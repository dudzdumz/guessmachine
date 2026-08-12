import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { openDatabase } from '../src/storage/database.mjs';
import { importMvpSeed } from '../src/storage/seed.mjs';
import { createAppServer } from '../src/http/server.mjs';

async function setupApi() {
  const db = openDatabase();
  importMvpSeed(db);
  const { server } = createAppServer({ db });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  return {
    db, server, base,
    close: async () => { server.close(); await once(server, 'close'); db.close(); },
  };
}

async function request(base, path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { ...(token ? { 'x-game-token': token } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json() };
}

async function createReadyGame(api, language = 'en') {
  const created = await request(api.base, '/api/games', { method: 'POST', body: {
    account_id: 'acct_api', language, region: 'OM', idempotency_key: `create-${language}`,
    teams: [{ display_name: 'Falcons' }, { display_name: 'Stars' }],
    selected_category_ids: ['cat_football', 'cat_movies', 'cat_oman', 'cat_games'],
  } });
  assert.equal(created.status, 201);
  const prepared = await request(api.base, `/api/games/${created.body.game_id}/prepare`, { method: 'POST', token: created.body.host_token, body: { idempotency_key: `prepare-${language}`, expected_state_version: 1 } });
  assert.equal(prepared.status, 200);
  return { ...created.body, prepared: prepared.body };
}

test('shared display sees board and active question but never answer or future package', async () => {
  const api = await setupApi();
  try {
    const game = await createReadyGame(api);
    const board = await request(api.base, `/api/games/${game.game_id}/board`, { token: game.display_token });
    assert.equal(board.status, 200);
    assert.equal(board.body.categories.length, 4);
    assert.equal(JSON.stringify(board.body).includes('answer'), false);
    assert.equal(JSON.stringify(board.body).includes('primary_fact'), false);

    const teamId = board.body.active_team_id;
    const selected = await request(api.base, `/api/games/${game.game_id}/select-category`, { method: 'POST', token: game.host_token, body: { category_id: 'cat_football', acting_team_id: teamId, idempotency_key: 'select-1', expected_state_version: board.body.state_version } });
    const active = await request(api.base, `/api/games/${game.game_id}/activate`, { method: 'POST', token: game.host_token, body: { category_id: 'cat_football', difficulty: 200, team_id: teamId, idempotency_key: 'activate-1', expected_state_version: selected.body.state_version } });
    assert.equal(active.status, 200);
    const serialized = JSON.stringify(active.body);
    assert.equal(serialized.includes('answer'), false);
    assert.equal(serialized.includes('fallback'), false);
    assert.equal(serialized.includes('fact_id'), false);

    const forbiddenReveal = await request(api.base, `/api/games/${game.game_id}/reveal`, { method: 'POST', token: game.display_token, body: { slot_id: active.body.slot_id, idempotency_key: 'bad-reveal' } });
    assert.equal(forbiddenReveal.status, 403);
    const revealed = await request(api.base, `/api/games/${game.game_id}/reveal`, { method: 'POST', token: game.host_token, body: { slot_id: active.body.slot_id, idempotency_key: 'reveal-1', expected_state_version: active.body.state_version } });
    assert.equal(revealed.status, 200);
    assert.ok(revealed.body.answer_display);
  } finally { await api.close(); }
});

test('runtime mutations are idempotent and stale versions cannot overwrite state', async () => {
  const api = await setupApi();
  try {
    const game = await createReadyGame(api, 'ar');
    const board = (await request(api.base, `/api/games/${game.game_id}/board`, { token: game.host_token })).body;
    const payload = { category_id: 'cat_oman', acting_team_id: board.active_team_id, idempotency_key: 'select-retry', expected_state_version: board.state_version };
    const first = await request(api.base, `/api/games/${game.game_id}/select-category`, { method: 'POST', token: game.host_token, body: payload });
    const second = await request(api.base, `/api/games/${game.game_id}/select-category`, { method: 'POST', token: game.host_token, body: payload });
    assert.deepEqual(second.body, first.body);
    const stale = await request(api.base, `/api/games/${game.game_id}/activate`, { method: 'POST', token: game.host_token, body: { category_id: 'cat_oman', difficulty: 100, team_id: board.active_team_id, idempotency_key: 'stale-activation', expected_state_version: board.state_version } });
    assert.equal(stale.status, 409);
    assert.equal(stale.body.code, 'STALE_CLIENT_STATE');
  } finally { await api.close(); }
});

test('contract-level full game transition activates prepared content and advances score/turn', async () => {
  const api = await setupApi();
  try {
    const game = await createReadyGame(api);
    let board = (await request(api.base, `/api/games/${game.game_id}/board`, { token: game.host_token })).body;
    const selected = (await request(api.base, `/api/games/${game.game_id}/select-category`, { method: 'POST', token: game.host_token, body: { category_id: 'cat_games', acting_team_id: board.active_team_id, idempotency_key: 'select-full', expected_state_version: board.state_version } })).body;
    const active = (await request(api.base, `/api/games/${game.game_id}/activate`, { method: 'POST', token: game.host_token, body: { category_id: 'cat_games', difficulty: 300, team_id: board.active_team_id, idempotency_key: 'activate-full', expected_state_version: selected.state_version } })).body;
    const revealed = (await request(api.base, `/api/games/${game.game_id}/reveal`, { method: 'POST', token: game.host_token, body: { slot_id: active.slot_id, idempotency_key: 'reveal-full', expected_state_version: active.state_version } })).body;
    const outcome = await request(api.base, `/api/games/${game.game_id}/outcomes`, { method: 'POST', token: game.host_token, body: { slot_id: active.slot_id, team_id: board.active_team_id, outcome: 'correct', idempotency_key: 'outcome-full', expected_state_version: revealed.state_version } });
    assert.equal(outcome.status, 200);
    assert.equal(outcome.body.score_delta, 300);
    assert.notEqual(outcome.body.active_team_id, board.active_team_id);
    board = (await request(api.base, `/api/games/${game.game_id}/board`, { token: game.display_token })).body;
    assert.equal(board.categories.find((category) => category.category_id === 'cat_games').difficulties.find((item) => item.level === 300).status, 'used');
  } finally { await api.close(); }
});

test('malformed setup input and terminal-state mutation fail without partial writes', async () => {
  const api = await setupApi();
  try {
    const invalid = await request(api.base, '/api/games', { method: 'POST', body: {
      account_id: 'acct_invalid', language: 'en', region: 'OM', game_mode: 'unknown-mode', idempotency_key: 'invalid-create',
      teams: [{ display_name: 'Same' }, { display_name: 'Same' }], selected_category_ids: ['cat_football'],
    } });
    assert.equal(invalid.status, 400);
    assert.equal(api.db.prepare("SELECT COUNT(*) count FROM games WHERE account_id='acct_invalid'").get().count, 0);

    const game = await createReadyGame(api);
    const completed = await request(api.base, `/api/games/${game.game_id}/complete`, { method: 'POST', token: game.host_token, body: {
      idempotency_key: 'complete-early', expected_state_version: game.prepared.state_version,
    } });
    assert.equal(completed.status, 200);
    const abandoned = await request(api.base, `/api/games/${game.game_id}/abandon`, { method: 'POST', token: game.host_token, body: {
      reason: 'late-mutation', idempotency_key: 'abandon-after-complete', expected_state_version: completed.body.state_version,
    } });
    assert.equal(abandoned.status, 409);
    assert.equal(api.db.prepare('SELECT status FROM games WHERE id=?').get(game.game_id).status, 'completed');
  } finally { await api.close(); }
});

test('authoritative mutation and idempotency receipt commit or roll back together', async () => {
  const api = await setupApi();
  try {
    const game = await createReadyGame(api, 'en');
    const board = (await request(api.base, `/api/games/${game.game_id}/board`, { token: game.host_token })).body;
    api.db.exec(`CREATE TRIGGER fail_select_receipt BEFORE INSERT ON idempotency_records
      WHEN NEW.operation='select_category' BEGIN SELECT RAISE(ABORT, 'simulated receipt failure'); END;`);
    const selected = await request(api.base, `/api/games/${game.game_id}/select-category`, { method: 'POST', token: game.host_token, body: {
      category_id: 'cat_football', acting_team_id: board.active_team_id,
      idempotency_key: 'select-atomicity', expected_state_version: board.state_version,
    } });
    assert.equal(selected.status, 500);
    const after = api.db.prepare('SELECT selected_category_id, state_version FROM games WHERE id=?').get(game.game_id);
    assert.equal(after.selected_category_id, null);
    assert.equal(after.state_version, board.state_version);
    assert.equal(api.db.prepare("SELECT COUNT(*) count FROM idempotency_records WHERE operation='select_category' AND idempotency_key='select-atomicity'").get().count, 0);
  } finally { await api.close(); }
});
