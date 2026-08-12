import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { GameService } from '../src/engine/game-service.mjs';

test('golden 12-slot game prepares, resumes, scores, and completes with every external provider offline', () => {
  const db = openDatabase();
  importMvpSeed(db);
  let nextId = 0;
  let providerCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    providerCalls += 1;
    throw new Error('Every external provider is offline');
  };
  try {
    const service = new GameService(db, {
      now: () => '2026-08-12T12:00:00.000Z',
      id: (prefix) => `${prefix}_golden_${++nextId}`,
    });
    const game = service.createGame({
      account_id: 'acct_golden_offline',
      language: 'ar',
      region: 'OM',
      selected_category_ids: ['cat_football', 'cat_movies', 'cat_oman', 'cat_games'],
      teams: [{ display_name: 'الصقور' }, { display_name: 'النجوم' }],
      idempotency_key: 'create-golden',
    });
    service.prepareGame(game.game_id, game.host_token, {
      idempotency_key: 'prepare-golden',
      expected_state_version: game.state_version,
    });
    assert.equal(db.prepare('SELECT COUNT(*) count FROM exposures WHERE game_id=?').get(game.game_id).count, 0);
    assert.equal(db.prepare(`SELECT COUNT(*) count FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
      WHERE gp.game_id=?`).get(game.game_id).count, 12);

    let turn = 0;
    for (const categoryId of ['cat_football', 'cat_movies', 'cat_oman', 'cat_games']) {
      for (const difficulty of [100, 200, 300]) {
        const board = service.getBoard(game.game_id, game.host_token);
        const selected = service.selectCategory(game.game_id, game.host_token, {
          category_id: categoryId,
          acting_team_id: board.active_team_id,
          idempotency_key: `select-${turn}`,
          expected_state_version: board.state_version,
        });
        const active = service.activateSlot(game.game_id, game.host_token, {
          category_id: categoryId,
          difficulty,
          team_id: board.active_team_id,
          idempotency_key: `activate-${turn}`,
          expected_state_version: selected.state_version,
        });
        if (turn === 5) {
          const resumed = service.readGameState(game.game_id, game.host_token);
          assert.equal(resumed.active_question.slot_id, active.slot_id);
          assert.equal(resumed.board.active_slot_summary.slot_id, active.slot_id);
          assert.equal(db.prepare('SELECT COUNT(*) count FROM exposures WHERE slot_id=?').get(active.slot_id).count, 1);
        }
        const revealed = service.revealAnswer(game.game_id, game.host_token, {
          slot_id: active.slot_id,
          idempotency_key: `reveal-${turn}`,
          expected_state_version: active.state_version,
        });
        service.recordOutcome(game.game_id, game.host_token, {
          slot_id: active.slot_id,
          team_id: board.active_team_id,
          outcome: turn % 4 === 3 ? 'skipped' : 'correct',
          idempotency_key: `outcome-${turn}`,
          expected_state_version: revealed.state_version,
        });
        turn += 1;
      }
    }

    const finalBoard = service.getBoard(game.game_id, game.host_token);
    assert.equal(finalBoard.game_status, 'completed');
    assert.equal(finalBoard.categories.flatMap((category) => category.difficulties).every((slot) => slot.status === 'used'), true);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM exposures WHERE game_id=?').get(game.game_id).count, 12);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM outcomes WHERE game_id=?').get(game.game_id).count, 12);
    assert.equal(db.prepare('SELECT COUNT(DISTINCT fact_id) count FROM exposures WHERE game_id=?').get(game.game_id).count, 12);
    assert.equal(providerCalls, 0, 'live play and preparation must use local verified inventory only');
  } finally {
    globalThis.fetch = originalFetch;
    db.close();
  }
});
