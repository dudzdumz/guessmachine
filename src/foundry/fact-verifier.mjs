import { createHash, randomUUID } from 'node:crypto';
import { inTransaction } from '../storage/database.mjs';
import { createFactFingerprint, normalizeForSearch } from '../domain/normalization.mjs';

function hash(value) { return createHash('sha256').update(value).digest('hex'); }
function cleanKey(value, field) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9:_-]{1,180}$/i.test(value)) throw new Error(`Invalid ${field}`);
  return value;
}
function cleanText(value, field, max = 1000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(`Invalid ${field}`);
  return value.trim();
}

export class FactVerifier {
  constructor(db, acquisition, { trustedHosts = {}, now = () => new Date().toISOString(), id = (prefix) => `${prefix}_${randomUUID()}` } = {}) {
    this.db = db;
    this.acquisition = acquisition;
    this.trustedHosts = new Map(Object.entries(trustedHosts).map(([host, tier]) => [host.toLowerCase(), tier]));
    this.now = now;
    this.id = id;
  }

  async verify(candidate) {
    const normalized = {
      category_id: cleanKey(candidate.category_id, 'category'),
      node_id: candidate.node_id == null ? null : cleanKey(candidate.node_id, 'node'),
      subject_key: cleanKey(candidate.subject_key, 'subject'),
      predicate_key: cleanKey(candidate.predicate_key, 'predicate'),
      object_key: cleanKey(candidate.object_key, 'object'),
      qualifiers: candidate.qualifiers == null ? '' : cleanText(candidate.qualifiers, 'qualifiers', 300),
      statement_en: cleanText(candidate.statement_en, 'English statement'),
      statement_ar: cleanText(candidate.statement_ar, 'Arabic statement'),
      answer_en: cleanText(candidate.answer_en, 'English answer', 160),
      answer_ar: cleanText(candidate.answer_ar, 'Arabic answer', 160),
      answer_type: cleanKey(candidate.answer_type, 'answer type'),
      search_query: cleanText(candidate.search_query, 'search query', 500),
      stability_class: ['historical', 'periodic', 'current'].includes(candidate.stability_class) ? candidate.stability_class : 'historical',
    };
    const category = this.db.prepare('SELECT category_type, lifecycle_state FROM categories WHERE id=?').get(normalized.category_id);
    if (!category || !(category.lifecycle_state === 'available' || (category.category_type === 'custom' && category.lifecycle_state === 'candidate'))) throw new Error('Category is not available for manufacturing');
    if (normalized.node_id && !this.db.prepare("SELECT 1 FROM knowledge_nodes WHERE id=? AND category_id=? AND lifecycle_state='available'").get(normalized.node_id, normalized.category_id)) throw new Error('Knowledge node is not available');
    const fingerprint = createFactFingerprint({ subject: normalized.subject_key, predicate: normalized.predicate_key, object: normalized.object_key, qualifiers: normalized.qualifiers });
    const existingFact = this.db.prepare('SELECT id FROM facts WHERE fingerprint=?').get(fingerprint);
    if (existingFact) {
      this.db.prepare('INSERT OR IGNORE INTO fact_categories(fact_id, category_id) VALUES (?, ?)').run(existingFact.id, normalized.category_id);
      if (normalized.node_id) this.db.prepare('INSERT OR IGNORE INTO fact_nodes(fact_id, node_id) VALUES (?, ?)').run(existingFact.id, normalized.node_id);
      return { status: 'verified', fact_id: existingFact.id, reused: true, supporting_sources: 0 };
    }

    const dedupeKey = `fact-verification:${fingerprint}`;
    const previous = this.db.prepare('SELECT * FROM manufacturing_jobs WHERE dedupe_key=?').get(dedupeKey);
    if (previous) {
      const previousCandidate = this.db.prepare('SELECT * FROM fact_candidates WHERE job_id=?').get(previous.id);
      return { status: previousCandidate.status, fact_id: previousCandidate.promoted_fact_id, reused: true, supporting_sources: 0 };
    }
    const now = this.now();
    const jobId = this.id('job');
    const candidateId = this.id('fact_candidate');
    this.db.prepare(`INSERT INTO manufacturing_jobs(id, job_type, dedupe_key, status, input_json, created_at, updated_at)
      VALUES (?, 'fact_verification', ?, 'running', ?, ?, ?)`).run(jobId, dedupeKey, JSON.stringify({ fingerprint, category_id: normalized.category_id, node_id: normalized.node_id }), now, now);
    this.db.prepare(`INSERT INTO fact_candidates(id, job_id, category_id, node_id, subject_key, predicate_key, object_key, qualifiers,
      statement_en, statement_ar, answer_en, answer_ar, answer_type, source_plan_json, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'candidate', ?, ?)`)
      .run(candidateId, jobId, normalized.category_id, normalized.node_id, normalized.subject_key, normalized.predicate_key,
        normalized.object_key, normalized.qualifiers, normalized.statement_en, normalized.statement_ar, normalized.answer_en,
        normalized.answer_ar, normalized.answer_type, JSON.stringify({ search_query: normalized.search_query }), now, now);

    try {
      const discovered = await this.acquisition.search({ query: normalized.search_query, language: 'en', region: 'OM', maxResults: 8 });
      const supporting = [];
      const claim = normalizeForSearch(normalized.statement_en, 'en');
      for (const result of discovered.results) {
        const host = new URL(result.url).hostname.toLowerCase();
        const trustTier = this.trustedHosts.get(host);
        if (!['official', 'authoritative'].includes(trustTier)) continue;
        const page = await this.acquisition.fetchPage({ url: result.url });
        if (normalizeForSearch(page.body, 'en').includes(claim)) supporting.push({ result, page, host, trustTier });
      }
      if (!supporting.length) {
        this.db.prepare("UPDATE fact_candidates SET status='rejected', rejection_code='insufficient_evidence', updated_at=? WHERE id=?").run(this.now(), candidateId);
        this.db.prepare("UPDATE manufacturing_jobs SET status='failed', failure_code='insufficient_evidence', updated_at=?, completed_at=? WHERE id=?").run(this.now(), this.now(), jobId);
        return { status: 'rejected', fact_id: null, reused: false, supporting_sources: 0 };
      }
      const factId = this.id('fact');
      const entityId = this.id('entity');
      inTransaction(this.db, () => {
        const promotedAt = this.now();
        this.db.prepare(`INSERT INTO facts(id, fingerprint, subject_key, predicate_key, object_key, qualifiers, statement_en, statement_ar,
          stability_class, lifecycle_state, verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?, ?)`)
          .run(factId, fingerprint, normalized.subject_key, normalized.predicate_key, normalized.object_key, normalized.qualifiers,
            normalized.statement_en, normalized.statement_ar, normalized.stability_class, promotedAt, promotedAt, promotedAt);
        this.db.prepare('INSERT INTO fact_categories(fact_id, category_id) VALUES (?, ?)').run(factId, normalized.category_id);
        if (normalized.node_id) this.db.prepare('INSERT INTO fact_nodes(fact_id, node_id) VALUES (?, ?)').run(factId, normalized.node_id);
        this.db.prepare(`INSERT INTO entities(id, entity_type, canonical_name_en, canonical_name_ar, created_at) VALUES (?, ?, ?, ?, ?)`)
          .run(entityId, normalized.answer_type, normalized.answer_en, normalized.answer_ar, promotedAt);
        this.db.prepare("INSERT INTO fact_entities(fact_id, entity_id, role) VALUES (?, ?, 'answer')").run(factId, entityId);
        for (const [index, source] of supporting.entries()) {
          this.db.prepare(`INSERT INTO source_evidence(id, fact_id, source_title, source_url, publisher, trust_tier, supported_claim, checked_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'valid')`).run(this.id('evidence'), factId, source.result.title, source.page.final_url,
            source.host, source.trustTier, normalized.statement_en, source.page.retrieved_at ?? promotedAt);
        }
        this.db.prepare(`INSERT INTO validations(id, fact_id, validation_type, result, confidence, notes, validator, created_at)
          VALUES (?, ?, 'bounded_source_verification', 'passed', ?, ?, 'fact-verifier-v1', ?)`)
          .run(this.id('validation'), factId, supporting.length > 1 ? 0.95 : 0.85, `Exact claim support on ${supporting.length} trusted fetched source(s).`, promotedAt);
        this.db.prepare("UPDATE fact_candidates SET status='verified', promoted_fact_id=?, updated_at=? WHERE id=?").run(factId, promotedAt, candidateId);
        this.db.prepare("UPDATE manufacturing_jobs SET status='completed', result_json=?, updated_at=?, completed_at=? WHERE id=?")
          .run(JSON.stringify({ fact_id: factId, supporting_sources: supporting.length }), promotedAt, promotedAt, jobId);
      });
      return { status: 'verified', fact_id: factId, reused: false, supporting_sources: supporting.length };
    } catch (error) {
      this.db.prepare("UPDATE fact_candidates SET status='needs_review', rejection_code=?, updated_at=? WHERE id=?")
        .run(error.code ?? 'acquisition_failed', this.now(), candidateId);
      this.db.prepare("UPDATE manufacturing_jobs SET status='failed', failure_code=?, updated_at=?, completed_at=? WHERE id=?")
        .run(error.code ?? 'acquisition_failed', this.now(), this.now(), jobId);
      throw error;
    }
  }
}
