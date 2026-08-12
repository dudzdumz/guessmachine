import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { FakeReasoningAdapter } from '../src/providers/fake-adapters.mjs';
import { ProviderRouter } from '../src/providers/provider-router.mjs';
import { QuestionWriter } from '../src/foundry/question-writer.mjs';
import { QuestionFoundry } from '../src/foundry/question-foundry.mjs';
import { InventoryReplenisher } from '../src/foundry/inventory-replenisher.mjs';
import { QuestionBank } from '../src/engine/question-bank.mjs';
import { createFactFingerprint } from '../src/domain/normalization.mjs';

function addVerifiedFact(db) {
  const now = '2026-08-12T12:00:00.000Z';
  const factId = 'fact_bahla_foundry_fixture';
  db.prepare(`INSERT INTO facts(id, fingerprint, subject_key, predicate_key, object_key, statement_en, statement_ar, lifecycle_state, verified_at, created_at, updated_at)
    VALUES (?, ?, 'bahla_fort', 'unesco_year', '1987', ?, ?, 'verified', ?, ?, ?)`)
    .run(factId, createFactFingerprint({ subject: 'bahla_fort', predicate: 'unesco_year', object: '1987' }),
      'Bahla Fort was inscribed on the UNESCO World Heritage List in 1987.', 'أُدرجت قلعة بهلاء على قائمة التراث العالمي لليونسكو عام 1987.', now, now, now);
  db.prepare("INSERT INTO fact_categories(fact_id, category_id) VALUES (?, 'cat_oman')").run(factId);
  db.prepare("INSERT INTO fact_nodes(fact_id, node_id) VALUES (?, 'node_oman_landmarks')").run(factId);
  db.prepare("INSERT INTO entities(id, entity_type, canonical_name_en, canonical_name_ar, created_at) VALUES ('entity_bahla_year', 'year', '1987', '1987', ?)").run(now);
  db.prepare("INSERT INTO fact_entities(fact_id, entity_id, role) VALUES (?, 'entity_bahla_year', 'answer')").run(factId);
  db.prepare(`INSERT INTO source_evidence(id, fact_id, source_title, source_url, trust_tier, supported_claim, checked_at, status)
    VALUES ('evidence_bahla', ?, 'Official fixture', 'https://example.gov.om/bahla', 'official', ?, ?, 'valid')`).run(factId, 'Bahla Fort was inscribed on the UNESCO World Heritage List in 1987.', now);
  db.prepare(`INSERT INTO validations(id, fact_id, validation_type, result, confidence, validator, created_at)
    VALUES ('validation_bahla', ?, 'fixture_review', 'passed', 0.95, 'test-editor', ?)`).run(factId, now);
  return factId;
}

function createFoundry(db, responses) {
  const adapter = new FakeReasoningAdapter({ responses });
  const router = new ProviderRouter({ db, adapters: { reasoning: adapter }, now: () => '2026-08-12T12:00:00.000Z' });
  let id = 0;
  const ids = (prefix) => `${prefix}_foundry_${++id}`;
  const writer = new QuestionWriter(db, router, { now: () => '2026-08-12T12:00:00.000Z', id: ids });
  return { adapter, foundry: new QuestionFoundry(db, writer, { now: () => '2026-08-12T12:00:00.000Z', id: ids }) };
}

const bahlaDraft = { data: { variants: [
  { language: 'en', question_text: 'In which year was Bahla Fort added to the UNESCO World Heritage List?', answer_display: '1987', accepted_answers: ['nineteen eighty-seven'] },
  { language: 'ar', question_text: 'في أي عام أُدرجت قلعة بهلاء على قائمة اليونسكو للتراث العالمي؟', answer_display: '1987', accepted_answers: ['١٩٨٧'] },
] } };

test('Foundry requires quality plus named human approval before ordinary Question Bank eligibility', async () => {
  const db = openDatabase();
  importMvpSeed(db);
  try {
    const factId = addVerifiedFact(db);
    const { foundry } = createFoundry(db, [bahlaDraft]);
    const job = await foundry.manufacture({ factId, difficulty: 100 });
    assert.equal(job.status, 'needs_review');
    assert.equal(db.prepare('SELECT COUNT(*) count FROM questions WHERE fact_id=?').get(factId).count, 0);
    const approved = foundry.approve({ jobId: job.job_id, reviewerId: 'editor:amal' });
    assert.equal(approved.status, 'completed');
    assert.equal(foundry.approve({ jobId: job.job_id, reviewerId: 'editor:amal' }).question_id, approved.question_id);
    const eligible = new QuestionBank(db).findCandidates({ categoryId: 'cat_oman', difficulty: 100, language: 'ar' });
    assert.ok(eligible.some((candidate) => candidate.fact_id === factId));
    assert.equal(db.prepare("SELECT COUNT(*) count FROM manufacturing_events WHERE job_id=? AND event_type='approved_and_published'").get(job.job_id).count, 1);
  } finally { db.close(); }
});

test('low-stock demand is deduplicated, replenishes exactly to target, and then stops', async () => {
  const db = openDatabase();
  importMvpSeed(db);
  try {
    const factId = addVerifiedFact(db);
    const { adapter, foundry } = createFoundry(db, [bahlaDraft]);
    const replenisher = new InventoryReplenisher(db, { now: () => '2026-08-12T12:00:00.000Z', id: () => 'demand_oman_100_en' });
    const demand = replenisher.evaluate({ categoryId: 'cat_oman', difficulty: 100, language: 'en', targetStock: 4 });
    assert.equal(demand.current_stock, 3);
    assert.equal(demand.requested_count, 1);
    assert.equal(replenisher.evaluate({ categoryId: 'cat_oman', difficulty: 100, language: 'en', targetStock: 4 }).demand_id, demand.demand_id);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM inventory_demands').get().count, 1);

    const fulfilled = await replenisher.fulfill({ demandId: demand.demand_id, factIds: [factId], foundry, reviewerId: 'editor:amal' });
    assert.equal(fulfilled.status, 'satisfied');
    assert.equal(fulfilled.current_stock, 4);
    assert.equal(fulfilled.requested_count, 0);
    const recheck = replenisher.evaluate({ categoryId: 'cat_oman', difficulty: 100, language: 'en', targetStock: 4 });
    assert.equal(recheck.status, 'satisfied');
    assert.equal(adapter.calls.length, 1);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM inventory_demands').get().count, 1);
  } finally { db.close(); }
});

test('Foundry rechecks evidence at approval and cannot publish a stale draft', async () => {
  const db = openDatabase();
  importMvpSeed(db);
  try {
    const factId = addVerifiedFact(db);
    const { foundry } = createFoundry(db, [bahlaDraft]);
    const job = await foundry.manufacture({ factId, difficulty: 100 });
    db.prepare("UPDATE source_evidence SET status='contradicted' WHERE fact_id=?").run(factId);
    assert.throws(() => foundry.approve({ jobId: job.job_id, reviewerId: 'editor:amal' }), /Current evidence-backed verified Fact required/);
    assert.equal(db.prepare('SELECT COUNT(*) count FROM questions WHERE fact_id=?').get(factId).count, 0);
    assert.equal(db.prepare('SELECT status FROM manufacturing_jobs WHERE id=?').get(job.job_id).status, 'needs_review');
  } finally { db.close(); }
});
