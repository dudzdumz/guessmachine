import { randomUUID } from 'node:crypto';
import { QuestionBank } from '../engine/question-bank.mjs';

export class InventoryReplenisher {
  constructor(db, { now = () => new Date().toISOString(), id = () => `demand_${randomUUID()}` } = {}) {
    this.db = db;
    this.now = now;
    this.id = id;
  }

  evaluate({ categoryId, difficulty, language, targetStock }) {
    if (!Number.isInteger(targetStock) || targetStock < 1 || targetStock > 100) throw new RangeError('Target stock must be between 1 and 100');
    const currentStock = new QuestionBank(this.db).findCandidates({ categoryId, difficulty, language, limit: 1000, asOf: this.now() }).length;
    const demandKey = `${categoryId}:${difficulty}:${language}:v1`;
    const existing = this.db.prepare('SELECT * FROM inventory_demands WHERE demand_key=?').get(demandKey);
    const now = this.now();
    if (currentStock >= targetStock) {
      if (existing && ['open', 'in_progress'].includes(existing.status)) {
        this.db.prepare("UPDATE inventory_demands SET current_stock=?, target_stock=?, requested_count=0, status='satisfied', updated_at=?, satisfied_at=? WHERE id=?")
          .run(currentStock, targetStock, now, now, existing.id);
      }
      return { demand_id: existing?.id ?? null, status: 'satisfied', current_stock: currentStock, target_stock: targetStock, requested_count: 0, reused: Boolean(existing) };
    }
    const requested = targetStock - currentStock;
    if (existing) {
      this.db.prepare("UPDATE inventory_demands SET current_stock=?, target_stock=?, requested_count=?, status='open', updated_at=?, satisfied_at=NULL WHERE id=?")
        .run(currentStock, targetStock, requested, now, existing.id);
      return { demand_id: existing.id, status: 'open', current_stock: currentStock, target_stock: targetStock, requested_count: requested, reused: true };
    }
    const demandId = this.id();
    this.db.prepare(`INSERT INTO inventory_demands(id, demand_key, category_id, difficulty, language, current_stock, target_stock,
      requested_count, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`)
      .run(demandId, demandKey, categoryId, difficulty, language, currentStock, targetStock, requested, now, now);
    return { demand_id: demandId, status: 'open', current_stock: currentStock, target_stock: targetStock, requested_count: requested, reused: false };
  }

  async fulfill({ demandId, factIds, foundry, reviewerId }) {
    const demand = this.db.prepare("SELECT * FROM inventory_demands WHERE id=? AND status IN ('open','in_progress')").get(demandId);
    if (!demand) throw new Error('Open inventory demand not found');
    if (!Array.isArray(factIds) || !factIds.length || factIds.length > demand.requested_count) throw new Error('Fact inputs must be bounded by requested stock');
    this.db.prepare("UPDATE inventory_demands SET status='in_progress', updated_at=? WHERE id=?").run(this.now(), demandId);
    const published = [];
    try {
      for (const factId of [...new Set(factIds)]) {
        const category = this.db.prepare('SELECT 1 FROM fact_categories WHERE fact_id=? AND category_id=?').get(factId, demand.category_id);
        if (!category) throw new Error('Fact does not satisfy demand category');
        const job = await foundry.manufacture({ factId, difficulty: demand.difficulty });
        if (job.status !== 'needs_review') throw new Error('Foundry item did not reach review');
        published.push(foundry.approve({ jobId: job.job_id, reviewerId }).question_id);
      }
      return { ...this.evaluate({ categoryId: demand.category_id, difficulty: demand.difficulty, language: demand.language, targetStock: demand.target_stock }), published_question_ids: published };
    } catch (error) {
      this.db.prepare("UPDATE inventory_demands SET status='failed', updated_at=? WHERE id=?").run(this.now(), demandId);
      throw error;
    }
  }
}
