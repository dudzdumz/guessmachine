import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { FakeReasoningAdapter } from '../src/providers/fake-adapters.mjs';
import { ProviderRouter } from '../src/providers/provider-router.mjs';
import { QuestionWriter } from '../src/foundry/question-writer.mjs';
import { assessQuestionDraft } from '../src/foundry/quality-pipeline.mjs';

function setup(response) {
  const db = openDatabase();
  importMvpSeed(db);
  const adapter = new FakeReasoningAdapter({ responses: [response] });
  const router = new ProviderRouter({ db, adapters: { reasoning: adapter }, now: () => '2026-08-12T12:00:00.000Z', id: () => 'provider_write_test' });
  let counter = 0;
  const writer = new QuestionWriter(db, router, { now: () => '2026-08-12T12:00:00.000Z', id: (prefix) => `${prefix}_write_${++counter}` });
  return { db, adapter, writer };
}

const goodResponse = { data: { variants: [
  { language: 'en', question_text: 'Who scored Spain’s winning goal in the 2010 FIFA World Cup final?', answer_display: 'Andrés Iniesta', accepted_answers: ['Andres Iniesta'], explanation: 'He scored in extra time.' },
  { language: 'ar', question_text: 'من أحرز هدف تتويج إسبانيا خلال نهائي كأس العالم لعام 2010؟', answer_display: 'أندريس إنييستا', accepted_answers: ['انييستا'], explanation: 'سجّل الهدف في الوقت الإضافي.' },
] }, usage: { input_units: 100, output_units: 80 } };

test('answer-locked writer creates review-only bilingual candidate and is idempotent', async () => {
  const { db, adapter, writer } = setup(goodResponse);
  try {
    const before = db.prepare('SELECT COUNT(*) count FROM questions').get().count;
    const draft = await writer.createDraft({ factId: 'fact_iniesta_2010_winner', difficulty: 200 });
    const retry = await writer.createDraft({ factId: 'fact_iniesta_2010_winner', difficulty: 200 });
    assert.equal(draft.status, 'candidate');
    assert.equal(retry.draft_id, draft.draft_id);
    assert.equal(retry.reused, true);
    assert.equal(adapter.calls.length, 1);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM questions').get().count, before, 'provider candidates cannot publish themselves');
    assert.equal(db.prepare('SELECT lifecycle_state FROM facts WHERE id=?').get('fact_iniesta_2010_winner').lifecycle_state, 'verified');
  } finally { db.close(); }
});

test('writer rejects any provider attempt to alter the locked answer', async () => {
  const bad = structuredClone(goodResponse);
  bad.data.variants[0].answer_display = 'David Villa';
  const { db, writer } = setup(bad);
  try {
    await assert.rejects(writer.createDraft({ factId: 'fact_iniesta_2010_winner', difficulty: 200 }), (error) => error.code === 'policy');
    assert.equal(db.prepare('SELECT COUNT(*) count FROM question_drafts').get().count, 0);
    assert.equal(db.prepare("SELECT status FROM manufacturing_jobs WHERE job_type='question_writing'").get().status, 'failed');
  } finally { db.close(); }
});

test('deterministic bilingual quality pipeline passes clean writing and rejects leakage/machine language', async () => {
  const clean = setup(goodResponse);
  try {
    const draft = await clean.writer.createDraft({ factId: 'fact_iniesta_2010_winner', difficulty: 200 });
    const assessment = assessQuestionDraft(clean.db, draft.draft_id, { now: () => '2026-08-12T12:00:00.000Z', id: () => 'quality_good' });
    assert.equal(assessment.disposition, 'passed');
    assert.equal(clean.db.prepare('SELECT status FROM question_drafts WHERE id=?').get(draft.draft_id).status, 'quality_passed');
  } finally { clean.db.close(); }

  const leakingResponse = structuredClone(goodResponse);
  leakingResponse.data.variants[0].question_text = 'According to ChatGPT, did Andrés Iniesta score Spain’s winning goal?';
  leakingResponse.data.variants[1].question_text = 'هل أندريس إنييستا هو من سجل هدف فوز إسبانيا؟';
  const leaking = setup(leakingResponse);
  try {
    const draft = await leaking.writer.createDraft({ factId: 'fact_iniesta_2010_winner', difficulty: 200 });
    const assessment = assessQuestionDraft(leaking.db, draft.draft_id, { id: () => 'quality_bad' });
    assert.equal(assessment.disposition, 'rejected');
    assert.ok(assessment.checks.some((variant) => !variant.checks.no_answer_leakage || !variant.checks.no_machine_language));
    assert.equal(leaking.db.prepare('SELECT COUNT(*) count FROM questions').get().count, 36);
  } finally { leaking.db.close(); }
});
