import { randomUUID } from 'node:crypto';
import { inTransaction } from '../storage/database.mjs';
import { EngineError } from './errors.mjs';

export function persistGamePackage(db, { packageId = `pkg_${randomUUID()}`, gameId, slots, expectedSlotCount, now = new Date().toISOString(), expiresAt = null, assemblyVersion = 'mvp-v1' }) {
  if (slots.length !== expectedSlotCount) {
    throw new EngineError('PACKAGE_INCOMPLETE', 'MACHINE COULD NOT PREPARE EVERY SLOT', { category: 'inventory', details: { expectedSlotCount, actual: slots.length } });
  }
  const primaryFacts = new Set(slots.map((slot) => slot.primary.fact_id));
  if (primaryFacts.size !== slots.length) {
    throw new EngineError('PACKAGE_DUPLICATE_FACT', 'MACHINE FOUND A REPEATED FACT', { category: 'inventory' });
  }
  if (slots.some((slot) => !slot.fallback?.fact_id)) {
    throw new EngineError('PACKAGE_FALLBACK_MISSING', 'MACHINE COULD NOT PREPARE A FALLBACK', { category: 'inventory' });
  }

  return inTransaction(db, () => {
    db.prepare(`INSERT INTO game_packages(id, game_id, assembly_version, status, created_at, expires_at)
      VALUES (?, ?, ?, 'preparing', ?, ?)`).run(packageId, gameId, assemblyVersion, now, expiresAt);
    const insert = db.prepare(`INSERT INTO game_slots(
      id, package_id, category_id, difficulty,
      primary_fact_id, primary_question_id, primary_variant_id, primary_question_snapshot, primary_answer_snapshot,
      primary_explanation_snapshot, primary_language_snapshot,
      fallback_fact_id, fallback_question_id, fallback_variant_id, fallback_question_snapshot, fallback_answer_snapshot,
      fallback_explanation_snapshot, fallback_language_snapshot
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const slot of slots) {
      insert.run(
        slot.id ?? `slot_${randomUUID()}`, packageId, slot.category_id, slot.difficulty,
        slot.primary.fact_id, slot.primary.question_id, slot.primary.variant_id, slot.primary.question_text,
        slot.primary.answer_display, slot.primary.explanation ?? null, slot.primary.language,
        slot.fallback.fact_id, slot.fallback.question_id, slot.fallback.variant_id, slot.fallback.question_text,
        slot.fallback.answer_display, slot.fallback.explanation ?? null, slot.fallback.language,
      );
    }
    const persisted = db.prepare('SELECT COUNT(*) count, COUNT(DISTINCT primary_fact_id) facts FROM game_slots WHERE package_id=?').get(packageId);
    if (persisted.count !== expectedSlotCount || persisted.facts !== expectedSlotCount) {
      throw new EngineError('PACKAGE_INVALID', 'MACHINE PACKAGE FAILED INTEGRITY CHECK', { category: 'inventory' });
    }
    db.prepare("UPDATE game_packages SET status='ready', ready_at=? WHERE id=?").run(now, packageId);
    return packageId;
  });
}
