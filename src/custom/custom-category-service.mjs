import { randomUUID } from 'node:crypto';
import { inTransaction } from '../storage/database.mjs';
import { QuestionBank } from '../engine/question-bank.mjs';

export class CustomCategoryService {
  constructor(db, { now = () => new Date().toISOString(), id = (prefix) => `${prefix}_${randomUUID()}` } = {}) {
    this.db = db;
    this.now = now;
    this.id = id;
  }

  createManualReady({ accountId, accountDisplayName = 'Guess Machine Account', slug, nameEn, nameAr, originalScopeText, factIds }) {
    if (typeof accountId !== 'string' || !accountId.trim() || accountId.length > 128) throw new Error('Valid account required');
    if (!/^[a-z0-9][a-z0-9-]{2,80}$/.test(slug ?? '')) throw new Error('Valid custom category slug required');
    for (const value of [nameEn, nameAr, originalScopeText]) if (typeof value !== 'string' || !value.trim() || value.length > 500) throw new Error('Valid custom category text required');
    if (!Array.isArray(factIds) || new Set(factIds).size < 6 || factIds.some((factId) => typeof factId !== 'string')) throw new Error('At least six unique verified Facts are required');
    const categoryId = this.id('custom_category');
    const now = this.now();
    return inTransaction(this.db, () => {
      this.db.prepare('INSERT INTO accounts(id, display_name, created_at) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING').run(accountId, accountDisplayName, now);
      this.db.prepare(`INSERT INTO categories(id, slug, name_en, name_ar, description_en, description_ar, category_type, lifecycle_state, owner_account_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'custom', 'available', ?, ?, ?)`)
        .run(categoryId, slug, nameEn.trim(), nameAr.trim(), originalScopeText.trim(), originalScopeText.trim(), accountId, now, now);
      this.db.prepare(`INSERT INTO custom_category_definitions(category_id, account_id, original_scope_text, normalized_scope_json, readiness_status, created_at, updated_at, ready_at)
        VALUES (?, ?, ?, '{}', 'draft', ?, ?, NULL)`).run(categoryId, accountId, originalScopeText.trim(), now, now);
      for (const factId of new Set(factIds)) {
        const fact = this.db.prepare("SELECT 1 FROM facts WHERE id=? AND lifecycle_state='verified'").get(factId);
        if (!fact) throw new Error('Custom category Fact is not verified');
        this.db.prepare('INSERT INTO fact_categories(fact_id, category_id) VALUES (?, ?)').run(factId, categoryId);
      }
      const bank = new QuestionBank(this.db);
      for (const language of ['ar', 'en']) {
        for (const difficulty of [100, 200, 300]) {
          if (bank.findCandidates({ categoryId, difficulty, language, limit: 100, asOf: now }).length < 2) throw new Error(`Custom category lacks ${language}/${difficulty} primary and fallback stock`);
        }
      }
      this.db.prepare("UPDATE custom_category_definitions SET readiness_status='ready', updated_at=?, ready_at=? WHERE category_id=?").run(now, now, categoryId);
      return { category_id: categoryId, readiness_status: 'ready', fact_count: new Set(factIds).size };
    });
  }

  createDraftFromScope({ accountId, accountDisplayName = 'Guess Machine Account', slug, originalScopeText, normalizedScope }) {
    if (typeof accountId !== 'string' || !accountId.trim() || accountId.length > 128) throw new Error('Valid account required');
    if (!/^[a-z0-9][a-z0-9-]{2,80}$/.test(slug ?? '')) throw new Error('Valid custom category slug required');
    if (typeof originalScopeText !== 'string' || !originalScopeText.trim() || originalScopeText.length > 500) throw new Error('Valid original scope required');
    if (!normalizedScope || typeof normalizedScope !== 'object' || !normalizedScope.title_en || !normalizedScope.title_ar) throw new Error('Normalized scope required');
    const categoryId = this.id('custom_category');
    const now = this.now();
    return inTransaction(this.db, () => {
      this.db.prepare('INSERT INTO accounts(id, display_name, created_at) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING').run(accountId, accountDisplayName, now);
      this.db.prepare(`INSERT INTO categories(id, slug, name_en, name_ar, description_en, description_ar, category_type, lifecycle_state, owner_account_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'custom', 'candidate', ?, ?, ?)`)
        .run(categoryId, slug, normalizedScope.title_en, normalizedScope.title_ar, originalScopeText.trim(), originalScopeText.trim(), accountId, now, now);
      this.db.prepare(`INSERT INTO custom_category_definitions(category_id, account_id, original_scope_text, normalized_scope_json, readiness_status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'draft', ?, ?)`)
        .run(categoryId, accountId, originalScopeText.trim(), JSON.stringify(normalizedScope), now, now);
      return { category_id: categoryId, readiness_status: 'draft', scope_version: 1 };
    });
  }

  retire({ accountId, categoryId }) {
    const definition = this.db.prepare('SELECT * FROM custom_category_definitions WHERE category_id=? AND account_id=?').get(categoryId, accountId);
    if (!definition) throw new Error('Owned custom category not found');
    const now = this.now();
    return inTransaction(this.db, () => {
      this.db.prepare("UPDATE custom_category_definitions SET readiness_status='retired', updated_at=?, retired_at=? WHERE category_id=?").run(now, now, categoryId);
      this.db.prepare("UPDATE categories SET lifecycle_state='retired', updated_at=? WHERE id=?").run(now, categoryId);
      return { category_id: categoryId, readiness_status: 'retired' };
    });
  }
}
