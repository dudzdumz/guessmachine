import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { GameService } from '../src/engine/game-service.mjs';

function setup(key) {
  const db = openDatabase();
  importMvpSeed(db);
  let nextId = 0;
  const service = new GameService(db, {
    now: () => '2026-08-12T12:00:00.000Z',
    id: (prefix) => `${prefix}_${key}_${++nextId}`,
  });
  const game = service.createGame({
    account_id: `acct_${key}`,
    language: 'en',
    region: 'OM',
    selected_category_ids: ['cat_football', 'cat_movies', 'cat_oman', 'cat_games'],
    teams: [{ display_name: 'Falcons' }, { display_name: 'Stars' }],
    idempotency_key: `create-${key}`,
  });
  service.prepareGame(game.game_id, game.host_token, { idempotency_key: `prepare-${key}`, expected_state_version: 1 });
  return { db, service, game };
}

function selectFootball(service, game, key) {
  const board = service.getBoard(game.game_id, game.host_token);
  const selected = service.selectCategory(game.game_id, game.host_token, {
    category_id: 'cat_football', acting_team_id: board.active_team_id,
    idempotency_key: `select-${key}`, expected_state_version: board.state_version,
  });
  return { board, selected };
}

test('post-preparation quarantine atomically serves the qualified fallback and records only actual content', () => {
  const { db, service, game } = setup('fallback');
  try {
    const preparedSlot = db.prepare(`SELECT gs.* FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
      WHERE gp.game_id=? AND gs.category_id='cat_football' AND gs.difficulty=200`).get(game.game_id);
    assert.notEqual(preparedSlot.primary_fact_id, preparedSlot.fallback_fact_id);
    db.prepare("UPDATE questions SET lifecycle_state='quarantined' WHERE id=?").run(preparedSlot.primary_question_id);

    const { board, selected } = selectFootball(service, game, 'fallback');
    const activationRequest = {
      category_id: 'cat_football', difficulty: 200, team_id: board.active_team_id,
      idempotency_key: 'activate-fallback', expected_state_version: selected.state_version,
    };
    const active = service.activateSlot(game.game_id, game.host_token, activationRequest);
    assert.deepEqual(service.activateSlot(game.game_id, game.host_token, activationRequest), active);

    const servedSlot = db.prepare('SELECT * FROM game_slots WHERE id=?').get(active.slot_id);
    const exposure = db.prepare('SELECT * FROM exposures WHERE slot_id=?').get(active.slot_id);
    assert.equal(servedSlot.served_source, 'fallback');
    assert.equal(servedSlot.fallback_reason, 'primary_ineligible_or_unavailable');
    assert.equal(servedSlot.served_fact_id, preparedSlot.fallback_fact_id);
    assert.equal(exposure.fact_id, preparedSlot.fallback_fact_id);
    assert.notEqual(exposure.fact_id, preparedSlot.primary_fact_id);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM exposures WHERE fact_id=?').get(preparedSlot.primary_fact_id).count, 0);

    const revealed = service.revealAnswer(game.game_id, game.host_token, {
      slot_id: active.slot_id, idempotency_key: 'reveal-fallback', expected_state_version: active.state_version,
    });
    service.recordOutcome(game.game_id, game.host_token, {
      slot_id: active.slot_id, team_id: board.active_team_id, outcome: 'correct',
      idempotency_key: 'outcome-fallback', expected_state_version: revealed.state_version,
    });
    const outcome = db.prepare('SELECT * FROM outcomes WHERE slot_id=?').get(active.slot_id);
    assert.equal(outcome.fact_id, preparedSlot.fallback_fact_id);
    assert.equal(outcome.question_id, preparedSlot.fallback_question_id);
    assert.equal(outcome.variant_id, preparedSlot.fallback_variant_id);
  } finally {
    db.close();
  }
});

test('expired package and ineligible primary plus fallback fail before presentation with no exposure', () => {
  const expired = setup('expired');
  try {
    expired.db.prepare("UPDATE game_packages SET expires_at='2026-08-12T11:59:59.000Z' WHERE game_id=?").run(expired.game.game_id);
    const { board, selected } = selectFootball(expired.service, expired.game, 'expired');
    assert.throws(() => expired.service.activateSlot(expired.game.game_id, expired.game.host_token, {
      category_id: 'cat_football', difficulty: 100, team_id: board.active_team_id,
      idempotency_key: 'activate-expired', expected_state_version: selected.state_version,
    }), (error) => error.code === 'PACKAGE_EXPIRED');
    assert.equal(expired.db.prepare('SELECT COUNT(*) count FROM exposures WHERE game_id=?').get(expired.game.game_id).count, 0);
  } finally {
    expired.db.close();
  }

  const unavailable = setup('unavailable');
  try {
    const slot = unavailable.db.prepare(`SELECT gs.* FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
      WHERE gp.game_id=? AND gs.category_id='cat_football' AND gs.difficulty=100`).get(unavailable.game.game_id);
    unavailable.db.prepare("UPDATE questions SET lifecycle_state='quarantined' WHERE id IN (?, ?)").run(slot.primary_question_id, slot.fallback_question_id);
    const { board, selected } = selectFootball(unavailable.service, unavailable.game, 'unavailable');
    assert.throws(() => unavailable.service.activateSlot(unavailable.game.game_id, unavailable.game.host_token, {
      category_id: 'cat_football', difficulty: 100, team_id: board.active_team_id,
      idempotency_key: 'activate-unavailable', expected_state_version: selected.state_version,
    }), (error) => error.code === 'QUESTION_UNAVAILABLE');
    assert.equal(unavailable.db.prepare('SELECT COUNT(*) count FROM exposures WHERE game_id=?').get(unavailable.game.game_id).count, 0);
    assert.equal(unavailable.db.prepare('SELECT status FROM game_slots WHERE id=?').get(slot.id).status, 'available');
  } finally {
    unavailable.db.close();
  }
});

test('same-Fact prepared fallback creates one Fact exposure for the presentation actually used', () => {
  const { db, service, game } = setup('same-fact');
  try {
    const slot = db.prepare(`SELECT gs.* FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
      WHERE gp.game_id=? AND gs.category_id='cat_football' AND gs.difficulty=300`).get(game.game_id);
    db.prepare(`UPDATE game_slots SET primary_available=0,
      fallback_fact_id=primary_fact_id,
      fallback_question_id=primary_question_id,
      fallback_variant_id=primary_variant_id,
      fallback_question_snapshot=primary_question_snapshot,
      fallback_answer_snapshot=primary_answer_snapshot,
      fallback_explanation_snapshot=primary_explanation_snapshot,
      fallback_language_snapshot=primary_language_snapshot
      WHERE id=?`).run(slot.id);

    const { board, selected } = selectFootball(service, game, 'same-fact');
    const active = service.activateSlot(game.game_id, game.host_token, {
      category_id: 'cat_football', difficulty: 300, team_id: board.active_team_id,
      idempotency_key: 'activate-same-fact', expected_state_version: selected.state_version,
    });
    const served = db.prepare('SELECT * FROM game_slots WHERE id=?').get(active.slot_id);
    assert.equal(served.served_source, 'fallback');
    assert.equal(served.served_fact_id, slot.primary_fact_id);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM exposures WHERE slot_id=?').get(active.slot_id).count, 1);
    assert.equal(db.prepare('SELECT COUNT(DISTINCT fact_id) count FROM exposures WHERE slot_id=?').get(active.slot_id).count, 1);
  } finally {
    db.close();
  }
});
