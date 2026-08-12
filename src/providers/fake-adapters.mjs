import { ProviderExecutionError } from './contracts.mjs';

class DeterministicFakeAdapter {
  constructor({ key, responses = [], handler } = {}) {
    this.key = key ?? 'deterministic-fake';
    this.responses = [...responses];
    this.handler = handler;
    this.calls = [];
  }

  async execute(request) {
    this.calls.push(structuredClone(request));
    const next = this.handler ? await this.handler(request, this.calls.length - 1) : this.responses.shift();
    if (next instanceof Error) throw next;
    if (next?.error) throw new ProviderExecutionError(next.error.code ?? 'internal', next.error.message);
    if (next === undefined) throw new ProviderExecutionError('unavailable', 'Fake adapter has no configured response');
    return structuredClone(next);
  }
}

export class FakeReasoningAdapter extends DeterministicFakeAdapter {}
export class FakeSearchAdapter extends DeterministicFakeAdapter {}
export class FakeFetchAdapter extends DeterministicFakeAdapter {}
