import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseCandidate, rankCandidate } from '../src/engine/assembly.mjs';

test('diversity ranking prefers a comparable unused topic and answer entity', () => {
  const candidates = [
    { fact_id: 'fact_a', node_id: 'node_used', answer_entity_id: 'entity_used' },
    { fact_id: 'fact_b', node_id: 'node_fresh', answer_entity_id: 'entity_fresh' },
    { fact_id: 'fact_c', node_id: 'node_used', answer_entity_id: 'entity_fresh' },
  ];
  const nodeUse = new Map([['node_used', 2]]);
  const entityUse = new Map([['entity_used', 1]]);
  assert.ok(rankCandidate(candidates[0], nodeUse, entityUse) > rankCandidate(candidates[2], nodeUse, entityUse));
  assert.equal(chooseCandidate(candidates, new Set(), nodeUse, entityUse).fact_id, 'fact_b');
});

test('hard Fact exclusions win over diversity scoring and ties stay deterministic', () => {
  const candidates = [
    { fact_id: 'fact_b', node_id: 'node_fresh', answer_entity_id: 'entity_fresh' },
    { fact_id: 'fact_a', node_id: 'node_fresh', answer_entity_id: 'entity_fresh' },
  ];
  assert.equal(chooseCandidate(candidates, new Set(), new Map(), new Map()).fact_id, 'fact_a');
  assert.equal(chooseCandidate(candidates, new Set(['fact_a']), new Map(), new Map()).fact_id, 'fact_b');
});
