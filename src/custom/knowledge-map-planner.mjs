import { randomUUID } from 'node:crypto';
import { ProviderExecutionError } from '../providers/contracts.mjs';
import { inTransaction } from '../storage/database.mjs';

function bounded(value, field, max = 160) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new ProviderExecutionError('malformed_response', `Invalid ${field}`);
  return value.trim();
}

export class CustomKnowledgeMapPlanner {
  constructor(db, router, { now = () => new Date().toISOString(), id = (prefix) => `${prefix}_${randomUUID()}` } = {}) {
    this.db = db; this.router = router; this.now = now; this.id = id;
  }

  async plan({ accountId, categoryId }) {
    const definition = this.db.prepare(`SELECT c.*, d.normalized_scope_json, d.version scope_version
      FROM custom_category_definitions d JOIN categories c ON c.id=d.category_id
      WHERE d.category_id=? AND d.account_id=? AND d.readiness_status='draft' AND c.lifecycle_state='candidate'`).get(categoryId, accountId);
    if (!definition) throw new Error('Owned draft custom category not found');
    const existing = this.db.prepare('SELECT * FROM custom_knowledge_maps WHERE category_id=? AND scope_version=? ORDER BY version DESC LIMIT 1').get(categoryId, definition.scope_version);
    if (existing) return { map_id: existing.id, status: existing.status, branches: JSON.parse(existing.branches_json), reused: true };
    const scope = JSON.parse(definition.normalized_scope_json);
    const response = await this.router.execute('reasoning', {
      task: 'plan_custom_knowledge_map', schema_version: 1,
      input: { category_id: categoryId, normalized_scope: scope, constraints: { min_branches: 3, max_branches: 12, required_difficulties: [100, 200, 300], no_fact_writing: true } },
    });
    if (!Array.isArray(response.data.branches) || response.data.branches.length < 3 || response.data.branches.length > 12) throw new ProviderExecutionError('malformed_response', 'KnowledgeMap requires 3–12 branches');
    const slugs = new Set();
    const branches = response.data.branches.map((branch) => {
      const slug = bounded(branch.slug, 'branch slug', 80);
      if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug) || slugs.has(slug)) throw new ProviderExecutionError('malformed_response', 'Branch slugs must be unique');
      slugs.add(slug);
      const capacity = {};
      for (const level of [100, 200, 300]) {
        const value = Number(branch.capacity?.[level]);
        if (!Number.isInteger(value) || value < 0 || value > 100) throw new ProviderExecutionError('malformed_response', 'Invalid branch capacity');
        capacity[level] = value;
      }
      const sourceQueries = branch.source_queries ?? [];
      if (!Array.isArray(sourceQueries) || sourceQueries.length < 1 || sourceQueries.length > 8 || sourceQueries.some((query) => typeof query !== 'string' || !query.trim() || query.length > 300)) throw new ProviderExecutionError('malformed_response', 'Invalid source plan');
      return { slug, name_en: bounded(branch.name_en, 'English branch name'), name_ar: bounded(branch.name_ar, 'Arabic branch name'), description: bounded(branch.description, 'branch description', 400), capacity, source_queries: sourceQueries.map((query) => query.trim()) };
    });
    const aggregateCapacity = Object.fromEntries([100, 200, 300].map((level) => [level, branches.reduce((sum, branch) => sum + branch.capacity[level], 0)]));
    const viability = response.data.source_viability ?? {};
    const viable = [100, 200, 300].every((level) => aggregateCapacity[level] >= 2) && viability.status === 'viable';
    const status = viable ? 'viable' : [100, 200, 300].some((level) => aggregateCapacity[level] < 2) ? 'too_narrow' : 'source_poor';
    const mapId = this.id('knowledge_map');
    const now = this.now();
    inTransaction(this.db, () => {
      this.db.prepare(`INSERT INTO custom_knowledge_maps(id, category_id, version, scope_version, branches_json, capacity_json, source_viability_json, status, created_at, updated_at)
        VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`)
        .run(mapId, categoryId, definition.scope_version, JSON.stringify(branches), JSON.stringify(aggregateCapacity), JSON.stringify(viability), status, now, now);
      if (viable) {
        for (const branch of branches) {
          this.db.prepare(`INSERT INTO knowledge_nodes(id, category_id, slug, name_en, name_ar, lifecycle_state)
            VALUES (?, ?, ?, ?, ?, 'available')`).run(this.id('custom_node'), categoryId, branch.slug, branch.name_en, branch.name_ar);
        }
      }
    });
    return { map_id: mapId, status, branches, aggregate_capacity: aggregateCapacity, reused: false };
  }
}
