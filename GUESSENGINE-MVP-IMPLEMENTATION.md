# Guess Engine MVP Implementation Specification

**Status:** First implementation-planning document  
**Product:** Guess Machine / مخ ماشين  
**Binding architecture:** `GUESSENGINE-1.md` through `GUESSENGINE-9.md`  
**Repository state at assessment:** Specification-only; no application stack exists yet  
**Implementation status:** Planning only; this document authorizes no code or infrastructure changes

## 0. Purpose

The nine foundational Guess Engine documents define the complete architectural destination. This document defines the first physical implementation slice: the smallest real, playable system that proves the essential loop without prematurely implementing every mature subsystem.

```text
Fact → Question → Question Bank → Game Assembly → GamePackage
→ Runtime → PlayerOutcome → Exposure → Machine Memory
→ Better future selection
```

The MVP does not need an automated Question Foundry. Humans may perform upstream discovery, verification, and editorial work temporarily, provided seeded content enters through the same canonical identities and eligibility rules future automation will use.

## 1. MVP Principles

1. Preserve architecture while minimizing infrastructure.
2. Build a vertical loop before broad subsystem sophistication.
3. One end-to-end path beats eight incomplete engines.
4. Logical engines are initially modules, not microservices.
5. Prefer deterministic and inspectable behavior.
6. Keep future external intelligence behind replaceable adapters.
7. Do not host large models locally.
8. Do not download giant knowledge datasets.
9. Add vector search only after measured need.
10. Avoid distributed systems, Kubernetes, service meshes, and heavyweight observability.
11. Every dependency solves a present requirement.
12. Prefer reversible decisions and easy rollback.
13. Keep development lightweight.
14. Runtime reliability matters more than automation theater.

## 2. Local Development Resource Constraint

> Guess Engine MVP development must remain lightweight on the developer machine.

Prohibited by default: local LLM hosting, multi-gigabyte model downloads, Wikipedia/local knowledge mirrors, giant vector indexes, Elasticsearch/OpenSearch, dedicated vector databases, Kafka, Kubernetes, service meshes, multi-node databases, monitoring fleets, and unnecessary Docker stacks.

Prefer one application, one application backend, one primary relational database when selected, ordinary filesystem tooling, small maintained libraries, and external adapters for expensive future intelligence. Knowledge Engine, Foundry, Difficulty, Memory, Media, and Assembly begin as cohesive modules within that application.

## 3. Existing Repository Assessment

The assessment on 2026-08-11 found a deliberate specification-only project. The root contains `AGENTS.md`, `UIX.md`, and `GUESSENGINE-1.md` through `GUESSENGINE-9.md`. There are no non-Markdown files or implementation directories.

| Area | Current state |
|---|---|
| Frontend framework | None selected or present |
| Backend framework | None selected or present |
| Database/persistence | None selected or present |
| Authentication | None present |
| Game/runtime code | None present |
| Category/question data | Defined semantically in specifications; no physical dataset |
| Current UI flow | Specified in `UIX.md`; not implemented |
| API structure | None present |
| Environment/config | None present; no `.env` or manifest |
| Tests | None present |
| Git | Not present and not required for this specification phase |

### Keep

- Engines 1–9 as binding architecture.
- `UIX.md` category visibility, shared 100/200/300 dial, tactile state machine, accessibility, and reset flow.
- Canonical terminology: FactRecord, QuestionRecord, QuestionVariant, Question Bank, GamePackage, Machine Memory.
- The no-live-generation boundary.

### Adapt

- Convert canonical conceptual objects into minimal physical types/storage after the storage design is approved.
- Translate the `UIX.md` dial/board states into runtime state contracts.
- Use Engine 9’s assembly pipeline as the first vertical service/module boundary.

### Replace Later

- No implementation shortcuts exist yet. Manual upstream seeding will later be supplemented—not replaced semantically—by Foundry/Knowledge automation.
- Simple editorial difficulty and fact-ID dedupe will later gain empirical calibration and semantic similarity.

### Avoid

- Inventing a framework before storage/API requirements are designed.
- A temporary flat “question + answer” schema.
- Direct UI-to-random-question selection.
- Live model calls, string-only repeat memory, language-duplicated facts, or a separate custom-category runtime.

## 4. MVP Product Capability

A user can start Guess Machine, define teams, choose built-in categories and Arabic/English, prepare a game, receive a complete GamePackage, scan all category cards, choose category and 100/200/300 through the shared dial, reveal an instantly prepared question, reveal its answer, record correct/incorrect/skipped/voided, finish the game, return later, and receive fewer repeated FactRecords.

## 5. MVP Subsystems

### Canonical Domain Layer

Implement minimal physical forms of CategoryDefinition, simple KnowledgeNode, FactRecord, SourceEvidence/verification metadata, QuestionRecord, QuestionVariant, AcceptedAnswerSet, DifficultyProfile, ExposureRecord, PlayerOutcome, MachineMemoryProfile projection, GameRequest, GameQuestionSlot, and GamePackage. Not every Engine 2 field is required initially; identity and semantics are.

### Runtime Capabilities

- Persistent eligible Question Bank.
- Deterministic Game Assembly.
- Runtime that consumes only GamePackage.
- Fact-level exposure memory.
- Correct/incorrect/skipped/voided outcomes.
- Explicit 100/200/300.
- Arabic/English variants under one fact identity.
- Lightweight validated developer seed flow.

## 6. Explicitly Deferred from MVP

Defer automated retrieval/Foundry, multi-provider source ranking, embeddings/vector database, sophisticated semantic similarity, statistical calibration, advanced cohorts/groups, autonomous custom categories, audio/video/reveal, rights automation, recommendation ML, complex job systems, large admin dashboards, distributed workers, and source-domain memory.

Every deferral retains a clear canonical extension point.

## 7. Manual Seeding Strategy

Seed high-quality specimen content through canonical contracts. Every seed includes FactRecord, evidence/provenance, QuestionRecord, Arabic and English QuestionVariants, AcceptedAnswerSet, editorial 100/200/300, category/node metadata, and eligible lifecycle state.

Humans temporarily perform discovery, verification, answer lock, writing, localization, difficulty assignment, and quality review. There is no temporary trivia schema.

## 8. Initial Specimen Dataset

Recommended initial scope: 4–6 categories, enough eligible questions and fallbacks for at least three complete non-repeating games in both target languages, all difficulty levels, and multiple nodes per category. Suggested categories: Football, Geography, Movies/TV, Music, Games, and Oman/GCC.

The exact count derives from the selected board shape. Inventory depth should test Assembly and returning-account suppression rather than chase a headline number.

## 9. Specimen Edge Cases

Fixtures should include two variants of one QuestionRecord; Arabic/English siblings; related but distinct facts; a deliberate same-fact duplicate candidate; exposed fact; quarantined question; stale current fact; ambiguous answer candidate; missing-language item; text fallback; and representative 100/200/300.

## 10. Physical Data Model Philosophy

Detailed persistence belongs in `GUESSENGINE-STORAGE-DESIGN.md`. MVP expectations are stable opaque IDs, retained provenance, separated variants, `fact_id` in exposure, explicit record references, auditable slots/packages, and outcome-to-served-slot linkage.

Prefer simple relational/queryable persistence. Avoid both a destructive giant JSON blob and premature normalization that obscures the core loop.

## 11. MVP Question Bank

Eligibility minimally requires valid fact, approved question and language variant, accepted answer, difficulty, and active lifecycle. Queries must filter category, difficulty, language, lifecycle, excluded fact IDs, and—when available—basic node/entity metadata. No vector database is required.

## 12. Basic Duplicate Prevention

Hard rules: one `fact_id` per GamePackage and suppression/penalty for recently exposed account fact IDs. Optionally add deterministic normalized fact fingerprint and obvious relation checks. Embedding similarity waits.

This proves “remember facts, not strings.”

## 13. Basic Machine Memory

Persist account, fact/question exposures, category history, difficulty outcomes, games played, and optionally recent entity/topic references. Primary behavior is recently seen FactRecord suppression; secondary behavior is a cautious ranking modifier from category/difficulty history.

Do not implement personality/preference modeling.

## 14. Machine Memory Cold Start

New accounts use canonical difficulty and diverse eligible bank stock with no setup. Returning accounts add exposure exclusions/penalties. Memory absence never prevents preparation.

## 15. Basic Difficulty

Store editorial 100/200/300, optional prediction confidence/notes, and collect outcomes. Implement the data path `difficulty → served slot → outcome → aggregate-ready storage`, not a complex calibration algorithm.

## 16. Basic Knowledge Map

Use a small hierarchy such as Football → World Cup, Clubs, Players, Managers, GCC Football. It must support category breadth and diversity testing without becoming a global knowledge graph.

## 17. Game Assembly MVP

1. Resolve GameRequest and slot requirements.
2. Load exposure exclusions.
3. Query eligible category/difficulty/language inventory.
4. remove duplicate fact IDs;
5. penalize/exclude recent exposure;
6. apply basic node/entity diversity;
7. choose a question and language variant;
8. assign approved fallback;
9. construct GamePackage;
10. validate completeness.

Use deterministic/simple ranking with reproducible diagnostics.

## 18. MVP Ranking Priorities

Order: hard eligibility; category; difficulty; language; unseen fact; unsaturated entity/topic; node diversity; trusted/quality state; fallback availability. A small weighted score plus deterministic tie-break is sufficient. Measure before tuning.

## 19. GamePackage MVP

Include package ID/version/time, teams, categories, slots, QuestionRecord/Variant and FactRecord references, presentation text, accepted/display answer, difficulty, slot status, and fallback ref. It contains enough resolved data to run the whole game without Foundry.

## 20. GamePackage Integrity

Before ready: every required slot and fallback resolved; no duplicate facts; eligible lifecycle; requested variant/answer/difficulty present. Failure returns a structured preparation error, never partial readiness.

## 21. Runtime MVP

Runtime exposes availability, active team, category/difficulty selection, prepared slot activation, question/answer display, outcome, used slot, score where needed, next turn, and completion. It performs no retrieval, generation, validation, or AI call.

## 22. Rotary Dial Integration

Preserve `UIX.md`: scan visible categories → select → wake shared dial → choose valid 100/200/300 → press → THUNK → prepared question → score → reset neutral. Runtime is authoritative for selected category, available/used difficulty, active team/slot, and completion.

## 23. Outcome and Exposure Writeback

Create ExposureRecord when the clue is actually shown, not when packaged/preloaded. On resolution create PlayerOutcome with fact/question/slot/game/account/category/difficulty/outcome/served time and relevant runtime context.

## 24. Post-game MVP

Finalize session, outcomes, exposures, basic performance projection if included, and Machine Memory. The next GameRequest must see newly exposed fact IDs. Advanced recommendations are not required.

## 25. Admin / Developer Content Flow

Use the lightest safe mechanism compatible with the future selected stack: version-controlled seed files plus a validated local import/seed command is the recommended starting point. A small internal admin UI can follow; do not build a CMS first.

## 26. Basic Validation Tooling

Seed/import validation checks IDs, FactRecord/QuestionRecord/Variant links, category/node, both required languages or declared availability, difficulty, answer set, lifecycle, evidence metadata, and duplicate canonical IDs. Malformed content fails before Question Bank activation.

## 27. MVP Source Evidence

Manual seeds retain source URL/reference, source type/tier, checked date, validation status, and reviewer/seed provenance where practical. MVP may not retrieve automatically, but it cannot be evidence-free.

## 28. Current Facts in MVP

Prefer stable historical facts. Any current-state item carries stability class, checked date, and expiry/revalidation requirement and becomes ineligible when expired.

## 29. Arabic and English MVP

One FactRecord supports sibling `ar` and `en` QuestionVariants. Store UTF-8, handle RTL in UI, and permit answers/aliases/transliterations in both scripts without duplicating truth.

## 30. Oman/GCC Coverage

Seed meaningful Oman/GCC nodes and facts from the first dataset so the runtime, language, evidence, and difficulty pathways prove regional-first capability rather than a generic US database.

## 31. Media MVP

Text-first is acceptable because no media runtime currently exists. If later initial UI/storage supports images cleanly, add only a few stable qualified images with provenance, leakage checks, and text fallback. Audio/video remain deferred.

## 32. Custom Category MVP Boundary

Do not require autonomous custom generation. Prove one developer-defined CustomCategoryDefinition with manually prepared canonical inventory flowing through normal Assembly/GamePackage/runtime. Automation attaches later without a separate runtime.

## 33. External AI Providers

Do not integrate providers merely to claim intelligence. First prove storage, bank, assembly, runtime, outcome, and exposure with verified seeds. This isolates product architecture from prompt/provider debugging.

## 34. MVP Implementation Milestones

### Milestone 0 — Repository and stack decision audit

Confirm requirements, choose the minimum coherent stack in later planning, and record architectural decisions. No major feature work.

### Milestone 1 — Canonical Core

Implement minimal types/storage and prove FactRecord → QuestionRecord → QuestionVariant.

### Milestone 2 — Seed Inventory

Load and validate representative bilingual verified specimens.

### Milestone 3 — Question Bank

Query eligible content by category/difficulty/language/lifecycle/exclusions.

### Milestone 4 — Game Assembly

Produce complete non-duplicate GamePackage with fallbacks.

### Milestone 5 — Runtime Integration

Connect package to board/dial and complete a game without generation.

### Milestone 6 — Outcome and Exposure

Persist PlayerOutcome and actual-served exposure.

### Milestone 7 — Machine Memory v1

Suppress recently seen facts in the next package.

### Milestone 8 — Basic Diversity and Ranking

Add deterministic node/entity set diversity and diagnostics.

### Milestone 9 — Lightweight Images, only if ready

Add a few qualified image fixtures with text fallbacks.

### Milestone 10 — Hardening

Failure paths, tests, accessibility, cleanup, documentation, and local performance.

## 35. Milestone Acceptance Criteria

Every milestone plan must name required behavior, automated/manual tests, created/migrated data, protected regressions, rollback boundary, and definition of done. Execute as separate controlled changes; never merge all milestones into one rewrite.

## 36. Git / Change Management

This folder is not currently a repository, which is valid. Before implementation, Git setup may be chosen explicitly. Once Git exists, use clean checkpoints, small logical commits, milestone commits, preserved user work, and reversible migrations. Git never substitutes for tests or architecture.

## 37. Dependency Policy

Prefer existing dependencies once a stack exists; justify every runtime addition; avoid heavyweight/duplicate/experimental packages; choose mainstream maintained libraries; document large additions and alternatives.

## 38. Storage Footprint Philosophy

Text, metadata, outcomes, and small fixtures should remain ordinary application scale. If MVP requires multi-gigabyte databases/assets, stop and reassess; that signals premature infrastructure.

## 39. Memory / CPU Footprint Philosophy

Development must run comfortably on a normal laptop without GPU, huge RAM, or local inference. Future expensive intelligence uses external adapters unless explicitly reconsidered.

## 40. Background Process Policy

Minimize always-on processes. Use straightforward request/storage flows for MVP. Introduce jobs only for demonstrated asynchronous manufacturing/revalidation/media workloads; do not install queue infrastructure in anticipation.

## 41. Observability MVP

Use structured logs, safe errors, correlation IDs, and simple development diagnostics/internal status. Defer Prometheus, Grafana, and distributed tracing while preserving future-compatible identifiers.

## 42. Error Handling MVP

Structured codes cover insufficient inventory, invalid/incomplete package, missing variant/answer/fallback, duplicate fact, stale question, invalid outcome, and persistence failure. Player messages use Machine-friendly safe language and never leak stack traces.

## 43. Failure Tests

Test low inventory, duplicates, stale current item, missing Arabic variant, incomplete package, returning exposure, runtime retry/idempotency, invalid outcome, and absent fallback. Hard failures must never result in a fake ready package.

## 44. Performance Target Philosophy

Local GamePackage retrieval and slot reveal should feel immediate; normal play never waits on intelligence/network generation; preparation is bounded; queries are simple. Measure actual behavior before optimizing or adding caches.

## 45. Security MVP

Preserve account isolation, untrusted input handling, secrets outside client/content, host/shared answer separation, safe environment-variable use, no arbitrary execution, and validated seed imports. Detailed security follows later.

## 46. Testing Strategy

- **Unit:** canonical validation, duplicate exclusion, package integrity, exposure, ranking helpers.
- **Integration:** GameRequest→GamePackage, runtime→outcome, outcome→Memory.
- **Fixture:** bilingual/edge-case specimen seeds.
- **End-to-end:** one complete board game and returning-account follow-up.

Use existing test tooling once a stack is selected; do not build a testing platform.

## 47. Golden End-to-end Test

A returning account chooses Football, Movies, Oman Geography, and Games. The system loads exposure, builds a bilingual-ready 100/200/300 package with no repeated facts, serves the selected dial slot instantly, records outcome/exposure, and the next assembled game suppresses that FactRecord. Passing this proves the core Engine loop.

## 48. Architecture Compatibility Check

For every simplification ask whether full architecture can extend it without changing canonical identity: manual seeds→Foundry; editorial difficulty→calibration; fact-ID suppression→semantic dedupe; text/images→Media Engine; account→group memory. If not, revise the shortcut.

## 49. MVP Non-goals

The MVP does not prove infinite scale, perfect semantic dedupe/sourcing/calibration, every media format, arbitrary autonomous custom categories, human-equivalent editorial automation, or global personalization sophistication. It proves architectural correctness and playable value.

## 50. Definition of Engine MVP Done

MVP is complete when persistent canonical facts/questions and bilingual variants exist; Question Bank and complete GamePackage work; same fact cannot repeat in-package; returning accounts avoid recent facts; 100/200/300 and board/dial runtime work without generation; outcomes/exposures persist and affect the next game; diversity and safe errors exist; tests prove the loop; and development remains lightweight.

## 51. After MVP

Only after the loop stabilizes add automated Foundry, retrieval/verification, calibration, richer Memory, autonomous Custom Engine, Media Engine, semantic dedupe, and adaptive replenishment in measured increments.

## 52. Required Follow-up Implementation Documents

Create later, separately:

1. `GUESSENGINE-STORAGE-DESIGN.md`
2. `GUESSENGINE-API-CONTRACTS.md`
3. `GUESSENGINE-PROVIDER-STRATEGY.md`
4. `GUESSENGINE-OPERATING-CONSTRAINTS.md`
5. `GUESSENGINE-TEST-PLAN.md`
6. `GUESSENGINE-IMPLEMENTATION-PLAN.md`
7. `GUESSENGINE-CODEX-HANDOFF.md`
8. `GUESSENGINE-README.md`

The recommended next document is Storage Design because no physical stack or persistence exists and GamePackage/exposure semantics depend on it. None are created here.

## 53. MVP Implementation Doctrine

1. Build the core loop first.
2. Preserve canonical identity.
3. Seed manually before automating recklessly.
4. Fact IDs deliver the first repeat-prevention win.
5. Question Bank before Foundry automation.
6. GamePackage before live intelligence.
7. Runtime should be boring and reliable.
8. External intelligence stays outside live play.
9. One application is enough until proven otherwise.
10. One database is enough until proven otherwise.
11. No giant local models or corpora.
12. No vector database without demonstrated need.
13. No microservices without demonstrated need.
14. No Kubernetes.
15. No architecture cosplay.
16. Keep the laptop cool.
17. Make rollback easy.
18. Measure before optimizing.
19. Simple correct architecture beats sophisticated wrong architecture.
20. The first milestone is not “AI generates trivia.”
21. The first milestone is “the Machine reliably serves the right prepared question.”
22. Build the smallest version that goes **THUNK**.

