import { inTransaction } from './database.mjs';
import { categories, questions, seedRevision } from '../../data/seeds/mvp.mjs';
import { createFactFingerprint, normalizeForSearch } from '../domain/normalization.mjs';

const SEEDED_AT = '2026-08-12T00:00:00.000Z';
const id = (prefix, slug) => `${prefix}_${slug.replaceAll('-', '_')}`;

export function importMvpSeed(db) {
  return inTransaction(db, () => {
    const upsertCategory = db.prepare(`INSERT INTO categories(id, slug, name_en, name_ar, description_en, description_ar, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name_en=excluded.name_en, name_ar=excluded.name_ar,
      description_en=excluded.description_en, description_ar=excluded.description_ar, updated_at=excluded.updated_at`);
    const upsertNode = db.prepare(`INSERT INTO knowledge_nodes(id, category_id, slug, name_en, name_ar) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name_en=excluded.name_en, name_ar=excluded.name_ar`);

    for (const category of categories) {
      const categoryId = id('cat', category.slug);
      upsertCategory.run(categoryId, category.slug, category.nameEn, category.nameAr, category.descriptionEn, category.descriptionAr, SEEDED_AT, SEEDED_AT);
      for (const [slug, nameEn, nameAr] of category.nodes) {
        upsertNode.run(id('node', `${category.slug}_${slug}`), categoryId, slug, nameEn, nameAr);
      }
    }

    const upsertFact = db.prepare(`INSERT INTO facts(id, fingerprint, subject_key, predicate_key, object_key, qualifiers, statement_en, statement_ar,
      stability_class, lifecycle_state, verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'historical', 'verified', ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET fingerprint=excluded.fingerprint, statement_en=excluded.statement_en, statement_ar=excluded.statement_ar,
      lifecycle_state='verified', verified_at=excluded.verified_at, updated_at=excluded.updated_at`);
    const upsertEntity = db.prepare(`INSERT INTO entities(id, entity_type, canonical_name_en, canonical_name_ar, created_at) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET canonical_name_en=excluded.canonical_name_en, canonical_name_ar=excluded.canonical_name_ar`);
    const upsertQuestion = db.prepare(`INSERT INTO questions(id, fact_id, question_intent, answer_type, lifecycle_state, created_at, updated_at)
      VALUES (?, ?, 'direct_recall', ?, 'available', ?, ?) ON CONFLICT(id) DO UPDATE SET fact_id=excluded.fact_id,
      answer_type=excluded.answer_type, lifecycle_state='available', updated_at=excluded.updated_at`);
    const upsertVariant = db.prepare(`INSERT INTO question_variants(id, question_id, language, version, question_text, answer_display, normalized_question,
      lifecycle_state, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?, ?, 'available', ?, ?)
      ON CONFLICT(id) DO UPDATE SET question_text=excluded.question_text, answer_display=excluded.answer_display,
      normalized_question=excluded.normalized_question, lifecycle_state='available', updated_at=excluded.updated_at`);

    for (const item of questions) {
      const factId = id('fact', item.slug);
      const questionId = id('q', item.slug);
      const categoryId = id('cat', item.category);
      const nodeId = id('node', `${item.category}_${item.node}`);
      const entityId = id('entity', item.slug);
      const fingerprint = createFactFingerprint({ subject: item.subject, predicate: item.predicate, object: item.object });

      upsertFact.run(factId, fingerprint, item.subject, item.predicate, item.object, '', item.statementEn, item.statementAr, SEEDED_AT, SEEDED_AT, SEEDED_AT);
      db.prepare('INSERT OR IGNORE INTO fact_categories(fact_id, category_id) VALUES (?, ?)').run(factId, categoryId);
      db.prepare('INSERT OR IGNORE INTO fact_nodes(fact_id, node_id) VALUES (?, ?)').run(factId, nodeId);
      upsertEntity.run(entityId, item.answerType, item.answerEn, item.answerAr, SEEDED_AT);
      db.prepare('INSERT OR IGNORE INTO fact_entities(fact_id, entity_id, role) VALUES (?, ?, ?)').run(factId, entityId, 'answer');

      db.prepare(`INSERT INTO source_evidence(id, fact_id, source_title, source_url, publisher, trust_tier, supported_claim, checked_at, status)
        VALUES (?, ?, ?, ?, ?, 'authoritative', ?, ?, 'valid') ON CONFLICT(id) DO UPDATE SET source_title=excluded.source_title,
        source_url=excluded.source_url, supported_claim=excluded.supported_claim, checked_at=excluded.checked_at, status='valid'`)
        .run(id('evidence', item.slug), factId, item.sourceTitle, item.sourceUrl, new URL(item.sourceUrl).hostname, item.statementEn, SEEDED_AT);
      db.prepare(`INSERT INTO validations(id, fact_id, validation_type, result, confidence, notes, validator, created_at)
        VALUES (?, ?, 'editorial_seed_review', 'passed', 0.9, ?, 'manual_seed_v1', ?) ON CONFLICT(id) DO UPDATE SET result='passed', notes=excluded.notes`)
        .run(id('validation', item.slug), factId, `Seed revision ${seedRevision}; source must be re-reviewed before public production launch.`, SEEDED_AT);

      upsertQuestion.run(questionId, factId, item.answerType, SEEDED_AT, SEEDED_AT);
      for (const language of ['en', 'ar']) {
        const suffix = language;
        const questionText = language === 'ar' ? item.questionAr : item.questionEn;
        const answerDisplay = language === 'ar' ? item.answerAr : item.answerEn;
        const variantId = id('qv', `${item.slug}_${suffix}`);
        upsertVariant.run(variantId, questionId, language, questionText, answerDisplay, normalizeForSearch(questionText, language), SEEDED_AT, SEEDED_AT);
        const answers = [answerDisplay, ...(language === 'ar' ? item.aliasesAr : item.aliasesEn)];
        for (const [index, answer] of answers.entries()) {
          db.prepare(`INSERT INTO accepted_answers(question_id, variant_id, language, answer_text, normalized_answer, answer_kind)
            VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(question_id, language, normalized_answer) DO UPDATE SET answer_text=excluded.answer_text`)
            .run(questionId, variantId, language, answer, normalizeForSearch(answer, language), index === 0 ? 'canonical' : 'alias');
        }
      }
      db.prepare(`INSERT INTO difficulty_profiles(question_id, level, source, confidence, rationale, version, updated_at)
        VALUES (?, ?, 'editorial', 0.85, ?, 1, ?) ON CONFLICT(question_id) DO UPDATE SET level=excluded.level,
        rationale=excluded.rationale, updated_at=excluded.updated_at`)
        .run(questionId, item.level, `Curated ${item.level} specimen for ${item.category}.`, SEEDED_AT);
    }

    return { revision: seedRevision, categories: categories.length, facts: questions.length, variants: questions.length * 2 };
  });
}
