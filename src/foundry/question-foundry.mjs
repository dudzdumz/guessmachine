import { createHash, randomUUID } from 'node:crypto';
import { inTransaction } from '../storage/database.mjs';
import { normalizeForSearch } from '../domain/normalization.mjs';
import { assessQuestionDraft } from './quality-pipeline.mjs';

function key(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }

export class QuestionFoundry {
  constructor(db, writer, { now = () => new Date().toISOString(), id = (prefix) => `${prefix}_${randomUUID()}` } = {}) {
    this.db = db;
    this.writer = writer;
    this.now = now;
    this.id = id;
  }

  async manufacture({ factId, difficulty, questionIntent = 'direct_recall' }) {
    const dedupeKey = `question-foundry:${key({ factId, difficulty, questionIntent, version: 1 })}`;
    const existing = this.db.prepare('SELECT * FROM manufacturing_jobs WHERE dedupe_key=?').get(dedupeKey);
    if (existing) {
      const result = existing.result_json ? JSON.parse(existing.result_json) : {};
      return { job_id: existing.id, status: existing.status, ...result, reused: true };
    }
    const now = this.now();
    const jobId = this.id('job');
    this.db.prepare(`INSERT INTO manufacturing_jobs(id, job_type, dedupe_key, status, input_json, created_at, updated_at)
      VALUES (?, 'question_foundry', ?, 'running', ?, ?, ?)`).run(jobId, dedupeKey, JSON.stringify({ fact_id: factId, difficulty, question_intent: questionIntent }), now, now);
    try {
      const draft = await this.writer.createDraft({ factId, difficulty, questionIntent });
      const assessment = assessQuestionDraft(this.db, draft.draft_id, { now: this.now, id: () => this.id('quality') });
      const status = assessment.disposition === 'passed' ? 'needs_review' : 'failed';
      const result = { draft_id: draft.draft_id, quality_assessment_id: assessment.assessment_id, quality_disposition: assessment.disposition };
      this.db.prepare('UPDATE manufacturing_jobs SET status=?, result_json=?, failure_code=?, updated_at=?, completed_at=? WHERE id=?')
        .run(status, JSON.stringify(result), status === 'failed' ? 'quality_rejected' : null, this.now(), status === 'failed' ? this.now() : null, jobId);
      this.db.prepare(`INSERT INTO manufacturing_events(id, job_id, draft_id, event_type, actor, payload_json, occurred_at)
        VALUES (?, ?, ?, ?, 'question-foundry-v1', ?, ?)`)
        .run(this.id('mfg_event'), jobId, draft.draft_id, status === 'needs_review' ? 'review_requested' : 'quality_rejected', JSON.stringify({ assessment_id: assessment.assessment_id }), this.now());
      return { job_id: jobId, status, ...result, reused: false };
    } catch (error) {
      this.db.prepare("UPDATE manufacturing_jobs SET status='failed', failure_code=?, updated_at=?, completed_at=? WHERE id=?")
        .run(error.code ?? 'foundry_failed', this.now(), this.now(), jobId);
      throw error;
    }
  }

  approve({ jobId, reviewerId }) {
    if (typeof reviewerId !== 'string' || !/^[a-zA-Z0-9:_-]{2,120}$/.test(reviewerId)) throw new Error('Valid reviewer identity required');
    const job = this.db.prepare("SELECT * FROM manufacturing_jobs WHERE id=? AND job_type='question_foundry'").get(jobId);
    if (!job) throw new Error('Foundry job not found');
    const result = job.result_json ? JSON.parse(job.result_json) : {};
    const draft = this.db.prepare('SELECT * FROM question_drafts WHERE id=?').get(result.draft_id);
    if (job.status === 'completed' && draft?.published_question_id) return { job_id: jobId, status: 'completed', question_id: draft.published_question_id, reused: true };
    if (job.status !== 'needs_review' || draft?.status !== 'quality_passed') throw new Error('Only quality-passed review jobs can be approved');
    const assessment = this.db.prepare("SELECT * FROM quality_assessments WHERE draft_id=? AND disposition='passed' ORDER BY created_at DESC LIMIT 1").get(draft.id);
    if (!assessment) throw new Error('Passing quality assessment required');
    const factEligible = this.db.prepare(`SELECT 1 FROM facts f
      WHERE f.id=? AND f.lifecycle_state='verified'
        AND (f.valid_from IS NULL OR f.valid_from<=?)
        AND (f.valid_until IS NULL OR f.valid_until>?)
        AND EXISTS (SELECT 1 FROM source_evidence se WHERE se.fact_id=f.id AND se.status='valid')
        AND EXISTS (SELECT 1 FROM validations v WHERE v.fact_id=f.id AND v.result='passed')`).get(draft.fact_id, this.now(), this.now());
    if (!factEligible) throw new Error('Current evidence-backed verified Fact required at publication');
    const variants = JSON.parse(draft.variants_json);
    const questionId = this.id('question');
    const now = this.now();
    inTransaction(this.db, () => {
      this.db.prepare(`INSERT INTO questions(id, fact_id, question_intent, answer_type, lifecycle_state, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'available', ?, ?)`).run(questionId, draft.fact_id, draft.question_intent, draft.answer_type, now, now);
      for (const variant of variants) {
        const variantId = this.id('variant');
        this.db.prepare(`INSERT INTO question_variants(id, question_id, language, version, question_text, answer_display, explanation,
          normalized_question, lifecycle_state, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?, ?, ?, 'available', ?, ?)`)
          .run(variantId, questionId, variant.language, variant.question_text, variant.answer_display, variant.explanation,
            normalizeForSearch(variant.question_text, variant.language), now, now);
        for (const [index, answer] of variant.accepted_answers.entries()) {
          this.db.prepare(`INSERT INTO accepted_answers(question_id, variant_id, language, answer_text, normalized_answer, answer_kind)
            VALUES (?, ?, ?, ?, ?, ?)`)
            .run(questionId, variantId, variant.language, answer, normalizeForSearch(answer, variant.language), index === 0 ? 'canonical' : 'alias');
        }
      }
      this.db.prepare(`INSERT INTO difficulty_profiles(question_id, level, source, confidence, rationale, version, updated_at)
        VALUES (?, ?, 'predicted', 0.6, 'Foundry requested level; requires outcome calibration.', 1, ?)`)
        .run(questionId, draft.requested_difficulty, now);
      this.db.prepare("UPDATE question_drafts SET status='published', published_question_id=?, updated_at=? WHERE id=?").run(questionId, now, draft.id);
      this.db.prepare("UPDATE manufacturing_jobs SET status='completed', result_json=?, updated_at=?, completed_at=? WHERE id=?")
        .run(JSON.stringify({ ...result, question_id: questionId, reviewer_id: reviewerId }), now, now, jobId);
      this.db.prepare(`INSERT INTO manufacturing_events(id, job_id, draft_id, event_type, actor, payload_json, occurred_at)
        VALUES (?, ?, ?, 'approved_and_published', ?, ?, ?)`)
        .run(this.id('mfg_event'), jobId, draft.id, reviewerId, JSON.stringify({ question_id: questionId, assessment_id: assessment.id }), now);
    });
    return { job_id: jobId, status: 'completed', question_id: questionId, reused: false };
  }
}
