export class QuestionBank {
  constructor(db) {
    this.db = db;
  }

  findCandidates({ categoryId, difficulty, language, excludeFactIds = [], excludeQuestionIds = [], limit = 50, asOf = new Date().toISOString() }) {
    if (![100, 200, 300].includes(difficulty)) throw new RangeError('Difficulty must be 100, 200, or 300.');
    if (!['ar', 'en'].includes(language)) throw new RangeError('Language must be ar or en.');
    const factExclusion = excludeFactIds.length ? `AND f.id NOT IN (${excludeFactIds.map(() => '?').join(',')})` : '';
    const questionExclusion = excludeQuestionIds.length ? `AND q.id NOT IN (${excludeQuestionIds.map(() => '?').join(',')})` : '';
    const sql = `
      SELECT
        f.id fact_id, f.fingerprint, q.id question_id, q.question_intent, q.answer_type,
        qv.id variant_id, qv.version variant_version, qv.language, qv.question_text, qv.answer_display, qv.explanation,
        c.id category_id, c.slug category_slug, c.name_en category_name_en, c.name_ar category_name_ar,
        dp.level difficulty, dp.confidence difficulty_confidence,
        MIN(kn.id) node_id, MIN(kn.name_en) node_name_en, MIN(kn.name_ar) node_name_ar,
        MIN(CASE WHEN fe.role='answer' THEN e.id END) answer_entity_id
      FROM facts f
      JOIN fact_categories fc ON fc.fact_id=f.id
      JOIN categories c ON c.id=fc.category_id
      JOIN questions q ON q.fact_id=f.id
      JOIN question_variants qv ON qv.question_id=q.id AND qv.language=?
      JOIN difficulty_profiles dp ON dp.question_id=q.id
      LEFT JOIN fact_nodes fn ON fn.fact_id=f.id
      LEFT JOIN knowledge_nodes kn ON kn.id=fn.node_id AND kn.lifecycle_state='available'
      LEFT JOIN fact_entities fe ON fe.fact_id=f.id
      LEFT JOIN entities e ON e.id=fe.entity_id AND e.lifecycle_state='available'
      WHERE c.id=? AND c.lifecycle_state='available'
        AND dp.level=?
        AND f.lifecycle_state='verified'
        AND (f.valid_from IS NULL OR f.valid_from<=?)
        AND (f.valid_until IS NULL OR f.valid_until>?)
        AND q.lifecycle_state='available'
        AND qv.lifecycle_state='available'
        AND EXISTS (SELECT 1 FROM source_evidence se WHERE se.fact_id=f.id AND se.status='valid')
        AND EXISTS (SELECT 1 FROM validations v WHERE v.fact_id=f.id AND v.result='passed')
        AND EXISTS (SELECT 1 FROM accepted_answers aa WHERE aa.question_id=q.id AND aa.language=qv.language)
        ${factExclusion}
        ${questionExclusion}
      GROUP BY f.id, q.id, qv.id, c.id, dp.level
      ORDER BY f.id
      LIMIT ?`;
    const params = [language, categoryId, difficulty, asOf, asOf, ...excludeFactIds, ...excludeQuestionIds, limit];
    return this.db.prepare(sql).all(...params).map((row) => ({
      ...row,
      accepted_answers: this.db.prepare(`SELECT answer_text, answer_kind FROM accepted_answers
        WHERE question_id=? AND language=? ORDER BY CASE answer_kind WHEN 'canonical' THEN 0 WHEN 'alias' THEN 1 ELSE 2 END, id`)
        .all(row.question_id, language).map((answer) => ({ ...answer })),
    }));
  }

  isEligibleReference({ factId, questionId, variantId, language, asOf = new Date().toISOString() }) {
    return Boolean(this.db.prepare(`
      SELECT 1 eligible
      FROM facts f
      JOIN questions q ON q.id=? AND q.fact_id=f.id
      JOIN question_variants qv ON qv.id=? AND qv.question_id=q.id AND qv.language=?
      WHERE f.id=?
        AND f.lifecycle_state='verified'
        AND (f.valid_from IS NULL OR f.valid_from<=?)
        AND (f.valid_until IS NULL OR f.valid_until>?)
        AND q.lifecycle_state='available'
        AND qv.lifecycle_state='available'
        AND EXISTS (SELECT 1 FROM source_evidence se WHERE se.fact_id=f.id AND se.status='valid')
        AND EXISTS (SELECT 1 FROM validations v WHERE v.fact_id=f.id AND v.result='passed')
        AND EXISTS (SELECT 1 FROM accepted_answers aa WHERE aa.question_id=q.id AND aa.language=qv.language)
      LIMIT 1`).get(questionId, variantId, language, factId, asOf, asOf));
  }
}
