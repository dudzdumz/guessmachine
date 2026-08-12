import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { GameService } from '../src/engine/game-service.mjs';

function setup() {
  const db = openDatabase();
  importMvpSeed(db);
  let nextId = 0;
  const service = new GameService(db, {
    now: () => '2026-08-12T12:00:00.000Z',
    id: (prefix) => `${prefix}_history_${++nextId}`,
  });
  return { db, service };
}

function createReadyGame(service, { accountId, language, key }) {
  const game = service.createGame({
    account_id: accountId,
    language,
    region: 'OM',
    selected_category_ids: ['cat_football', 'cat_movies', 'cat_oman', 'cat_games'],
    teams: [{ display_name: 'Falcons' }, { display_name: 'Stars' }],
    idempotency_key: `create-${key}`,
  });
  service.prepareGame(game.game_id, game.host_token, {
    idempotency_key: `prepare-${key}`,
    expected_state_version: game.state_version,
  });
  return game;
}

function activateFootball200(service, game, key) {
  const board = service.getBoard(game.game_id, game.host_token);
  const selected = service.selectCategory(game.game_id, game.host_token, {
    category_id: 'cat_football',
    acting_team_id: board.active_team_id,
    idempotency_key: `select-${key}`,
    expected_state_version: board.state_version,
  });
  const request = {
    category_id: 'cat_football',
    difficulty: 200,
    team_id: board.active_team_id,
    idempotency_key: `activate-${key}`,
    expected_state_version: selected.state_version,
  };
  return { board, request, active: service.activateSlot(game.game_id, game.host_token, request) };
}

test('exposure starts at presentation, activation retry is singular, and unanswered abandonment keeps memory', () => {
  const { db, service } = setup();
  try {
    const first = createReadyGame(service, { accountId: 'acct_memory', language: 'ar', key: 'ar-one' });
    assert.equal(db.prepare('SELECT COUNT(*) count FROM exposures WHERE game_id=?').get(first.game_id).count, 0);

    const { request, active } = activateFootball200(service, first, 'ar-one');
    const retry = service.activateSlot(first.game_id, first.host_token, request);
    assert.deepEqual(retry, active);

    const exposure = db.prepare('SELECT * FROM exposures WHERE game_id=?').get(first.game_id);
    const slot = db.prepare('SELECT * FROM game_slots WHERE id=?').get(active.slot_id);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM exposures WHERE game_id=?').get(first.game_id).count, 1);
    assert.equal(exposure.fact_id, slot.served_fact_id);
    assert.equal(exposure.question_id, slot.served_question_id);
    assert.equal(exposure.variant_id, slot.served_variant_id);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM outcomes WHERE game_id=?').get(first.game_id).count, 0);

    service.abandonGame(first.game_id, first.host_token, {
      reason: 'connection_lost',
      idempotency_key: 'abandon-ar-one',
      expected_state_version: active.state_version,
    });
    assert.equal(db.prepare('SELECT COUNT(*) count FROM exposures WHERE game_id=?').get(first.game_id).count, 1);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM outcomes WHERE game_id=?').get(first.game_id).count, 0);

    const second = createReadyGame(service, { accountId: 'acct_memory', language: 'en', key: 'en-two' });
    const repeated = db.prepare(`SELECT COUNT(*) count FROM game_slots gs
      JOIN game_packages gp ON gp.id=gs.package_id
      WHERE gp.game_id=? AND (gs.primary_fact_id=? OR gs.fallback_fact_id=?)`).get(second.game_id, exposure.fact_id, exposure.fact_id);
    assert.equal(repeated.count, 0, 'Arabic Fact exposure must suppress every English wording and fallback for that Fact');
  } finally {
    db.close();
  }
});

test('outcome binds to served canonical content and idempotent retry cannot double-score', () => {
  const { db, service } = setup();
  try {
    const game = createReadyGame(service, { accountId: 'acct_outcome', language: 'en', key: 'outcome' });
    const { board, active } = activateFootball200(service, game, 'outcome');
    const revealed = service.revealAnswer(game.game_id, game.host_token, {
      slot_id: active.slot_id,
      idempotency_key: 'reveal-outcome',
      expected_state_version: active.state_version,
    });
    const request = {
      slot_id: active.slot_id,
      team_id: board.active_team_id,
      outcome: 'correct',
      response_time_ms: 12_345,
      idempotency_key: 'record-outcome',
      expected_state_version: revealed.state_version,
    };
    const first = service.recordOutcome(game.game_id, game.host_token, request);
    const retry = service.recordOutcome(game.game_id, game.host_token, request);
    assert.deepEqual(retry, first);

    const outcome = db.prepare('SELECT * FROM outcomes WHERE game_id=?').get(game.game_id);
    const exposure = db.prepare('SELECT * FROM exposures WHERE game_id=?').get(game.game_id);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM outcomes WHERE game_id=?').get(game.game_id).count, 1);
    assert.equal(outcome.fact_id, exposure.fact_id);
    assert.equal(outcome.question_id, exposure.question_id);
    assert.equal(outcome.variant_id, exposure.variant_id);
    assert.equal(outcome.response_time_ms, 12_345);
    assert.equal(outcome.score_delta, 200);
    assert.equal(db.prepare('SELECT score FROM teams WHERE id=?').get(board.active_team_id).score, 200);
    assert.equal(db.prepare("SELECT COUNT(*) count FROM game_events WHERE game_id=? AND event_type='question_exposed'").get(game.game_id).count, 1);
    assert.equal(db.prepare("SELECT COUNT(*) count FROM game_events WHERE game_id=? AND event_type='outcome_recorded'").get(game.game_id).count, 1);
  } finally {
    db.close();
  }
});
