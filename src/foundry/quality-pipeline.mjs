import { randomUUID } from 'node:crypto';
import { normalizeForSearch } from '../domain/normalization.mjs';

const FORBIDDEN_MACHINE_LANGUAGE = /chatgpt|openai|\bai\b|prompt|language model|ذكاء اصطناعي|نموذج لغوي|برومبت/i;
const AMBIGUITY_MARKERS = /\bone of (?:the|these)\b|possibly|maybe|ربما|قد يكون/i;

function assessVariant(db, draft, variant) {
  const normalizedQuestion = normalizeForSearch(variant.question_text, variant.language);
  const normalizedAnswer = normalizeForSearch(variant.answer_display, variant.language);
  const checks = {
    supported_language: ['ar', 'en'].includes(variant.language),
    bounded_question_length: variant.question_text.length >= 12 && variant.question_text.length <= 220,
    question_form: /[?؟]$/.test(variant.question_text.trim()),
    native_script: variant.language === 'ar' ? /[\u0600-\u06ff]/.test(variant.question_text) : /[a-z]/i.test(variant.question_text),
    answer_lock_unchanged: normalizedAnswer === normalizeForSearch(variant.language === 'ar' ? draft.locked_answer_ar : draft.locked_answer_en, variant.language),
    no_answer_leakage: normalizedAnswer.length < 3 || !normalizedQuestion.includes(normalizedAnswer),
    no_machine_language: !FORBIDDEN_MACHINE_LANGUAGE.test(variant.question_text),
    no_ambiguity_marker: !AMBIGUITY_MARKERS.test(variant.question_text),
    unique_wording: !db.prepare('SELECT 1 FROM question_variants WHERE language=? AND normalized_question=? LIMIT 1').get(variant.language, normalizedQuestion),
    answer_aliases_present: Array.isArray(variant.accepted_answers) && variant.accepted_answers.length > 0,
  };
  return { language: variant.language, normalized_question: normalizedQuestion, checks, passed: Object.values(checks).every(Boolean) };
}

export function assessQuestionDraft(db, draftId, { now = () => new Date().toISOString(), id = () => `quality_${randomUUID()}` } = {}) {
  const draft = db.prepare('SELECT * FROM question_drafts WHERE id=?').get(draftId);
  if (!draft) throw new Error('Question draft not found');
  const existing = db.prepare('SELECT * FROM quality_assessments WHERE draft_id=? ORDER BY created_at DESC LIMIT 1').get(draftId);
  if (existing) return { assessment_id: existing.id, disposition: existing.disposition, checks: JSON.parse(existing.checks_json), reused: true };
  const variants = JSON.parse(draft.variants_json);
  const checks = variants.map((variant) => assessVariant(db, draft, variant));
  const disposition = checks.length === 2 && checks.every((item) => item.passed) ? 'passed' : 'rejected';
  const assessmentId = id();
  const timestamp = now();
  db.prepare(`INSERT INTO quality_assessments(id, draft_id, pipeline_version, disposition, checks_json, created_at)
    VALUES (?, ?, 'deterministic-v1', ?, ?, ?)`).run(assessmentId, draftId, disposition, JSON.stringify(checks), timestamp);
  db.prepare('UPDATE question_drafts SET status=?, updated_at=? WHERE id=?').run(disposition === 'passed' ? 'quality_passed' : 'rejected', timestamp, draftId);
  return { assessment_id: assessmentId, disposition, checks, reused: false };
}
