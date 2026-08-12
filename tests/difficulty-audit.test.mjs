import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { GameService } from '../src/engine/game-service.mjs';
import { auditDifficultyData } from '../src/engine/difficulty-data-audit.mjs';

test('difficulty data audit explains exclusions and refuses calibration on sparse controlled outcomes', () => {
  const db = openDatabase();
  importMvpSeed(db);
  let id = 0;
  const service = new GameService(db, { now: () => `2026-08-12T12:00:${String(id).padStart(2, '0')}.000Z`, id: (prefix) => `${prefix}_audit_${++id}` });
  try {
    const game = service.createGame({ account_id: 'acct_audit', language: 'en', region: 'OM', selected_category_ids: ['cat_games'], teams: [{ display_name: 'A' }, { display_name: 'B' }], idempotency_key: 'create-audit' });
    service.prepareGame(game.game_id, game.host_token, { idempotency_key: 'prepare-audit', expected_state_version: 1 });
    for (const [turn, difficulty] of [100, 200].entries()) {
      const board = service.getBoard(game.game_id, game.host_token);
      const selected = service.selectCategory(game.game_id, game.host_token, { category_id: 'cat_games', acting_team_id: board.active_team_id, idempotency_key: `select-${turn}`, expected_state_version: board.state_version });
      const active = service.activateSlot(game.game_id, game.host_token, { category_id: 'cat_games', difficulty, team_id: board.active_team_id, idempotency_key: `activate-${turn}`, expected_state_version: selected.state_version });
      const revealed = service.revealAnswer(game.game_id, game.host_token, { slot_id: active.slot_id, idempotency_key: `reveal-${turn}`, expected_state_version: active.state_version });
      service.recordOutcome(game.game_id, game.host_token, { slot_id: active.slot_id, team_id: board.active_team_id, outcome: turn === 0 ? 'correct' : 'disputed', dispute_note: turn === 1 ? 'Host and team disagreed' : undefined, response_time_ms: 10_000, idempotency_key: `outcome-${turn}`, expected_state_version: revealed.state_version });
    }
    const before = db.prepare("SELECT level FROM difficulty_profiles WHERE question_id='q_mario_nintendo'").get()?.level;
    const audit = auditDifficultyData(db, { minimumCleanSamples: 30 });
    assert.equal(audit.total_outcomes, 2);
    assert.equal(audit.clean_sample_size, 1);
    assert.equal(audit.exclusion_counts.disputed, 1);
    assert.equal(audit.gate, 'insufficient_data');
    assert.equal(audit.calibration_applied, false);
    assert.equal(db.prepare("SELECT level FROM difficulty_profiles WHERE question_id='q_mario_nintendo'").get()?.level, before);
  } finally { db.close(); }
});
