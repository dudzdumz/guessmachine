# Guess Engine Implementation Plan

## 0. Purpose

This seventh implementation-planning document converts:

```text
Foundational Architecture
+ MVP Scope
+ Storage
+ API Contracts
+ Provider Strategy
+ Operating Constraints
+ Test Plan
```

into:

```text
Milestone 0 → Milestone 1 → ... → Engine MVP
→ Foundry Automation → Custom Categories → Rich Media
```

It is a construction sequence, not new architecture. It binds future work to small coherent deliverables, gates, rollback boundaries, and explicit deferrals.

> Codex should not “implement Guess Engine.” Codex should implement the next approved milestone.

## 1. Implementation Philosophy

1. Deliver vertical slices before broad infrastructure.
2. Leave the repository working after every milestone.
3. Give every milestone proportionate automated/manual proof.
4. Preserve a clear rollback boundary.
5. Add infrastructure only after proven requirements.
6. Treat manual reviewed seeds as valid early architecture.
7. Build runtime before autonomous manufacturing.
8. Build Question Bank before automating Foundry.
9. Establish Fact identity before embeddings.
10. Deliver Machine Memory v1 before advanced personalization.
11. Prove custom-category runtime compatibility before automation.
12. Introduce images before audio/video.
13. Integrate one provider capability at a time.
14. Do not begin the next milestone while the current gate fails.
15. Stop on architectural surprises instead of bulldozing through them.

## 2. Implementation Phases

| Phase | Milestones | Outcome |
|---|---:|---|
| A — Core Engine Spine | 0–4 | Audited stack, canonical storage, trusted seed inventory, Question Bank |
| B — Prepared Gameplay | 5–8 | Persisted packages, deterministic Assembly, secure runtime, tactile UI integration |
| C — Memory and Feedback | 9–10 | Trustworthy exposure/outcome history and Fact-level repeat suppression |
| D — Engine Hardening | 11–13 | Diversity, fallbacks/resilience, tested Engine MVP |
| E — Upstream Automation | 14–23 | Provider-isolated Foundry, acquisition, replenishment, cautious calibration/memory v2 |
| F — Flagship Expansion | 24–28 | Ordinary custom runtime plus bounded manufacturing and continuity |
| G — Media Expansion | 29–34 | Qualified images, then optional audio/video/multi-asset formats |

Engine MVP ends at Milestone 13. Mature phases are not prerequisites for a valuable prepared trivia machine.

## 3. Milestone Execution Rule

For every milestone, Codex must: inspect repository and Git status **if Git exists**; read governing specs; identify reusable code; state scoped plan; implement only approved milestone; add/run required tests; diagnose/fix milestone regressions; review changed files; report changes/tests/deferred/deviations/resources; and commit/checkpoint only when explicitly requested or the established workflow requires it. Absence of Git never blocks work or authorizes initialization.

Every milestone below inherits this required record:

- **Objective and governing specifications**
- **Prerequisites and likely affected areas**
- **Required behavior and tests**
- **Definition of done / gate**
- **Explicit non-goals**
- **Rollback boundary**
- **Stop conditions** from Section 58 and milestone-specific surprises
- **Unlocks**: what becomes safe/possible next

## 4. Pre-milestone Repository Audit

Before Milestone 1, factually document frontend, backend, persistence, authentication, game flow, category/question models, API conventions, tests/build scripts/package manager, UI/dial work, runtime commands, deployment hints, Git state, and uncommitted user work. Classify components as reuse/adapt/migrate/avoid. The current snapshot is Markdown-only and non-Git, but Milestone 0 must re-audit because implementation may begin in a changed repository. Audit informs sequencing; it does not redesign product doctrine.

## 5. Milestone 0 — Implementation Readiness Audit

- **Objective / governing specs:** establish factual starting point under all planning docs, especially MVP Sections 2–3/34 and Operating Constraints.
- **Prerequisites / areas:** approved start; inspect root/instructions, code, commands, environment names (never values), tests, data, UI, and Git if present. Likely output is a concise project-local implementation-readiness report only if requested/useful.
- **Behavior / tests:** run existing non-destructive build/test/start diagnostics when possible; record exact failures and stack decision gaps. Do not refactor.
- **Done / gate:** current app can build/run/test, or existing blockers and exact next decision are documented; reuse/adaptation boundaries are clear.
- **Non-goals:** no code architecture, dependencies, Git initialization, cleanup, providers, or data conversion.
- **Rollback / stop:** read-only except approved report; stop for missing major stack choice, destructive prerequisite, or operating-constraint boundary.
- **Unlocks:** a reliable Milestone 1 file/migration/test plan grounded in reality.

## 6. Milestone 1 — Canonical Core Storage

- **Objective / governing specs:** implement minimum Category → Fact → Question → Variant → AcceptedAnswer plus difficulty/lifecycle spine under GE2, MVP, Storage 3–18/43–55, Operating Constraints, and Test Plan 8–24.
- **Prerequisites / areas:** Milestone 0 gate and chosen existing/minimal backend/database/migration/test conventions. Likely domain models, relational schema/migrations, repositories/queries, seed contracts, and focused tests.
- **Behavior / tests:** stable opaque IDs; relations/FKs/uniqueness; UTF-8 Arabic/English originals and derived normalization; 100/200/300; lifecycle/timestamps. Prove one Fact with one Question, Arabic and English Variants, reviewed answers, and difficulty round-trips.
- **Done / gate:** canonical identity/storage/normalization/lifecycle tests pass through real persistence.
- **Non-goals:** evidence graph breadth, Assembly/runtime, memory, providers, Foundry, custom generation, embeddings.
- **Rollback / stop:** one reversible migration/application slice; stop if another datastore, destructive reset of non-disposable data, framework replacement, or unclear canonical identity is required.
- **Unlocks:** provenance support and reviewable seed inventory.

## 7. Milestone 2 — Trust / Knowledge Support

- **Objective / governing specs:** make seeded knowledge future-Foundry-compatible using GE2–4, Storage 7–13/18/45, and Test Plan 11–16.
- **Prerequisites / areas:** M1 passes. Add SourceEvidence, Validation history/status, KnowledgeNode, Entity/Alias, and Fact membership/relation structures using current data layer.
- **Behavior / tests:** a seeded Fact links category/node/entities, inspectable provenance, validation state, freshness/as-of; eligibility depends on required validation; history persists. Relational structure only.
- **Done / gate:** verified Fact is eligible; stale/rejected/unvalidated equivalents are not; joins/history tests pass.
- **Non-goals:** automated search/fetch, graph DB, source crawling, rich admin UI, provider validation.
- **Rollback / stop:** additive migration/module; stop on graph/search infrastructure proposal or ambiguous source/Fact ownership.
- **Unlocks:** trustworthy canonical specimen inventory.

## 8. Milestone 3 — Seed Inventory

- **Objective / governing specs:** create enough high-quality manual inventory for multiple complete games under MVP 7–9/27–31, Storage 41–45, Test Plan 4–7, and regional/language doctrines.
- **Prerequisites / areas:** M2 schema/import contract. Likely small seed files/import command and review documentation/tests following selected stack.
- **Behavior / tests:** reviewable/idempotent/non-destructive import; stable IDs; Football, Movies/TV, Music, Games, Geography, Oman/GCC; all values; selected bilingual graphs; special edge cases; real evidence/validation. Dry-run/conflict reporting.
- **Done / gate:** repeated import is stable and Question Bank-size queries show enough eligible stock to assemble agreed fixture games.
- **Non-goals:** autonomous generation, huge dataset, media archive, exhaustive content launch inventory.
- **Rollback / stop:** seed-owned additions can be retired/reverted without deleting durable work; stop on licensing/evidence uncertainty or mass generated content.
- **Unlocks:** application-level Question Bank and deterministic Assembly work.

## 9. Milestone 4 — Question Bank

- **Objective / governing specs:** implement internal storage-neutral candidate boundary under GE1/2/9, API 34, Storage indexes/eligibility, and Test Plan 23–28.
- **Prerequisites / areas:** M3 eligible inventory. Likely domain/application query service, persistence query adapter, candidate DTO, and tests.
- **Behavior / tests:** filter category/difficulty/language/lifecycle/currentness/validation and exclude Fact IDs plus optional Question/node/entity context; return compact eligible descriptors deterministically. No vectors/search cluster.
- **Done / gate:** eligibility/exclusion/language/difficulty/cross-category tests pass and a future Assembler needs no table knowledge.
- **Non-goals:** global ranking, package persistence, memory projections, full-text/vector infrastructure, public CRUD.
- **Rollback / stop:** isolated query boundary; stop if raw database entities leak or correct queries require new database class.
- **Unlocks:** GamePackage model and Assembly consumption.

## 10. Milestone 5 — Game / Package Storage

- **Objective / governing specs:** represent Game, GamePackage, GameQuestionSlot, snapshots, states, expiry, and prepared fallback references under GE2/9, Storage 20–24/39–53, and Test Plan 31–37/86–89.
- **Prerequisites / areas:** M4 candidate contract. Add domain/state models, relational migrations, transactional persistence, integrity validators, tests.
- **Behavior / tests:** package preparing→ready only when complete; unique primary Facts; exact served presentation snapshot fields; canonical/live references; fallbacks; no exposure on preparation.
- **Done / gate:** complete package persists/reads; uniqueness/completeness/snapshot/partial-failure transaction tests pass.
- **Non-goals:** selection algorithm, player API/UI, outcomes/memory, providers.
- **Rollback / stop:** additive package tables/migration removable before use; stop on partial-ready semantics, destructive cascade, or package sent client-side.
- **Unlocks:** deterministic Assembly V1.

## 11. Milestone 6 — Game Assembly V1

- **Objective / governing specs:** turn normalized GameRequest into ready package under GE9, MVP 17–20, API 35–37, and Test Plan 25/30–34/60–64.
- **Prerequisites / areas:** M4–5. Add small deterministic Assembly application service/policy and tests.
- **Behavior / tests:** enforce category, 100/200/300, language, lifecycle/validation, unique Fact, basic node/entity diversity, fallback, integrity, and explicit insufficient-inventory failure. No ML/provider calls.
- **Done / gate:** seeded requests reliably produce reproducible complete packages; duplicate/difficulty/language/failure/diversity tests pass.
- **Non-goals:** advanced optimization, empirical difficulty, Memory history, custom manufacture, media discovery.
- **Rollback / stop:** manual selection/import remains possible; stop if Assembly needs external intelligence, distributed coordination, or weakened hard constraints.
- **Unlocks:** secure runtime/application contracts independent of frontend.

## 12. Milestone 7 — Runtime API / Application Contracts

- **Objective / governing specs:** implement minimal Create/Prepare/ReadBoard/Activate/Reveal/Outcome/Complete/Abandon/Resume semantics under API Contracts, GE9 runtime state, Storage transactions, and Test Plan 29–53/83–88.
- **Prerequisites / areas:** M6 package proof and existing transport/auth pattern from M0. Add application handlers/DTOs/auth capabilities/idempotency/state-version persistence and contract tests.
- **Behavior / tests:** host vs display authority; no future answers/full package; active prepared slot only; server-authoritative score/turn; structured safe errors; idempotent/concurrent transitions.
- **Done / gate:** a contract-level simulated full game succeeds and security/idempotency/state/transaction tests pass.
- **Non-goals:** UI redesign, provider calls, public admin surface, advanced live transport, memory sophistication.
- **Rollback / stop:** preserve Assembly/package service callable without transport; stop on answer leakage, frontend-held truth, auth provider overhaul, or live generation.
- **Unlocks:** existing UI can play the Engine.

## 13. Milestone 8 — Existing UI Integration

- **Objective / governing specs:** connect runtime to `UIX.md`, GE9 rotary boundary, API safe views, and Operating Constraints UI preservation.
- **Prerequisites / areas:** M7 and working existing frontend identified in M0. Touch only necessary state/data adapters and focused components/styles/tests.
- **Behavior / tests:** all categories visible; category selection; central 100/200/300 dial/detents/press; used indicators; active team; question/reveal/outcome; mechanical reset; keyboard/tap/reduced-motion/audio alternatives; no generation call.
- **Done / gate:** scan → select → rotate → THUNK → prepared question → reveal/outcome → reset completes a full seeded game; manual shared-screen test passes.
- **Non-goals:** framework migration, carousel, dashboard redesign, rich media, broad visual rewrite.
- **Rollback / stop:** old presentation path remains recoverable behind integration seam; stop if intentional UI identity must be erased or full package/answers would enter browser.
- **Unlocks:** first playable target.

## 14. Milestone 9 — Outcomes and Exposures

- **Objective / governing specs:** make actual served history trustworthy under GE2/6/9, Storage 24–29/52, API 16–18, and Test Plan 44–48/86–88.
- **Prerequisites / areas:** M7–8 active slot lifecycle. Add exposure/outcome persistence, transactional application logic/events/projections as minimal.
- **Behavior / tests:** exposure on actual presentation—not package/preload; unanswered remains exposed; outcome binds actual fallback/primary; idempotent score/outcome; abandonment correct.
- **Done / gate:** a played game leaves internally consistent served history; unanswered/retry/fallback/abandon tests pass.
- **Non-goals:** calibration, inferred profiles, analytics warehouse, arbitrary memory-edit API.
- **Rollback / stop:** runtime can still play but milestone is not accepted until history is correct; stop on client-supplied Fact truth or split transactions.
- **Unlocks:** Machine Memory v1 and trustworthy future performance data.

## 15. Milestone 10 — Machine Memory V1

- **Objective / governing specs:** truthfully deliver “The Machine remembers what you’ve played” under GE6, MVP 13–14, Storage 25–29, API 25–26/36, Test Plan 54–59/100–101.
- **Prerequisites / areas:** M9 durable exposure. Add recent/lifetime Fact exclusion query/context, Assembly integration, games/category summary if cheap.
- **Behavior / tests:** Game 2 suppresses Fact A across Question/Variant/language/category for account/group scope; cold/degraded defaults; no personality profiling. Hard within-package and configured recent exclusion remain distinct.
- **Done / gate:** golden cross-game/cross-language/cross-category tests pass and stored exposure drives selection.
- **Non-goals:** category strengths, effective difficulty, decay sophistication, recommendations, embeddings.
- **Rollback / stop:** disable Memory projection and use canonical Assembly defaults without corrupting exposure; stop if memory requires sending profiles/providers or changes board values.
- **Unlocks:** first genuine “Machine” target and memory-driven diversity.

## 16. Milestone 11 — Basic Diversity

- **Objective / governing specs:** improve package rhythm using GE9 ranking/diversity, GE6 saturation, and Test Plan 60–64.
- **Prerequisites / areas:** M10 eligible candidates/context. Add deterministic inspectable scoring/tie-break policy and selection trace.
- **Behavior / tests:** penalize entity/node/topic/recent concentration and balance format when available while preserving hard category/difficulty/language/Fact rules. Seeded tests remain reproducible.
- **Done / gate:** Messi/World Cup-heavy fixtures select materially varied valid packages and explain relaxations.
- **Non-goals:** ML recommendation, perfect fairness, embeddings, personalized board labels.
- **Rollback / stop:** revert to M6 deterministic baseline; stop if diversity weakens hard constraints or becomes opaque.
- **Unlocks:** stronger game composition before resilience hardening.

## 17. Milestone 12 — Fallback / Resilience Hardening

- **Objective / governing specs:** make prepared gameplay survive bad content/media/dependencies under GE8/9, API 19–20, Storage 23/50–53, Test Plan 33–37/50/73/102–103.
- **Prerequisites / areas:** M5 fallback data plus live runtime. Add invalidation/activation policy, transaction handling, health/degraded seams, resume fixes.
- **Behavior / tests:** same/different-Fact fallback reality; package invalidation/rebuild-before-play; provider outage after ready; interrupted resume; no raw generation; correct exposures/outcomes.
- **Done / gate:** one broken primary cannot kill game and all fallback/provider-outage golden tests pass.
- **Non-goals:** live search, complex chaos platform, rich media discovery, distributed failover.
- **Rollback / stop:** text/known-valid seeded package remains base; stop if recovery fabricates content or loses audit truth.
- **Unlocks:** MVP hardening/release gate.

## 18. Milestone 13 — Engine MVP Hardening

- **Objective / governing specs:** close Phase A–D acceptance using MVP Definition, Operating Constraints gates, and complete Test Plan.
- **Prerequisites / areas:** M1–12 feature-complete. Touch defects/tests/docs only; profile current queries/resources and conduct manual game night.
- **Behavior / tests:** run critical unit/storage/migration/API/security/integration, five golden tests, Arabic UTF-8/human review, resource/startup smoke, and full dial game. Fix correctness, state, repeats, leakage, language, fallback, and usability bugs.
- **Done / gate:** Section 19 and Test Plan 106 pass with documented limitations and sane laptop footprint.
- **Non-goals:** provider automation, new features, custom manufacture, calibration, rich media.
- **Rollback / stop:** retain last passing milestone; stop release for any hard invariant/security/data failure or unexplained resource growth.
- **Unlocks:** Engine MVP review and only then Phase E.

## 19. Engine MVP Definition of Done

Canonical Facts, Questions/Variants, Arabic/English, evidence/validation, Question Bank, deterministic Assembly, stored GamePackages/snapshots, secure prepared runtime, preserved grid/dial UI, outcomes/exposures, Fact-level Machine Memory, fallbacks, idempotency/concurrency, and tests all work locally. Active gameplay has no intelligence-provider dependency or live generation; one relational database/few processes remain laptop-friendly. At this point Guess Engine is a real product runtime even without autonomous content manufacturing.

## 20. MVP Review Gate

Before Phase E, review architecture adherence, schema/migration/index quality, canonical identity, API answer/security boundary, performance/resource/startup, developer ergonomics, tests/fixtures, content/import/editorial workflow, backup/recovery concept, and known debt. Fix unstable foundations now; do not automate upstream complexity onto incorrect identity, leaky runtime, or brittle storage.

## 21. Phase E — Upstream Automation Principle

Automation replaces manual upstream labor one stage at a time while emitting identical canonical outputs:

```text
find Fact → verify → lock answer → write Question → assess → approve → Question Bank
```

Runtime, player APIs, package semantics, and trust gates do not change. Every external output is candidate data; provider failure delays manufacturing rather than game night.

## 22. Milestone 14 — Provider Adapter Foundation

- **Objective / governing specs:** establish one provider-neutral Reasoning capability under Provider Strategy, API internal boundaries, Operating Constraints, Test Plan 69–76.
- **Prerequisites / areas:** MVP review passes and a dated provider evaluation/explicit configuration exists. Add capability DTO/port, fake adapter, centralized routing/config, one real adapter only when authorized/configured, usage/error normalization.
- **Behavior / tests:** provider types stay at edge; malformed/timeout/quota/redaction/switch tests; default startup/tests make zero paid calls.
- **Done / gate:** fake and configured real smoke can satisfy same normalized contract; canonical domain unchanged.
- **Non-goals:** retrieval, broad agent, multiple vendors, live runtime calls, prompt sprawl.
- **Rollback / stop:** fake/manual pipeline remains; disable adapter cleanly. Stop for paid activation, giant SDK/dependency, secret exposure, or vendor-domain coupling.
- **Unlocks:** safe assisted question writing.

## 23. Milestone 15 — Question Writing Assistance

- **Objective / governing specs:** automate only candidate Variant writing under GE3, Provider 30–35/95, and Test Plan answer-lock/provider tests.
- **Prerequisites / areas:** M14 plus verified manual Facts/answer locks. Add versioned prompt/task implementation, candidate DTO/persistence or review flow, validation tests.
- **Behavior / tests:** locked Fact/answer + language/intent/difficulty constraints → candidate Arabic/English wording/answer aliases; cannot change truth or publish; provider output schema/size checked.
- **Done / gate:** reviewed candidates meet contract and switching/failure leaves existing Question Bank unaffected.
- **Non-goals:** fact discovery/evidence, autonomous approval, custom categories, live generation.
- **Rollback / stop:** manual authoring remains fully usable; stop on answer-lock violation, poor Arabic quality, or provider output becoming evidence.
- **Unlocks:** repeatable quality pipeline.

## 24. Milestone 16 — Question Quality Pipeline

- **Objective / governing specs:** implement bounded Foundry checks from GE3/5, Provider 34–35, and Test Plan lifecycle/quality requirements.
- **Prerequisites / areas:** M15 candidates. Add deterministic ambiguity/leakage/answer/language/difficulty/duplicate checks, optional independent review adapter, lifecycle/audit.
- **Behavior / tests:** reject/rewrite boundedly; no self-certification; only evidence-linked locked candidates promote after required review.
- **Done / gate:** curated good/bad Arabic/English fixtures yield expected lifecycle and no unreviewed publication.
- **Non-goals:** full acquisition, endless rewrite agent, calibration ML, admin CMS.
- **Rollback / stop:** manual reviewed promotion remains; stop if quality gate is opaque, unbounded, or weakens evidence.
- **Unlocks:** acquisition adapters can feed trustworthy Fact candidates separately.

## 25. Milestone 17 — Search / Fetch Adapters

- **Objective / governing specs:** introduce acquisition capabilities under GE4, Provider 14–24/43–49/96, Operating network/scraping limits, Test Plan 69/72/74–75.
- **Prerequisites / areas:** provider evaluation/approval for needed capability. Add Search/Fetch DTOs, fakes, centralized adapters/routing, safe fetch restrictions/cache metadata.
- **Behavior / tests:** normalize query/results/pages/status; snippets not evidence; timeouts/rate/budget/circuit behavior; Arabic/Oman/GCC evaluation; targeted only.
- **Done / gate:** fakes and bounded configured smoke discover/fetch inspectable sources without domain/vendor leakage.
- **Non-goals:** crawler, Fact promotion, current web at runtime, multiple providers by default.
- **Rollback / stop:** manual evidence import remains; stop on uncontrolled network, terms/security issue, or paid/cloud surprise.
- **Unlocks:** evidence-backed FactCandidate pipeline.

## 26. Milestone 18 — Fact Candidate / Verification Pipeline

- **Objective / governing specs:** automate KnowledgeNode → discovery → fetch → evidence → validation → Fact under GE3–4, Storage evidence/currentness, Provider trust rules, Test Plan 13–15/71–72.
- **Prerequisites / areas:** M17 plus canonical M2. Add candidate/stage orchestration, provenance, entity normalization, contradiction/freshness gates, bounded retries/idempotency.
- **Behavior / tests:** models assist but are not evidence; authoritative inspected sources; current as-of/expiry; duplicate check before promotion; unsupported claims reject/defer.
- **Done / gate:** a known-node flow creates a verified canonical Fact with evidence without manual row creation, and rejection examples remain unpromoted.
- **Non-goals:** Question writing coupling, broad custom scope, crawling, derived aggregate complexity.
- **Rollback / stop:** manual Fact/evidence flow remains; stop on truth-policy ambiguity, source injection, or unbounded acquisition.
- **Unlocks:** end-to-end Foundry from verified Facts.

## 27. Milestone 19 — Question Foundry V1

- **Objective / governing specs:** connect ManufacturingDemand → verified Fact → answer lock → draft → difficulty/quality → Question Bank under GE3 convergence and provider rules.
- **Prerequisites / areas:** M16 and M18 separately proven. Add bounded orchestrator/stage state, inventory insertion, observability/cost/audit, tests.
- **Behavior / tests:** idempotent staged pipeline, retries without duplicate canonical output, explicit failures, human review path, no autonomous monolith.
- **Done / gate:** one built-in demand produces approved eligible Question/Variants through normal gates; full trace and cost/yield visible.
- **Non-goals:** custom categories, continuous generation, live provider calls, embeddings, massive inventory.
- **Rollback / stop:** disable Foundry and retain seed bank/runtime; stop on stage-boundary collapse or automatic publication below quality.
- **Unlocks:** demand-driven replenishment.

## 28. Milestone 20 — Inventory Replenishment

- **Objective / governing specs:** create bounded stock awareness under GE3/6/9 and Provider cost/cache policy.
- **Prerequisites / areas:** M19 and measurable inventory views. Add thresholds/demand records, explicit trigger/schedule, deduped jobs, budgets, admin visibility/tests.
- **Behavior / tests:** detect e.g. Football/300/ar eligible stock gap; request exact coverage; reuse knowledge; stop at target; no continuous overgeneration.
- **Done / gate:** a low-stock fixture produces one bounded demand and eligible replenishment without duplicates/runaway work.
- **Non-goals:** global autonomous scraping, predictive scale infrastructure, queue fleet.
- **Rollback / stop:** manual seed/Foundry invocation remains; stop on background-process/queue or cost explosion.
- **Unlocks:** sustainable built-in inventory and first “Infinite” path when combined with Memory.

## 29. Milestone 21 — Difficulty Data Collection Review

- **Objective / governing specs:** validate outcome telemetry before calibration under GE5, Storage performance, Test Plan 44/58/79.
- **Prerequisites / areas:** sufficient real/controlled M9 outcomes. Audit inclusion, language/region/version, repeat exposure, response-time quality, skips/disputes/overrides/technical failures.
- **Behavior / tests:** define trustworthy cohorts and exclusion reasons; repair collection defects first; produce analysis/report/projection tests rather than calibration.
- **Done / gate:** data lineage/sample/quality is explainable and broken media/disputes do not masquerade as difficulty.
- **Non-goals:** adaptive ML, automatic relabeling, invented sample size, personality inference.
- **Rollback / stop:** no player-facing change; stop if observations are sparse/biased/unreliable.
- **Unlocks:** conservative calibration V1 when evidence exists.

## 30. Milestone 22 — Difficulty Calibration V1

- **Objective / governing specs:** add simple inspectable calibration under GE5 and Test Plan difficulty/fairness rules.
- **Prerequisites / areas:** M21 gate with sufficient data. Add versioned aggregate/projection, confidence/sample thresholds, Assembly effective context, admin diagnostics/tests.
- **Behavior / tests:** blend stored prior with correctness and permitted signals conservatively; exclude broken/disputed/repeat-biased events; never rewrite Fact truth or old snapshots.
- **Done / gate:** known fixtures promote/demote only at thresholds with rationale/version and baseline fallback.
- **Non-goals:** opaque ML, player labels beyond 100/200/300, individual psychometrics, rapid oscillation.
- **Rollback / stop:** disable projection and use stored difficulty; stop on fairness/privacy/unstable-data concerns.
- **Unlocks:** measured effective challenge and Memory V2 hints.

## 31. Milestone 23 — Machine Memory V2

- **Objective / governing specs:** enrich useful non-creepy assembly context under GE6, Difficulty GE5, Storage projections, API privacy, Test Plan memory/fairness.
- **Prerequisites / areas:** stable M10 memory plus reviewed M21/optional M22 data. Add recomputable category strength, difficulty history, entity/topic recency/saturation, confidence/version.
- **Behavior / tests:** hard Fact exclusions stay authoritative; soft ranking/effective hints degrade independently; account/group layers remain scoped; summaries minimize inference.
- **Done / gate:** returning-group fixtures change selection sensibly without changing board values or exposing profiles; reset/failure behavior works as implemented.
- **Non-goals:** personality/demographic profiling, filter bubble, per-player accounts requirement, opaque recommender.
- **Rollback / stop:** recompute/disable V2 and retain M10 Fact memory; stop on privacy/fairness or provider sharing.
- **Unlocks:** richer assembly inputs and custom continuity.

## 32. Phase F — Custom Category Principle

Automatic custom categories begin only after Foundry, retrieval, evidence, and quality gates are independently reliable. They compose the existing pipeline rather than creating a privileged prompt-to-question path. User input defines untrusted scope; approved inventory enters ordinary Question Bank/GamePackage/runtime contracts.

## 33. Milestone 24 — Custom Category Domain / Runtime Proof

- **Objective / governing specs:** prove custom equals ordinary at package/runtime under GE7, Storage 19, API 28–33/65, Test Plan 65–68/104.
- **Prerequisites / areas:** Engine MVP; add CustomCategoryDefinition/ownership/membership/readiness storage and minimal account contracts if absent, plus manually seeded inventory.
- **Behavior / tests:** authorized setup references ready custom ID; canonical Fact reuse; standard Assembly/dial/outcome/memory; removal affects ownership, not global truth/history.
- **Done / gate:** Nintendo GameCube golden test passes with no custom runtime branch/provider.
- **Non-goals:** scope interpretation, automatic map/retrieval, payments, public marketplace.
- **Rollback / stop:** disable custom selection; built-ins unaffected. Stop on duplicated Facts or special client package.
- **Unlocks:** upstream custom manufacturing can target a proven domain/runtime object.

## 34. Milestone 25 — Custom Scope Interpretation

- **Objective / governing specs:** safely convert user text into normalized bounded scope under GE7, Provider privacy/security/routing, API clarification, Operating bounds, Test Plan 67–68.
- **Prerequisites / areas:** M14 evaluated reasoning/moderation route and M24 domain. Add safety screen, scope DTO/version, clarification, entity/time/region/domain resolution, budgets/tests.
- **Behavior / tests:** original Arabic/English preserved; text is data, not instruction; ambiguity returns concise clarification; unsupported/private/unsafe/oversized scopes fail safely; confidence explicit.
- **Done / gate:** representative broad/narrow/Arabic/GCC/injection fixtures normalize or fail as expected without tool/secret leakage.
- **Non-goals:** facts/questions, chat interface, arbitrary browsing, automatic readiness.
- **Rollback / stop:** manual custom definitions remain; stop on unsafe moderation/privacy or poor native-language scope quality.
- **Unlocks:** custom KnowledgeMap planning.

## 35. Milestone 26 — Custom Knowledge Map

- **Objective / governing specs:** turn normalized scope into relevant temporary/reusable map and capacity plan under GE7/4.
- **Prerequisites / areas:** M25 and M2 node/entity model. Add map branches, coverage/source landscape/capacity/viability state and tests.
- **Behavior / tests:** relevant non-overlapping branches, entity saturation plan, time/version/region bounds, difficulty capacity and source viability; no Question writing. Reuse canonical nodes/entities where valid.
- **Done / gate:** curated custom scopes produce reviewable viable maps or explicit too-narrow/source-poor failures.
- **Non-goals:** graph database, facts, providers beyond bounded planning, endless map expansion.
- **Rollback / stop:** retire draft map without affecting runtime; stop on unbounded branches or identity conflicts.
- **Unlocks:** bounded custom manufacturing demand.

## 36. Milestone 27 — Custom Category Manufacturing

- **Objective / governing specs:** compose scope → map → retrieval → verified Facts → Foundry → Question Bank → package under GE3/4/7 and all provider/quality constraints.
- **Prerequisites / areas:** M18–20 and M24–26 pass. Add custom orchestration/status/budgets/cancellation/idempotency/reuse and API progress mapping.
- **Behavior / tests:** same evidence/answer/difficulty/quality/lifecycle gates as built-ins; partial/limited/failure honest; no provider details; ready only with package-capable inventory.
- **Done / gate:** one source-rich custom category becomes playable end-to-end without bypass and survives provider failures safely.
- **Non-goals:** every imaginable scope, instant live manufacture, unlimited cost, monetization, media-first custom.
- **Rollback / stop:** disable new manufacturing; already approved/custom seeded inventory remains ordinary. Stop on quality, safety, runaway resource, or parallel truth path.
- **Unlocks:** flagship “Make Your Category” beta.

## 37. Milestone 28 — Custom Category Memory / Reuse

- **Objective / governing specs:** make saved second use materially better/cheaper under GE6/7, Provider caching/cost, Test Plan custom reuse.
- **Prerequisites / areas:** M27 plus exposures and saved ownership. Add map/inventory version reuse, gap/undercovered-branch demand, custom memory context/cost metrics/tests.
- **Behavior / tests:** reuse scope/map/entities/evidence/Facts/Questions; suppress prior Facts; fill only gaps/freshness; handle edits/versioning/account vs group scope.
- **Done / gate:** second-use fixture avoids repeats, broadens coverage, and uses fewer external calls/cost than first use.
- **Non-goals:** permanent exhaustive inventory, intrusive profiling, free-form regeneration button.
- **Rollback / stop:** revert to valid M27 preparation with M10 exclusions; stop on stale unsafe reuse or privacy boundary.
- **Unlocks:** premium continuity target.

## 38. Custom Category Product Gate

Before monetization or broad beta, humans test broad, narrow, Arabic, Oman/GCC, music, games, sports, current, source-poor, subjective, unsafe, and unsupported scopes across first/second use. Review truth, natural language, viability honesty, latency/cost, repeats, difficulty, failure/clarification, and ordinary runtime. Flagship positioning requires consistent trust—not one cherry-picked demo.

## 39. Phase G — Media Principle

Text Engine must already be trustworthy and playable. Add images first through qualified prepared assets and accessible text fallback; audio/video only when rights, delivery, leakage, and performance paths are clear. Media can enrich the Machine but cannot delay or destabilize its core.

## 40. Milestone 29 — Media Metadata / Image Asset Support

- **Objective / governing specs:** establish MediaAsset/QuestionMediaUsage, provenance/rights/technical qualification, delivery reference, accessibility and fallback under GE8, Storage 46, Provider media boundary, Test Plan 77–79.
- **Prerequisites / areas:** stable text runtime and a reviewed image source/delivery plan. Add metadata storage, qualification service/adapters, package snapshot/preflight, tests.
- **Behavior / tests:** region/license/attribution, hash, dimensions/type/availability, safe opaque reference, metadata leakage check, qualified text fallback.
- **Done / gate:** one approved image usage packages/serves safely and delivery failure uses fallback.
- **Non-goals:** bulk archive, audio/video, AI image generation, complex transforms, provider selection beyond need.
- **Rollback / stop:** disable image eligibility and retain text; stop on rights ambiguity, answer leakage, huge cache/dependency.
- **Unlocks:** basic image question formats.

## 41. Milestone 30 — Image Questions

- **Objective / governing specs:** enable qualified image identification/logo/badge/map/cover-poster where permitted under GE8.
- **Prerequisites / areas:** M29. Add image-format presentation DTO/UI, eligibility/difficulty/accessibility rules, seed/admin flow/tests.
- **Behavior / tests:** no answer-bearing metadata/text/crop; correct preload/fallback; region/rights; host/shared safe presentation; normal exposure/outcome.
- **Done / gate:** curated formats play through full game with leakage/fallback/manual UX proof.
- **Non-goals:** transformations/progressive reveal, broad scraping, audio/video, unlicensed assets.
- **Rollback / stop:** text-only selection remains complete; stop on layout/accessibility/rights failures.
- **Unlocks:** optional versioned image transforms.

## 42. Milestone 31 — Image Difficulty / Transforms

- **Objective / governing specs:** cautiously add crop, blur, silhouette/mask, or progressive reveal under GE5/8.
- **Prerequisites / areas:** reliable M30 and measurable use. Add non-destructive transform/version metadata, derived assets, calibration isolation, UI timing/tests.
- **Behavior / tests:** transform does not leak/distort identity unfairly; version-specific difficulty/performance; accessible fallback; bounded cache/CPU.
- **Done / gate:** one transform type is reproducible, qualified, calibrated separately, and fails to base/text safely.
- **Non-goals:** transform fleet, local generative models, GPU pipeline, arbitrary client manipulation.
- **Rollback / stop:** disable transformed usage and serve base/text; stop on resource/rights/fairness problem.
- **Unlocks:** richer image reveal rhythm and evidence for later media.

## 43. Milestone 32 — Audio

- **Objective / governing specs:** add permitted prepared audio questions under GE8 only with clear rights/provider/delivery path.
- **Prerequisites / areas:** stable media model/M31 optional and explicit rights decision. Add audio metadata/clip/cue/delivery/accessibility/fallback/UI/tests.
- **Behavior / tests:** licensed/allowed clip, bounded duration, stripped answer tags, captions/transcript leakage policy, volume/control, text alternative, versioned difficulty.
- **Done / gate:** curated audio question survives delivery failure and manual accessibility/game-night review.
- **Non-goals:** piracy, music-library mirror, speech model, live recognition, video.
- **Rollback / stop:** disable audio eligibility and use text/image; stop on rights, bandwidth, metadata, or accessibility ambiguity.
- **Unlocks:** controlled sound-based trivia.

## 44. Milestone 33 — Video

- **Objective / governing specs:** add qualified prepared video/embed/clip only after audio/media operations mature.
- **Prerequisites / areas:** M29 foundation, explicit rights/delivery choice, stable fallback. Add video usage metadata/UI/preload/health/leakage/tests.
- **Behavior / tests:** subtitles, titles, scoreboards, thumbnails, controls, territory, availability, accessibility, and bandwidth validated; snapshot/fallback correct.
- **Done / gate:** curated video completes full game and failures degrade safely.
- **Non-goals:** video hosting empire, scraping/downloading catalogs, live processing, local multimodal models.
- **Rollback / stop:** disable video and retain lower modalities; stop on rights/cost/network/resource issues.
- **Unlocks:** mature multimodal basis.

## 45. Milestone 34 — Multi-asset Formats

- **Objective / governing specs:** support connections, odd-one-out, timeline, and multi-image formats under GE8/5 only after stable single-asset semantics.
- **Prerequisites / areas:** M30+ reliability and specific product requirement. Extend intent/usage/package/UI/answer/difficulty/fallback contracts and tests per format.
- **Behavior / tests:** atomic asset readiness, ordering, combined leakage, one answer lock, accessible alternatives, snapshot, performance/calibration version.
- **Done / gate:** each introduced format independently passes quality/security/fallback/manual play before enabling next.
- **Non-goals:** simultaneous implementation of all formats, generic canvas engine, spectacle over trivia.
- **Rollback / stop:** feature flag each format and retain simpler questions; stop on ambiguous scoring/answer or package fragility.
- **Unlocks:** richer future game variety.

## 46. Provider Evaluation Timing

Run dated task-specific Reasoning evaluation immediately before M14–15, Search/Fetch evaluation before M17, and Media discovery/delivery evaluation before M29. Do not benchmark/procure capabilities years early. Use Provider Strategy criteria, Arabic/Oman/GCC sets, privacy/terms/cost, adapter fit, and a separate evaluation artifact when requested.

## 47. Storage Evolution Timing

Implement the minimum tables/columns/indexes for the current milestone; add later projections/media/provider trace/custom/calibration storage with their feature. A tiny forward-compatible field may be justified when migration cost is real and semantics settled, but speculative Phase 3 schema is not. Every evolution uses migration/backfill/test/recovery discipline.

## 48. API Evolution Timing

Implement only required MVP setup/runtime intents first. Add memory summaries/privacy actions, custom category, admin/editorial, provider/manufacturing, cancellation, media, and diagnostics as their callers/features arrive. Preserve transport-neutral semantics and additive compatibility; do not scaffold all conceptual endpoints on day one.

## 49. Background Job Timing

No job system through prepared runtime unless current stack already needs one. When Foundry/custom/revalidation work becomes asynchronous, prove actual queue semantics—durability, idempotency, cancellation, retries—then choose the smallest project-compatible mechanism. Runtime continues without it.

## 50. Cache Timing

Measure first. Start with relational queries and bounded process cache. Candidate queries, permitted retrieval results, or saved custom knowledge may later justify caching; only measured latency/cost/concurrency can justify dedicated infrastructure. Canonical truth never moves into cache.

## 51. Vector / Embedding Timing

Wait until canonical Fact identity, fingerprints, relational links, real exposure, and a meaningful duplicate corpus exist. Measure semantic duplicates escaping simpler checks, evaluate benefit/cost/Arabic quality, then add an optional rebuildable projection—never because “AI needs vectors.”

## 52. Observability Timing

Begin with test output, structured logs, IDs, safe errors, and milestone-specific counters. Add inventory/assembly/memory/provider/media metrics when an operational question exists. Only measured complexity may justify external observability tooling; do not install a fleet preemptively.

## 53. Admin Tooling Timing

Manual seed/import and narrowly scoped developer commands are sufficient early. Add admin review UI when Foundry creates candidate volume, disputes/quarantines/revalidation become frequent, or content operators need it. Build explicit domain actions, not a generic canonical-table CMS.

## 54. Data Migration Strategy

Every schema milestone includes forward migration, constraint/index changes, seed/import compatibility, bounded data backfill where necessary, migration tests, and rollback/forward-repair considerations. Use expand/backfill/switch/contract for shared production data. Never casually regenerate canonical IDs or call external providers inside migrations.

## 55. Feature Flags

Use lightweight flags/config matching the stack for provider Foundry, calibration, automated custom categories, and media formats when staged rollout/rollback needs them. Flags default safely, are tested both ways, have owner/removal condition, and never replace authorization or hide incomplete migrations. No flag platform required.

## 56. Rollback Strategy

Every advanced layer collapses to the last trusted one: provider-assisted writing → manual seeds; automated Foundry → existing Bank; custom manufacturing → built-ins/approved saved inventory; calibration → stored 100/200/300; Memory V2 → Fact suppression/defaults; rich media → image/text; media delivery → prepared text fallback. Schema rollback may use forward repair when destructive down-migration risks data. Rollback preserves canonical records/history.

## 57. Core Fallback Architecture

```text
Mature Engine
  ↓ automation unavailable
Existing approved Question Bank
  ↓ advanced Machine Memory unavailable
Canonical Assembly defaults + session uniqueness
  ↓ media unavailable
Prepared text fallback
  ↓
Still a valid prepared trivia game
```

The product degrades toward boring correctness, never raw generation or invented truth.

## 58. Stop Conditions During Implementation

Codex must stop and report before a milestone crosses Operating Constraints: heavyweight local model; multi-gigabyte download; new graph/vector/document/search database; Elasticsearch/OpenSearch; Kubernetes/service mesh; multiple new services; framework rewrite; destructive repo/schema operation; paid cloud/provider activation; third-party account creation; global system modification; major unrelated refactor; uncontrolled scraping; secret/rights/privacy risk; or unexplained disk/RAM/process growth. Gather evidence and propose the smallest compliant alternative.

## 59. Architectural Deviation Process

1. Identify the exact observed conflict.
2. Cite governing document and section.
3. Explain why compliant implementation is unreasonable/impossible.
4. List alternatives and recommend the smallest.
5. Preserve Fact identity, evidence, prepared runtime, answer security, and rollback.
6. Record scope/resource/data effects and reversibility.
7. Stop for user approval when architectural or externally consequential.

Never silently rewrite design in code or weaken a test to conceal divergence.

## 60. Milestone Report Format

```text
Milestone:
Status: complete | incomplete | blocked

Implemented:
- ...

Files changed:
- ...

Tests run / results:
- ...

Known limitations and deferred work:
- ...

Spec deviations:
- none | ...

Resource / infrastructure changes:
- none | ...

Rollback note:
- ...

Recommended next milestone:
- ...
```

Keep it concise, evidence-backed, and never claim completion while a gate fails.

## 61. No Multi-milestone Blast by Default

Do not execute Milestones 1–13—or any broad phase—in one uncontrolled run. Default cadence is one approved milestone, verification, report, then next instruction/approved continuation. Only tightly coupled small work may be grouped when the user explicitly allows it and every component retains its gate/rollback/report visibility.

## 62. When “Let It Rip” Becomes Safe

Broader milestone-by-milestone autonomy becomes reasonable only when foundational/implementation documents and final handoff exist, M0 audit/stack/commands are current, milestone scope/tests/stop rules are explicit, repository safety is understood, and the user approves execution cadence. It means continue through approved gates without reinventing architecture—not ignore approvals, failures, destructive boundaries, or external-cost constraints.

## 63. Implementation Document Precedence

When an actual conflict cannot be reconciled:

1. User’s explicit current instruction.
2. `GUESSENGINE-CODEX-HANDOFF.md` once created, for execution protocol only.
3. `GUESSENGINE-OPERATING-CONSTRAINTS.md`.
4. `GUESSENGINE-IMPLEMENTATION-PLAN.md`.
5. `GUESSENGINE-MVP-IMPLEMENTATION.md`.
6. `GUESSENGINE-STORAGE-DESIGN.md`.
7. `GUESSENGINE-API-CONTRACTS.md`.
8. `GUESSENGINE-PROVIDER-STRATEGY.md`.
9. `GUESSENGINE-TEST-PLAN.md`.
10. `GUESSENGINE-1.md` through `GUESSENGINE-9.md`.

Lower documents remain binding doctrine unless a higher document explicitly narrows timing/scope. Precedence cannot casually override Fact-first truth, stable canonical identity, evidence gates, Fact-level exposure, answer security, prepared/no-live-generation runtime, or the established tactile UI. Report genuine contradictions rather than selecting convenient text silently.

## 64. MVP vs Mature Architecture

| Area | MVP | Mature |
|---|---|---|
| Content | Reviewed manual seeds | Automated bounded Foundry/replenishment |
| Retrieval | Manually attached evidence | Search/fetch/structured acquisition pipeline |
| Difficulty | Stored 100/200/300 | Versioned calibrated/effective context |
| Memory | Fact-level recent suppression | Category/entity/topic/effective difficulty |
| Custom | Seeded domain/runtime proof | Interpreted, verified manufacturing + continuity |
| Media | Text, perhaps limited qualified images | Images/audio/video/multi-asset as justified |
| Deduplication | Fact ID/fingerprint/relations | Optional evaluated semantic projections |
| Providers | None required for runtime/core proof | Replaceable upstream adapters |
| Infrastructure | Lightweight modular monolith + one relational DB | Scale only from measured needs |

## 65. First Playable Target

After Milestone 8, a seeded Question Bank assembles and persists a complete GamePackage; the existing all-visible category grid and central dial activate prepared 100/200/300 slots; teams reveal/score and complete a game. This is independently valuable before durable memory and provides early product/runtime feedback.

## 66. First “Machine” Target

After Milestone 10, gameplay, exposures, and Fact-level exclusions work across games, wording, languages, and categories. The product is no longer merely serving a bank: it remembers what this account/group has played and assembles differently next time.

## 67. First “Infinite” Target

After Foundry V1, bounded replenishment, and Machine Memory, the Engine can manufacture verified approved inventory against real stock gaps while avoiding prior knowledge. This makes Infinite Questions technically meaningful beyond a large static catalog—without promising literal infinity or live generation.

## 68. First “Make Your Category” Target

After Milestone 27, a safe viable user scope becomes a KnowledgeMap, verified Facts, approved Questions, ordinary GamePackage, and normal runtime. This is the flagship beta threshold; it does not require every category to succeed.

## 69. First Premium Continuity Target

After Milestone 28, returning saved custom categories reuse their map/evidence/inventory, remember exposed Facts, target undercovered branches, and require less provider work. Continuity—rather than disposable regeneration—is the premium value.

## 70. Content Quality Gate

Do not publish Foundry output merely because stages execute. Review a representative sample by category, language, difficulty, source policy, and format for factual support, answer lock/uniqueness, ambiguity/leakage, wording/fun, duplicates, sensitivity, and lifecycle. Track approval/rejection/yield and fix root-stage problems before volume.

## 71. Arabic Quality Gate

Before public Arabic Engine, pass UTF-8 storage/import/query/snapshot/API round-trip, direction/mixed-script UI, Arabic normalization/aliases/transliteration, independent native wording, clue/ambiguity review, difficulty, and host accepted-answer usability. Arabic is not an English build plus machine translation.

## 72. Oman/GCC Quality Gate

Before claims of regional intelligence, test Oman geography/institutions/culture, GCC football, Arab entertainment, Arabic sources/search recall, regional terminology, evidence authority, sensitivity, and all relevant difficulty levels with regional/native reviewers. Inventory counts alone do not pass.

## 73. Performance Gate

Before infrastructure optimization, measure package assembly and Question Bank queries, activation/reveal latency, database query plans/size, provider stage latency/cost/yield, media delivery, startup/build/tests, and concurrent behavior appropriate to observed use. Optimize the measured bottleneck with the smallest compliant change.

## 74. Resource Gate

After major phases, inspect disk/database/media/cache, peak RAM/CPU, process/service count, dependency/install size, build/startup/test time, background concurrency, and provider calls/cost. Compare with prior checkpoint. Unexpected material growth triggers stop/root-cause review under Operating Constraints.

## 75. Security Gate

Before external testing/public launch, verify host/display/account/admin capabilities, cross-account ownership, unrevealed/future answer/package leakage, server-authoritative mutations, idempotency/concurrency, secrets/log redaction, input/custom prompt injection, source/URL safety, provider tool permission, and media metadata leakage. UI hiding never passes authorization.

## 76. Data Integrity Gate

Verify stable canonical IDs, FKs/uniqueness, lifecycle/evidence history, migration and idempotent seeds, package completeness/snapshots, actual-served exposure/outcome, fallback reality, account deletion policy when applicable, backup/restore, and no orphaned/cascade-deleted truth. Run failure injection around transaction boundaries.

## 77. Manual Game Night Gate

Before serious launch, play multiple complete shared-screen games in Arabic and English as relevant. Observe distant category scan, team discussion, dial detents/press/reset/used states, pacing, 100/200/300 feel, repeats, disputes, natural wording, fun reveal, media, accessibility, recovery, and awkward pauses. Convert observations into ID-linked feedback/regression candidates.

## 78. Pre-launch Gate

Require applicable milestone/core/golden/security tests; Arabic/Oman/GCC review for claims; multiple manual games; sane resources/performance; no surprise provider calls/cost; fallback/degraded/resume behavior; minimal admin/quarantine/recovery; migration/backup/restore plan; documented privacy/rights/limitations; and no critical known invariant failure. A polished UI cannot waive Engine trust.

## 79. Implementation Anti-patterns

Reject: simultaneous implementation of GE1–9; autonomous monolithic agent; provider-first architecture; microservice per subsystem; premature vector/search/graph database; gigantic initial dataset; rich media before text runtime; automatic custom categories before Foundry/evidence; calibration before trustworthy outcomes; full UI/framework rewrite; client-held full GamePackage; generic CRUD over state transitions; and infrastructure whose workload cannot be named.

## 80. Code Quality Principles

Use small cohesive modules, canonical terminology, explicit types/state transitions, narrow DTOs, validation at boundaries, clear structured errors, short transactions, tests near business logic, and comments explaining **why**. Prefer understandable repetition to abstraction theater, provider/domain separation to clever coupling, and conventional project style to speculative frameworks.

## 81. Documentation Maintenance

Implementation must not silently obsolete blueprints. Record small concrete implementation choices in milestone reports/decision notes as appropriate. Correct factual command/file references when the stack exists. Architectural doctrine changes require explicit review and user approval before synchronized document/code changes; never rewrite earlier specs merely to excuse drift.

## 82. Open Questions Log

Maintain a concise implementation-era record with question, milestone, governing section, impact, options, temporary/recommended decision, owner/decision date, and revisit trigger. Resolve small reversible naming/layout choices autonomously. Stop for datastore/framework/provider/security/privacy/identity/prepared-runtime choices or other architectural boundaries.

## 83. Implementation Success Metrics

- **Technical:** gates/tests pass; zero within-package repeated Facts; no answer leakage; consistent transactions/state; low runtime/fallback failures; reproducible builds/migrations.
- **Product:** trusted/fun questions; sensible 100/200/300; reduced repeats; natural Arabic/English; later viable fresh custom categories.
- **Operational:** laptop-friendly; few processes; quick startup/runtime; bounded predictable provider cost; clear diagnostics; codebase understandable by one developer.

Metrics diagnose and guide; they never justify weakening truth, safety, rights, privacy, or identity.

## 84. Final MVP Execution Sequence

> **Approved construction order**

```text
Readiness Audit
→ Canonical Core
→ Evidence / Knowledge Support
→ Manual Seed Inventory
→ Question Bank
→ Game / Package Storage
→ Deterministic Game Assembly
→ Secure Runtime Contracts
→ Existing UI / Rotary Dial Integration
→ Outcomes + Exposures
→ Machine Memory V1
→ Basic Diversity
→ Fallback / Resilience Hardening
→ Engine MVP Hardening
→ MVP REVIEW
```

Do not reorder Memory before exposure, runtime before packages, Assembly before Question Bank, or automation before MVP review without explicit architectural approval.

## 85. Post-MVP Execution Sequence

```text
Provider Adapter Foundation
→ Question Writing Assistance
→ Quality Pipeline
→ Search / Fetch
→ Fact Verification
→ Question Foundry V1
→ Bounded Replenishment
→ Difficulty Data Review / Calibration V1
→ Machine Memory V2
→ Custom Runtime Proof
→ Scope Interpretation
→ Custom Knowledge Maps
→ Custom Manufacturing
→ Custom Continuity
→ Qualified Images
→ Optional Rich Media
```

Each arrow is a gate, not a promise to proceed automatically.

## 86. Implementation Invariants

1. Every milestone leaves a working repository or explicitly remains incomplete.
2. Tests and manual gates govern progression.
3. Manual seed content is legitimate architecture.
4. Runtime exists before autonomous Foundry.
5. Question Bank exists before custom generation.
6. Exposure exists before advanced personalization.
7. Trustworthy outcomes exist before calibration.
8. Foundry/retrieval work before automatic custom categories.
9. Text works before rich media.
10. Fact identity/fingerprints work before embeddings.
11. Infrastructure follows measured workload.
12. Capability adapters precede provider proliferation.
13. No architectural deviation is silent.
14. Operating stop conditions are binding.
15. Each advanced layer has a rollback/degraded boundary.
16. Existing Guess Machine UI identity is preserved.
17. Arabic quality is independently tested/reviewed.
18. No live generation is introduced later for convenience.
19. Engine capability increases without making runtime more fragile.
20. Every advanced subsystem collapses safely toward prepared trivia.
21. Database rows and provider objects never become player API contracts.
22. Stable Fact identity survives language/category/wording/media.
23. Quality/security/rights rules do not relax for inventory or deadlines.
24. GAME READY means external intelligence is no longer required.
25. One milestone may not pre-scaffold an entire future phase without need.

## 87. What This File Does Not Decide

This plan defers dates, developer-hour estimates, framework/language, database vendor, provider/model/search/media vendor, Git branching model, issue tracker, team assignments, cloud/deployment/release platform, exact migration/test tools, CI/CD, infrastructure topology, product pricing, and launch dates. Milestone 0 plus explicit later decisions select only what current work needs within constraints.

## 88. Follow-up Document

The next and final implementation-planning document should be `GUESSENGINE-CODEX-HANDOFF.md`. It must tell Codex what to read and in what order, how to select/execute one milestone, how to report/tests/deviations, when to stop, how to respect repository/Git/filesystem/resource safety, its autonomy boundary, and how to begin at Milestone 0. Do not create it during this task.

## 89. Implementation Plan Doctrine

1. Build the spine before the brain.
2. Build the game before automating the factory.
3. Seed before generating.
4. Serve before personalizing.
5. Remember before adapting.
6. Observe before calibrating.
7. Verify before manufacturing.
8. Manufacture before customizing.
9. Text before spectacle.
10. One milestone at a time.
11. One rollback point at a time.
12. Do not let architecture become simultaneous work.
13. A sophisticated final system can emerge from simple validated layers.
14. The first goal is not Infinite Questions.
15. The first goal is one excellent prepared question going THUNK exactly when the player asks for it.
16. Then make the Machine remember.
17. Then make the Machine manufacture.
18. Then let it invent categories.
19. Then give it eyes and ears.
20. Build the Machine in the order that makes failure boring.
