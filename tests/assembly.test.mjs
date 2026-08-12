import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { assembleGamePackage } from '../src/engine/assembly.mjs';
import { persistGamePackage } from '../src/engine/package-store.mjs';

const NOW = '2026-08-12T00:00:00.000Z';

function setupGame(language = 'en') {
  const db = openDatabase();
  importMvpSeed(db);
  db.prepare('INSERT INTO accounts(id, display_name, created_at) VALUES (?, ?, ?)').run('acct_test', 'Test Account', NOW);
  db.prepare(`INSERT INTO games(id, account_id, language, region, status, host_token, display_token, created_at, updated_at)
    VALUES (?, ?, ?, 'OM', 'preparing', 'host_test', 'display_test', ?, ?)`).run('game_test', 'acct_test', language, NOW, NOW);
  for (const [position, categoryId] of ['cat_football', 'cat_movies', 'cat_oman', 'cat_games'].entries()) {
    db.prepare('INSERT INTO game_categories(game_id, category_id, position) VALUES (?, ?, ?)').run('game_test', categoryId, position);
  }
  return db;
}

test('Game Assembly creates a complete bilingual-ready package with no duplicate primary Facts', () => {
  const db = setupGame('ar');
  const result = assembleGamePackage(db, { gameId: 'game_test', categoryIds: ['cat_football', 'cat_movies', 'cat_oman', 'cat_games'], language: 'ar', now: NOW });
  assert.equal(result.slotCount, 12);
  assert.equal(new Set(result.selectedFactIds).size, 12);
  const packageRow = db.prepare('SELECT status FROM game_packages WHERE id=?').get(result.packageId);
  assert.equal(packageRow.status, 'ready');
  const slots = db.prepare('SELECT * FROM game_slots WHERE package_id=?').all(result.packageId);
  assert.equal(slots.length, 12);
  assert.ok(slots.every((slot) => slot.primary_language_snapshot === 'ar' && slot.fallback_fact_id));
  assert.deepEqual([...new Set(slots.map((slot) => slot.difficulty))].sort(), [100, 200, 300]);
  db.close();
});

test('GamePackage snapshots survive later canonical Variant edits', () => {
  const db = setupGame('en');
  const { packageId } = assembleGamePackage(db, { gameId: 'game_test', categoryIds: ['cat_football', 'cat_movies', 'cat_oman', 'cat_games'], language: 'en', now: NOW });
  const before = db.prepare('SELECT id, primary_variant_id, primary_question_snapshot FROM game_slots WHERE package_id=? LIMIT 1').get(packageId);
  db.prepare("UPDATE question_variants SET question_text='EDITORIAL CHANGE' WHERE id=?").run(before.primary_variant_id);
  const after = db.prepare('SELECT primary_question_snapshot FROM game_slots WHERE id=?').get(before.id);
  assert.equal(after.primary_question_snapshot, before.primary_question_snapshot);
  db.close();
});

test('package persistence rejects duplicate Facts before creating a ready package', () => {
  const db = setupGame('en');
  const question = {
    fact_id: 'fact_brazil_five_world_cups', question_id: 'q_brazil_five_world_cups', variant_id: 'qv_brazil_five_world_cups_en',
    question_text: 'Question', answer_display: 'Brazil', language: 'en',
  };
  assert.throws(() => persistGamePackage(db, {
    gameId: 'game_test', expectedSlotCount: 2,
    slots: [
      { category_id: 'cat_football', difficulty: 100, primary: question, fallback: { ...question, fact_id: 'fact_spain_2010_champion', question_id: 'q_spain_2010_champion', variant_id: 'qv_spain_2010_champion_en' } },
      { category_id: 'cat_football', difficulty: 200, primary: question, fallback: { ...question, fact_id: 'fact_iniesta_2010_winner', question_id: 'q_iniesta_2010_winner', variant_id: 'qv_iniesta_2010_winner_en' } },
    ],
  }), /REPEATED FACT/);
  assert.equal(db.prepare('SELECT COUNT(*) count FROM game_packages').get().count, 0);
  db.close();
});

test('insufficient eligible inventory fails without partial ready package', () => {
  const db = setupGame('en');
  db.prepare("UPDATE questions SET lifecycle_state='quarantined' WHERE fact_id IN (SELECT fact_id FROM fact_categories WHERE category_id='cat_football')").run();
  assert.throws(() => assembleGamePackage(db, { gameId: 'game_test', categoryIds: ['cat_football'], language: 'en', now: NOW }), /VERIFY ENOUGH/);
  assert.equal(db.prepare("SELECT COUNT(*) count FROM game_packages WHERE status='ready'").get().count, 0);
  db.close();
});
