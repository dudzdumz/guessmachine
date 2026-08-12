import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { QuestionBank } from '../src/engine/question-bank.mjs';

function setup() {
  const db = openDatabase();
  importMvpSeed(db);
  return { db, bank: new QuestionBank(db) };
}

test('Question Bank returns only requested category, difficulty, and native language', () => {
  const { db, bank } = setup();
  const candidates = bank.findCandidates({ categoryId: 'cat_football', difficulty: 200, language: 'ar' });
  assert.equal(candidates.length, 3);
  assert.ok(candidates.every((item) => item.category_id === 'cat_football' && item.difficulty === 200 && item.language === 'ar'));
  assert.ok(candidates.every((item) => item.question_text && item.answer_display && item.accepted_answers.length >= 1));
  db.close();
});

test('Question Bank excludes canonical Fact IDs across all wording', () => {
  const { db, bank } = setup();
  const all = bank.findCandidates({ categoryId: 'cat_football', difficulty: 200, language: 'en' });
  const filtered = bank.findCandidates({ categoryId: 'cat_football', difficulty: 200, language: 'en', excludeFactIds: [all[0].fact_id] });
  assert.equal(filtered.length, 2);
  assert.ok(filtered.every((candidate) => candidate.fact_id !== all[0].fact_id));
  db.close();
});

test('stale, quarantined, unsupported, and missing-language content is ineligible', () => {
  const { db, bank } = setup();
  db.prepare("UPDATE facts SET lifecycle_state='stale' WHERE id='fact_brazil_five_world_cups'").run();
  db.prepare("UPDATE questions SET lifecycle_state='quarantined' WHERE id='q_spain_2010_champion'").run();
  db.prepare("UPDATE source_evidence SET status='unavailable' WHERE fact_id='fact_qatar_2022_host'").run();
  const blocked = bank.findCandidates({ categoryId: 'cat_football', difficulty: 100, language: 'en' });
  assert.equal(blocked.length, 0);

  db.prepare("UPDATE question_variants SET lifecycle_state='retired' WHERE question_id='q_iniesta_2010_winner' AND language='ar'").run();
  const arabic = bank.findCandidates({ categoryId: 'cat_football', difficulty: 200, language: 'ar' });
  const english = bank.findCandidates({ categoryId: 'cat_football', difficulty: 200, language: 'en' });
  assert.equal(arabic.length, 2);
  assert.equal(english.length, 3);
  db.close();
});

test('current Fact eligibility uses the supplied deterministic as-of time', () => {
  const { db, bank } = setup();
  db.prepare("UPDATE facts SET stability_class='current', valid_from='2026-01-01T00:00:00.000Z', valid_until='2026-06-01T00:00:00.000Z' WHERE id='fact_oman_capital_muscat'").run();
  const before = bank.findCandidates({ categoryId: 'cat_oman', difficulty: 100, language: 'en', asOf: '2026-05-01T00:00:00.000Z' });
  const after = bank.findCandidates({ categoryId: 'cat_oman', difficulty: 100, language: 'en', asOf: '2026-07-01T00:00:00.000Z' });
  assert.ok(before.some((item) => item.fact_id === 'fact_oman_capital_muscat'));
  assert.ok(after.every((item) => item.fact_id !== 'fact_oman_capital_muscat'));
  db.close();
});
