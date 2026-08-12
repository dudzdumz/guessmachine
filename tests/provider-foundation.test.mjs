import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/storage/database.mjs';
import { FakeReasoningAdapter } from '../src/providers/fake-adapters.mjs';
import { ProviderRouter } from '../src/providers/provider-router.mjs';

const request = { task: 'structured_test', schema_version: 1, input: { value: 'safe' } };

test('provider-neutral router normalizes response, usage, and persistent audit', async () => {
  const db = openDatabase();
  try {
    const adapter = new FakeReasoningAdapter({ key: 'fake-reasoning-v1', responses: [{ data: { result: 'ok' }, usage: { input_units: 10, output_units: 4 } }] });
    const router = new ProviderRouter({ db, adapters: { reasoning: adapter }, now: () => '2026-08-12T12:00:00.000Z', id: () => 'provider_run_test' });
    const result = await router.execute('reasoning', request);
    assert.deepEqual(result.data, { result: 'ok' });
    assert.deepEqual(result.usage, { input_units: 10, output_units: 4, cost_micros: 0 });
    assert.deepEqual(adapter.calls, [request]);
    const audit = db.prepare('SELECT * FROM provider_runs WHERE id=?').get('provider_run_test');
    assert.equal(audit.status, 'succeeded');
    assert.equal(audit.adapter_key, 'fake-reasoning-v1');
    assert.equal(JSON.parse(audit.usage_json).cost_micros, 0);
  } finally { db.close(); }
});

test('disabled, timeout, and malformed providers fail with stable normalized codes', async () => {
  const disabled = new ProviderRouter();
  await assert.rejects(disabled.execute('reasoning', request), (error) => error.code === 'unavailable');

  const timeout = new ProviderRouter({ adapters: { reasoning: new FakeReasoningAdapter({ responses: [{ error: { code: 'timeout' } }] }) } });
  await assert.rejects(timeout.execute('reasoning', request), (error) => error.code === 'timeout');

  const malformed = new ProviderRouter({ adapters: { reasoning: new FakeReasoningAdapter({ responses: [{ data: 'not-an-object' }] }) } });
  await assert.rejects(malformed.execute('reasoning', request), (error) => error.code === 'malformed_response');
});

test('provider boundary rejects oversized and malformed tasks before adapter invocation', async () => {
  const adapter = new FakeReasoningAdapter({ responses: [{ data: { ok: true } }] });
  const router = new ProviderRouter({ adapters: { reasoning: adapter } });
  await assert.rejects(router.execute('reasoning', { task: '../bad', schema_version: 1, input: {} }), (error) => error.code === 'malformed_response');
  await assert.rejects(router.execute('reasoning', { task: 'large_input', schema_version: 1, input: { text: 'x'.repeat(70_000) } }), (error) => error.code === 'malformed_response');
  assert.equal(adapter.calls.length, 0);
});
