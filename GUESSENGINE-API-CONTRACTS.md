# Guess Engine API Contracts

## 0. Purpose

This is the third implementation-planning document for the Guess Engine. It defines the semantic boundary through which Guess Machine frontend, host, player-display, administration, and background systems ask the Engine to do work. It is subordinate to `GUESSENGINE-1.md` through `GUESSENGINE-9.md`, `GUESSENGINE-MVP-IMPLEMENTATION.md`, and `GUESSENGINE-STORAGE-DESIGN.md`.

```text
Storage
  ↕
Domain / Engine services
  ↕
API contracts
  ↕
Frontend / Host / Player
```

Database schema is not an API. API payloads are not canonical storage records. The Engine owns business transitions. Contracts describe intent and observable results; a later implementation may map them to REST, RPC, GraphQL, messages, or another transport without changing their meaning.

## 1. API Principles

1. Prefer intent-based operations over CRUD where business rules matter.
2. Use stable opaque IDs, never display labels as identity.
3. Make state transitions explicit and Engine-owned.
4. Return the minimum information each trust level needs.
5. Separate host, shared-display, account, and administrative authority.
6. Make retryable mutations idempotent.
7. Never leak answers or future package contents.
8. Return structured, user-safe errors.
9. Version contracts deliberately and evolve additively.
10. Remain transport-neutral where practical.
11. Hide model, retrieval, media-provider, and infrastructure details.
12. Keep live-runtime operations fast, deterministic, and boring.
13. Keep expensive manufacturing in preparation, administration, or background flows.
14. Treat the server-side game state as authoritative.
15. Return presentation DTOs, not domain or database objects.

## 2. Client Types / Trust Boundaries

### Shared Player View

May read board state, the currently active presentation-safe question, safe media, public scores, and revealed results. It cannot see unrevealed answers, future questions, fallback inventory, Machine Memory internals, evidence notes, or selection traces.

### Host / Controller

May create/start a game, prepare it, select/activate a slot for the active team, reveal, record outcomes, void a broken slot, advance/pause/end, and restore authoritative state. Accepted-answer guidance appears only after the allowed reveal stage unless a future host mode explicitly requires otherwise.

### Authenticated Account Client

May manage its own games, saved categories, future custom-category requests, privacy actions, and non-creepy Machine Memory summaries. Account ownership alone does not grant canonical editorial access.

### Internal / Admin

May seed/import, manufacture, review, validate, quarantine, retire, restore, and inspect canonical content and evidence through audited domain actions. These are capabilities, not necessarily separate physical applications.

## 3. API Surface Map

| Contract group | Primary responsibility | Typical caller |
|---|---|---|
| Game Setup | Capture teams, categories, locale, mode | Account/host |
| Game Preparation | Normalize request and assemble package | Host/background |
| Board / Runtime | Read authoritative playable state | Host/display |
| Question Lifecycle Runtime | Activate, reveal, void | Host |
| Outcome Recording | Resolve served slot and scoring | Host |
| Game Completion | Complete, abandon, resume | Host/account |
| Machine Memory | Safe summary/privacy actions | Account/internal |
| Custom Categories | Submit, clarify, inspect, retire | Account/internal |
| Question Bank / Assembly | Retrieve and rank candidates | Internal Engine |
| Editorial / Admin | Govern canonical content | Admin/developer |
| Health / Diagnostics | Read operational status | Internal operations |

## 4. Identity Contracts

Use stable opaque `account_id`, `group_id`, `team_id`, `game_id`, `game_package_id`, `game_slot_id`, `category_id`, `fact_id`, `question_id`, `variant_id`, and `custom_category_id`. IDs are strings at the contract boundary unless a future platform convention says otherwise. Display names, slugs, array positions, category order, and difficulty values are not identifiers. Clients must not mint canonical IDs except through an explicitly authorized creation contract.

## 5. Contract Versioning

Use `contract_version` at major envelopes, persisted package handoffs, events, and long-lived integration boundaries. Do not add it to every tiny nested value. Additive optional fields preserve compatibility; removed, renamed, or semantically repurposed fields require an explicit breaking version and coordinated migration.

## 6. Create Game Request

```text
CreateGameRequest {
  account_id
  group_id_optional
  teams[] { team_id_optional, display_name }
  language
  region
  selected_category_ids[]
  custom_category_refs_optional[]
  game_mode
  accessibility_preferences_optional
  idempotency_key
}

CreateGameResult {
  game_id
  status: draft | awaiting_preparation
  preparation_required
  state_version
}
```

The Engine validates ownership, team uniqueness, category count/readiness, language/region, mode rules, and entitlements. It creates intent, not inventory, and returns no questions.

## 7. Start Preparation

```text
PrepareGame {
  game_id
  idempotency_key
  expected_state_version_optional
}

GamePreparationStatus {
  game_id
  package_id_optional
  state
  progress_stage_optional
  failure_code_optional
  retryable_optional
  state_version
}
```

This operation normalizes the GameRequest, loads Machine Memory, checks custom-category readiness, invokes Game Assembly, validates the GamePackage, and makes a valid package ready. It may complete synchronously or later; the contract does not prescribe polling or jobs.

## 8. Preparation Progress

Player-safe stages are `initializing`, `checking_memory`, `resolving_categories`, `building_custom_categories`, `selecting_questions`, `preparing_media`, `validating_package`, `ready`, and `failed`. They are coarse truth mappings, not a fabricated progress percentage. Never expose provider names, prompts, model calls, raw retrieval queries, or internal exception text.

## 9. Get Game Ready State

Return `game_id`, readiness, package status/expiry when relevant, safe category views, difficulty availability, teams, language, game mode, and `state_version`. It may include a safe preparation failure with permitted actions. It contains no question text, answer, future media clue, variant ID, fallback, or assembly trace.

## 10. Board State Contract

```text
BoardState {
  game_id
  active_team_id
  categories[] {
    category_id
    display_name
    difficulties[] { level: 100 | 200 | 300, status }
  }
  game_status
  teams[]: TeamView
  active_slot_summary_optional
  state_version
}
```

Difficulty status is `available`, `selected`, `used`, or `disabled`. Important status must not rely on color. Shared responses omit question/fact/variant IDs unless a concrete client need later outweighs enumeration risk.

## 11. Select Category

```text
SelectCategory {
  game_id
  category_id
  acting_team_id
  idempotency_key
  expected_state_version_optional
}
```

The Engine verifies the active team and available category, then returns the selected category, valid difficulty choices, runtime state, and new version. This is an optional UX state supporting scan → discuss → select; it does not reveal or consume a question. Activation may combine selection and difficulty in one operation.

## 12. Select Difficulty / Activate Slot

```text
ActivateSlot {
  game_id
  category_id
  difficulty: 100 | 200 | 300
  team_id
  idempotency_key
  expected_state_version_optional
}
```

The rotary dial’s center press invokes this intent. The Engine validates turn, category, unused difficulty, ready/unexpired package, slot eligibility, and absence of another active slot. It locks and serves the prepared slot, creates exposure internally, increments state, and returns `ActiveQuestionView`. It does not generate content live.

## 13. Active Question Player Payload

```text
ActiveQuestionView {
  game_id
  slot_id
  category { category_id, display_name }
  difficulty
  question_text
  format
  media_optional { safe_ref, type, alt_or_caption_optional }
  presentation_metadata { language, direction, accessibility_optional }
  state: active
  served_at
  state_version
}
```

It excludes the canonical/display answer, accepted answers, future IDs, fallback details, evidence, FactRecord data, quality/difficulty reasoning, selection reasons, and hidden metadata.

## 14. Host Active Question Payload

Before reveal, the host receives the same safe question plus control permissions and state—not the answer by default. After a valid reveal it may receive:

```text
HostAnswerView {
  slot_id
  answer_display
  accepted_answers_optional[]
  explanation_optional
  attribution_optional
  state: revealed
  permitted_actions[]
  state_version
}
```

If a future host mode needs pre-reveal adjudication data, it requires a separate privileged capability and must never flow to the shared display.

## 15. Reveal Answer

```text
RevealAnswer {
  game_id
  slot_id
  idempotency_key
  expected_state_version_optional
}
```

Only the active slot may transition from `active` to `revealed`. The result contains `HostAnswerView` and a presentation-safe revealed view for the display. Reveal is idempotent and does not mark correctness or change score.

## 16. Record Outcome

```text
RecordOutcome {
  game_id
  slot_id
  team_id
  outcome: correct | incorrect | skipped | voided | disputed
  response_time_optional
  host_override_optional { applied, reason_optional }
  disputed_optional { raised, note_optional }
  technical_failure_optional { code }
  idempotency_key
  expected_state_version_optional
}
```

The Engine validates reveal/state and binds the event to the **actual served** fact, question, and variant stored on the slot. The caller cannot submit `fact_id`, a score total, or replacement content.

## 17. Outcome Response

Return slot completion, outcome, score delta and authoritative totals when the game mode scores, next/active team, updated board availability, permitted next actions, game completion state, and `state_version`. Do not return calibration changes, Machine Memory features, private review flags, or provider data.

## 18. Exposure Contract

Exposure creation is internal. Serving `ActiveQuestionView` is the authoritative trigger, preferably in the same transactional boundary as slot activation. No player or frontend contract accepts “mark fact X as seen.” A served but unanswered or abandoned question remains exposed; an unserved prepared slot does not.

## 19. Fallback Activation

Fallback activation is normally internal. When the selected presentation is unavailable or invalid, the Engine chooses the prepared, qualified fallback according to package policy, records the reason and actual canonical identities, and returns only the safe replacement `ActiveQuestionView`. It does not disclose the rejected primary or remaining fallback inventory.

## 20. Void Broken Slot

```text
VoidSlot {
  game_id
  slot_id
  reason: presentation_failure | content_dispute | host_error | other
  note_optional
  idempotency_key
  expected_state_version_optional
}
```

The host reports the problem; the Engine decides whether to activate a prepared fallback, mark the slot voided, adjust scoring, and continue. The client cannot name a fallback. If content was already shown, its exposure remains.

## 21. Complete Game

```text
CompleteGame { game_id, idempotency_key, expected_state_version_optional }
```

The Engine validates terminal conditions or an allowed early completion, finalizes status and summary, and triggers/queues recomputable post-game projections. Return final TeamViews, counts of resolved/voided slots, completion time, completion status, and state version—not raw Machine Memory internals.

## 22. Abandon Game

```text
AbandonGame { game_id, reason_optional, idempotency_key, expected_state_version_optional }
```

The Engine makes the session terminal, preserves already served exposures/outcomes, and does not expose or count hidden package content. A repeated request returns the same terminal result. Resume is unavailable unless product policy explicitly supports recovery from that reason.

## 23. Resume Game

```text
ResumeGame { game_id, expected_state_version_optional }
```

If resumable, return the authoritative GameState appropriate to the caller’s capability. Never rebuild state from local client assumptions. If an active question was already served, return that same safe presentation without creating another exposure.

## 24. Game State Read

`ReadGameState` restores teams, scores, active team, selected/used slots, category/difficulty availability, active question stage, game status, permitted actions, timestamps, and `state_version`. The host view may include post-reveal adjudication data; the shared view may not. Reads never advance state.

## 25. Machine Memory Read Contract

```text
MachineMemorySummary {
  games_remembered
  facts_seen
  recently_played_categories[]
  saved_custom_categories[]
  category_strength_summary_optional[]
  as_of
}
```

This optional account/group view is approximate, friendly, and non-diagnostic. It excludes raw exposure histories, inferred traits, entity penalties, internal confidence, individual performance unless explicitly supported, and selection controls.

## 26. Machine Memory Write Boundary

There is no generic `UpdateMachineMemory(payload)`. Trusted Engine events—question served, outcome recorded, game completed—and explicit privacy actions are the only write inputs. Preferences may be separate declared settings, but callers cannot edit repetition exclusions, strengths, or difficulty estimates directly.

## 27. Reset Memory

```text
ResetMachineMemory {
  account_id
  scope
  group_id_optional
  confirmation_or_reauth_optional
  idempotency_key
}
```

Future scopes may include personalization projection, recent cooldown, group profile, or full account memory subject to privacy policy. Exact retention/anonymization effects, reversibility, and entitlements are deliberately deferred; the result must state what was reset and what durable legal/operational records remain.

## 28. Custom Category Submission

```text
CreateCustomCategoryRequest {
  account_id
  input_text
  language
  region_optional
  persistence_preference_optional: temporary | saved
  idempotency_key
}
```

The Engine treats user text as untrusted scope data, never system instructions. It screens safety, normalizes scope, assesses viability and entitlements, then starts upstream manufacturing if needed.

## 29. Custom Category Response

```text
CustomCategoryStatus {
  custom_category_id
  display_name
  normalized_scope_summary_optional
  state: submitted | needs_clarification | preparing | ready | failed | retired
  viability_optional
  preparation_stage_optional
  failure_reason_optional
  reusable
  updated_at
}
```

Provider calls, prompts, retrieval details, and unpublished inventory remain hidden.

## 30. Custom Category Clarification

When ambiguity materially affects scope, return `needs_clarification` with one concise question, a stable `clarification_id`, and safe structured options where possible. A follow-up `ResolveCustomCategoryClarification` supplies the chosen value and idempotency key. Limit rounds; ordinary category requests must not become chatbot conversations.

## 31. Custom Category Read

Return owned category ID, native display name, normalized description, status, ready state, last-used time, saved/reusable status, and safe failure/clarification state. Do not expose its KnowledgeNodes, FactRecords, sources, candidate inventory, prompts, or private manufacturing traces to ordinary clients.

## 32. Saved Custom Category List

An authenticated account may list its saved category summaries with modest pagination if necessary. Ownership and readiness are authoritative. Entitlement/capability decisions are supplied separately; payment-provider objects do not enter this payload.

## 33. Custom Category Delete / Retire

`RemoveSavedCustomCategory` removes or retires the account’s ownership/reference after authorization. It does not automatically delete globally reusable categories, canonical facts, evidence, prior GamePackages, exposures, or outcomes. Privacy deletion follows its own policy; active games retain stable snapshots.

## 34. Question Bank Internal Query Contract

```text
QuestionBankQuery {
  category_ids[]
  difficulty
  language
  region_optional
  lifecycle_states[]
  exclude_fact_ids[]
  exclude_question_ids_optional[]
  knowledge_node_preferences_optional[]
  entity_penalties_optional[]
  format_constraints_optional
  limit
}
```

It returns compact eligible candidate descriptors with canonical IDs, eligibility, difficulty confidence, format, and ranking features—not complete database graphs. This is an internal Engine boundary. Question Bank filters; Game Assembly makes the globally coherent selection.

## 35. Game Assembly Internal Contract

```text
AssembleGamePackage {
  resolved_game_request
  machine_memory_context
  inventory_context
  assembly_policy_version
  idempotency_key
}

AssemblyResult {
  package
  selection_trace
  warnings[]
  integrity_result
}
```

The package contains prepared primaries/fallbacks and snapshots. `selection_trace` and warnings are internal diagnostics and never player DTOs. Only an integrity-valid package becomes ready.

## 36. Machine Memory Internal Contract

```text
MachineMemoryContext {
  excluded_fact_ids[]
  recent_fact_ids[]
  recent_entity_ids[]
  recent_topic_ids[]
  category_strengths[]
  effective_difficulty_context_optional
  confidence
  as_of
  policy_version
}
```

This recomputable assembly input combines account, group, and session layers with explicit confidence. Shared and host clients cannot read or supply it.

## 37. Difficulty Internal Contract

```text
GetDifficultyContext {
  question_ids[]
  language
  region
  group_context_optional
}
```

Return intended, predicted, calibrated, and effective level metadata with confidence/version as available. MVP may read stored 100/200/300 assessments only. Game Assembly consumes the result; clients receive the selected public value, not calibration features.

## 38. Knowledge / Foundry Internal Contracts

Upstream boundaries include `RequestInventoryReplenishment`, `ManufactureFacts`, `ManufactureQuestions`, and `RevalidateFact`. Each accepts scoped, validated demand plus correlation/idempotency metadata and produces staged results or events. They are internal/admin/background capabilities, never live player operations, and cannot bypass evidence, duplicate, answer-lock, quality, or lifecycle gates.

## 39. Media Internal Contract

```text
ResolveMediaUsage {
  question_variant_id
  region
  accessibility_requirements
  intended_difficulty
}
```

Return qualified safe usage, rights/availability expiry, presentation metadata, and an approved fallback reference—or a typed rejection. Resolution happens during preparation. Runtime may health-check and activate a prepared fallback but must not search for arbitrary media live.

## 40. Player vs Internal DTO Separation

Never serialize storage/domain entities directly. A database Question may contain `fact_id`, validations, evidence, scores, lifecycle, notes, accepted answers, and selection features. `ActiveQuestionView` contains only playable wording, public difficulty, safe media, and presentation metadata. Use distinct input/output models even if fields initially overlap; deny-by-default mapping prevents accidental future leakage.

## 41. Authorization Model

- **Account owner:** create/manage owned games, groups, saved custom categories, and privacy actions.
- **Host:** mutate only the authorized active game through allowed state transitions.
- **Shared/player view:** read-only presentation capability for one game.
- **Admin/editor:** audited canonical-content actions within assigned roles.
- **Internal worker:** narrowly scoped assembly/manufacturing/event capabilities.

Authorization is checked server-side on every operation and resource, independent of client UI. This document does not choose an identity provider.

## 42. Host Token / Session Auth Concept

When host/controller and shared display are separate, issue distinct capabilities: a host credential that can mutate one game and a display credential that can read presentation-safe state only. Credentials should be scoped, expirable, revocable, and unguessable. Joining/display codes may exchange for capabilities but are not perpetual authorization. UI hiding is never security.

## 43. Idempotency

Create game, prepare, activate, reveal, record outcome, void, complete/abandon, and custom-category submission accept an idempotency key. Same authorized actor + operation scope + key + same normalized intent returns the original semantic result. Reusing the key with different intent returns `IDEMPOTENCY_CONFLICT`. Keys have a documented retention window long enough for realistic retries.

## 44. Optimistic Concurrency

Runtime mutations may carry `expected_state_version`. The Engine atomically checks it before transition and returns the incremented version. Stale callers receive current safe state or `STALE_CLIENT_STATE`; they do not overwrite it. Database constraints/state guards remain authoritative even when clients omit the optional version.

## 45. Error Model

```text
EngineError {
  code
  category
  retryable
  user_safe_message
  correlation_id_optional
  current_state_version_optional
  permitted_actions_optional[]
  details_internal_only
}
```

Public serialization omits `details_internal_only`, stack traces, source queries, secrets, and provider responses. The same semantic error shape should survive transport choices.

## 46. Error Categories

Use `validation`, `authorization`, `conflict`, `inventory`, `runtime_state`, `dependency`, `media`, `custom_category`, and `internal`. Category guides client behavior; stable code identifies the precise condition. Do not encode transport status numbers into domain meaning.

## 47. Common Error Codes

```text
GAME_NOT_READY
GAME_ALREADY_COMPLETED
INVALID_TURN
CATEGORY_NOT_AVAILABLE
DIFFICULTY_ALREADY_USED
SLOT_ALREADY_ACTIVE
SLOT_ALREADY_COMPLETED
PACKAGE_INVALID
PACKAGE_EXPIRED
INVENTORY_INSUFFICIENT
QUESTION_UNAVAILABLE
MEDIA_FALLBACK_REQUIRED
CUSTOM_CATEGORY_NOT_READY
CUSTOM_CATEGORY_UNSUPPORTED
STALE_CLIENT_STATE
UNAUTHORIZED
IDEMPOTENCY_CONFLICT
```

Names may adapt to a future repository convention, but meanings must not silently change.

## 48. Retryable vs Non-retryable

Transient internal/dependency failures, preparation still running, and temporary media checks may be retryable with bounded backoff or a status refresh. Invalid turn, used slot, unsupported scope, permission denial, malformed request, terminal game, and idempotency conflict are non-retryable until intent/state changes. Responses may include a safe retry time; clients must not loop blindly.

## 49. User-safe Error Language

Product-facing messages may use restrained Machine language: `MACHINE STILL PREPARING`, `SLOT ALREADY USED`, `CATEGORY NOT READY`, or `MACHINE COULDN'T VERIFY ENOUGH QUESTIONS`. Codes remain stable and localized UI copy may vary. Technical causes and correlation data stay in internal logs.

## 50. Pagination

Admin searches, audit histories, saved-category lists, and long game histories may use bounded pagination with stable ordering and opaque cursors or the future project convention. Board/game/active-question reads are complete small documents and normally unpaginated. Never paginate a single runtime state across inconsistent snapshots.

## 51. Filtering

Internal/admin question search may filter by category, difficulty, lifecycle, language, evidence state, fact ID, entity, KnowledgeNode, custom category, freshness, format, and quarantine status. Public clients receive only product-approved filters. Filters must map to explicit semantics rather than arbitrary SQL-like expressions.

## 52. Admin Content Contracts

Future audited actions include `CreateFact`, `ReviseFact`, `AttachEvidence`, `RecordValidation`, `CreateQuestion`, `AuthorVariant`, `SetDifficulty`, `ApproveQuestion`, `QuarantineQuestion`, `RetireQuestion`, `RestoreQuestion`, and `InspectUsage`. Each validates role, current lifecycle, invariants, reason, and version. There is no generic endpoint to patch arbitrary canonical columns.

## 53. Seed Import Contract

```text
ImportSeedBundle {
  seed_revision
  contract_version
  categories[]
  facts[]
  evidence[]
  questions[]
  variants[]
  answers[]
  validate_only_optional
  idempotency_key
}
```

An internal developer tool validates identity, references, duplicates, evidence, lifecycle, and Arabic/English fields before atomic activation. It reports per-record rejection/conflict; it is not public and does not silently delete absent records.

## 54. Editorial Approval Contract

```text
ApproveQuestion {
  question_id
  reviewer_id
  expected_content_version
  reason_optional
  idempotency_key
}
```

The Engine verifies evidence, validation, answer lock, variant readiness, difficulty, and allowed lifecycle transition, then records an audit action. The client cannot set `lifecycle_state = active` directly.

## 55. Quarantine Contract

```text
QuarantineQuestion {
  question_id
  reason_code
  notes_optional
  actor_id
  expected_content_version_optional
  idempotency_key
}
```

The Engine immediately excludes it from new packages, audits the reason, and evaluates prepared/active packages using invalidation and fallback policy. Existing historical snapshots remain readable.

## 56. Revalidate Fact Contract

```text
RevalidateFact {
  fact_id
  reason
  priority_optional
  actor_or_worker_id
  idempotency_key
}
```

This internal/admin action schedules or performs the established evidence workflow and returns status, not an unverified truth edit. Dependent questions remain governed by current eligibility until the revalidation transition completes.

## 57. Event / Notification Contracts

Useful internal events include `GameReady`, `QuestionServed`, `AnswerRevealed`, `OutcomeRecorded`, `GameCompleted`, `CustomCategoryReady`, `QuestionQuarantined`, and `MediaInvalidated`. Envelopes carry event ID/type/version, occurred time, aggregate ID, correlation/causation IDs, and minimal payload. Delivery may be synchronous or asynchronous; this does not require event sourcing, and consumers must tolerate duplicate delivery.

## 58. Live Updates

Host/display synchronization may use polling, server push, WebSockets, or subscriptions. Regardless of transport, updates represent authoritative game state or state changes tagged with `state_version`. On gaps, reconnects, or out-of-order delivery, clients read the canonical GameState. No transport is selected here.

## 59. Active Question Security

Return only the active question to the shared client. Never preload the GamePackage, answer set, hidden media, or fallback list into browser code, HTML, caches, or predictable URLs. Assume players can inspect network traffic and application state. Sensitive response caching is disabled or tightly scoped by the future transport layer.

## 60. Future Question Security

Future question text, formats, media source names, filenames, answer aliases, Fact IDs, and fallback questions remain server-side until activation. Board state exposes only availability. Debug/admin payloads must never share the player delivery channel.

## 61. Media Payload Security

Return short-lived or otherwise safe opaque media references plus presentation metadata. Strip answer-bearing filenames, URLs, EXIF, tags, captions, source titles, audio/video metadata, and storage keys. The media service enforces rights/region and capability; obscurity of a URL is not authorization.

## 62. Arabic / English Contracts

Language is explicit using supported tags such as `ar` and `en`. A player payload normally contains one native QuestionVariant and display answer; it does not return both languages unless a product mode requests them. Canonical category/fact/question identities remain language-independent, so exposure crosses variants.

## 63. RTL Metadata

Presentation metadata may include `direction: rtl | ltr`, or clients may derive it from language using a shared localization rule. The Engine owns content language, not visual layout. Arabic-specific layout logic belongs in the UI and must support mixed-script names correctly.

## 64. Region

Region is contextual input for eligibility, cultural relevance, effective difficulty, localization, and media rights. It never changes Fact truth or creates a second Fact identity. Responses expose region only where needed for transparency or presentation, not internal regional scoring.

## 65. Custom Category Language

Arabic custom-category input is accepted and preserved internally exactly as entered alongside safe normalized scope. Public responses provide a native display name/description without forcing an English pivot. Clarification remains in the requested language where possible; canonical reused facts keep shared identity.

## 66. Timestamps

Use unambiguous ISO-8601/RFC-3339-style timestamps with explicit UTC offsets in contract examples/serialization. Useful fields include `created_at`, `expires_at`, `served_at`, `revealed_at`, and `completed_at`. The frontend localizes display; durations use explicit units and are not inferred from locale.

## 67. Score Model Boundary

Question/fact contracts contain no scoring rules. Game-mode policy converts an allowed outcome into `score_delta` and authoritative team total. Clients never submit score totals. Voids, overrides, and disputes use domain actions so scoring and audit remain consistent.

## 68. Team Contract

```text
TeamView {
  team_id
  display_name
  score
  turn_state: active | waiting | completed
}
```

Teams belong to a game and need no participant accounts. Display names are validated presentation data, not identity or authorization.

## 69. Game State Version

Every successful runtime mutation increments a monotonic `state_version` for that game and returns it. Reads include the current version; live messages are ordered by it. This enables multi-device reconciliation and stale-write detection without making the version a global sequence or business timestamp.

## 70. Rate / Abuse Boundaries

Preparation, custom-category manufacturing, media work, import, and expensive admin searches may later enforce actor/account quotas, concurrency limits, and rate limits. Contracts leave room for capability denial, remaining allowance, and safe retry time. Abuse controls do not weaken idempotency or leak provider costs, and billing logic does not become core domain state.

## 71. Entitlement Context

A future entitlement boundary supplies resolved capabilities such as `custom_category_allowed`, `saved_category_allowed`, `media_feature_allowed`, and relevant limits. Guess Engine consumes that result, not checkout status, card data, Stripe objects, or plan-specific branching scattered across contracts. Entitlement failure is distinct from content viability failure.

## 72. Preparation Timeout / Cancel

A future `CancelGamePreparation { game_id, idempotency_key }` may request cancellation before a package becomes ready, especially during custom manufacturing. The Engine decides whether work is cancellable and preserves reusable validated inventory. MVP may omit this; timeout policy must distinguish still-running, safely failed, and ready-after-client-departure states.

## 73. Package Rebuild

If a package becomes invalid before play, an internal `RebuildGamePackage` may assemble a replacement from the original normalized request and current memory/inventory. It is idempotent, audited, and never exposes rejected contents. Do not offer a default “regenerate everything” button that encourages novelty brute force, answer fishing, or avoidable cost.

## 74. Regenerate / Refresh Semantics

If the product later offers **Refresh**, it means “assemble another approved GamePackage under current rules,” not “generate raw questions now.” Previously served facts remain in memory; refresh cannot bypass validation, duplication, exposure, entitlement, or package integrity rules.

## 75. API Observability

Significant mutations carry or produce correlation ID, action name, game/account IDs where appropriate, duration, result/error code, state version, and idempotency result. Internal traces connect preparation and assembly stages without exposing sensitive payloads to clients. Metrics must avoid raw answer/custom-input content unless explicitly secured and necessary.

## 76. Auditability

Admin/editorial mutations record actor, action, target, previous/new lifecycle or version, reason, timestamp, and correlation ID. Runtime actions record authorized host/session capability, game/slot, state version, idempotency key fingerprint, and actual served identities. Audit records are append-oriented and access-controlled.

## 77. Contract Testing

Future automated contract tests must prove:

- shared/display credentials cannot access unrevealed or future answers;
- repeated activation returns the same result without a second exposure;
- stale state versions cannot overwrite current state;
- duplicate outcome submission cannot double-score;
- fallback exposure/outcome use the actual served Fact;
- Arabic native variants round-trip correctly;
- exposure is created on serve, not package preparation;
- hidden slots never appear in board payloads;
- host and display capabilities differ server-side;
- errors never contain stack/provider/secrets.

## 78. Game Flow Integration Test

```text
CreateGame
→ PrepareGame
→ GameReady
→ ReadBoard
→ ActivateSlot
→ ActiveQuestionView
→ RevealAnswer
→ RecordOutcome
→ BoardUpdate
→ ...
→ CompleteGame
```

Assert state versions, authorization, snapshots, exposure timing, scoring, turn progression, and used-slot state at every step. No generation or retrieval endpoint appears in the live sequence.

## 79. Custom Category Flow Integration Test

```text
SubmitCustomCategory
→ CustomCategoryStatus
→ clarification if genuinely required
→ ready
→ CreateGame(custom_category_id)
→ PrepareGame
→ ordinary GamePackage/runtime flow
```

Once ready, runtime cannot tell or care whether the category began built-in or custom. Test ownership, native Arabic input, retry idempotency, failure safety, and cross-category Fact reuse.

## 80. Machine Memory Flow Test

```text
Question served
→ Exposure created internally
→ Outcome recorded
→ Game completed
→ New game prepared
→ same Fact suppressed across wording/category/language
```

Verify hidden prepared questions do not count, abandoned served questions do count, and the frontend has no memory-write operation.

## 81. Admin Flow Test

```text
Create Fact
→ attach evidence
→ validate
→ create Question
→ author Variants/answers
→ assess difficulty
→ approve
→ appears in Question Bank
```

Assert authorization, lifecycle guards, audit records, version conflicts, failed gate rejection, and absence from eligible inventory until approval. No UI action directly patches a row state.

## 82. Performance Principles

Board and active-question reads are small, bounded, and served from prepared state. Avoid giant nested canonical graphs, synchronous manufacturing, evidence retrieval, provider calls, or recalibration in runtime. Preparation/admin contracts may be heavier and asynchronous. Measure latency by semantic action; optimize projections without weakening authoritative transitions.

## 83. Cache Headers / Transport Details

This document does not specify HTTP cache headers. Conceptually, future-question and active-game payloads are sensitive and must not be broadly/shared cached; authoritative runtime reads require freshness; stable public category metadata may be cached. Any transport implementation must preserve authorization, invalidation, and no-answer-leakage rules.

## 84. Backward Compatibility

Prefer additive optional fields and tolerant readers so frontend and Engine can deploy independently. Never silently change a field’s units, nullability, identity meaning, enum semantics, or authorization. Breaking changes require a contract version or coordinated release with compatibility tests.

## 85. Deprecation

Mark a superseded contract/field deprecated, document replacement and deadline, observe remaining callers, migrate them, then remove intentionally in a breaking release. Security-sensitive exposure may require an accelerated coordinated removal. Do not retain permanent dead aliases or two competing state machines.

## 86. API Naming

Use the canonical vocabulary consistently: Fact, Question, Variant, Game, GamePackage/Package, GameSlot/Slot, Exposure, Outcome, Machine Memory, Custom Category, Question Bank, and Game Assembly. Operation names express intent (`ActivateSlot`, `RevealAnswer`) rather than database mechanics (`UpdateSlotRow`).

## 87. Full Worked Example: Start Game

```text
CreateGameRequest {
  account_id: "acct_7F3"
  teams: [{display_name: "Falcons"}, {display_name: "Stars"}]
  language: "en"
  region: "OM"
  selected_category_ids: ["cat_football", "cat_geography"]
  game_mode: "classic_100_200_300"
  idempotency_key: "idem_create_81"
}
→ { game_id: "game_A12", status: "awaiting_preparation",
    preparation_required: true, state_version: 1 }

PrepareGame {
  game_id: "game_A12"
  idempotency_key: "idem_prepare_81"
  expected_state_version: 1
}
→ { game_id: "game_A12", state: "preparing",
    progress_stage: "checking_memory", state_version: 2 }

GamePreparationStatus
→ { game_id: "game_A12", package_id: "pkg_K9",
    state: "ready", progress_stage: "ready", state_version: 3 }
```

No question, answer, provider, or selection trace is returned.

## 88. Full Worked Example: Rotary Dial

`BoardState` shows Football values 100, 200, and 300 as `available`. The host selects Football; the central dial turns to 200 with its tactile detent and the center press sends:

```text
ActivateSlot {
  game_id: "game_A12"
  category_id: "cat_football"
  difficulty: 200
  team_id: "team_falcons"
  idempotency_key: "idem_activate_14"
  expected_state_version: 4
}
```

The Engine validates version/turn, activates the prepared slot, records exposure, and returns one `ActiveQuestionView`. Board state now reports Football 200 as `selected`; after outcome it becomes `used`. The client never guesses availability or chooses a Question ID.

## 89. Full Worked Example: Arabic Question

For a game with `language: "ar"`, activation returns:

```text
ActiveQuestionView {
  slot_id: "slot_7"
  category: { category_id: "cat_football", display_name: "كرة القدم" }
  difficulty: 200
  question_text: "من سجّل هدف فوز إسبانيا في نهائي كأس العالم 2010؟"
  format: "text"
  presentation_metadata: { language: "ar", direction: "rtl" }
  state: "active"
}
```

After reveal, the authorized view returns `answer_display: "أندريس إنييستا"`. Storage records the same language-independent canonical Fact exposure as its English variant.

## 90. Full Worked Example: Network Retry

The host records `correct` with key `idem_outcome_22`; the response times out after the Engine commits. Retrying the identical intent/key returns the original completed result and current state version. It does not create another outcome, exposure, turn advancement, or score delta. Reusing that key with `incorrect` returns `IDEMPOTENCY_CONFLICT`.

## 91. Full Worked Example: Two Devices

Two authorized controllers read state version 9 and try to activate different values. The first commits, creating slot/exposure and version 10. The second fails its version/state guard with `STALE_CLIENT_STATE` or `SLOT_ALREADY_ACTIVE` plus safe current state. Only one slot is consumed; the second controller refreshes before another action.

## 92. Full Worked Example: Media Fallback

The selected image fails its runtime health check before presentation. The Engine atomically activates the package’s qualified text fallback and returns that fallback’s safe `ActiveQuestionView`; it does not reveal the image question. Exposure and later outcome point to the actual fallback Fact/Question/Variant, while internal telemetry records `media_unavailable` and the abandoned primary.

## 93. Full Worked Example: Custom Category

An account previously created `Nintendo GameCube`, now represented by `custom_category_id: "cc_gamecube"` and ready. `CreateGameRequest` references it alongside built-ins. Preparation resolves it into ordinary category slots; activation still uses `category_id + difficulty`, and active payloads have no custom-specific runtime shape. Manufacturing remains upstream.

## 94. Full Worked Example: Dispute

After reveal, the group challenges the accepted answer. The host sends `RecordOutcome` with `outcome: disputed` and a concise note or approved override. The Engine records the actual served identities, applies game-mode dispute scoring/continuation, flags trusted downstream review, and returns the next board state. It performs no live web lookup and does not let the host edit canonical truth.

## 95. API Invariants

1. Clients never write Fact truth directly.
2. Clients never create Exposure records directly.
3. Clients never choose fallback content.
4. Player views never receive future answers.
5. GamePackages remain internal until individual slots activate.
6. Every runtime mutation is authorized and state-validated.
7. Outcomes reference actual served content.
8. One idempotency key cannot double-apply a mutation.
9. Shared display is less privileged than host.
10. Administrative mutations are audited.
11. Custom categories use the same runtime contracts as built-ins.
12. Machine Memory changes only from trusted Engine events/privacy actions.
13. Arabic and English variants preserve one Fact identity.
14. Errors never leak provider details, secrets, or stacks.
15. Database records are not API DTOs.
16. Runtime never calls raw generation.
17. State transitions belong to the Engine.
18. Transport choice does not redefine domain semantics.
19. Game state is authoritative server-side.
20. The dial activates a prepared slot, not generation.
21. Serving a question creates exposure even without an outcome.
22. Preparing a hidden question does not create exposure.
23. Reveal and outcome are separate transitions.
24. Clients submit neither canonical IDs nor score totals when resolving outcomes.
25. Future media and fallbacks remain hidden.
26. A stale device cannot overwrite current game state.
27. Package integrity is proven before readiness.
28. Region affects context, not Fact identity.

## 96. MVP API Surface

MVP external/runtime contracts are: Create Game, Prepare Game, Read Preparation Status, Read Board/Game State, Activate Slot, Read Active Question, Reveal Answer, Record Outcome, Complete Game, Abandon Game, and Resume/Read Game. Internally it needs Question Bank Query, basic Machine Memory Context, Game Assembly, and validated seed import/developer content flow. Custom-category submission, rich admin editing, live push, resets, and provider-backed manufacturing are Phase 2 unless explicitly included in the MVP proof. Implement the smallest authorization split that still prevents answer leakage.

## 97. What This File Does Not Decide

This file deliberately defers REST vs RPC vs GraphQL, route paths, HTTP verbs/status mapping, WebSocket provider, API framework, schema/validation library, authentication provider, exact session/token representation, serialization format, pagination mechanism, rate-limit product, generated client tooling, billing integration, background-job transport, deployment topology, and provider SDKs. Those decisions must implement these semantics rather than redefine them.

## 98. Follow-up Document

The next implementation document should be `GUESSENGINE-PROVIDER-STRATEGY.md`. It should define mature external capabilities, adapter boundaries, what MVP genuinely needs, validation and fallback behavior, cost/latency/privacy limits, provider substitution, and why no provider becomes the architecture. It must reference these contracts and the storage design. It is not created during this task.

## 99. API Contract Doctrine

1. The database is not the API.
2. Clients express intent.
3. The Engine performs state transitions.
4. Answers are privileged data until reveal.
5. Future questions stay hidden.
6. Exposure happens because content was served, not because a client claimed it.
7. Outcomes record reality.
8. Idempotency makes nervous thumbs harmless.
9. Host and shared display are different trust levels.
10. Runtime contracts stay small.
11. Heavy intelligence stays upstream.
12. Custom categories become ordinary runtime categories.
13. Machine Memory is an Engine concern.
14. Provider details never leak through product contracts.
15. Arabic and English share canonical identity.
16. Game state is authoritative.
17. The dial selects a slot.
18. The slot already contains a question.
19. Once the Machine says GAME READY, gameplay should not need to think.
20. Let the API be boring so the game can be fun.
