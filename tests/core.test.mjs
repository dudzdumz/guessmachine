import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { createFactFingerprint, normalizeArabic, normalizeEnglish } from '../src/domain/normalization.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';

test('Arabic normalization supports matching without changing authored text', () => {
  const authored = 'مُسْقَط ـ عاصمةُ عُمان!';
  assert.equal(normalizeArabic(authored), 'مسقط عاصمة عمان');
  assert.equal(authored, 'مُسْقَط ـ عاصمةُ عُمان!');
});

test('English normalization is deterministic', () => {
  assert.equal(normalizeEnglish('  Andrés  Iniesta! '), 'andrés iniesta');
});

test('Fact fingerprints represent the relationship, not wording', () => {
  const first = createFactFingerprint({ subject: 'Andrés Iniesta', predicate: 'scored winning goal in', object: '2010 World Cup Final' });
  const second = createFactFingerprint({ subject: ' ANDRÉS INIESTA ', predicate: 'scored winning goal in', object: '2010 World Cup Final!' });
  assert.equal(first, second);
});

test('canonical Fact → Question → bilingual Variant round-trips through relational storage', () => {
  const db = openDatabase();
  const now = '2026-08-12T00:00:00.000Z';
  db.prepare('INSERT INTO categories(id, slug, name_en, name_ar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('cat_football', 'football', 'Football', 'كرة القدم', now, now);
  db.prepare(`INSERT INTO facts(id, fingerprint, subject_key, predicate_key, object_key, statement_en, statement_ar, verified_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'fact_iniesta_2010', 'fp_iniesta', 'iniesta', 'winning_goal', 'wc_2010_final',
      'Iniesta scored the winning goal in the 2010 World Cup Final.',
      'سجل إنييستا هدف الفوز في نهائي كأس العالم 2010.', now, now, now,
    );
  db.prepare('INSERT INTO fact_categories(fact_id, category_id) VALUES (?, ?)').run('fact_iniesta_2010', 'cat_football');
  db.prepare('INSERT INTO questions(id, fact_id, question_intent, answer_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run('q_iniesta_2010', 'fact_iniesta_2010', 'direct_recall', 'person', now, now);
  const insertVariant = db.prepare(`INSERT INTO question_variants(id, question_id, language, question_text, answer_display, normalized_question, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  insertVariant.run('qv_iniesta_en', 'q_iniesta_2010', 'en', 'Who scored Spain’s winner in the 2010 World Cup final?', 'Andrés Iniesta', 'who scored spain winner', now, now);
  insertVariant.run('qv_iniesta_ar', 'q_iniesta_2010', 'ar', 'من سجل هدف فوز إسبانيا في نهائي كأس العالم 2010؟', 'أندريس إنييستا', 'من سجل هدف فوز اسبانيا', now, now);
  db.prepare('INSERT INTO accepted_answers(question_id, variant_id, language, answer_text, normalized_answer, answer_kind) VALUES (?, ?, ?, ?, ?, ?)')
    .run('q_iniesta_2010', 'qv_iniesta_ar', 'ar', 'أندريس إنييستا', normalizeArabic('أندريس إنييستا'), 'canonical');
  db.prepare('INSERT INTO difficulty_profiles(question_id, level, updated_at) VALUES (?, ?, ?)').run('q_iniesta_2010', 200, now);

  const graph = db.prepare(`SELECT f.id fact_id, q.id question_id, COUNT(DISTINCT qv.language) languages, dp.level
    FROM facts f JOIN questions q ON q.fact_id=f.id JOIN question_variants qv ON qv.question_id=q.id
    JOIN difficulty_profiles dp ON dp.question_id=q.id WHERE f.id=? GROUP BY f.id, q.id, dp.level`).get('fact_iniesta_2010');
  assert.deepEqual({ ...graph }, { fact_id: 'fact_iniesta_2010', question_id: 'q_iniesta_2010', languages: 2, level: 200 });
  db.close();
});

test('MVP seed import is idempotent, bilingual, evidenced, and validation-backed', () => {
  const db = openDatabase();
  const first = importMvpSeed(db);
  const second = importMvpSeed(db);
  assert.deepEqual(second, first);
  assert.equal(db.prepare('SELECT COUNT(*) count FROM categories').get().count, 4);
  assert.equal(db.prepare('SELECT COUNT(*) count FROM facts').get().count, 36);
  assert.equal(db.prepare('SELECT COUNT(*) count FROM question_variants').get().count, 72);
  assert.equal(db.prepare('SELECT COUNT(*) count FROM source_evidence WHERE status = ?').get('valid').count, 36);
  assert.equal(db.prepare('SELECT COUNT(*) count FROM validations WHERE result = ?').get('passed').count, 36);
  const bilingual = db.prepare(`SELECT q.fact_id, COUNT(DISTINCT qv.language) languages FROM questions q
    JOIN question_variants qv ON qv.question_id=q.id GROUP BY q.fact_id HAVING languages != 2`).all();
  assert.equal(bilingual.length, 0);
  db.close();
});

test('Fact eligibility depends on valid evidence and validation', () => {
  const db = openDatabase();
  importMvpSeed(db);
  const eligible = db.prepare(`SELECT COUNT(*) count FROM facts f
    WHERE f.lifecycle_state='verified'
    AND EXISTS (SELECT 1 FROM source_evidence se WHERE se.fact_id=f.id AND se.status='valid')
    AND EXISTS (SELECT 1 FROM validations v WHERE v.fact_id=f.id AND v.result='passed')`).get().count;
  assert.equal(eligible, 36);
  db.prepare("UPDATE source_evidence SET status='unavailable' WHERE fact_id='fact_oman_capital_muscat'").run();
  const blocked = db.prepare(`SELECT EXISTS(SELECT 1 FROM facts f WHERE f.id=? AND EXISTS
    (SELECT 1 FROM source_evidence se WHERE se.fact_id=f.id AND se.status='valid')) ok`).get('fact_oman_capital_muscat').ok;
  assert.equal(blocked, 0);
  db.close();
});
