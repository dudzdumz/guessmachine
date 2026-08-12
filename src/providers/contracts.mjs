import { createHash } from 'node:crypto';

const ERROR_CODES = new Set(['timeout', 'quota', 'authentication', 'policy', 'malformed_response', 'unavailable', 'cancelled', 'internal']);

export class ProviderExecutionError extends Error {
  constructor(code, message = 'Provider capability failed', { cause } = {}) {
    super(message, { cause });
    this.name = 'ProviderExecutionError';
    this.code = ERROR_CODES.has(code) ? code : 'internal';
  }
}

export function validateCapabilityRequest(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) throw new ProviderExecutionError('malformed_response', 'Capability request must be an object');
  if (!/^[a-z][a-z0-9_]{1,80}$/.test(request.task ?? '')) throw new ProviderExecutionError('malformed_response', 'Invalid capability task');
  if (!Number.isInteger(request.schema_version) || request.schema_version < 1) throw new ProviderExecutionError('malformed_response', 'Invalid schema version');
  if (!request.input || typeof request.input !== 'object' || Array.isArray(request.input)) throw new ProviderExecutionError('malformed_response', 'Capability input must be an object');
  const serialized = JSON.stringify(request);
  if (Buffer.byteLength(serialized) > 64_000) throw new ProviderExecutionError('malformed_response', 'Capability request is too large');
  return request;
}

export function validateCapabilityResponse(response) {
  if (!response || typeof response !== 'object' || Array.isArray(response) || !response.data || typeof response.data !== 'object' || Array.isArray(response.data)) {
    throw new ProviderExecutionError('malformed_response', 'Provider returned an invalid normalized response');
  }
  if (Buffer.byteLength(JSON.stringify(response.data)) > 128_000) throw new ProviderExecutionError('malformed_response', 'Provider response is too large');
  const usage = response.usage ?? {};
  for (const field of ['input_units', 'output_units', 'cost_micros']) {
    if (usage[field] !== undefined && (!Number.isInteger(usage[field]) || usage[field] < 0)) throw new ProviderExecutionError('malformed_response', 'Provider usage is invalid');
  }
  return {
    data: response.data,
    usage: { input_units: usage.input_units ?? 0, output_units: usage.output_units ?? 0, cost_micros: usage.cost_micros ?? 0 },
    trace_id: typeof response.trace_id === 'string' ? response.trace_id.slice(0, 200) : null,
  };
}

export function normalizeProviderError(error) {
  if (error instanceof ProviderExecutionError) return error;
  const raw = String(error?.code ?? '').toLowerCase();
  const map = { etimedout: 'timeout', timeout: 'timeout', rate_limit: 'quota', quota: 'quota', unauthorized: 'authentication', policy: 'policy', cancelled: 'cancelled', unavailable: 'unavailable' };
  return new ProviderExecutionError(map[raw] ?? 'internal', 'Provider capability failed', { cause: error });
}

export function capabilityInputHash(request) {
  return createHash('sha256').update(JSON.stringify(request)).digest('hex');
}
