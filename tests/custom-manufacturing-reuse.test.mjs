import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { FakeFetchAdapter, FakeReasoningAdapter, FakeSearchAdapter } from '../src/providers/fake-adapters.mjs';
import { ProviderRouter } from '../src/providers/provider-router.mjs';
import { AcquisitionService } from '../src/acquisition/acquisition-service.mjs';
import { FactVerifier } from '../src/foundry/fact-verifier.mjs';
import { QuestionWriter } from '../src/foundry/question-writer.mjs';
import { QuestionFoundry } from '../src/foundry/question-foundry.mjs';
import { CustomCategoryService } from '../src/custom/custom-category-service.mjs';
import { CustomKnowledgeMapPlanner } from '../src/custom/knowledge-map-planner.mjs';
import { CustomCategoryManufacturer } from '../src/custom/custom-category-manufacturer.mjs';
import { GameService } from '../src/engine/game-service.mjs';

const scope = { title_en: 'GameCube Factory Fixture', title_ar: 'فئة جيم كيوب التجريبية', domain_slug: 'gamecube-factory-fixture', inclusions: ['hardware', 'games', 'history'], exclusions: [], seed_entities: ['GameCube'], region_scope: ['GLOBAL'], time_bounds: null, source_expectation: 'strong', confidence: 0.95 };
const map = { data: { branches: [
  { slug: 'hardware', name_en: 'Hardware', name_ar: 'العتاد', description: 'Hardware facts', capacity: { 100: 4, 200: 4, 300: 4 }, source_queries: ['GameCube hardware official'] },
  { slug: 'games', name_en: 'Games', name_ar: 'الألعاب', description: 'Game facts', capacity: { 100: 4, 200: 4, 300: 4 }, source_queries: ['GameCube games official'] },
  { slug: 'history', name_en: 'History', name_ar: 'التاريخ', description: 'History facts', capacity: { 100: 4, 200: 4, 300: 4 }, source_queries: ['GameCube history official'] },
], source_viability: { status: 'viable', trusted_hosts: ['archive.nintendo.com'] } } };

function fixtures(nodeIds) {
  const items = [];
  const searches = [];
  const fetches = [];
  const writings = [];
  for (let index = 0; index < 9; index += 1) {
    const number = index + 1;
    const difficulty = [100, 200, 300][Math.floor(index / 3)];
    const code = `GCN-${number}`;
    const statement = `Official GameCube fixture number ${number} has catalog code ${code}.`;
    const url = `https://archive.nintendo.com/gamecube/fixture-${number}`;
    items.push({ difficulty, fact_candidate: {
      node_id: nodeIds[index % nodeIds.length], subject_key: `gamecube_fixture_${number}`, predicate_key: 'catalog_code', object_key: `gcn_${number}`,
      statement_en: statement, statement_ar: `يحمل عنصر جيم كيوب التجريبي رقم ${number} رمز الفهرس ${code}.`, answer_en: code, answer_ar: code,
      answer_type: 'code', search_query: `official GameCube fixture ${number}`, stability_class: 'historical',
    } });
    searches.push({ data: { results: [{ url, title: `Official fixture ${number}`, snippet: statement, language: 'en' }] } });
    fetches.push({ data: { url, final_url: url, status: 200, content_type: 'text/html', body: `<main>${statement}</main>`, retrieved_at: '2026-08-12T12:00:00.000Z' } });
    writings.push({ data: { variants: [
      { language: 'en', question_text: `Which catalog code belongs to official GameCube fixture number ${number}?`, answer_display: code, accepted_answers: [] },
      { language: 'ar', question_text: `ما رمز الفهرس الخاص بعنصر جيم كيوب التجريبي رقم ${number}؟`, answer_display: code, accepted_answers: [] },
    ] } });
  }
  return { items, searches, fetches, writings };
}

test('source-rich custom scope manufactures through ordinary gates and second use costs zero provider calls', async () => {
  const db = openDatabase();
  importMvpSeed(db);
  let sequence = 0;
  const ids = (prefix = 'id') => `${prefix}_custom_mfg_${++sequence}`;
  try {
    const categories = new CustomCategoryService(db, { now: () => '2026-08-12T12:00:00.000Z', id: ids });
    const draft = categories.createDraftFromScope({ accountId: 'acct_custom_mfg', slug: 'gamecube-factory-fixture', originalScopeText: 'GameCube hardware, games, and history.', normalizedScope: scope });
    const mapAdapter = new FakeReasoningAdapter({ responses: [map] });
    const mapPlanner = new CustomKnowledgeMapPlanner(db, new ProviderRouter({ db, adapters: { reasoning: mapAdapter } }), { now: () => '2026-08-12T12:00:00.000Z', id: ids });
    await mapPlanner.plan({ accountId: 'acct_custom_mfg', categoryId: draft.category_id });
    const nodeIds = db.prepare('SELECT id FROM knowledge_nodes WHERE category_id=? ORDER BY slug').all(draft.category_id).map((row) => row.id);
    const prepared = fixtures(nodeIds);

    const search = new FakeSearchAdapter({ responses: prepared.searches });
    const fetch = new FakeFetchAdapter({ responses: prepared.fetches });
    const reasoning = new FakeReasoningAdapter({ responses: prepared.writings });
    const router = new ProviderRouter({ db, adapters: { search, fetch, reasoning }, now: () => '2026-08-12T12:00:00.000Z', id: () => ids('provider_run') });
    const acquisition = new AcquisitionService(router);
    const verifier = new FactVerifier(db, acquisition, { trustedHosts: { 'archive.nintendo.com': 'official' }, now: () => '2026-08-12T12:00:00.000Z', id: ids });
    const writer = new QuestionWriter(db, router, { now: () => '2026-08-12T12:00:00.000Z', id: ids });
    const foundry = new QuestionFoundry(db, writer, { now: () => '2026-08-12T12:00:00.000Z', id: ids });
    const manufacturer = new CustomCategoryManufacturer(db, verifier, foundry, { now: () => '2026-08-12T12:00:00.000Z', id: () => ids('custom_job') });
    const manufactured = await manufacturer.manufacture({ accountId: 'acct_custom_mfg', categoryId: draft.category_id, items: prepared.items, reviewerId: 'editor:amal', itemBudget: 9, providerCallBudget: 27 });
    assert.equal(manufactured.status, 'ready');
    assert.equal(manufactured.completed_items, 9);
    assert.equal(manufactured.provider_calls, 27);
    assert.equal(search.calls.length, 9);
    assert.equal(fetch.calls.length, 9);
    assert.equal(reasoning.calls.length, 9);

    const games = new GameService(db, { now: () => '2026-08-12T12:00:00.000Z', id: ids });
    const first = games.createGame({ account_id: 'acct_custom_mfg', language: 'ar', region: 'OM', selected_category_ids: [draft.category_id], teams: [{ display_name: 'أ' }, { display_name: 'ب' }], idempotency_key: 'custom-mfg-game-1' });
    games.prepareGame(first.game_id, first.host_token, { idempotency_key: 'prepare-custom-mfg-1', expected_state_version: 1 });
    const board = games.getBoard(first.game_id, first.host_token);
    const selected = games.selectCategory(first.game_id, first.host_token, { category_id: draft.category_id, acting_team_id: board.active_team_id, idempotency_key: 'select-custom-mfg', expected_state_version: board.state_version });
    const active = games.activateSlot(first.game_id, first.host_token, { category_id: draft.category_id, difficulty: 100, team_id: board.active_team_id, idempotency_key: 'activate-custom-mfg', expected_state_version: selected.state_version });
    const exposedFact = db.prepare('SELECT fact_id FROM exposures WHERE slot_id=?').get(active.slot_id).fact_id;
    const callsAfterFirstUse = db.prepare('SELECT COUNT(*) count FROM provider_runs').get().count;

    const second = games.createGame({ account_id: 'acct_custom_mfg', language: 'en', region: 'OM', selected_category_ids: [draft.category_id], teams: [{ display_name: 'A' }, { display_name: 'B' }], idempotency_key: 'custom-mfg-game-2' });
    games.prepareGame(second.game_id, second.host_token, { idempotency_key: 'prepare-custom-mfg-2', expected_state_version: 1 });
    const callsAfterSecondUse = db.prepare('SELECT COUNT(*) count FROM provider_runs').get().count;
    assert.equal(callsAfterSecondUse, callsAfterFirstUse, 'saved custom inventory should prepare again with no provider work');
    assert.equal(db.prepare(`SELECT COUNT(*) count FROM game_slots gs JOIN game_packages gp ON gp.id=gs.package_id
      WHERE gp.game_id=? AND (gs.primary_fact_id=? OR gs.fallback_fact_id=?)`).get(second.game_id, exposedFact, exposedFact).count, 0);
    assert.equal(db.prepare('SELECT readiness_status FROM custom_category_definitions WHERE category_id=?').get(draft.category_id).readiness_status, 'ready');
  } finally { db.close(); }
});
