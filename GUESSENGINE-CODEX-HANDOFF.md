# Guess Engine Codex Handoff

## 0. Purpose

This final planning document does not define Guess Engine architecture. It tells Codex how to execute the architecture already defined for Guess Machine / مخ ماشين. The blueprint is complete enough that implementation should apply it, not redesign it opportunistically.

> Read first. Inspect second. Implement third.

> Do not invent architecture where the specifications already decide it.

## 1. Project Identity

- **Product:** Guess Machine / مخ ماشين.
- **Working boundary:** the active Guess Machine repository/project only.
- **Identity:** tactile shared multiplayer trivia machine; Guess Engine operates backstage.

Never mix in Earprint branding, code, architecture, terminology, or unrelated repositories. Do not alter global machine configuration. Confirm the working directory before every session; if it is not the intended Guess Machine project, stop and route correctly.

## 2. Source-of-truth Document Set

### Foundational Architecture

- `GUESSENGINE-1.md`
- `GUESSENGINE-2.md`
- `GUESSENGINE-3.md`
- `GUESSENGINE-4.md`
- `GUESSENGINE-5.md`
- `GUESSENGINE-6.md`
- `GUESSENGINE-7.md`
- `GUESSENGINE-8.md`
- `GUESSENGINE-9.md`

### Implementation Planning

- `GUESSENGINE-MVP-IMPLEMENTATION.md`
- `GUESSENGINE-STORAGE-DESIGN.md`
- `GUESSENGINE-API-CONTRACTS.md`
- `GUESSENGINE-PROVIDER-STRATEGY.md`
- `GUESSENGINE-OPERATING-CONSTRAINTS.md`
- `GUESSENGINE-TEST-PLAN.md`
- `GUESSENGINE-IMPLEMENTATION-PLAN.md`
- `GUESSENGINE-CODEX-HANDOFF.md`

Also preserve the product interaction decisions in `UIX.md` and active repository instructions such as `AGENTS.md`. Implementation must remain consistent with the whole applicable set.

## 3. Required Reading Order

Before the first implementation session, read:

1. `GUESSENGINE-CODEX-HANDOFF.md`
2. `GUESSENGINE-OPERATING-CONSTRAINTS.md`
3. `GUESSENGINE-IMPLEMENTATION-PLAN.md`
4. `GUESSENGINE-MVP-IMPLEMENTATION.md`
5. `GUESSENGINE-STORAGE-DESIGN.md`
6. `GUESSENGINE-API-CONTRACTS.md`
7. `GUESSENGINE-TEST-PLAN.md`
8. `GUESSENGINE-PROVIDER-STRATEGY.md`
9. `GUESSENGINE-1.md` through `GUESSENGINE-9.md`
10. `UIX.md` and repository instructions for affected areas.

Later sessions must reread this handoff, operating constraints, implementation plan, milestone-governing sections, prior milestone/status notes, and changed code. Do not reread blindly when current context is reliable, but never implement a milestone without its governing specifications.

## 4. Specification Precedence

For a genuine irreconcilable conflict:

1. User’s explicit current instruction.
2. This handoff, for execution protocol.
3. `GUESSENGINE-OPERATING-CONSTRAINTS.md`.
4. `GUESSENGINE-IMPLEMENTATION-PLAN.md`.
5. `GUESSENGINE-MVP-IMPLEMENTATION.md`.
6. `GUESSENGINE-STORAGE-DESIGN.md`.
7. `GUESSENGINE-API-CONTRACTS.md`.
8. `GUESSENGINE-PROVIDER-STRATEGY.md`.
9. `GUESSENGINE-TEST-PLAN.md`.
10. `GUESSENGINE-1.md` through `GUESSENGINE-9.md`.

Higher implementation documents may narrow **when/how**, not casually invalidate Fact truth, Question/Variant separation, prepared GamePackages, Fact-level exposure, no live raw generation, truth-independent Machine Memory, ordinary custom-category pipeline, provider replaceability, or the established UI. On a genuine contradiction: **STOP and report it**.

## 5. First Action in Every Session

Before modifying code:

1. Confirm current working directory/project identity.
2. Read active repository instructions.
3. Check whether Git exists; if so, inspect status/branch/uncommitted work.
4. Inspect relevant files and existing behavior.
5. Identify current approved milestone and prerequisites.
6. Identify build/test/run commands and current results.
7. Identify unrelated user changes and preserve them.

The current planning workspace has no Git or code; future implementation must re-audit rather than assume this remains true. Git absence never blocks valid work or authorizes initialization.

## 6. Repository Safety

Read/write within Guess Machine unless explicitly supplied source material or another exact target is authorized. Do not touch Earprint, unrelated repositories/files, parent folders, personal data, system settings, or global tooling. Resolve paths before mutation; preserve user-owned/unrelated changes; material deletion requires clear scope, reason, and approval.

## 7. Git Safety

When Git exists, inspect status and branch before substantial changes and understand overlapping edits. Never assume uncommitted files are disposable. Do not hard reset, destructive clean, force push, rewrite history, delete branches, or discard changes without explicit approval and verified consequences. If Git does not exist, continue project work normally without initializing it unless requested.

## 8. Git Checkpoint Philosophy

Each milestone should start from a known understandable state and end at a testable rollback boundary. Prefer one logical milestone checkpoint/commit rather than a giant multi-milestone diff—but create commits/branches only when the user or established workflow authorizes it. A failing or incomplete milestone is reported, not disguised as a clean checkpoint.

## 9. Implementation Unit

The default unit is **one milestone** from `GUESSENGINE-IMPLEMENTATION-PLAN.md`, including its prerequisites, behavior, tests, non-goals, rollback, stop conditions, and gate. “Build Guess Engine” does not automatically mean implement Milestones 0–34 in one uncontrolled change.

## 10. Current Starting Point

When implementation is first authorized, begin at **Milestone 0 — Implementation Readiness Audit**. The current folder is a non-Git Markdown blueprint without application code, package manager, database, or test tooling; verify this snapshot again. Do not jump to providers, Foundry, custom manufacturing, embeddings, or media unless the user explicitly changes scope after acknowledging prerequisites.

## 11. Milestone Preparation

For the chosen milestone, state briefly: objective; governing documents/sections; proven prerequisites; reusable existing code; likely affected areas; required tests; non-goals; rollback boundary; stop conditions; and intended gate. Then implement only that slice. Do not produce another architecture essay or pre-scaffold later phases.

## 12. Reuse-first Rule

Search existing code for game state, categories, teams, persistence, API/transport/auth, runtime, UI/dial, localization, errors, tests, and build conventions before creating replacements. Prefer adapting, wrapping, migrating, or adding a focused seam. Conceptual names in docs do not require duplicate systems when existing code already provides correct semantics.

## 13. No Unrelated Cleanup

Do not rename unrelated files, mass-format the repository, upgrade packages casually, modernize unrelated modules, rewrite architecture, or delete “unused-looking” user work during a milestone. If unrelated debt truly blocks the gate, document exact evidence and propose the smallest separate change.

## 14. Implementation Autonomy

Codex may decide small reversible details left open: helper/test names, internal filenames/module placement, ordinary data structures, focused refactors, and a small justified utility matching repository convention. Choose the simplest conventional lightweight option that is easy to test, migrate, remove, and explain.

## 15. Implementation Autonomy Limit

Codex may not independently choose a new datastore category, vector/graph/search database, Redis without measurements, Kubernetes, microservice split, framework replacement, heavyweight local model/corpus, paid cloud/provider resource, deployment topology, destructive migration, or autonomous monolithic agent. Stop, present evidence/options/impact/reversibility, and request approval.

## 16. Lightweight Implementation Rule

`GUESSENGINE-OPERATING-CONSTRAINTS.md` is binding. MVP is a lightweight modular application, normally one deployable application and one relational database with few processes. Difficulty, Memory, Foundry, Media, Knowledge, Custom Categories, and Assembly are logical modules first—not services.

## 17. Local Resource Rule

Development must remain comfortable on a normal laptop: no GPU requirement, giant RAM/disk footprint, multi-gigabyte models/corpora, or fleets of always-running processes. Bound concurrency/caches/fixtures. Unexpected material resource growth is a stop condition requiring measurement and reassessment.

## 18. Dependency Policy

Before adding a dependency, inspect current stack/lockfile; ask whether built-in/current tooling suffices; justify current milestone need; review maintenance/security/license; assess download/transitives/native build/platform/runtime impact; and avoid overlap. Use project-local package management and report the change.

## 19. Large Dependency Stop Condition

Stop before adding huge binaries/downloads, dedicated service, GPU runtime, large native compiler/toolchain, giant transitive graph, or significant Windows/macOS risk. Explain why it appears necessary, alternatives, size/resource impact, and rollback. Do not install first and justify later.

## 20. Database Rule

Use one primary relational database for MVP, selected after Milestone 0 from current/minimal stack needs. Canonical IDs, relations, transactions, snapshots, exposure, and outcomes remain relationally representable. Another persistence technology requires explicit demonstrated need and approval.

## 21. No Vector Database Rule

No dedicated vector database for MVP. Implement Fact identity, fingerprints, relational links, exclusions, and real duplicate-corpus tests first. Later semantic projections follow the implementation/storage/provider review and remain rebuildable/noncanonical.

## 22. Provider Rule

Providers enter only in the approved provider milestone after Engine MVP review and dated capability evaluation. Do not integrate reasoning/search/media because keys or SDKs happen to exist. Core/runtime proof requires zero intelligence providers.

## 23. Provider SDK Isolation

Provider-specific imports, objects, IDs, configuration, responses, retries, and errors stay in adapters at the edge. Domain/application/storage/player DTOs use normalized internal contracts. One provider switch should not edit Fact, Question, GamePackage, Assembly, runtime, or frontend semantics.

## 24. No Live Intelligence Rule

Once GamePackage is ready, runtime normally calls no LLM, web search, source fetch, embeddings, media discovery, or Question Foundry. The rotary press activates a prepared slot. Ordinary database/backend and prepared media delivery may operate with qualified fallback. Never introduce live generation as a convenience patch.

## 25. Question Bank Before Foundry

Do not automate generation before canonical storage, reviewed seed inventory, Question Bank, packages, Assembly, secure runtime, UI integration, exposure, and Memory MVP are proven. Manual seeds are deliberate production-shaped scaffolding, not failure.

## 26. Test-first Gate Behavior

Literal TDD is not mandatory for every line, but milestone acceptance tests from `GUESSENGINE-TEST-PLAN.md` must be implemented and pass before “done.” Write tests at the layer that proves the invariant; do not mock the subsystem under test or substitute coverage percentage for behavior.

## 27. Test Execution

Run focused changed-area tests first, then broader relevant suite and milestone golden/manual checks where reasonable. Record exact commands/results. Use isolated test data, controllable time/randomness, fakes for external edges, and no internet/paid providers in the ordinary suite.

## 28. Test Failure Handling

Determine whether failure is newly introduced, pre-existing, environment-only, flaky, or a real spec conflict. Fix milestone regressions/root causes; add regression coverage for serious defects; do not weaken assertions or product invariants to get green. Report unrelated failures with evidence and impact.

## 29. Provider Test Safety

Ordinary tests use fakes/mocks/curated recordings and cannot spend money. Live integration checks are separate, explicit, minimally scoped, budgeted, credential-safe, and skippable. Provider calls never occur on startup or default test invocation.

## 30. Golden Test Importance

Once prerequisite milestones exist, preserve the Test Plan’s golden flows, especially:

```text
GameRequest → GamePackage → Runtime → Exposure
→ Next Game → same Fact suppressed
```

Also protect cross-language memory, fallback reality, provider outage after GAME READY, and ordinary custom-category runtime. This loop is the Engine heartbeat.

## 31. Arabic Rule

Arabic is first-class native content. Never duplicate a Fact because language changes, force Arabic through English-only fields/workflows, destructively normalize display text, corrupt UTF-8, or silently substitute English without policy. Arabic and English are sibling QuestionVariants sharing canonical Fact identity; test storage/API/RTL/aliases/naturalness independently.

## 32. UI Preservation Rule

Connect Engine state to the established all-visible category board and tactile shared machine. Preserve the central industrial dial, 100/200/300 detents, center-press/THUNK, used indicators, mechanical reset, active-team rhythm, deep aubergine identity, restrained materiality, and accessibility. Do not replace it with a carousel, dashboard, generic quiz, or framework rewrite unless explicitly requested.

## 33. Player Payload Security

Never send full GamePackage, future questions/media clues, unrevealed/future answers/aliases, fallback inventory, canonical Fact/evidence/validation internals, selection traces, or Machine Memory internals to shared/player clients. Deliver only active safe presentation and allowed reveal state. Assume network/browser inspection.

## 34. Host vs Shared Trust

Host/controller may perform authorized game transitions and receive post-reveal adjudication data; shared display remains read-only and less privileged. Enforce capabilities server-side for each resource/state. CSS, route hiding, or separate screens are not authorization.

## 35. Exposure Rule

Frontend never submits arbitrary “Fact X was seen.” Exposure is created by the Engine when content is actually presented, transactionally with activation. Package construction, hidden slots, board reads, and preloads are not exposure; shown-but-unanswered content is.

## 36. Fallback Rule

Client reports a problem but does not select arbitrary replacement. Engine activates an already-qualified packaged fallback, records reason/snapshot, and binds exposure/outcome to actual served Fact/Question/Variant. Never generate/search live to repair a slot.

## 37. Machine Memory Rule

Memory v1 starts with durable Fact exposure and configured cooldown/exclusions across wording/language/category. It does not edit truth or board values and is not an arbitrary editable intelligence profile. Do not add personality, demographic, or unrelated behavioral profiling.

## 38. Current Fact Rule

Current content must pass validation and `as_of`/validity/freshness policy at package preparation. Expired/stale facts are ineligible until revalidated; stored existence or model knowledge is insufficient. Historical snapshots remain intelligible.

## 39. Custom Category Rule

Custom scope is untrusted data that enters the same canonical Evidence → Fact → Answer Lock → Question → Variant → Question Bank → GamePackage → runtime/memory path. Never create a prompt-to-player shortcut, parallel “AI question” schema, or special runtime.

## 40. Media Rule

Follow GE8 and media milestones: text first, qualified images when useful, audio/video later only with rights/delivery/accessibility. Separate discovery from qualification/delivery, strip answer leakage, snapshot usage, and prepare text/accessible fallback. Media cannot block or destabilize the text Engine.

## 41. Content Quality Rule

Never lower factual evidence/validation, one defensible answer, lifecycle eligibility, safety/moderation, media rights, or same-game Fact uniqueness to fill a package, hit a deadline, reduce cost, or satisfy a provider. Soft diversity/personalization may relax in documented order. Failure is acceptable. Bullshit is not.

## 42. Implementation Stop Conditions

Codex **must stop and report** before crossing any of these unexpectedly:

- dedicated/heavy local LLM or multi-gigabyte model/corpus/download;
- vector, graph, document, search, or other new database category;
- Elasticsearch/OpenSearch, Kubernetes/service mesh, microservice split, or several new services;
- framework replacement or destructive repository/schema/filesystem rewrite;
- paid/persistent cloud resource, provider/account creation, or billing activation;
- global system/toolchain/settings modification;
- uncontrolled crawling or questionable data/media rights;
- secret/privacy/security boundary risk;
- architecture conflict with binding specifications;
- dramatic unexplained disk/RAM/CPU/process/dependency increase;
- destructive Git operation or risk to unrelated/user work.

Do not cross autonomously even under broad authorization.

## 43. Soft Blockers vs Hard Blockers

- **Soft blocker:** small reversible uncertainty—naming, local helper shape, minor copy/test layout. Choose the simplest convention-aligned option, document if meaningful, and continue.
- **Hard blocker:** architecture, datastore/framework/provider, external cost/state, destructive action, identity/security/privacy/rights, or operating-constraint decision. Exhaust safe read-only evidence, then stop and request direction.

Do not ask about every variable; do ask before changing system shape.

## 44. Deviation Handling

```text
Specification:
Section:
Observed conflict:
Why compliant implementation is unreasonable:
Smallest proposed deviation:
Alternatives considered:
Impact (data/API/security/resources):
Reversibility / rollback:
Approval required: yes | no
```

Preserve core semantics and stop for architectural approval. Never silently diverge, edit tests to match a violation, or rewrite specifications afterward to conceal it.

## 45. Open Question Handling

Record minor unresolved decisions with milestone, impact, temporary choice, and revisit trigger; do not block on reversible detail. Escalate only when correctness or milestone gate depends on it. Keep an implementation-era open-questions/status artifact only when useful and authorized by the milestone/workflow.

## 46. State of Done

A milestone is done only when required behavior and tests/manual checks pass; prerequisites/gate are satisfied; non-goals remain untouched; repository/build remains understandable/working; data/security/resource impacts are acceptable; deviations and limitations are documented; and rollback is understood. Compilation alone is not completion.

## 47. Milestone Completion Report

```text
Milestone:
Status: complete | incomplete | blocked

Implemented:
- ...

Files changed:
- ...

Tests run / results:
- ...

Known limitations / deferred:
- ...

Spec deviations:
- none | ...

Infrastructure / dependency changes:
- none | ...

Resource impact:
- ordinary | ...

Rollback note:
- ...

Recommended next milestone:
- ...
```

Keep it factual and concise.

## 48. No Claims Without Verification

Do not say “works,” “passes,” “implemented,” “secure,” or “complete” without inspecting actual state and running proportionate verification. If unverified, say exactly “implemented but not verified” or “not tested because …” and explain risk. A tool command succeeding is not proof of the full product gate.

## 49. Session Resumption

At a later session: confirm project; check Git if present; read repository instructions, this handoff, Operating Constraints, Implementation Plan, last milestone/status report/commits/diffs, and relevant changed code; identify last truly passing gate; rerun focused tests when uncertain; then continue only the next approved milestone. Do not trust conversational memory alone.

## 50. Multi-session Continuity

Leave code, tests, migrations, naming, milestone reports/status, TODO/deviation notes, and commits (when authorized) sufficient for a fresh session to reconstruct current milestone, decisions, failures, resource changes, and next step. Do not leave critical reasoning only in chat or unexplained partial scaffolding.

## 51. Implementation Notes

A future lightweight `GUESSENGINE-IMPLEMENTATION-STATUS.md` may track milestone state, commit/reference, tests, deviations, blockers, and next task when implementation begins and the user/workflow wants durable continuity. Keep it factual, small, and current. Do not create it during this planning task or turn it into a second architecture set.

## 52. When Codex May Continue Automatically

If the user explicitly authorizes “execute the implementation plan,” “let it rip,” or equivalent broad construction, Codex may continue milestone by milestone while prerequisites/gates/tests pass, no stop condition or major deviation occurs, resources stay compliant, and the authorized phase/scope is clear. Report at milestone boundaries and keep rollback points.

## 53. When Codex Must Stop Even Under Broad Authorization

Stop when Section 42 fires, tests reveal an architectural/integrity/security problem, a major dependency/infrastructure/external-state decision emerges, Git or user/unrelated work is at risk, a destructive operation is needed, rights/privacy uncertainty is material, or implementation contradicts specifications. Broad autonomy does not override safety, cost authority, or architecture approval.

## 54. When Codex Should Not Ask

Do not interrupt for helper/file/test names, small internal types, conventional local module placement, ordinary reversible refactors, formatting consistent with project, or other low-risk details that do not alter behavior/architecture. Make an informed simple choice and mention it only if useful.

## 55. When Codex Should Ask / Stop

Require explicit approval for major framework migration; new datastore/infrastructure/service; cloud or paid provider/resource/account; global/system change; large/native/GPU download; destructive Git/filesystem/schema/data action; architectural doctrine deviation; unclear ownership/privacy/rights; or material expansion beyond the approved milestone.

## 56. First Implementation Command Interpretation

If the user later says **“Let it rip”**, interpret it as: read handoff/constraints/plan; inspect repository; execute Milestone 0; report its gate; then continue milestone-by-milestone only insofar as broad authorization, passing gates, and safety allow. It never means rewrite everything, skip tests, invent architecture, initialize infrastructure, or ignore approvals.

## 57. First Milestone Expectation

Milestone 0 is observational/readiness work: establish actual stack/entry points, frontend/backend/game/UI/persistence/auth/API/test/build/package-manager/Git state, reuse/adaptation map, commands, existing failures, and blockers. Do not refactor or install speculative dependencies. Begin Milestone 1 only when authorized and the readiness gate passes.

## 58. Existing Repository Overrides Assumptions

Specifications predate final physical implementation. If a good existing component already satisfies semantics, reuse it even if its names/layout differ. Do not duplicate game state, auth, categories, persistence, API, or UI merely to mirror diagrams. Existing code cannot override binding identity/security/prepared-runtime doctrine without explicit deviation review.

## 59. Simplest Reversible Choice Rule

When unspecified, choose the option that is simplest, conventional for the current stack, lightweight, portable, secure, easy to test/migrate/remove, and consistent with existing patterns. Avoid locking provider/framework/vendor choices through convenience.

## 60. Do Not Solve Future Milestones Early

Canonical storage work does not include embeddings, custom search, media, calibration, provider adapters, or background fleets. Runtime work does not prebuild Foundry. Implement only current prerequisites plus tiny genuine seams whose value is immediate; future milestone owns future behavior.

## 61. No Placeholder Infrastructure

Do not add empty Redis/Kafka/vector/search clients, microservice templates, provider SDK/config, queues, feature-flag platforms, cloud manifests, or monitoring stacks “for later.” Prepare with clean domain/application boundaries and documented milestones, not unused dependencies, processes, credentials, or files.

## 62. No Fake Abstractions

Create an abstraction where a real provider/storage/transport boundary exists, multiple implementations/testing need it, or business policy deserves isolation. Do not wrap every function in generic repository/factory/DI layers. A modular monolith is not one file, but it also is not ceremony.

## 63. Domain Language

Use recognizable canonical terms: FactRecord/Fact, QuestionRecord/Question, QuestionVariant/Variant, Question Bank, GameRequest, GamePackage, GameQuestionSlot/Slot, PlayerOutcome/Outcome, ExposureRecord/Exposure, Machine Memory, Custom Category, KnowledgeNode, Entity, and SourceEvidence. Adapt casing/suffixes to framework conventions without inventing parallel concepts.

## 64. Database Semantic Rule

Do not collapse the Engine into only `question + answer + category`. Storage must preserve canonical Fact identity, Question intent, language/presentation Variants, reviewed answers, provenance/validation, difficulty/lifecycle, package snapshots, actual exposure/outcome, and cross-category relationships at the milestone where each becomes required.

## 65. Snapshot Rule

Played/served slots retain exactly what players saw: question text, display answer, language, difficulty, media usage, and canonical/version references as specified. Later editorial fixes affect future packages, not historical reality. Controlled redaction remains audited.

## 66. Idempotency Rule

Retries/double taps cannot double-create a game/custom request, consume/serve a slot twice, create duplicate exposure/outcome, reveal twice as a new transition, double score, or complete twice. Same key/same intent returns the prior semantic result; same key/different intent conflicts.

## 67. Transaction Rule

Use short atomic boundaries for package readiness, slot activation+snapshot+exposure, fallback activation, outcome+score+turn+completion, and lifecycle+audit where required. Never hold database transactions open across external providers/search/fetch/media discovery. Failures leave rollback-safe, inspectable state.

## 68. Startup Rule

Startup starts the application and validates only required local configuration/schema state. It does not fetch the web, generate questions, rebuild maps/embeddings, scan corpora/media, revalidate every Fact, or spend provider budget. Maintenance/manufacturing uses explicit commands/jobs.

## 69. Test Rule

Core tests run locally without internet, GPU, cloud, paid APIs, or real personal data. Use representative deterministic fixtures, isolated relational state, fakes at external edges, and real domain/application behavior. Provider/live network tests remain separate and explicit.

## 70. Performance Rule

Measure package queries/assembly, activation/reveal, startup/build/tests, database/resource growth, provider stages, and media before optimizing. Use indexes/query fixes/simple caching first. Do not introduce services, distributed patterns, or giant in-memory data based on imagined traffic.

## 71. Resource Report

Every milestone report states meaningful dependency/install, process/service, database/migration, disk/media/cache, CPU/RAM, network/provider, and startup/build/test changes. If none, say **none**. Unexpected growth is evidence to investigate, not a detail to omit.

## 72. Provider Cost Report

Once provider milestones begin, report capability/adapter added, real versus fake calls, call counts or bounded scope, configured budget/ceiling if known, approximate observed cost when available, credentials/config requirements without values, and default test/startup behavior. Never hide paid-call behavior.

## 73. Content Seed Rule

Early curated content uses the same production-shaped Category/Fact/Evidence/Question/Variant/Answer/Difficulty/Lifecycle structures and stable IDs as later Foundry output. Import is reviewable/idempotent/non-destructive. Do not build a disposable alternate `questions.json` truth schema.

## 74. Manual Content Is Not Failure

Manual fact finding, evidence review, answer lock, writing, difficulty assessment, and seed import deliberately prove canonical/runtime architecture. Do not rush AI integration to make the project appear intelligent. Automation is valuable only when it preserves or improves reviewed output.

## 75. Engine MVP Completion

Only after Milestone 13 and all defined gates truly pass, report:

> Guess Engine MVP core loop is operational.

This means canonical bilingual prepared gameplay, secure runtime, exposure/outcome, Fact memory, fallback, UI/dial, tests, and laptop-friendly operation work. It does not mean Foundry, automatic custom categories, calibration, or rich media are mature.

## 76. Post-MVP Authorization

Completing MVP does not automatically authorize Phase E–G unless the user’s active instruction explicitly covers them. If broad full-plan authorization remains clear, continue through passing milestones until a stop condition. Otherwise report MVP completion and readiness for the provider-adapter review/Milestone 14.

## 77. Custom Category Launch Caution

Do not expose automatic custom manufacture publicly until Foundry writing, acquisition/fetch, evidence verification, duplicates, difficulty/quality, safety/privacy, bounded costs, failure/cancellation, Arabic/GCC quality, and ordinary runtime are proven. One impressive demo does not pass the product gate.

## 78. Media Launch Caution

Do not ship fragile multimedia merely because code exists. Require rights/attribution/region, answer-metadata leakage protection, technical availability, accessibility, package snapshots/preload, prepared fallback, bandwidth/resource bounds, and manual play. Text remains the trusted universal fallback.

## 79. Implementation Success Standard

Success is faithful canonical architecture, simple understandable code, a working tactile game, passing semantic/security/failure tests, natural bilingual content, low runtime fragility/resource use, clear diagnostics, and easy rollback. It is not code volume, abstraction count, provider sophistication, or maximum automation.

## 80. Failure Standard

A milestone may legitimately end `incomplete` or `blocked` when continuing would violate architecture, safety, data integrity, authorization, resources, rights, or external authority. Report evidence, completed safe work, exact blocker, and smallest next decision. A clean stop is better than a corrupted Machine.

## 81. Implementation Anti-patterns

Avoid “while I’m here” rewrites, hidden architecture invention, framework churn, provider-first logic, autonomous giant agent, abstraction/DI theater, speculative infrastructure, huge seeds/corpora, live-generation fallback, full package/answer leakage, Arabic Fact duplication, custom parallel schema, client-authored exposure/score/truth, silent spec deviation, and claiming success without tests.

## 82. Reporting Style

Reports are concise, factual, implementation-oriented, and lead with status/outcome. State what changed, files, tests/results, limitations/deferred, deviations, infrastructure/resources, rollback, and next milestone. Do not dump internal chain-of-thought, exaggerate confidence, or require the user to infer failures from raw command output.

## 83. Final Pre-implementation Checklist

- [ ] Current directory is the intended Guess Machine project.
- [ ] Active repository/project instructions are read.
- [ ] Git presence/status/branch inspected when applicable.
- [ ] Relevant specs and prior status are read.
- [ ] Current approved milestone/prerequisites are identified.
- [ ] Existing code/data/UI and user changes are inspected.
- [ ] Build/test/run commands and baseline results are known.
- [ ] No stop condition is already present.
- [ ] Planned scope/non-goals fit one milestone.
- [ ] No unnecessary infrastructure/provider/dependency is planned.
- [ ] Tests and rollback boundary are understood.

## 84. Final Milestone Checklist

- [ ] Objective and required behavior are implemented.
- [ ] Required automated/manual tests were written/run.
- [ ] Tests pass or exact failures/status are reported.
- [ ] Prerequisite/gate is satisfied.
- [ ] Non-goals/unrelated scope remain untouched.
- [ ] No stop condition or security/data invariant was violated.
- [ ] Dependency/resource/infrastructure impact is acceptable/reported.
- [ ] Spec deviations/open questions are documented.
- [ ] Repository remains working/understandable and rollback is clear.
- [ ] Next approved milestone/readiness is identified.

## 85. Final “Let It Rip” Protocol

When the user explicitly grants broad execution authority:

```text
READ
→ INSPECT
→ MILESTONE 0
→ TEST / VERIFY GATE
→ REPORT
→ NEXT APPROVED MILESTONE
→ TEST / VERIFY GATE
→ REPORT
→ ...
```

Continue while gates pass and constraints hold. Pause at meaningful milestone boundaries to report; stop immediately for Section 42/53 conditions. Autonomy means executing known architecture efficiently, never ignoring it.

## 86. Final Handoff Doctrine

1. Read before touching.
2. Inspect before assuming.
3. Implement milestones, not “the whole Engine.”
4. Preserve existing working code.
5. Choose the simplest reversible option.
6. Keep architecture boundaries real.
7. Keep infrastructure boring.
8. Keep providers at the edges.
9. Keep runtime prepared.
10. Keep answers hidden.
11. Keep Fact identity canonical.
12. Keep Arabic first-class.
13. Keep Git recoverable when Git exists.
14. Keep the laptop cool.
15. Test every milestone.
16. Report every milestone.
17. Stop on architecture surprises.
18. Do not silently improvise around the specs.
19. Build the Machine layer by layer.
20. When the user finally says “let it rip,” know exactly what that means.
