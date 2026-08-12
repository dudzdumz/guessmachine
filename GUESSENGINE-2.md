# Guess Engine 2: Canonical Data Model and Engine Contracts

**Status:** Foundational domain-model specification  
**Product:** Guess Machine / مخ ماشين  
**Depends on:** `GUESSENGINE-1.md`  
**Implementation status:** Architecture only; no backend implementation is authorized by this document

## 0. Purpose and Relationship to GUESSENGINE-1

`GUESSENGINE-1.md` defines what the Guess Engine is, why it exists, and which principles it must preserve. This document operationalizes that doctrine by defining the information that exists inside the engine and the semantic shapes exchanged between its stages.

The binding principles remain:

- facts first, questions second;
- verified facts are the truth-bearing objects;
- wording is downstream, replaceable presentation;
- remember facts, not merely strings;
- custom categories are first-class;
- difficulty is predicted, then empirically calibrated;
- Machine Memory improves Game Assembly;
- live play consumes prepared GamePackages;
- quality outranks inventory size;
- the engine remains vendor-neutral.

The structures below are **canonical domain models**, not one-to-one database tables, ORM classes, API payloads, or files. Implementations may normalize, split, join, denormalize, cache, index, or materialize them differently. What must survive is their meaning, identity, invariants, provenance, and stage boundaries.

> The Guess Engine owns its data contracts. Providers, models, databases, search APIs, vector stores, and cloud services adapt to the Guess Engine—not the reverse.

## 1. Modeling Philosophy

### 1.1 Stable IDs

Every durable object has an opaque, stable internal identifier, such as `fact_id`, `question_id`, `evidence_id`, `entity_id`, `knowledge_node_id`, `media_asset_id`, `game_package_id`, or `machine_memory_profile_id`. IDs must not depend on mutable names, localized labels, provider IDs, or URLs. External identifiers are aliases, never canonical identity.

### 1.2 Schema and contract versioning

Important records identify the version of the contract under which they were created or last transformed. Changes must be migratable and auditable. Readers should reject unsupported breaking versions rather than guess at meaning.

### 1.3 Provenance everywhere

Derived information retains its origin: evidence, producing stage, engine/generation version, normalization rules, validator version, difficulty version, localization version, duplicate threshold, and lifecycle history. Provenance should answer both “what produced this?” and “what evidence justified it?”

### 1.4 Separate truth from presentation

A canonical fact exists independently of Arabic or English wording, clue structure, media treatment, difficulty label, answer display, and player explanation. Rewriting or localizing a question must not rewrite truth.

### 1.5 Explicit uncertainty

Confidence, ambiguity, contradictory evidence, freshness, and review requirements are structured values—not caveats buried in notes. Free text may explain a decision, but cannot replace a decision state.

### 1.6 Immutable history where valuable

Lifecycle transitions, difficulty recalibrations, manual overrides, source invalidations, disputes, and editorial actions should be append-only or otherwise fully auditable. Current projections may be updated for speed, but history must not disappear silently.

### 1.7 References over duplication

Canonical objects reference one another by stable ID. Snapshots may duplicate selected fields for runtime resilience, but the snapshot must identify its source and time.

### 1.8 Closed vocabularies at boundaries

Statuses, reason codes, event types, and disposition values should use versioned vocabularies. Extensions are allowed, but unknown critical values fail safely.

### 1.9 Timestamps are contextual

Timestamps use an unambiguous instant and retain relevant effective-date context. “Current” claims require an explicit observation or validity window.

## 2. Core Domain Object Map

```text
CategoryDefinition ───────┐                 CustomCategoryDefinition
        │                 │                          │
        ▼                 └──────────────┬───────────┘
 KnowledgeNode ◀────────────────────────┘
    │      │
    │      └──────────▶ EntityRecord ◀──────────────┐
    │                                               │
    └──────────────────▶ FactRecord ────────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
          SourceEvidence ValidationResult Fact Fingerprint
                              │
                              ▼
                       QuestionRecord
                 ┌────────────┼──────────────┐
                 ▼            ▼              ▼
         QuestionVariant DifficultyProfile MediaAsset
                 │            │              │
                 └─────┬──────┴──────────────┘
                       ▼
          QualityAssessment + DuplicateAssessment
                       │
                       ▼
                  Question Bank
                       │
GameRequest + MachineMemoryProfile
                       │
                       ▼
          GamePackage → GameQuestionSlot
                       │
                       ▼
        PlayerOutcome → ExposureRecord
                       │
                       ▼
       QuestionPerformance + MachineMemoryProfile
```

This is logical ownership and information flow, not a physical database diagram. Objects may live together or separately as long as contracts and invariants remain intact.

## 3. CategoryDefinition

`CategoryDefinition` defines an engine-recognized category and its operating policy.

```text
CategoryDefinition {
  category_id, slug, display_names, description,
  category_type, status, default_language_support,
  regional_relevance, sensitivity_profile,
  default_source_policy, knowledge_root_id,
  desired_inventory_targets, supported_question_formats,
  created_at, updated_at, schema_version
}
```

`display_names` holds independently authored locale values such as `ar` and `en`; Arabic is not assumed to be a translation derivative. `category_type` may be `built_in`, `editorial`, `generated_custom`, `temporary_custom`, or `promoted_custom`. Statuses include `active`, `limited`, `experimental`, and `retired`. A retired category remains referentially valid for historical packages and outcomes.

Inventory targets should be scoped by language, difficulty, format, and possibly region. Source and sensitivity policies are references to configurable policy contracts, not embedded provider logic.

## 4. KnowledgeNode

`KnowledgeNode` is the canonical unit of a category knowledge map.

```text
KnowledgeNode {
  knowledge_node_id, category_id, parent_node_id,
  node_type, canonical_name, display_names, aliases,
  description, entity_refs, time_scope, region_scope,
  sensitivity, source_preferences, format_suitability,
  inventory_targets, coverage_score, cross_link_refs,
  status, created_at, updated_at, schema_version
}
```

Possible `node_type` values include `topic`, `subtopic`, `era`, `person_cluster`, `event_cluster`, `franchise`, `competition`, `geography`, `concept`, and `theme`. A primary parent enables navigation, but `cross_link_refs` permit a graph: a player may belong to a season, club, national team, and tournament without duplicating identity.

Built-in example:

```text
Football → World Cup → Finals → 2010 Final
```

Custom example:

```text
Barcelona under Guardiola
├── Seasons
├── Players
├── Matches
├── Trophies
├── Tactics
└── Opponents
```

Coverage score is derived evidence of inventory health, not truth. A node may be inactive for generation while retained for history.

## 5. EntityRecord

`EntityRecord` identifies a thing referenced by facts.

```text
EntityRecord {
  entity_id, entity_type, canonical_name, display_names,
  aliases, transliterations, external_identifiers,
  region_relevance, date_context, metadata,
  status, created_at, updated_at, schema_version
}
```

Entity types may include person, team, organization, country, city, location, event, competition, film, television series, song, album, game, character, company, product, historical event, object, or concept.

Canonical entity identity enables fact fingerprints, accepted answers, entity-overuse penalties, Machine Memory, topic diversity, native localization, and media pairing. The engine does not require a universal knowledge graph; it needs only identities relevant to its domains, with merge/split history when ambiguity is later resolved.

## 6. FactRecord: The Truth-Bearing Object

`FactRecord` is the canonical unit of asserted truth from which questions are constructed.

```text
FactRecord {
  fact_id, category_refs, knowledge_node_refs,
  subject_entity_refs, predicate, object,
  object_entity_refs, normalized_fact,
  answer_target, answer_entity_refs, qualifiers,
  time_context, geographic_context,
  language_independent_notes, fact_fingerprint,
  stability_class, freshness_policy, sensitivity_class,
  validation_status, validation_confidence, evidence_refs,
  created_at, updated_at, schema_version
}
```

`normalized_fact` is concise, factual, and presentation-neutral. `predicate` expresses the relationship being asserted. `answer_target` says which component the player must supply; it prevents the writer from accidentally asking a different fact. Qualifiers capture details needed for uniqueness, such as competition, date, opponent, edition, office, or measurement basis.

```json
{
  "subject": "2010 FIFA World Cup Final",
  "predicate": "winning_goal_scorer",
  "object": "Andrés Iniesta",
  "answer_target": "object",
  "qualifiers": {
    "opponent": "Netherlands",
    "minute": 116
  }
}
```

Several variants can reference this one fact: an English text clue, Arabic text clue, or qualified image-assisted clue. They remain the same trivia unit.

Facts sharing an event are not automatically duplicates. `winning_goal_scorer`, `final_score`, `host_country`, `stadium`, and `referee` are different relationships and therefore different facts, provided each is answerable and appropriately qualified.

## 7. Fact Fingerprint

`fact_fingerprint` represents semantic fact identity, never question text. Conceptual inputs include normalized subject, predicate, normalized object, critical qualifiers, time context, and domain context where needed.

It may eventually combine deterministic normalization/hashing with semantic methods. The implementation is deferred; the contract requires reproducibility, versioning, comparison explainability, and the ability to recompute.

Same fact:

- “Who scored Spain’s winner in the 2010 World Cup Final?”
- “Which midfielder scored the decisive goal for Spain against the Netherlands in the 2010 World Cup Final?”

Different facts:

- “Who scored Spain’s winner in the 2010 World Cup Final?”
- “In which stadium was the 2010 World Cup Final played?”

The event overlaps; the relationship and answer target do not.

## 8. SourceEvidence

`SourceEvidence` records why an assertion was accepted, questioned, or rejected.

```text
SourceEvidence {
  evidence_id, fact_id, source_url, source_domain,
  source_title, source_type, publisher, author,
  published_at, retrieved_at, relevant_excerpt_or_reference,
  supports_claim, contradicts_claim, source_trust_tier,
  source_domain_class, language, region, freshness,
  access_status, content_hash, notes, schema_version
}
```

The record should preserve enough provenance for audit without assuming full webpage text is stored forever. Legal, licensing, privacy, and technical policy may permit a citation, structured reference, content hash, or limited excerpt rather than a complete copy. Evidence records may contradict a fact and must not be deleted merely because validation chose another conclusion.

## 9. Source Trust Tiers

Source trust is domain-relative.

| Tier | Meaning | Examples and use |
|---|---|---|
| **A: Primary/Official** | Direct authority for the relevant claim | official federation results, government records, award bodies, primary documents, official product documentation |
| **B: Authoritative Reference** | Established reference expertise | museums, universities, respected encyclopedic institutions, major statistical/reference organizations |
| **C: Reputable Secondary** | Credible reporting or scholarship | established journalism, specialist publications, biographies, histories |
| **D: Supporting/Weak** | Useful for discovery, rarely sufficient alone | fan wikis, community databases, user-generated collections, unsourced aggregation |
| **Rejected/Untrusted** | Must not support acceptance | anonymous unsourced posts, fabricated pages, content farms, unreliable snippets, unresolved contradictions |

Tier does not equal truth. FIFA may be Tier A for FIFA tournament records, while an official marketing page is not authoritative for a subjective “greatest” claim. Source policy evaluates claim domain, recency, independence, conflicts, and specificity—not only publisher reputation.

## 10. SourcePolicyProfile

`SourcePolicyProfile` defines the evidence standard for a fact class.

```text
SourcePolicyProfile {
  policy_profile_id, domain_class, minimum_trust_tiers,
  minimum_support_count, independence_requirements,
  freshness_window, contradiction_policy,
  required_time_qualification, human_review_rule,
  sensitivity_profile_ref, policy_version
}
```

- A stable entertainment fact may accept one Tier A/B source or multiple agreeing Tier C sources.
- A current sports fact requires recent evidence and strong preference for official records.
- Current political leadership requires an explicit as-of time, authoritative evidence, and short expiry.
- Religious questions require an approved authoritative sourcing profile and stricter review; casual model-only claims are unacceptable.
- Disputed history requires explicit framing and multiple perspectives, and may be unsuitable when no unique defensible answer exists.

This contract permits later domain policies without hard-coding them into FactRecord or a provider adapter.

## 11. ValidationResult

```text
ValidationResult {
  validation_id, fact_id, status, confidence,
  policy_profile, supporting_evidence_refs,
  contradicting_evidence_refs, checks_run,
  ambiguity_flags, freshness_status,
  requires_human_review, failure_reasons,
  validator_versions, validated_at, expires_at,
  schema_version
}
```

Statuses: `verified`, `provisionally_verified`, `insufficient_evidence`, `contradictory`, `ambiguous`, `stale`, `rejected`, and `requires_review`.

`verified` means the configured Guess Engine policy was satisfied. It does not mean metaphysical certainty. A validation result is a time-bound decision with evidence and version context; new evidence can supersede it without erasing it.

## 12. QuestionRecord vs QuestionVariant

`QuestionRecord` is the trivia unit tied to one fact and answer target. `QuestionVariant` is one player-facing formulation.

```text
QuestionRecord {
  question_id, fact_id, answer_target,
  accepted_answer_set_id, question_type,
  lifecycle_state, difficulty_profile_id,
  quality_state, duplicate_state,
  created_at, updated_at, generation_version,
  schema_version
}

QuestionVariant {
  variant_id, question_id, language, locale,
  question_text, clue_structure, format,
  media_refs, answer_display, explanation,
  writer_type, writer_version, localization_version,
  language_quality_score, status,
  created_at, updated_at, schema_version
}
```

One fact—Iniesta scored the winning goal—can produce one QuestionRecord asking for the scorer, with Arabic text, English text, image-assisted, and alternative approved variants. Language versions are siblings, not separate facts. Each variant is independently reviewable because naturalness, clue leakage, and difficulty may differ.

## 13. AcceptedAnswerSet

```text
AcceptedAnswerSet {
  accepted_answer_set_id, question_id,
  canonical_answer, canonical_entity_refs,
  exact_variants, normalized_variants, aliases,
  transliterations, abbreviations,
  rejected_confusable_answers, language_rules, notes,
  schema_version
}
```

For Andrés Iniesta, valid variants may include `Andrés Iniesta`, `Andres Iniesta`, `Iniesta`, `أندريس إنييستا`, and `إنييستا`. The set must not over-accept an ambiguous surname or nickname where another plausible entity matches. Rejected confusables help future automated support explain near misses.

This object remains useful when a host controls scoring: it supports answer display, adjudication guidance, search, accessibility, and future modes without dictating the host’s decision.

## 14. DifficultyProfile

```text
DifficultyProfile {
  difficulty_profile_id, question_id,
  predicted_level, predicted_score, predicted_confidence,
  prediction_features, prediction_version,
  calibrated_level, calibrated_score, calibration_confidence,
  sample_size, cohort_context, last_calibrated_at,
  manual_override, override_reason, schema_version
}
```

Player-facing levels remain `100`, `200`, and `300`; internal scores may be continuous. The formula is deferred. Calibration may be global or cohort-specific without cloning the QuestionRecord: globally 200, easier for experienced football groups, and differently accessible in a GCC context. Overrides require EditorialAction and do not erase predictions or observations.

## 15. MediaAsset and QuestionMediaUsage

```text
MediaAsset {
  media_asset_id, media_type, source_url, source_domain,
  source_title, creator, license_or_rights_basis,
  attribution, retrieved_at, cached_location, content_hash,
  mime_type, dimensions, duration, language, region,
  moderation_status, availability_status, expiry,
  accessibility_metadata, metadata, schema_version
}

QuestionMediaUsage {
  question_media_usage_id, question_id, variant_id,
  media_asset_id, usage_type, crop, blur_level,
  start_time, end_time, reveal_sequence,
  caption_policy, fallback_behavior, status
}
```

The link object keeps presentation instructions separate and permits one qualified asset to support multiple questions. Rights, availability, moderation, and accessibility are eligibility conditions, not optional notes.

## 16. DuplicateAssessment

```text
DuplicateAssessment {
  assessment_id, candidate_question_id, compared_question_id,
  candidate_fact_id, compared_fact_id,
  fact_fingerprint_match, entity_overlap_score,
  semantic_similarity_score, relationship_match,
  metadata_similarity, decision, confidence,
  threshold_version, reason, created_at
}
```

Decisions: `same_fact`, `probable_duplicate`, `related_but_distinct`, `safe`, and `requires_review`. Assessments operate globally, within custom-category manufacturing, within one account’s recent history, and with the strictest rules inside one game. Scores are evidence; the decision must explain which signals mattered.

## 17. QualityAssessment

```text
QualityAssessment {
  quality_assessment_id, question_id, variant_id,
  fact_confidence, answer_uniqueness, wording_clarity,
  language_naturalness, difficulty_fit, clue_leakage,
  ambiguity, duplicate_risk, regional_fit,
  media_quality, freshness, policy_risk,
  fatal_defects, overall_disposition,
  assessor_versions, assessed_at
}
```

Dispositions: `approve`, `approve_with_warning`, `rewrite`, `revalidate`, `review`, and `reject`. Quality is multidimensional; an aggregate may assist ranking but never cancel a fatal defect. A beautifully phrased question with two valid answers is rejected.

## 18. Question Lifecycle Contract

```text
candidate → fact_verified → question_written → quality_checked
    → approved → available → served → calibrated → trusted

candidate/available/trusted ──problem──▶ needs_review
needs_review ──risk──▶ quarantined ──resolved──▶ approved/available
available/trusted ──expiry──▶ stale ──revalidated──▶ available
any active state ──invalid source──▶ source_invalid
candidate/checked ──same fact──▶ duplicate
candidate/checked ──fatal defect──▶ rejected
approved/available/trusted ──editorial end──▶ retired
```

Not every item passes every state. Some states are operational, some terminal, and some reversible. `quarantined` items are immediately ineligible for new packages; `retired` and `rejected` items remain auditable.

```text
LifecycleTransition {
  transition_id, entity_type, entity_id,
  from_state, to_state, reason_code, notes,
  actor_type, actor_id, pipeline_version, timestamp
}
```

## 19. QuestionPerformance

```text
QuestionPerformance {
  question_id, times_served, attempt_count,
  correct_count, incorrect_count, skip_count,
  reveal_without_attempt_count, host_override_count,
  dispute_count, report_count,
  average_response_time, median_response_time,
  performance_by_language, performance_by_region,
  performance_by_cohort, last_served_at, updated_at,
  aggregation_version
}
```

This aggregate accelerates ranking and calibration but does not replace raw PlayerOutcome events where retention is lawful and appropriate. Counts must define inclusion rules and avoid treating voided or technical-failure slots as clean attempts.

## 20. PlayerOutcome / QuestionOutcomeEvent

```text
PlayerOutcome {
  outcome_id, game_id, game_question_slot_id,
  question_id, fact_id, account_id, group_id, team_id,
  language, difficulty_presented, outcome, response_time,
  answer_revealed, host_override, dispute, report_reason,
  technical_failure, prior_exposure, timestamp,
  event_version
}
```

Outcomes: `correct`, `incorrect`, `skipped`, `revealed`, `voided`, and `disputed`. Host-scored social trivia produces noisy observations, not perfect labels. Discussion time, host judgment, interruptions, and prior exposure affect interpretation. Calibration must retain this context.

## 21. ExposureRecord

```text
ExposureRecord {
  exposure_id, account_id, group_id, game_id,
  question_id, fact_id, category_id,
  knowledge_node_refs, entity_refs, served_at,
  difficulty, question_type, result, exposure_version
}
```

`fact_id` is mandatory. A different wording of the same fact must not evade repetition memory. Question and variant IDs remain useful for measuring exact-form exposure.

## 22. MachineMemoryProfile

```text
MachineMemoryProfile {
  machine_memory_profile_id, account_id, group_id,
  games_played, questions_seen, facts_seen,
  category_statistics, difficulty_statistics,
  format_statistics, recent_entity_exposure,
  recent_topic_exposure, category_strength_estimates,
  difficulty_strength_estimates,
  preferred_or_successful_formats, skip_patterns,
  dispute_patterns, uncertainty, cooldown_policy,
  memory_updated_at, memory_version
}
```

This is trivia-game memory, not a personality profile. Account memory supports durable suppression and general calibration; an optional stable group profile captures a recurring group’s experience. Estimates include sample size, uncertainty, decay, and cooldown. Implementations should aggregate where possible and expose privacy controls. Unnecessary sensitive traits are prohibited.

## 23. CustomCategoryDefinition

```text
CustomCategoryDefinition {
  custom_category_id, account_id, original_user_input,
  normalized_scope, display_names, interpreted_entities,
  time_scope, region_scope, language, knowledge_root_id,
  interpretation_confidence, ambiguity_flags,
  safety_status, generation_status, persistence_mode,
  created_at, last_used_at, schema_version
}
```

Persistence modes: `single_game`, `reusable`, `account_saved`, and `promoted_to_editorial`. Original untrusted input remains distinct from the engine’s normalized interpretation.

```text
Input:      Barca Pep era
Normalized: FC Barcelona first-team football during Pep Guardiola's
            managerial tenure, 2008–2012.
```

Retrieval and coverage operate on the normalized scope. Safety status and interpretation confidence must be resolved before manufacturing proceeds.

## 24. GameRequest

```text
GameRequest {
  game_request_id, account_id, group_id, teams,
  selected_categories, custom_categories,
  language, region, difficulty_slots, game_mode,
  question_format_preferences, accessibility_preferences,
  created_at, contract_version
}
```

This expresses player intent, not a fixed board shape. Category count, slot count, team count, and mode-specific constraints remain extensible. Accessibility preferences affect presentation eligibility but never factual truth.

## 25. GameQuestionSlot

```text
GameQuestionSlot {
  game_question_slot_id, game_package_id, category_id,
  question_id, variant_id, fact_id, difficulty,
  turn_order, slot_index, team_context,
  fallback_question_ids, selection_reason,
  ranking_score, status
}
```

`selection_reason` is structured observability, for example: `fresh_for_account`, `strong_difficulty_fit`, `format_diversity`, `underrepresented_topic`, or `custom_category_requirement`. Ranking score is assembly-version-specific and must not be mistaken for permanent quality.

## 26. GamePackage

`GamePackage` is the complete prepared runtime payload produced before normal gameplay.

```text
GamePackage {
  game_package_id, game_request_id, account_id, group_id,
  engine_version, assembly_version, language, region, teams,
  question_slots, fallback_inventory, created_at, expires_at,
  package_status, contract_version
}
```

Statuses: `preparing`, `ready`, `active`, `completed`, `invalidated`, and `failed`.

> Live gameplay consumes a GamePackage, not the manufacturing pipeline.

A ready package contains resolved variants, answer displays, qualified media usages, attribution where required, and approved fallbacks. Normal question-to-question play does not require generation.

## 27. Fallback Contracts

Prepared fallbacks handle media unavailability, post-assembly quarantine, source invalidation, malformed localization, and technical errors. A fallback may be:

- an alternate approved QuestionVariant;
- an alternate qualified media asset;
- an approved text-only presentation of the same question;
- another eligible question with the same category/difficulty constraints.

Fallbacks are validated at package preparation and ordered by compatibility. Activating one records a reason. Raw emergency generation is never the normal live-play fallback.

## 28. Inventory View Model

```text
InventoryView {
  category_id, language, difficulty, question_type,
  eligible_count, trusted_count, low_stock_threshold,
  target_stock, overexposure_score, freshness_health,
  media_health, last_replenished_at, projection_version
}
```

This may be derived rather than stored. It supports low-stock alerts, adaptive replenishment, category health, coverage planning, and prioritization. Eligibility must use current validation, lifecycle, freshness, language, and media rules—not raw record count.

## 29. Engine Events

Canonical event names include:

```text
FACT_DISCOVERED                 FACT_VALIDATED
FACT_REJECTED                   QUESTION_WRITTEN
QUESTION_APPROVED               QUESTION_QUARANTINED
QUESTION_RETIRED                MEDIA_QUALIFIED
MEDIA_INVALIDATED               DIFFICULTY_CALIBRATED
CUSTOM_CATEGORY_INTERPRETED     GAME_PACKAGE_PREPARING
GAME_PACKAGE_READY              QUESTION_SERVED
QUESTION_OUTCOME_RECORDED       MACHINE_MEMORY_UPDATED
INVENTORY_LOW
```

```text
EngineEvent {
  event_id, event_type, entity_type, entity_id,
  correlation_id, causation_id, payload,
  engine_version, event_version, timestamp
}
```

This is a shared vocabulary for observability and future asynchronous work; it does not mandate event sourcing or a message broker. Events should contain references and safe metadata, not unnecessary sensitive payloads.

## 30. Error and Rejection Contracts

```text
EngineFailure {
  error_code, stage, entity_id, severity, retryable,
  user_visible, internal_message, safe_user_message,
  context, provider_reference, created_at, contract_version
}
```

Representative codes: `insufficient_evidence`, `contradictory_sources`, `ambiguous_answer`, `duplicate_fact`, `language_quality_failure`, `media_unavailable`, `source_stale`, `unsafe_custom_scope`, `inventory_exhausted`, `provider_failure`, and `validation_timeout`.

Structured reasons enable safe retry, routing, metrics, user messaging, and root-cause analysis. Provider errors must be translated into engine-owned codes. Internal messages and provider details must never leak automatically to players.

## 31. Time, Freshness, and Stability

Common fields include `fact_effective_at`, `fact_valid_from`, `fact_valid_until`, `retrieved_at`, `validated_at`, `expires_at`, and `last_checked_at`.

Stability classes:

- `immutable_historical` — 2010 World Cup winner;
- `highly_stable` — established biographical birth place, subject to correction;
- `periodically_changing` — annual award holder;
- `current_state` — current club manager;
- `rapidly_changing` — live chart ranking.

Freshness policies derive review windows from stability, sensitivity, and source policy. Expiry removes eligibility; it does not delete the fact. Time-dependent question wording must expose the relevant “as of” or edition context.

## 32. Language and Localization Contract

Language-independent information includes FactRecord, entity identity, evidence, fingerprint, lifecycle, and most difficulty metadata. Language-specific information includes question text, answer display, aliases/transliterations, explanations, pronunciation hints, and captions.

Arabic (`ar`) and English (`en`) are first-class from the beginning. Neither is the canonical linguistic parent of the other. Locale-specific variants may later distinguish regional vocabulary while referencing the same QuestionRecord and FactRecord. Bidirectional text, native punctuation, transliteration, and Arabic-script normalization are contract concerns, not UI afterthoughts.

## 33. Regional Relevance Model

```text
region_relevance {
  OM: high,
  GCC: high,
  MENA: medium,
  GLOBAL: medium
}
```

Exact weights are deferred. Relevance may attach to categories, nodes, entities, facts, and questions and inform selection, predicted difficulty, coverage, and Machine Memory. It is contextual metadata: it must never mutate factual truth or imply that all players within a region share identical knowledge.

## 34. SensitivityProfile

```text
SensitivityProfile {
  sensitivity_profile_id, sensitivity_class,
  verification_threshold, allowed_question_formats,
  requires_editorial_review, freshness_requirements,
  prohibited_treatments, notes, policy_version
}
```

Classes may include `ordinary`, `religion`, `politics`, `health`, `tragedy`, `disputed_history`, `sexuality`, `minors`, `violence`, and `current_conflict`. This is an attachment point for stricter future sourcing, moderation, wording, and review policy—not the complete policy itself.

## 35. Manual Overrides and EditorialAction

Humans may approve, reject, rewrite a variant, add accepted answers, override difficulty, quarantine, restore, replace a source, flag ambiguity, or retire an item.

```text
EditorialAction {
  editorial_action_id, actor_id, action_type,
  entity_type, entity_id, before_reference,
  after_reference, reason_code, notes,
  related_transition_id, timestamp, action_version
}
```

Edits create new versions or auditable changes; they never silently destroy generated history. Restoring an item requires the issue that caused quarantine to be addressed and recorded.

## 36. Versioning

The engine distinguishes:

- **schema version:** structure and semantics of a canonical object;
- **engine version:** overall producing system release;
- **generation version:** fact/question construction rules or mechanism;
- **validation version:** evidence and verification behavior;
- **difficulty version:** prediction/calibration behavior;
- **localization version:** language-writing and normalization behavior;
- **assembly version:** ranking and constraint behavior;
- **duplicate-threshold version:** similarity signals and decisions.

Versions let operators trace a bad outcome to the system that produced it, compare cohorts, recompute projections, and roll back derived behavior without rewriting historical facts.

## 37. Example: Complete Question Object Graph

The following compact graph illustrates one coherent instance; IDs are illustrative.

```json
{
  "category": {
    "category_id": "cat_football",
    "display_names": {"en": "Football", "ar": "كرة القدم"},
    "status": "active"
  },
  "knowledge_nodes": [
    {"knowledge_node_id": "kn_world_cup", "parent": "cat_football", "name": "World Cup"},
    {"knowledge_node_id": "kn_wc_2010_final", "parent": "kn_world_cup", "name": "2010 Final"}
  ],
  "entities": [
    {"entity_id": "ent_wc2010_final", "entity_type": "event", "canonical_name": "2010 FIFA World Cup Final"},
    {"entity_id": "ent_iniesta", "entity_type": "person", "canonical_name": "Andrés Iniesta"},
    {"entity_id": "ent_netherlands", "entity_type": "team", "canonical_name": "Netherlands"}
  ],
  "fact": {
    "fact_id": "fact_wc2010_winner_scorer",
    "subject_entity_refs": ["ent_wc2010_final"],
    "predicate": "winning_goal_scorer",
    "object_entity_refs": ["ent_iniesta"],
    "answer_target": "object",
    "qualifiers": {"opponent": "ent_netherlands", "minute": 116},
    "stability_class": "immutable_historical",
    "validation_status": "verified"
  },
  "evidence": {
    "evidence_id": "ev_official_match_record",
    "fact_id": "fact_wc2010_winner_scorer",
    "source_trust_tier": "A",
    "supports_claim": true
  },
  "validation": {
    "validation_id": "val_wc2010_1",
    "status": "verified",
    "supporting_evidence_refs": ["ev_official_match_record"],
    "confidence": "high"
  },
  "question": {
    "question_id": "q_wc2010_winner_scorer",
    "fact_id": "fact_wc2010_winner_scorer",
    "answer_target": "object",
    "lifecycle_state": "available"
  },
  "variants": [
    {"variant_id": "qv_wc2010_en", "language": "en", "question_text": "Who scored Spain's winning goal in the 2010 FIFA World Cup Final?", "status": "approved"},
    {"variant_id": "qv_wc2010_ar", "language": "ar", "question_text": "من سجل هدف فوز إسبانيا في نهائي كأس العالم 2010؟", "status": "approved"}
  ],
  "accepted_answers": {
    "canonical_answer": "Andrés Iniesta",
    "exact_variants": ["Andrés Iniesta", "Andres Iniesta", "Iniesta", "أندريس إنييستا", "إنييستا"]
  },
  "difficulty": {"predicted_level": 100, "predicted_confidence": "medium", "calibrated_level": null},
  "duplicate_assessment": {"decision": "safe", "fact_fingerprint_match": false},
  "quality": {"answer_uniqueness": "pass", "language_naturalness": "pass", "overall_disposition": "approve"},
  "slot": {"game_question_slot_id": "slot_4", "question_id": "q_wc2010_winner_scorer", "fact_id": "fact_wc2010_winner_scorer", "difficulty": 100, "selection_reason": ["fresh_for_account", "strong_difficulty_fit"]},
  "outcome": {"outcome_id": "out_4", "game_question_slot_id": "slot_4", "outcome": "correct", "response_time": 8.4},
  "exposure": {"exposure_id": "exp_4", "question_id": "q_wc2010_winner_scorer", "fact_id": "fact_wc2010_winner_scorer", "result": "correct"}
}
```

The outcome updates aggregates and Machine Memory but does not mutate the historical fact.

## 38. Example: Custom Category Object Graph

```json
{
  "custom_category": {
    "custom_category_id": "custom_barca_guardiola",
    "original_user_input": "Barcelona under Guardiola",
    "normalized_scope": "FC Barcelona first-team football during Pep Guardiola's managerial tenure, 2008–2012",
    "interpretation_confidence": "high",
    "safety_status": "allowed",
    "persistence_mode": "single_game"
  },
  "knowledge_nodes": [
    "Seasons", "Players", "Matches", "Trophies", "Tactics", "Opponents"
  ],
  "candidate_fact": {
    "fact_id": "fact_barca_2009_six_trophies",
    "predicate": "trophies_won_in_calendar_year",
    "object": 6,
    "qualifiers": {"club": "FC Barcelona", "year": 2009}
  },
  "validation": {
    "status": "verified",
    "policy_profile": "stable_sports_history",
    "supporting_evidence_refs": ["ev_official_club_record", "ev_authoritative_reference"]
  },
  "question": {
    "question_id": "q_barca_2009_trophy_count",
    "fact_id": "fact_barca_2009_six_trophies",
    "answer_target": "object",
    "lifecycle_state": "available"
  },
  "variant": {
    "language": "en",
    "question_text": "How many trophies did Barcelona win during the 2009 calendar year?",
    "status": "approved"
  },
  "assembly": {
    "category_id": "custom_barca_guardiola",
    "selection_reason": ["custom_category_requirement", "underrepresented_topic"],
    "duplicate_scope": "game_and_account"
  }
}
```

The custom scope produces ordinary KnowledgeNodes, FactRecords, evidence, validation, QuestionRecords, variants, and slots. It does not require a parallel “AI questions” schema or weaker quality rules.

## 39. Invariants

Future implementations must enforce at least these rules:

1. An `available` QuestionRecord references a FactRecord validated to its active source policy.
2. A live GamePackage contains no two slots with the same fact identity.
3. A quarantined QuestionRecord is never eligible for a new GamePackage.
4. Every QuestionVariant belongs to exactly one QuestionRecord.
5. Every QuestionRecord belongs to exactly one FactRecord and answer target.
6. A question cannot become `trusted` without valid lifecycle history.
7. Exposure records include FactRecord identity, not only wording or question identity.
8. Expired current-state facts are ineligible until revalidated.
9. Custom categories use the same FactRecord and QuestionRecord contracts as built-ins.
10. Arabic and English variants never create separate fact identities solely because of language.
11. Manual overrides require an EditorialAction and lifecycle reason where applicable.
12. Fallback questions and variants are already approved and eligible.
13. A ready GamePackage resolves every required slot or fails explicitly; it does not promise missing questions.
14. Fatal QualityAssessment defects prevent approval regardless of aggregate score.
15. Evidence contradictions remain auditable after a validation decision.
16. Provider identifiers cannot become canonical engine IDs.
17. A media-dependent slot has an eligible fallback or is excluded from a ready package.
18. Outcome events do not directly mutate canonical facts.

## 40. Durable Storage vs Derived Information

Likely durable information includes facts, evidence provenance, validation decisions, questions, variants, accepted-answer sets, lifecycle history, exposures, outcomes, editorial actions, custom-category interpretations, packages required for audit, and version metadata.

Potentially derived or cacheable information includes embeddings, aggregate performance, inventory health, coverage scores, ranking scores, difficulty features, semantic candidate lists, and Machine Memory projections. Some derived values may still be persisted for performance or audit, but they must identify source inputs and computation version and be safely recomputable.

The distinction is semantic, not a storage mandate: losing a cache should cost time, not truth or audit history.

## 41. Privacy and Data Minimization

Machine Memory should reason primarily from account ID, optional group ID, game behavior, exposures, category performance, and format outcomes. It should not become personality profiling or ingest unrelated browsing behavior, private demographic inference, contacts, communications, or invasive tracking.

Identifiers should be minimized or pseudonymous in analytics contexts. Retention, deletion, access, aggregation thresholds, and regional legal compliance belong in later privacy/security work. The data model must support those controls and avoid collecting fields without a defined game benefit.

## 42. Implementation Boundary

This document does not decide:

- SQL versus NoSQL;
- table layout, normalization, indexes, or ORM;
- database or vector-store vendor;
- graph-database use;
- model, search, or media provider;
- cloud, API, or queue framework;
- programming language;
- exact JSON serialization;
- exact numeric scoring, confidence, ranking, or calibration formulas.

It defines semantic stability before implementation choice. No routes, migrations, models, services, workers, queues, prompts, or infrastructure are created by this specification.

## 43. Handoff to GUESSENGINE-3

`GUESSENGINE-1.md` defines system doctrine.  
`GUESSENGINE-2.md` defines canonical objects and contracts.  
`GUESSENGINE-3.md` will define the detailed manufacturing pipeline that creates, transforms, validates, rejects, caches, and promotes these objects through the Guess Engine.

`GUESSENGINE-3.md` is not part of this work and must not be written yet.

## 44. Canonical Contract Doctrine

1. Facts are the truth-bearing core.
2. Questions reference facts; wording does not redefine truth.
3. Evidence is inspectable.
4. Uncertainty is explicit.
5. Identity survives rewriting and localization.
6. Arabic and English are first-class siblings.
7. Custom categories use the same object model.
8. Exposure is tracked by fact, not merely question wording.
9. Lifecycle changes are auditable.
10. Difficulty can evolve without mutating the fact.
11. Providers are adapters, not architecture.
12. GamePackages are the runtime boundary.
13. These schemas describe meaning, not database tables.

