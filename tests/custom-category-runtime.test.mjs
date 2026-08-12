import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { CustomCategoryService } from '../src/custom/custom-category-service.mjs';
import { GameService } from '../src/engine/game-service.mjs';

test('owned ready custom category uses ordinary package, dial runtime, exposure, and next-game memory', () => {
  const db = openDatabase();
  importMvpSeed(db);
  let id = 0;
  const ids = (prefix) => `${prefix}_custom_${++id}`;
  const custom = new CustomCategoryService(db, { now: () => '2026-08-12T12:00:00.000Z', id: ids });
  const games = new GameService(db, { now: () => '2026-08-12T12:00:00.000Z', id: ids });
  try {
    const factIds = db.prepare(`SELECT DISTINCT f.id FROM facts f JOIN fact_categories fc ON fc.fact_id=f.id
      JOIN questions q ON q.fact_id=f.id JOIN difficulty_profiles dp ON dp.question_id=q.id
      WHERE fc.category_id='cat_games' ORDER BY dp.level, f.id`).all().map((row) => row.id);
    const definition = custom.createManualReady({
      accountId: 'acct_custom_owner', slug: 'nintendo-gamecube', nameEn: 'Nintendo GameCube', nameAr: 'نينتندو جيم كيوب',
      originalScopeText: 'Nintendo GameCube hardware, games, creators, and history.', factIds,
    });
    assert.equal(definition.readiness_status, 'ready');
    assert.throws(() => games.createGame({ account_id: 'acct_foreign', language: 'en', region: 'OM', selected_category_ids: [definition.category_id], teams: [{ display_name: 'A' }, { display_name: 'B' }], idempotency_key: 'foreign-custom' }), (error) => error.code === 'CATEGORY_NOT_AVAILABLE');

    const first = games.createGame({ account_id: 'acct_custom_owner', language: 'ar', region: 'OM', selected_category_ids: [definition.category_id], teams: [{ display_name: 'أ' }, { display_name: 'ب' }], idempotency_key: 'custom-one' });
    games.prepareGame(first.game_id, first.host_token, { idempotency_key: 'prepare-custom-one', expected_state_version: 1 });
    const board = games.getBoard(first.game_id, first.host_token);
    assert.equal(board.categories.length, 1);
    assert.equal(board.categories[0].category_id, definition.category_id);
    const selected = games.selectCategory(first.game_id, first.host_token, { category_id: definition.category_id, acting_team_id: board.active_team_id, idempotency_key: 'select-custom', expected_state_version: board.state_version });
    const active = games.activateSlot(first.game_id, first.host_token, { category_id: definition.category_id, difficulty: 100, team_id: board.active_team_id, idempotency_key: 'activate-custom', expected_state_version: selected.state_version });
    const exposedFact = db.prepare('SELECT fact_id FROM exposures WHERE slot_id=?').get(active.slot_id).fact_id;
    const revealed = games.revealAnswer(first.game_id, first.host_token, { slot_id: active.slot_id, idempotency_key: 'reveal-custom', expected_state_version: active.state_version });
    games.recordOutcome(first.game_id, first.host_token, { slot_id: active.slot_id, team_id: board.active_team_id, outcome: 'correct', idempotency_key: 'outcome-custom', expected_state_version: revealed.state_version });

    const second = games.createGame({ account_id: 'acct_custom_owner', language: 'en', region: 'OM', selected_category_ids: [definition.category_id], teams: [{ display_name: 'A' }, { display_name: 'B' }], idempotency_key: 'custom-two' });
    games.prepareGame(second.game_id, second.host_token, { idempotency_key: 'prepare-custom-two', expected_state_version: 1 });
    assert.equal(db.prepare(`SELECT COUNT(*) count FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
      WHERE gp.game_id=? AND (gs.primary_fact_id=? OR gs.fallback_fact_id=?)`).get(second.game_id, exposedFact, exposedFact).count, 0);

    custom.retire({ accountId: 'acct_custom_owner', categoryId: definition.category_id });
    assert.equal(db.prepare('SELECT COUNT(*) count FROM exposures WHERE fact_id=?').get(exposedFact).count, 1);
    assert.equal(games.getBoard(first.game_id, first.host_token).categories[0].category_id, definition.category_id);
    assert.throws(() => games.createGame({ account_id: 'acct_custom_owner', language: 'en', region: 'OM', selected_category_ids: [definition.category_id], teams: [{ display_name: 'A' }, { display_name: 'B' }], idempotency_key: 'custom-after-retire' }), (error) => error.code === 'CATEGORY_NOT_AVAILABLE');
  } finally { db.close(); }
});
