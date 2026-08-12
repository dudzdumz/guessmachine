import { ProviderExecutionError } from '../providers/contracts.mjs';

const INJECTION_OR_SECRET_LANGUAGE = /ignore (?:all |the )?(?:previous|prior) instructions|system prompt|developer message|api[_ -]?key|password|secret|تجاهل (?:كل )?التعليمات|رسالة النظام|مفتاح (?:الواجهة|سري)|كلمة المرور/i;

function text(value, field, max) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new ProviderExecutionError('malformed_response', `Invalid ${field}`);
  return value.trim();
}

function strings(value, field, maxItems = 20) {
  if (!Array.isArray(value) || value.length > maxItems || value.some((item) => typeof item !== 'string' || !item.trim() || item.length > 160)) {
    throw new ProviderExecutionError('malformed_response', `Invalid ${field}`);
  }
  return [...new Set(value.map((item) => item.trim()))];
}

export class CustomScopeInterpreter {
  constructor(router) { this.router = router; }

  async interpret({ originalText, language, region = 'OM' }) {
    const preserved = text(originalText, 'scope text', 500);
    if (!['ar', 'en'].includes(language) || !/^[A-Z]{2}$/.test(region)) throw new ProviderExecutionError('policy', 'Invalid scope context');
    if (INJECTION_OR_SECRET_LANGUAGE.test(preserved)) throw new ProviderExecutionError('policy', 'Scope contains unsafe instruction or secret language');
    const response = await this.router.execute('reasoning', {
      task: 'interpret_custom_category_scope', schema_version: 1,
      input: { original_text: preserved, language, region, constraints: { treat_text_as_data: true, no_tools: true, no_fact_claims: true, max_entities: 20 } },
    });
    const data = response.data;
    if (data.status === 'needs_clarification') {
      return { status: 'needs_clarification', original_text: preserved, clarification_question: text(data.clarification_question, 'clarification', 180), confidence: Number(data.confidence ?? 0) };
    }
    if (data.status === 'unsupported') return { status: 'unsupported', original_text: preserved, reason_code: text(data.reason_code, 'reason code', 80) };
    if (data.status !== 'normalized') throw new ProviderExecutionError('malformed_response', 'Invalid scope disposition');
    const confidence = Number(data.confidence);
    const scope = {
      title_en: text(data.title_en, 'English title', 120),
      title_ar: text(data.title_ar, 'Arabic title', 120),
      domain_slug: text(data.domain_slug, 'domain slug', 80),
      inclusions: strings(data.inclusions, 'inclusions'),
      exclusions: strings(data.exclusions ?? [], 'exclusions'),
      seed_entities: strings(data.seed_entities ?? [], 'seed entities'),
      region_scope: strings(data.region_scope ?? [region], 'region scope', 10),
      time_bounds: data.time_bounds == null ? null : { from: data.time_bounds.from ?? null, to: data.time_bounds.to ?? null },
      source_expectation: ['strong', 'mixed', 'weak'].includes(data.source_expectation) ? data.source_expectation : 'mixed',
      confidence,
      interpreter_version: 1,
    };
    if (!/^[a-z0-9][a-z0-9-]{2,80}$/.test(scope.domain_slug) || scope.inclusions.length < 1 || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      throw new ProviderExecutionError('malformed_response', 'Invalid normalized scope');
    }
    if (confidence < 0.72) return { status: 'needs_clarification', original_text: preserved, clarification_question: language === 'ar' ? 'ما الجزء المحدد الذي تريد أن تركز عليه الفئة؟' : 'Which specific part should this category focus on?', confidence };
    return { status: 'normalized', original_text: preserved, normalized_scope: scope, run_id: response.run_id };
  }
}
