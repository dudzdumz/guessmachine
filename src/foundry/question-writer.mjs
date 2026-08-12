import { createHash, randomUUID } from 'node:crypto';
import { normalizeForSearch } from '../domain/normalization.mjs';
import { ProviderExecutionError } from '../providers/contracts.mjs';

function stableKey(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function assertText(value, field, max) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new ProviderExecutionError('malformed_response', `Invalid ${field}`);
  return value.trim();
}

function validateDraftOutput(data, lockedAnswers) {
  if (!Array.isArray(data.variants) || data.variants.length !== 2) throw new ProviderExecutionError('malformed_response', 'Exactly two native language variants are required');
  const byLanguage = new Map();
  for (const raw of data.variants) {
    if (!raw || !['ar', 'en'].includes(raw.language) || byLanguage.has(raw.language)) throw new ProviderExecutionError('malformed_response', 'Invalid or duplicate draft language');
    const questionText = assertText(raw.question_text, 'question text', 500);
    const answerDisplay = assertText(raw.answer_display, 'answer display', 160);
    if (normalizeForSearch(answerDisplay, raw.language) !== normalizeForSearch(lockedAnswers[raw.language], raw.language)) {
      throw new ProviderExecutionError('policy', 'Provider attempted to alter the locked answer');
    }
    const aliases = raw.accepted_answers ?? [];
    if (!Array.isArray(aliases) || aliases.length > 12 || aliases.some((alias) => typeof alias !== 'string' || !alias.trim() || alias.length > 160)) {
      throw new ProviderExecutionError('malformed_response', 'Invalid answer aliases');
    }
    byLanguage.set(raw.language, {
      language: raw.language,
      question_text: questionText,
      answer_display: answerDisplay,
      accepted_answers: [...new Set([answerDisplay, ...aliases.map((alias) => alias.trim())])],
      explanation: raw.explanation == null ? null : assertText(raw.explanation, 'explanation', 700),
    });
  }
  if (!byLanguage.has('ar') || !byLanguage.has('en')) throw new ProviderExecutionError('malformed_response', 'Arabic and English variants are required');
  return ['en', 'ar'].map((language) => byLanguage.get(language));
}

export class QuestionWriter {
  constructor(db, router, { now = () => new Date().toISOString(), id = (prefix) => `${prefix}_${randomUUID()}` } = {}) {
    this.db = db;
    this.router = router;
    this.now = now;
    this.id = id;
  }

  async createDraft({ factId, difficulty, questionIntent = 'direct_recall' }) {
    if (![100, 200, 300].includes(difficulty)) throw new RangeError('Difficulty must be 100, 200, or 300');
    const fact = this.db.prepare(`SELECT f.*, e.entity_type answer_type, e.canonical_name_en answer_en, e.canonical_name_ar answer_ar
      FROM facts f
      JOIN fact_entities fe ON fe.fact_id=f.id AND fe.role='answer'
      JOIN entities e ON e.id=fe.entity_id AND e.lifecycle_state='available'
      WHERE f.id=? AND f.lifecycle_state='verified' LIMIT 1`).get(factId);
    if (!fact || !fact.answer_en || !fact.answer_ar) throw new Error('Verified Fact with bilingual answer lock required');

    const dedupeKey = `question-writing:${stableKey({ factId, difficulty, questionIntent, version: 1 })}`;
    const existing = this.db.prepare(`SELECT qd.* FROM manufacturing_jobs mj JOIN question_drafts qd ON qd.job_id=mj.id
      WHERE mj.dedupe_key=?`).get(dedupeKey);
    if (existing) return { job_id: existing.job_id, draft_id: existing.id, status: existing.status, variants: JSON.parse(existing.variants_json), reused: true };

    const now = this.now();
    const jobId = this.id('job');
    this.db.prepare(`INSERT INTO manufacturing_jobs(id, job_type, dedupe_key, status, input_json, created_at, updated_at)
      VALUES (?, 'question_writing', ?, 'running', ?, ?, ?)`)
      .run(jobId, dedupeKey, JSON.stringify({ fact_id: factId, difficulty, question_intent: questionIntent }), now, now);
    try {
      const response = await this.router.execute('reasoning', {
        task: 'write_question_variants',
        schema_version: 1,
        input: {
          fact_id: fact.id,
          statement_en: fact.statement_en,
          statement_ar: fact.statement_ar,
          locked_answers: { en: fact.answer_en, ar: fact.answer_ar },
          answer_type: fact.answer_type,
          question_intent: questionIntent,
          difficulty,
          required_languages: ['en', 'ar'],
          constraints: { one_defensible_answer: true, no_answer_leakage: true, native_wording: true },
        },
      });
      const variants = validateDraftOutput(response.data, { en: fact.answer_en, ar: fact.answer_ar });
      const draftId = this.id('draft');
      this.db.prepare(`INSERT INTO question_drafts(id, job_id, fact_id, question_intent, answer_type, requested_difficulty,
        locked_answer_en, locked_answer_ar, variants_json, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'candidate', ?, ?)`)
        .run(draftId, jobId, fact.id, questionIntent, fact.answer_type, difficulty, fact.answer_en, fact.answer_ar, JSON.stringify(variants), now, now);
      this.db.prepare("UPDATE manufacturing_jobs SET status='needs_review', result_json=?, updated_at=? WHERE id=?")
        .run(JSON.stringify({ draft_id: draftId, provider_run_id: response.run_id }), this.now(), jobId);
      return { job_id: jobId, draft_id: draftId, status: 'candidate', variants, reused: false };
    } catch (error) {
      this.db.prepare("UPDATE manufacturing_jobs SET status='failed', failure_code=?, updated_at=?, completed_at=? WHERE id=?")
        .run(error.code ?? 'writing_failed', this.now(), this.now(), jobId);
      throw error;
    }
  }
}
