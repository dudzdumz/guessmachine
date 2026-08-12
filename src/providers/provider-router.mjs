import { randomUUID } from 'node:crypto';
import { capabilityInputHash, normalizeProviderError, ProviderExecutionError, validateCapabilityRequest, validateCapabilityResponse } from './contracts.mjs';

export class ProviderRouter {
  constructor({ db = null, adapters = {}, now = () => new Date().toISOString(), id = () => `provider_run_${randomUUID()}` } = {}) {
    this.db = db;
    this.adapters = new Map(Object.entries(adapters));
    this.now = now;
    this.id = id;
  }

  register(capability, adapter) {
    if (this.adapters.has(capability)) throw new Error(`Capability already registered: ${capability}`);
    this.adapters.set(capability, adapter);
  }

  async execute(capability, request) {
    validateCapabilityRequest(request);
    const adapter = this.adapters.get(capability);
    if (!adapter) throw new ProviderExecutionError('unavailable', `Capability is disabled: ${capability}`);
    const runId = this.id();
    const createdAt = this.now();
    this.db?.prepare(`INSERT INTO provider_runs(id, capability, adapter_key, task, schema_version, input_hash, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'running', ?)`)
      .run(runId, capability, adapter.key ?? 'unknown-adapter', request.task, request.schema_version, capabilityInputHash(request), createdAt);
    try {
      const response = validateCapabilityResponse(await adapter.execute(structuredClone(request)));
      this.db?.prepare("UPDATE provider_runs SET status='succeeded', usage_json=?, completed_at=? WHERE id=?")
        .run(JSON.stringify(response.usage), this.now(), runId);
      return { ...response, run_id: runId };
    } catch (error) {
      const normalized = normalizeProviderError(error);
      this.db?.prepare("UPDATE provider_runs SET status='failed', error_code=?, completed_at=? WHERE id=?")
        .run(normalized.code, this.now(), runId);
      throw normalized;
    }
  }
}
