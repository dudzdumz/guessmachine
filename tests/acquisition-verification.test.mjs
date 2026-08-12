import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { FakeFetchAdapter, FakeSearchAdapter } from '../src/providers/fake-adapters.mjs';
import { ProviderRouter } from '../src/providers/provider-router.mjs';
import { AcquisitionService } from '../src/acquisition/acquisition-service.mjs';
import { FactVerifier } from '../src/foundry/fact-verifier.mjs';

function setup({ body }) {
  const db = openDatabase();
  importMvpSeed(db);
  const search = new FakeSearchAdapter({ responses: [{ data: { results: [{ url: 'https://example.gov.om/history/fort', title: 'Official fort history', snippet: 'Discovery snippet only', language: 'en' }] } }] });
  const fetch = new FakeFetchAdapter({ responses: [{ data: { url: 'https://example.gov.om/history/fort', final_url: 'https://example.gov.om/history/fort', status: 200, content_type: 'text/html', body, retrieved_at: '2026-08-12T12:00:00.000Z' } }] });
  const router = new ProviderRouter({ db, adapters: { search, fetch }, now: () => '2026-08-12T12:00:00.000Z' });
  const acquisition = new AcquisitionService(router);
  let sequence = 0;
  const verifier = new FactVerifier(db, acquisition, { trustedHosts: { 'example.gov.om': 'official' }, now: () => '2026-08-12T12:00:00.000Z', id: (prefix) => `${prefix}_verify_${++sequence}` });
  return { db, search, fetch, acquisition, verifier };
}

const candidate = {
  category_id: 'cat_oman', node_id: 'node_oman_landmarks',
  subject_key: 'bahla_fort', predicate_key: 'unesco_inscription_year', object_key: '1987',
  statement_en: 'Bahla Fort was inscribed on the UNESCO World Heritage List in 1987.',
  statement_ar: 'أُدرجت قلعة بهلاء على قائمة التراث العالمي لليونسكو عام 1987.',
  answer_en: '1987', answer_ar: '1987', answer_type: 'year',
  search_query: 'Bahla Fort UNESCO inscription year official', stability_class: 'historical',
};

test('bounded search/fetch keeps snippets non-evidentiary and blocks private targets before dispatch', async () => {
  const { db, search, fetch, acquisition } = setup({ body: candidate.statement_en });
  try {
    const results = await acquisition.search({ query: 'قلعة بهلاء اليونسكو', language: 'ar', region: 'OM' });
    assert.equal(results.results[0].snippet_is_evidence, false);
    assert.equal(search.calls.length, 1);
    await assert.rejects(acquisition.fetchPage({ url: 'http://127.0.0.1/secret' }), (error) => error.code === 'policy');
    assert.equal(fetch.calls.length, 0);
  } finally { db.close(); }
});

test('known-node verification promotes exact support from trusted fetched content into canonical Fact once', async () => {
  const context = setup({ body: `<main>${candidate.statement_en}</main>` });
  try {
    const result = await context.verifier.verify(candidate);
    assert.equal(result.status, 'verified');
    assert.equal(result.supporting_sources, 1);
    const fact = context.db.prepare('SELECT * FROM facts WHERE id=?').get(result.fact_id);
    assert.equal(fact.lifecycle_state, 'verified');
    assert.equal(context.db.prepare('SELECT COUNT(*) count FROM source_evidence WHERE fact_id=? AND status=\'valid\'').get(result.fact_id).count, 1);
    assert.equal(context.db.prepare('SELECT result FROM validations WHERE fact_id=?').get(result.fact_id).result, 'passed');
    const retry = await context.verifier.verify(candidate);
    assert.equal(retry.fact_id, result.fact_id);
    assert.equal(retry.reused, true);
    assert.equal(context.search.calls.length, 1);
    assert.equal(context.fetch.calls.length, 1);
  } finally { context.db.close(); }
});

test('unsupported fetched page rejects candidate and never promotes search snippet as evidence', async () => {
  const context = setup({ body: 'This official page discusses the fort but does not state the claimed year.' });
  try {
    const result = await context.verifier.verify(candidate);
    assert.equal(result.status, 'rejected');
    assert.equal(context.db.prepare("SELECT COUNT(*) count FROM facts WHERE subject_key='bahla_fort'").get().count, 0);
    assert.equal(context.db.prepare('SELECT status FROM fact_candidates').get().status, 'rejected');
  } finally { context.db.close(); }
});
