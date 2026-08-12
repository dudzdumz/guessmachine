import { randomUUID } from 'node:crypto';
import { QuestionBank } from './question-bank.mjs';
import { persistGamePackage } from './package-store.mjs';
import { EngineError } from './errors.mjs';

const DIFFICULTIES = [100, 200, 300];

export function rankCandidate(candidate, nodeUse, entityUse) {
  const nodePenalty = candidate.node_id ? (nodeUse.get(candidate.node_id) ?? 0) * 10 : 0;
  const entityPenalty = candidate.answer_entity_id ? (entityUse.get(candidate.answer_entity_id) ?? 0) * 6 : 0;
  return nodePenalty + entityPenalty;
}

export function chooseCandidate(candidates, selectedFacts, nodeUse, entityUse) {
  const eligible = candidates.filter((candidate) => !selectedFacts.has(candidate.fact_id));
  eligible.sort((a, b) => rankCandidate(a, nodeUse, entityUse) - rankCandidate(b, nodeUse, entityUse) || a.fact_id.localeCompare(b.fact_id));
  return eligible[0];
}

export function assembleGamePackage(db, { gameId, categoryIds, language, excludeFactIds = [], now = new Date().toISOString() }) {
  const bank = new QuestionBank(db);
  const selectedFacts = new Set();
  const nodeUse = new Map();
  const entityUse = new Map();
  const selected = [];

  for (const categoryId of categoryIds) {
    for (const difficulty of DIFFICULTIES) {
      const candidates = bank.findCandidates({ categoryId, difficulty, language, excludeFactIds, limit: 100, asOf: now });
      const primary = chooseCandidate(candidates, selectedFacts, nodeUse, entityUse);
      if (!primary) {
        throw new EngineError('INVENTORY_INSUFFICIENT', 'MACHINE COULD NOT VERIFY ENOUGH QUESTIONS', {
          category: 'inventory', details: { categoryId, difficulty, language },
        });
      }
      selectedFacts.add(primary.fact_id);
      if (primary.node_id) nodeUse.set(primary.node_id, (nodeUse.get(primary.node_id) ?? 0) + 1);
      if (primary.answer_entity_id) entityUse.set(primary.answer_entity_id, (entityUse.get(primary.answer_entity_id) ?? 0) + 1);
      selected.push({ categoryId, difficulty, primary, candidatePool: candidates });
    }
  }

  const slots = selected.map(({ categoryId, difficulty, primary, candidatePool }) => {
    const fallback = candidatePool.find((candidate) => candidate.fact_id !== primary.fact_id && !selectedFacts.has(candidate.fact_id));
    if (!fallback) {
      throw new EngineError('INVENTORY_INSUFFICIENT', 'MACHINE COULD NOT PREPARE SAFE FALLBACKS', {
        category: 'inventory', details: { categoryId, difficulty, language },
      });
    }
    return {
      id: `slot_${randomUUID()}`,
      category_id: categoryId,
      difficulty,
      primary,
      fallback,
    };
  });

  const packageId = persistGamePackage(db, {
    gameId,
    slots,
    expectedSlotCount: categoryIds.length * DIFFICULTIES.length,
    now,
  });
  return { packageId, slotCount: slots.length, selectedFactIds: [...selectedFacts] };
}
