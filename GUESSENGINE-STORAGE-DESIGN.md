# Guess Engine Storage Design

**Status:** Second implementation-planning document  
**Product:** Guess Machine / مخ ماشين  
**Binding inputs:** `GUESSENGINE-1.md` through `GUESSENGINE-9.md`, plus `GUESSENGINE-MVP-IMPLEMENTATION.md`  
**Repository assessment:** No database, ORM, migrations, application stack, or persistence artifacts currently exist  
**Implementation status:** Design only; no tables, models, migrations, dependencies, or database are created

## 0. Purpose

`GUESSENGINE-2.md` defines canonical semantic objects, not physical tables. This document maps the MVP’s required meaning into a lightweight relational persistence design that can later be implemented without reinventing identity, auditing, repeat memory, bilingual presentation, or runtime snapshots.

> Domain objects describe meaning. Storage structures serve implementation.

The mapping is deliberately not one table per conceptual object.

## 1. Storage Principles

1. Use one primary relational database for MVP.
2. Preserve stable opaque canonical IDs.
3. Keep FactRecord separate from QuestionRecord.
4. Keep QuestionVariant separate by language/presentation.
5. Store exposure by `fact_id`.
6. Preserve auditable GamePackage slots and actual presentation.
7. Retain claim provenance.
8. Use simple indexed relational queries.
9. Use JSON only for genuinely flexible metadata.
10. Core queryable relationships are relational.
11. Derived projections may be rebuilt.
12. Cache is never durable truth.
13. Prefer migration-friendly, boring structures.
14. Avoid infrastructure for hypothetical scale.
15. Keep extension paths for Foundry, Memory, Difficulty, Custom, and Media.

## 2. Existing Database Assessment

The repository contains Markdown specifications only. There is no database technology, ORM/query layer, physical model, account storage, migration tool, seed system, local database, production assumption, package manifest, or source code.

### Reuse

- Canonical IDs and relationships from Engine 2.
- GamePackage/runtime semantics from Engine 9.
- MVP scope and manual seed strategy.
- Bilingual sibling-variant model and fact-level exposure.

### Adapt

- Convert selected canonical objects into the minimum table set below once a stack is chosen.
- Represent flexible qualifiers/policy metadata as bounded JSON while preserving primary joins.
- Implement Machine Memory initially as queries/projections over durable events.

### Migrate

Nothing currently exists to migrate. Future migrations must preserve canonical IDs, references, snapshots, and history.

### Avoid

- Selecting a database provider in this document without an application stack.
- Flat `question, answer, category` storage.
- One giant JSON document per game or account.
- Language-duplicated facts, vector/graph databases, or event sourcing for MVP.

## 3. Relational Model Choice

The core is naturally relational: category/node↔fact, fact→question→variant/answers, account→exposure, game→package→slots→outcomes. Foreign keys and unique constraints protect identity and idempotency. Graph-shaped knowledge can use relation tables; no graph database is needed.

## 4. Core Physical Table Set

| Table | Purpose | MVP status |
|---|---|---|
| `accounts` | owner boundary if auth exists | critical once account persistence exists; auth fields external |
| `categories` | built-in/editorial/custom-facing category identity | critical |
| `knowledge_nodes` | lightweight coverage hierarchy | early/critical for diversity |
| `entities`, `entity_aliases` | canonical people/teams/works and names | early; aliases may phase in |
| `facts` | truth-bearing identity/current verification summary | critical |
| `fact_categories`, `fact_knowledge_nodes`, `fact_entities` | reusable many-to-many meaning | critical/early |
| `source_evidence` | inspectable provenance | critical for seeded facts |
| `fact_validations` | auditable validation decisions | recommended from MVP |
| `questions` | one trivia intent against one fact | critical |
| `question_variants` | Arabic/English/presentation wording | critical |
| `accepted_answers` | aliases/transliterations/answer forms | critical |
| `difficulty_profiles` | editorial/predicted/calibrated challenge | simple MVP row |
| `media_assets`, `question_media_usage` | qualified media metadata | defer unless image MVP ships |
| `custom_categories` | normalized saved/custom scope | early proof/phase 2 |
| `games`, `game_packages`, `game_slots` | runtime identity/snapshot | critical |
| `player_outcomes`, `exposures` | durable feedback and memory | critical |
| `question_performance`, category stats | derived aggregates | defer/materialize only when needed |
| `lifecycle_transitions`, `editorial_actions` | audit history | recommended but may phase in |

## 5. MVP-critical Tables

First playable storage requires accounts (or a stable development account abstraction), categories, facts, fact-category links, questions, variants, answers, difficulty, source evidence/validation summary, games, packages, slots, exposures, and outcomes. KnowledgeNodes should be included early because diversity is an MVP goal. Entities/custom categories can start minimal but must use canonical links rather than duplicated facts.

## 6. Category Storage

```text
categories {
  id, slug, name_en, name_ar,
  description_en, description_ar,
  status, category_type,
  created_at, updated_at
}
```

Names are independent localized presentation. Category availability must not live only in frontend constants. `slug` is unique; ID is canonical and immutable.

## 7. Knowledge Node Storage

```text
knowledge_nodes {
  id, category_id, parent_id,
  canonical_name, name_en, name_ar,
  node_type, status, metadata_json,
  created_at, updated_at
}
```

Self-reference provides hierarchy. A future `knowledge_node_links` table can express cross-links. No transitive-closure or graph infrastructure is required initially.

## 8. Entity Storage

```text
entities {
  id, entity_type, canonical_name,
  name_en, name_ar, status, metadata_json,
  created_at, updated_at
}

entity_aliases {
  id, entity_id, language, alias_text,
  normalized_text, alias_type
}
```

Separate alias rows are recommended because retrieval, accepted answers, and dedupe will query aliases. If entities are delayed, initial facts can still use normalized structured text, but no entity identity should be faked by question strings.

## 9. Fact Storage

```text
facts {
  id, normalized_fact, predicate, answer_target,
  fact_fingerprint, stability_class,
  validation_status, validation_confidence,
  qualifiers_json, effective_at, valid_until,
  created_at, updated_at
}
```

Fact text is presentation-neutral. Qualifiers JSON contains low-frequency structured qualifiers; core answer/category/entity relationships remain relational. Question text never belongs here.

## 10. Fact ↔ Category / Node Relationships

```text
fact_categories { fact_id, category_id, relation_type }
fact_knowledge_nodes { fact_id, knowledge_node_id, relation_type }
```

Many-to-many links enable one fact to serve built-in, custom, and overlapping categories without duplicated truth or exposure identity.

## 11. Fact ↔ Entity Relationships

```text
fact_entities {
  fact_id, entity_id, role, qualifier_key_optional,
  display_order_optional
}
```

Roles include `subject`, `object`, `answer`, `qualifier`, and `related`. This normalized relation is preferred over fixed subject/object columns alone because facts may contain several participants. `facts.predicate` plus role rows provide graph-like semantics relationally.

## 12. Source Evidence Storage

```text
source_evidence {
  id, fact_id, source_url, source_domain,
  source_title, source_type, trust_tier,
  supports_claim, contradicts_claim,
  retrieved_at, checked_at,
  reference_text_optional, metadata_json,
  status
}
```

Store claim-specific provenance, not complete copyrighted pages. Manual seed facts require at least one inspectable evidence record or an explicitly documented accepted source reference.

## 13. Validation Storage

Recommended MVP: retain current validation summary on `facts` for eligibility queries **and** a small `fact_validations` history table from the start:

```text
fact_validations {
  id, fact_id, status, confidence,
  policy_profile_key, validated_at, expires_at,
  reviewer_or_stage, reason_json
}
```

This costs little and avoids losing why a fact changed. Evidence links may use a join table later; source evidence already points to fact.

## 14. Question Storage

```text
questions {
  id, fact_id, answer_target,
  question_type, lifecycle_state, quality_state,
  created_at, updated_at
}
```

Every question references exactly one fact. Difficulty belongs in a profile row rather than duplicated across variants unless later evidence proves variant-specific profiles necessary; the schema can add `variant_id` to DifficultyProfile later.

## 15. Question Variant Storage

```text
question_variants {
  id, question_id, language, locale,
  question_text, answer_display, explanation,
  format, status, variant_version,
  created_at, updated_at
}
```

Unique key concept: `(question_id, language, format, variant_version)`. Exactly one active default per question/language/format should be enforced through application logic or a database constraint suitable to the chosen engine.

## 16. Accepted Answer Storage

```text
accepted_answers {
  id, question_id, language,
  answer_text, normalized_text,
  answer_type, is_canonical, status
}
```

Separate rows are preferred because Arabic/English variants, aliases, transliterations, abbreviations, and rejected confusables will be queried. Canonical display answer remains distinguishable from accepted alternatives.

## 17. Difficulty Storage

```text
difficulty_profiles {
  id, question_id,
  predicted_level, predicted_score_optional,
  predicted_confidence_optional,
  calibrated_level_optional,
  calibration_confidence_optional,
  sample_size_default_0,
  override_level_optional, updated_at
}
```

For MVP only `predicted_level` (100/200/300) is required; the extra nullable fields preserve a clean calibration path without requiring an algorithm.

## 18. Lifecycle Storage

`questions.lifecycle_state` is mandatory. States must distinguish candidate/approved/available/quarantined/rejected/retired/stale. A small `lifecycle_transitions` table is recommended in phase 2; MVP seed imports may initially record only current state plus created/updated timestamps. Historical games continue referencing retired records.

## 19. Custom Category Storage

```text
custom_categories {
  id, account_id, original_input, normalized_scope,
  display_name_en, display_name_ar,
  status, persistence_mode,
  scope_version, created_at, updated_at, last_used_at
}
```

A linking table such as `custom_category_facts(custom_category_id, fact_id)` or representation through a category identity/fact_categories associates ordinary canonical facts. There is no custom-question table.

## 20. Game Storage

```text
games {
  id, account_id, group_id_optional,
  language, region, status,
  created_at, started_at, completed_at
}
```

`games` owns player/session identity and completion status; selected inventory lives in its package/slots.

## 21. GamePackage Storage

Use a dedicated lightweight package row:

```text
game_packages {
  id, game_id, status,
  assembly_version, contract_version,
  created_at, expires_at_optional,
  failure_code_optional
}
```

This separates preparation lifecycle from gameplay and allows failed/rebuilt package attempts to remain diagnosable.

## 22. Game Slot Storage

```text
game_slots {
  id, game_package_id, category_id,
  question_id, fact_id, variant_id,
  difficulty, slot_index, status,
  fallback_question_id_optional,
  fallback_variant_id_optional,
  selection_reason_json,
  question_text_snapshot, answer_display_snapshot,
  language_snapshot, difficulty_snapshot,
  media_usage_snapshot_optional,
  served_question_id_optional, served_fact_id_optional,
  served_variant_id_optional
}
```

Unique package/fact prevents primary duplicates. Runtime `served_*` records fallback reality without rewriting the originally prepared primary.

## 23. Fallback Storage

MVP uses one prepared fallback question/variant per slot. If deeper fallback graphs become necessary, add `game_slot_fallbacks(slot_id, priority, question_id, variant_id, fact_id)` later. The simple columns must still satisfy category/difficulty/language/duplicate constraints at package validation.

## 24. Outcome Storage

```text
player_outcomes {
  id, game_id, game_slot_id, account_id,
  team_id_optional,
  question_id, fact_id, variant_id_optional,
  outcome, response_time_optional,
  host_override, disputed, technical_failure,
  idempotency_key, created_at
}
```

IDs reference the actual served primary or fallback.

## 25. Exposure Storage

```text
exposures {
  id, account_id, group_id_optional,
  game_id, game_slot_id,
  question_id, variant_id_optional, fact_id,
  category_id, served_at, outcome_optional,
  exposure_kind, idempotency_key
}
```

The critical index is `(account_id, fact_id, served_at)`, with a corresponding group index when groups exist.

## 26. Exact Variant Exposure

Store optional `variant_id` and `question_id` in ExposureRecord to distinguish exact wording from same fact. Repeat suppression begins with `fact_id`; detailed exposure refines penalties later.

## 27. Machine Memory Storage

Do not store one opaque profile blob. Derive MVP memory from exposures, outcomes, and games. Add a small `account_category_stats` projection only when repeated aggregation becomes measurably expensive:

```text
account_category_stats {
  account_id, category_id,
  games_played, questions_seen,
  correct_count, incorrect_count,
  last_played_at, projection_version
}
```

## 28. Group Memory Storage

Keep nullable `group_id` on games/exposures/outcomes and allow a future host-owned `groups(id, account_id, display_name, status)`. Do not require participant membership or individual player accounts for MVP.

## 29. Question Performance Storage

QuestionPerformance can be derived initially. If needed, materialize counts/timing totals in `question_performance` with a projection version and rebuild path. Durable PlayerOutcomes remain authoritative.

## 30. Derived vs Durable Data

| Data | Durable | Derived/cacheable |
|---|---:|---:|
| FactRecord/evidence | yes | no |
| Question/variant/answer | yes | no |
| Game slots/snapshots | yes | no |
| Exposure/PlayerOutcome | yes | no |
| Validation history | yes | no |
| QuestionPerformance aggregate | optional | yes |
| Category/group strength | optional | yes |
| Inventory health/ranking score | no | yes |
| Semantic embedding | no | yes |

Losing derived data costs recomputation, not history or truth.

## 31. JSON Usage Policy

Good JSON: flexible fact qualifiers, selection explanations, low-frequency metadata, accessibility/media usage snapshot, experimental fields. Bad JSON: IDs/foreign relations, category membership, exposure, accepted answers when queried, lifecycle, and core outcomes.

## 32. Enum / Status Policy

Closed vocabularies include lifecycle, outcome, category type, stability, language, package/game/slot status, and validation. Choose text plus application/database checks or native enums according to the future DB/ORM’s migration behavior. Favor easy evolution over rigid provider-specific enums.

## 33. Index Strategy

Essential indexes: fact fingerprint; questions by fact/lifecycle; category/node fact links; variants by question/language/status; difficulty by level; exposures by account/group and fact/time; slots by package/status; outcomes by question/fact; custom categories by account. Add composite indexes only from real query plans.

## 34. Unique Constraints

Use unique category slug, canonical IDs, package/game relation as appropriate, package+primary fact, variant version key, alias key where safe, and idempotency keys for outcome/exposure. Fact fingerprint may be unique only after normalization policy proves collisions/legitimate equivalents are handled.

## 35. Foreign Key Philosophy

Use foreign keys for question→fact, variant/answer→question, links→canonical objects, package→game, slot→package/question/fact/variant, and outcome/exposure→actual served objects. Avoid destructive cascade from canonical content into historical packages/outcomes; prefer restrict/retire or nullable ownership only where privacy requires it.

## 36. Delete vs Retire

Facts, questions, categories, and custom inventory normally transition to retired/rejected/quarantined. Hard deletion is limited to privacy requirements and unused development accidents. Historical references remain intelligible.

## 37. Account Deletion

Support deletion or anonymization of account/group links, exposures, saved custom ownership, and game records according to future policy. Global aggregates may remain only in lawful de-identified form. Canonical public facts/questions are not owned by the deleted account.

## 38. Versioning Storage

Use migration versioning through future tooling; store assembly/contract version on GamePackage, variant version, source/validation timestamps, and projection versions where data is derived. Do not add unused `version` columns to every table.

## 39. Game Snapshot vs Live References

A played game must remain auditable even after editorial changes. Each slot therefore keeps foreign keys to the canonical Fact, Question, and QuestionVariant **and** a presentation snapshot of what players actually saw. Live references support analytics and correction tracing; snapshots preserve history. A later correction changes future packages, never the wording of a completed game.

## 40. Game Slot Snapshot

At activation, persist `question_text_snapshot`, `answer_display_snapshot`, `language_snapshot`, `difficulty_snapshot`, and optional `media_usage_snapshot`. Also retain the selected canonical IDs and their versions. Snapshots are immutable after the slot is served, except for narrowly controlled redaction with an audit record. Internal notes, complete evidence payloads, and hidden alternate answers do not belong in the player snapshot.

## 41. Seed Data Storage

Initial categories, nodes, curated facts, and validation fixtures should live as reviewable JSON, YAML, or typed code fixtures chosen with the eventual stack—not as opaque SQL dumps. Stable canonical identifiers must be authored in the seed source. Seed files bootstrap durable tables but are not the runtime database and must not overwrite production editorial work. No seed fixtures are created by this document.

## 42. Seed Import Idempotency

Every seed record needs a stable ID or natural import key plus a seed revision. Imports use upsert semantics only for seed-owned fields, run safely more than once, and report conflicts rather than creating duplicates. Removing a seed entry should retire it explicitly; absence from a later file must not silently delete durable data.

## 43. Arabic Storage

Use full Unicode/UTF-8 storage throughout. Preserve original Arabic question text, display answers, aliases, diacritics, punctuation, Arabic-Indic digits, and transliterations as separately meaningful values. Never destructively normalize the canonical text. Language and, when useful, locale/script fields distinguish Arabic and English variants without forcing one to be a translation of the other.

## 44. Search Normalization

Store original display values alongside derived search forms. Normalization may case-fold Latin, normalize Unicode forms, standardize selected Arabic letter variants, remove optional diacritics/tatweel for matching, and normalize whitespace. It must be deterministic, versioned, reversible by recomputation, and must not collapse distinct canonical answers. Answer evaluation can compare several normalized aliases while always displaying the authored value.

## 45. Current Fact Storage

Time-sensitive facts carry `verified_at`, optional `valid_from`, `valid_until`, and a stability classification. A fact that expires is not deleted: it becomes ineligible for new selection until revalidated or superseded. Queries for “current” content require an eligible lifecycle state, sufficient validation confidence, and a validity window containing the package assembly time.

## 46. Media Storage Boundary

The database stores media identity, source/provider reference, canonical URL or object key, license/attribution, content type, dimensions/duration, safety/validation state, hashes, and availability checks. Large image/audio/video binaries belong in object storage or an approved provider, not ordinary relational rows. A future `media_assets` table may link assets to facts or variants; game snapshots store only the media usage/reference needed to reconstruct play.

## 47. Vector / Embedding Future

MVP does not require a vector database. Semantic fingerprints and canonical relationships provide the first duplicate defenses. Later, embeddings may be stored in a supported relational vector column or an external index keyed by stable canonical IDs, with model/version metadata. Embeddings are disposable projections: canonical identity, exposure, and suppression must never depend solely on a vector store.

## 48. Full-text Search Future

MVP uses indexed normalized fields and the chosen relational engine’s practical text capabilities. Built-in full-text search may later support administration and discovery. Elasticsearch or another search cluster is unjustified until measured query volume, language quality, or operational needs exceed the relational solution.

## 49. Cache Boundary

Caches may accelerate package candidates, category inventory counts, or read-heavy projections, but the relational store remains authoritative. Cache entries must be reconstructible, versioned or invalidated when eligibility changes, and safe to miss. Redis or another dedicated cache is deferred until latency and concurrency measurements justify the operational cost.

## 50. Transaction Boundaries

Transactions protect: package creation and readiness; slot activation/completion; fallback substitution; lifecycle transitions plus audit; and outcome/exposure recording. External model, media, or verification calls occur outside long database transactions. Use short transactions with explicit retry behavior, and never hold locks while waiting on a remote service.

## 51. GamePackage Creation Transaction

Create a package in `preparing`, insert its slots, validate uniqueness/eligibility/coverage, then atomically mark it `ready`. A ready package must have its required slot count and all required primary references/snapshots. Failure leaves an inspectable failed/preparing package or rolls back entirely; it must never expose a partially ready package. Retried assembly uses an idempotency key.

## 52. Outcome + Exposure Consistency

When a slot resolves, one transaction records the actual served fact/question/variant exposure, records or updates its outcome, and marks the slot resolved. Idempotency keys prevent double submission. If fallback changed the content, all three records point to the fallback actually shown—not the abandoned primary. A question becoming visible counts as exposure even if no answer is submitted.

## 53. Concurrency

Multiple games and package workers may operate simultaneously. Row state transitions use compare-and-set conditions or optimistic versions; unique constraints enforce idempotency; candidate reservation, when needed, is short-lived and scoped to a package. Double slot selection returns the already-selected result or a conflict, never two questions. Retried workers must recognize completed work. Distributed locks are deferred unless database coordination proves insufficient.

## 54. Migration Philosophy

Use the future stack’s conventional migration tool with reviewed, ordered, reversible-where-practical changes. Prefer expand/backfill/switch/contract for production changes. Never depend on destructive resets outside disposable local data. Schema migrations and seed imports are separate concerns, and data backfills must be restartable and observable.

## 55. Schema Naming

Use consistent `snake_case` physical names unless the selected framework has an established alternative. Tables use plural nouns; primary keys use `id`; foreign keys use `<entity>_id`; timestamps use `_at`; effective dates use `_from`/`_until`; booleans describe positive states. Canonical product terms—fact, question, variant, package, slot, exposure, outcome—must remain recognizable across code and storage.

## 56. Storage Size Expectations

Structured MVP data should remain ordinary relational scale: facts/questions are kilobyte-level records, while exposure/outcome history grows with games. Media binaries would dominate, which is why they stay outside the database. Monitor row growth, large JSON values, index size, snapshot duplication, and retention needs before partitioning or archiving. Unexpected ballooning is investigated rather than preemptively sharded.

## 57. Local Development Database

No runtime stack or database currently exists. Once selected, local development should use the same relational engine as production when practical, preferably through the project’s normal lightweight container/dev setup. A file database is acceptable only if its constraints, transactions, Unicode behavior, and query semantics are proven compatible. This document does not introduce Docker, a provider, or a database file.

## 58. Production Portability

The logical model targets common managed relational databases. Keep correctness in portable constraints and application contracts; isolate provider-specific full-text, vector, JSON-index, or generated-column features. IDs, timestamps, Unicode text, migrations, and transaction semantics must behave consistently. Portability does not mean avoiding all useful provider features—it means they cannot obscure the canonical model.

## 59. Backup / Recovery

Back up canonical facts/questions, source evidence, editorial and validation history, custom-category ownership, games/packages, exposures, and outcomes. Test restoration and define recovery objectives before launch. Media recovery follows object-storage policy while database metadata remains backed up. Detailed retention schedules, regional replication, point-in-time recovery, and disaster-runbooks wait for provider and business requirements.

## 60. Observability from Storage

Operational queries must reveal eligible inventory by category/difficulty/language; recently seen facts; disputed or skipped content; low-stock categories; missing/stale evidence; failed package assemblies; fallback rates; and account-owned custom categories. Use read-only views or projections when useful. Observability must not mutate canonical data or require inspecting opaque blobs.

## 61. Admin Queryability

An administrator should traverse Question → Variant/Answers → Fact → Evidence/Validation → Categories/Entities, then inspect lifecycle, package use, exposures, and outcomes. Important filters must be columns or relations, not buried in JSON. Admin access is audited and scoped; player-facing services never receive internal evidence notes or moderation fields by default.

## 62. Storage Security

Enforce ownership and authorization in service logic and, where appropriate, database policies. Clients cannot write canonical facts, lifecycle states, validation, exposures, or outcomes arbitrarily. Separate public presentation fields from internal notes; use least-privilege database roles; encrypt transport and managed storage; keep credentials outside tables and source control. Parameterized access and validated inputs are mandatory.

## 63. Privacy

Store only behavior needed to operate and improve games: account/group identifiers, content exposure, outcomes, disputes, ratings, and category preferences. Do not infer or store personality, demographics, sensitive traits, or unrelated telemetry. Support export/deletion policy, minimize raw identifiers in analytics, and define retention before production. The Machine learns game-running preferences, not private profiles.

## 64. Full Worked Record Graph

Example: the fact “Andrés Iniesta scored Spain’s winning goal in the 2010 FIFA World Cup final.”

1. `categories`: Football (`football`).
2. `knowledge_nodes`: FIFA World Cup; Spain national team.
3. `entities`: Andrés Iniesta, Spain, Netherlands, 2010 FIFA World Cup Final, with Arabic/English aliases.
4. `facts`: canonical proposition, stable fingerprint, historical stability, active lifecycle.
5. `fact_categories` and `fact_nodes`: link the fact to Football and both nodes.
6. `fact_entities`: Iniesta as answer/subject; Spain and Netherlands as participants; final as event.
7. `source_evidence`: authoritative match record reference, checked date, supported claim.
8. `validations`: factual, ambiguity, spoiler, and answer checks passed.
9. `questions`: asks who scored the winning goal, expected-answer type person.
10. `question_variants`: English and Arabic wording versions.
11. `accepted_answers`: “Andrés Iniesta”, “Iniesta”, “أندريس إنييستا”, and reviewed normalized forms.
12. `difficulty_assessments`: value 200 with rationale and calibration version.
13. `game_slots`: canonical IDs plus the exact served question/answer/language/difficulty snapshot.
14. `exposures`: the account/group saw this fact and exact Arabic variant.
15. `outcomes`: answered correctly, response time if collected, no dispute.

Every route back to the content resolves through the same `fact_id`, so rewording or cross-category membership cannot evade repetition controls.

## 65. Arabic / English Example

One Fact owns two language variants rather than two unrelated facts:

- English: “Who scored Spain’s winning goal in the 2010 World Cup final?” → “Andrés Iniesta”.
- Arabic: “من سجّل هدف فوز إسبانيا في نهائي كأس العالم 2010؟” → “أندريس إنييستا”.

Each variant has its own authored text and answer display/aliases, but both reference the same Question and Fact. Serving either writes the shared `fact_id` exposure, so the other language is suppressed by fact memory even if its exact variant was never seen.

## 66. Cross-category Example

The same Iniesta fact may belong to Football, Champions, and an account-owned “Barcelona Legends” custom category through separate membership rows. It is not copied three times. Once exposed, selection joins candidate memberships against the account/group’s Fact-level exposure and suppresses it everywhere for the applicable memory window. Category reports can still attribute where it was served.

## 67. GamePackage Snapshot Example

Package `P42` selects Arabic variant version 3 at difficulty 200 into slot 7. The slot stores the canonical IDs plus its Arabic question and display-answer snapshot. An editor later fixes punctuation and publishes variant version 4. Future packages receive version 4; replay/audit of `P42` shows exactly version 3. The Fact-level exposure remains unchanged because wording versions do not create new knowledge.

## 68. Fallback Example

A slot’s primary is an image question and its ordered fallback is a text question. If the image fails the pre-serve availability check, the slot atomically records `fallback_activated_at`, reason `media_unavailable`, selected fallback ID, and the fallback presentation snapshot. Exposure and outcome reference the fallback fact/question/variant actually shown. If fallback is merely another presentation of the same Fact, it still produces one Fact exposure, not two.

## 69. Storage Invariants

1. Every Question references exactly one canonical Fact.
2. Every QuestionVariant references one Question and one language.
3. Every accepted answer belongs to a Question or explicitly scoped variant.
4. Every ready GamePackage has all required slots.
5. Every served slot has an immutable presentation snapshot.
6. Every exposure records the actual Fact shown.
7. A wording change never creates a new Fact solely to evade memory.
8. Category membership never duplicates the Fact row.
9. Custom-category ownership is explicit.
10. Used/retired content cannot enter new packages unless policy explicitly re-enables it.
11. Expired current facts are ineligible until revalidated.
12. Evidence records preserve provenance and check time.
13. Validation history is append-oriented and attributable.
14. Derived projections can be rebuilt from durable records.
15. Cache loss cannot lose game truth or Machine Memory.
16. Media binaries are not stored in ordinary relational rows.
17. Canonical Arabic and English text is never overwritten by search normalization.
18. Outcome submission is idempotent per served slot.
19. A visible unanswered question still creates an exposure.
20. Fallback records identify what was actually shown.
21. Historical games remain interpretable after editorial updates.
22. Foreign keys cannot cascade-delete canonical content needed by history.
23. Account deletion does not erase globally canonical public knowledge, but removes/anonymizes account-linked history as policy requires.
24. No critical selection, eligibility, ownership, or exposure fact exists only inside opaque JSON.

## 70. MVP Storage Implementation Phases

**Phase 1 — playable memory:** categories, facts, questions, question variants, accepted answers, games, game packages/slots, exposures, and outcomes. Include lifecycle fields and snapshots needed for correctness.

**Phase 2 — trustworthy knowledge:** knowledge nodes, entities/aliases, fact relationships, source evidence, validations, and custom categories/memberships.

**Phase 3 — improving Machine:** difficulty assessments, lifecycle/audit history, performance projections, richer media metadata, and group/account memory projections.

Each phase must migrate existing records forward; later phases enrich rather than replace the Phase 1 canonical Fact/exposure spine.

## 71. What Should Not Be Decided Yet

Defer the database vendor/managed provider, ORM/query builder, dialect-specific column types, exact migration commands, provider-specific index syntax, cache product, vector store, search cluster, media object provider, backup schedule, capacity/sharding plan, retention periods, analytics warehouse, and regional topology. Those choices require the application stack, deployment target, budget, privacy policy, and measured workloads. The logical contracts and invariants in this document remain binding inputs to those decisions.

## 72. Recommended Follow-up Document

Create `GUESSENGINE-API-CONTRACTS.md` next. It should translate these durable objects and transaction boundaries into request/response contracts, idempotency rules, authorization scopes, errors, package assembly commands, slot activation/resolution, and admin workflows. It must reference this storage design rather than redefining canonical identity or Machine Memory. This follow-up is recommended only and is not created here.

## 73. Storage Doctrine

1. The Fact is the unit of knowledge.
2. The Question is a playable framing of a Fact.
3. A Variant is wording, not new knowledge.
4. Exposure follows the Fact across wording and categories.
5. Exact-variant history supplements, never replaces, Fact memory.
6. Categories organize knowledge; they do not own copies of it.
7. Evidence must remain traceable.
8. Validation must remain attributable and inspectable.
9. Difficulty is assessed and versioned, not guessed forever.
10. Lifecycle changes preserve history.
11. Played games keep what players actually saw.
12. Fallback records reality, not intent.
13. Transactions protect player-visible truth.
14. Idempotency makes retries safe.
15. Durable data expresses business truth; projections accelerate it.
16. JSON is an escape hatch, not a hiding place.
17. Caches and embeddings are disposable.
18. Arabic and English originals are first-class content.
19. Privacy limits what the Machine remembers about people.
20. Store the Machine's memory, not an entire copy of the internet.
