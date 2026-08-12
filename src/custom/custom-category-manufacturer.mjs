import { randomUUID } from 'node:crypto';
import { QuestionBank } from '../engine/question-bank.mjs';

export class CustomCategoryManufacturer {
  constructor(db, verifier, foundry, { now = () => new Date().toISOString(), id = () => `custom_mfg_${randomUUID()}` } = {}) {
    this.db = db; this.verifier = verifier; this.foundry = foundry; this.now = now; this.id = id;
  }

  async manufacture({ accountId, categoryId, items, reviewerId, itemBudget = 36, providerCallBudget = 120 }) {
    const definition = this.db.prepare(`SELECT d.*, c.lifecycle_state, km.status map_status
      FROM custom_category_definitions d JOIN categories c ON c.id=d.category_id
      JOIN custom_knowledge_maps km ON km.category_id=d.category_id
      WHERE d.category_id=? AND d.account_id=? ORDER BY km.version DESC LIMIT 1`).get(categoryId, accountId);
    if (!definition || definition.readiness_status !== 'draft' || definition.lifecycle_state !== 'candidate' || definition.map_status !== 'viable') throw new Error('Viable owned custom draft required');
    if (!Array.isArray(items) || items.length < 6 || items.length > itemBudget || itemBudget > 36) throw new Error('Manufacturing items exceed bounded budget');
    if (!Number.isInteger(providerCallBudget) || providerCallBudget < items.length * 3 || providerCallBudget > 500) throw new Error('Provider call budget cannot satisfy bounded stages');
    for (const level of [100, 200, 300]) if (items.filter((item) => item.difficulty === level).length < 2) throw new Error(`At least two candidates required for ${level}`);
    const prior = this.db.prepare('SELECT * FROM custom_manufacturing_jobs WHERE category_id=? AND definition_version=?').get(categoryId, definition.version);
    if (prior) return { job_id: prior.id, status: prior.status, completed_items: prior.completed_items, provider_calls: prior.provider_calls, reused: true };
    const jobId = this.id();
    const now = this.now();
    this.db.prepare(`INSERT INTO custom_manufacturing_jobs(id, category_id, account_id, definition_version, status, item_budget, provider_call_budget, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'running', ?, ?, ?, ?)`).run(jobId, categoryId, accountId, definition.version, itemBudget, providerCallBudget, now, now);
    const callsBefore = this.db.prepare('SELECT COUNT(*) count FROM provider_runs').get().count;
    const published = [];
    try {
      for (const [index, item] of items.entries()) {
        const currentJob = this.db.prepare('SELECT status FROM custom_manufacturing_jobs WHERE id=?').get(jobId);
        if (currentJob.status === 'cancelled') return { job_id: jobId, status: 'cancelled', completed_items: index, reused: false };
        const verified = await this.verifier.verify({ ...item.fact_candidate, category_id: categoryId });
        if (verified.status !== 'verified') throw new Error(`Fact candidate ${index + 1} did not verify`);
        const foundryJob = await this.foundry.manufacture({ factId: verified.fact_id, difficulty: item.difficulty });
        if (foundryJob.status !== 'needs_review') throw new Error(`Question candidate ${index + 1} did not reach review`);
        const approved = this.foundry.approve({ jobId: foundryJob.job_id, reviewerId });
        published.push({ fact_id: verified.fact_id, question_id: approved.question_id, difficulty: item.difficulty });
        const calls = this.db.prepare('SELECT COUNT(*) count FROM provider_runs').get().count - callsBefore;
        if (calls > providerCallBudget) throw new Error('Provider call budget exhausted');
        this.db.prepare('UPDATE custom_manufacturing_jobs SET completed_items=?, provider_calls=?, updated_at=? WHERE id=?').run(index + 1, calls, this.now(), jobId);
      }
      this.db.prepare("UPDATE categories SET lifecycle_state='available', updated_at=? WHERE id=?").run(this.now(), categoryId);
      const bank = new QuestionBank(this.db);
      for (const language of ['ar', 'en']) for (const difficulty of [100, 200, 300]) {
        if (bank.findCandidates({ categoryId, difficulty, language, limit: 100, asOf: this.now() }).length < 2) throw new Error(`Manufactured stock is not package-capable for ${language}/${difficulty}`);
      }
      const completedAt = this.now();
      const calls = this.db.prepare('SELECT COUNT(*) count FROM provider_runs').get().count - callsBefore;
      this.db.prepare("UPDATE custom_category_definitions SET readiness_status='ready', updated_at=?, ready_at=? WHERE category_id=?").run(completedAt, completedAt, categoryId);
      this.db.prepare("UPDATE custom_manufacturing_jobs SET status='ready', completed_items=?, provider_calls=?, result_json=?, updated_at=?, completed_at=? WHERE id=?")
        .run(published.length, calls, JSON.stringify({ published }), completedAt, completedAt, jobId);
      return { job_id: jobId, status: 'ready', completed_items: published.length, provider_calls: calls, published, reused: false };
    } catch (error) {
      this.db.prepare("UPDATE categories SET lifecycle_state='candidate', updated_at=? WHERE id=?").run(this.now(), categoryId);
      this.db.prepare("UPDATE custom_category_definitions SET readiness_status=?, updated_at=? WHERE category_id=?")
        .run(published.length ? 'limited' : 'failed', this.now(), categoryId);
      this.db.prepare("UPDATE custom_manufacturing_jobs SET status=?, failure_code=?, provider_calls=?, result_json=?, updated_at=?, completed_at=? WHERE id=?")
        .run(published.length ? 'limited' : 'failed', error.code ?? 'manufacturing_failed', this.db.prepare('SELECT COUNT(*) count FROM provider_runs').get().count - callsBefore,
          JSON.stringify({ published }), this.now(), this.now(), jobId);
      throw error;
    }
  }

  cancel({ accountId, jobId }) {
    const job = this.db.prepare("SELECT * FROM custom_manufacturing_jobs WHERE id=? AND account_id=? AND status IN ('pending','running')").get(jobId, accountId);
    if (!job) throw new Error('Cancellable custom manufacturing job not found');
    this.db.prepare("UPDATE custom_manufacturing_jobs SET status='cancelled', updated_at=?, completed_at=? WHERE id=?").run(this.now(), this.now(), jobId);
    return { job_id: jobId, status: 'cancelled' };
  }
}
