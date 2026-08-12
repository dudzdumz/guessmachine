# Guess Engine Operating Constraints

## 0. Purpose

This is the fifth implementation-planning document for Guess Engine. The architecture is intentionally sophisticated at the semantic level; its MVP infrastructure must remain lightweight, understandable, reversible, and safe for one developer.

> Logical complexity does not justify operational complexity.

> The existence of many Engine subsystems does not imply many services.

Where the foundational architecture permits a mature capability, this document may bind implementation to **Not for MVP**. Both rules apply. These constraints govern future Codex and human work unless the user explicitly approves a documented deviation.

## 1. Operating Philosophy

1. Single-developer-friendly first.
2. Laptop-friendly first.
3. Reversible decisions first.
4. Reuse an existing stack before introducing another.
5. One application before microservices.
6. One relational database before distributed storage.
7. External intelligence before heavyweight local inference.
8. Measure before scaling.
9. Prove workload before infrastructure.
10. Reliability beats cleverness.
11. Obtain explicit approval for heavyweight changes.
12. Use Git checkpoints when Git exists; Git absence never blocks valid work.
13. Never perform destructive cleanup without evidence and authorization.
14. Never solve imaginary scale.

## 2. Local Resource Constraint

> Guess Engine development must run comfortably on a normal developer laptop.

It must not require a dedicated GPU, workstation-class RAM, tens of gigabytes of models, giant datasets, or many heavyweight always-running services. Source, project-local dependencies, relational data, representative fixtures, and modest media should remain ordinary development scale. If implementation suddenly needs multi-gigabyte downloads, sustained memory pressure, or huge disk growth: **STOP, measure, and reassess before continuing**.

## 3. No Local Heavyweight Models by Default

Without later explicit approval, prohibit locally hosted LLMs, multi-gigabyte transformers, image-generation models, large speech models, embedding-model fleets, and multimodal foundation models. Initial intelligence uses replaceable external capabilities only after runtime MVP. Small deterministic parsers, normal language libraries, and bounded test fakes are acceptable when justified.

## 4. No Giant Local Knowledge Corpus

Do not download or maintain Wikipedia/Common Crawl dumps, full web archives, giant sports/entertainment datasets, or massive media collections. Guess Engine retrieves targeted material and retains qualified reusable knowledge. A bounded domain dataset may be considered later only with measured benefit, license review, update/size plan, and explicit approval. It does not clone the internet.

## 5. Database Constraint

MVP uses **one primary relational database** for canonical content, games, packages, exposures, outcomes, and durable audit state. Do not add a graph database, vector database, document database, analytics warehouse, or time-series database without demonstrated workload. Logical subsystem names do not imply separate datastores.

## 6. Vector Database Constraint

No dedicated vector database for MVP. Begin with Fact fingerprints, normalized fields, relational identity/links, exact exclusions, and simple similarity. Embeddings remain optional rebuildable projections. Evaluate vector storage only after a measured semantic-recall or scale problem survives simpler approaches.

## 7. Search Infrastructure Constraint

No Elasticsearch or OpenSearch cluster for MVP. Use relational indexes, normalized text, built-in database search where useful, and external search capabilities only for bounded web acquisition. A few thousand—or even substantially more—trivia records do not by themselves justify operating a cluster.

## 8. Cache Constraint

No dedicated Redis/cache service until measured latency, contention, or concurrency requires it. Application memory or database-backed projections may suffice. Cache is reconstructible optimization, never authoritative truth, game state, exposure, outcome, or canonical identity.

## 9. Queue / Worker Constraint

Do not introduce Kafka, RabbitMQ, distributed worker fleets, or elaborate orchestration for MVP. Foundry, custom manufacturing, revalidation, and media work may later need background execution; first use the smallest reliable mechanism compatible with the chosen stack and workload. No queue before queued work exists.

## 10. Microservice Constraint

Difficulty, Machine Memory, Foundry, Media, Assembly, Knowledge, and runtime begin as modules inside one deployable application. Split a service only for proven independent scale, reliability, security, deployment, or ownership needs, with documented operational cost. Logical boundaries remain clear without network boundaries.

## 11. Kubernetes / Orchestration Constraint

No Kubernetes, service mesh, Helm, cluster orchestration, or local pseudo-production cluster. Significant future scale may justify a separate infrastructure project; it is not an MVP assumption or ordinary Codex choice.

## 12. Docker Constraint

Docker is allowed only when it simplifies a real dependency or preserves an existing clean workflow. Do not containerize everything by habit or create a fleet of local containers. The current workspace has no container setup; adding one later needs a concrete stack/dependency reason.

## 13. Observability Constraint

MVP uses structured logs, correlation/action IDs, useful error reporting, and a few meaningful counters/timings. Do not automatically add Prometheus, Grafana, Jaeger, collector fleets, or ELK. Keep logs/metrics shaped so richer tooling can consume them later without operating enterprise infrastructure now.

## 14. Application Process Constraint

Normal development should require very few processes, conceptually frontend, backend, and database—and fewer when the selected architecture combines them. Every extra local daemon/process needs a named workload, owner, startup/shutdown story, resource estimate, and failure behavior.

## 15. Background Process Constraint

No processes that continuously scrape, generate questions, embed the entire database, refresh all facts, or scan media. Prefer user-triggered, scheduled, or inventory-threshold-driven bounded operations. Background tasks sleep/exit when there is no work and respect cancellation, deadlines, budgets, and concurrency.

## 16. Storage Footprint Constraint

No arbitrary exact limit is set, but code, dependencies, relational trivia, fixtures, logs, and caches should stay ordinary. Media is monitored separately and bounded. Tens of gigabytes during MVP is a design smell requiring a stop/review, inventory of what grew, and a retention or architecture correction.

## 17. Media Cache Constraint

Do not hoard media. Copy/cache only assets with permitted rights and a real reliability/performance use. Store references/metadata where sufficient; bound downloads, variants, transcodes, and expiry. Never build a giant local image/audio/video archive “for later.”

## 18. Dependency Constraint

For every runtime dependency ask: does the chosen stack already solve this, is standard library enough, is the package maintained/secure/portable/lightweight, and is it needed in the current milestone? Prefer one clear package per job. Record why it exists and avoid overlapping libraries.

## 19. Large Dependency Review

Explicit review is required for large binaries/downloads, native builds, huge transitive graphs, always-running services, GPU requirements, compilers, or material install/startup cost. Review alternatives, Windows/macOS support, license, security, size, removal path, and whether the current milestone truly needs it.

## 20. SDK Constraint

Provider SDKs stay inside provider adapters at the application edge. Domain, Assembly, runtime, API DTOs, and storage do not import vendor types. Prefer direct lightweight protocol use only when simpler/maintainable; either way, switching a provider must not edit Fact/Question/Game business logic.

## 21. Repository Boundary

All Guess Machine implementation reads/writes stay inside the active Guess Machine project unless the user explicitly supplies an external source or authorizes another target. Do not modify Earprint, unrelated repositories, personal files, OS configuration, or global settings. Attachments deliberately supplied for a task may be read, but outputs remain project-scoped.

## 22. Filesystem Safety

Do not delete arbitrary directories, globally wipe caches, remove unrelated files, modify parent directories, or recursively rewrite generated/user-owned folders without need. Resolve exact paths before destructive actions, prefer reversible changes, preserve unrelated work, and obtain explicit approval for material deletion.

## 23. System Safety

Do not alter OS settings, global PATH, shell profiles, global package managers, firewall, startup services, partitions, or system Python/Node/toolchains without explicit approval. Prefer project-local environments and tooling. Diagnose system prerequisites read-only before proposing a change.

## 24. Package Installation Safety

Use the chosen project package manager and lockfile; install locally. Avoid global npm/pip/Homebrew/toolchain changes unless the existing project explicitly depends on them and the user approves. Review install scripts, version scope, lockfile impact, and network/download size before adding dependencies.

## 25. Secret Safety

Never commit or print API keys, hardcode provider tokens, place secrets in Markdown/seeds/logs, expose them to the frontend, or include them in model/source content. Later use environment/secret management with server-only access, least privilege, rotation, and safe missing-secret behavior. Planning creates no real secrets.

## 26. Git Safety

When `.git` exists, inspect status/branch before substantial implementation, preserve unrelated changes, use appropriate checkpoints, and never assume uncommitted work is disposable. The current workspace is not a Git repository; that is valid for specification work, must not trigger initialization, and never blocks requested edits.

## 27. Commit Discipline

After Git is deliberately established, prefer small logical/milestone commits, readable messages, tested states, and easy rollback. Do not combine hundreds of unrelated files into “implement Guess Engine.” Documentation-only and tiny changes need not force artificial branching/commits unless requested.

## 28. No Forceful Git Operations by Default

Do not hard reset, destructive clean, force push, delete branches, rewrite history, or discard changes without explicit approval and verified targets/consequences. Prefer additive commits, revert, or scoped restoration. Git state is context, not authorization.

## 29. Backup / Copy Strategy

Before risky broad refactors in a Git repository, create a clean reviewed checkpoint. Avoid timestamped backup-folder clutter that can leak secrets or diverge. If Git does not yet exist, prefer small reversible edits and explicit user-approved backup strategy for genuinely risky work—never initialize Git solely as a gate.

## 30. Existing Code Preservation

Inspect before rewriting. Reuse working UI/runtime/backend patterns, add adapters/migrations, and refactor incrementally. Architecture documents define target semantics, not permission to erase working product behavior. Any replacement requires evidence of incompatibility, scoped plan, migration, and user awareness.

## 31. UI Preservation

Do not redesign established core interaction without request. Preserve simultaneously visible categories, shared industrial rotary dial, 100/200/300 detents, used-slot indicators, center-press/THUNK rhythm, mechanical reset, deep aubergine identity, and restrained industrial materiality. Engine integration supports the tactile game; it does not replace it with a dashboard, carousel, or generic quiz form.

## 32. Frontend Rewrite Constraint

Do not migrate or rewrite the frontend framework merely for Guess Engine. Map safe API/application contracts into the current structure when reasonable. Framework migration is a separate measured project with explicit approval, compatibility plan, and preserved UI identity.

## 33. Backend Rewrite Constraint

If a backend exists when implementation begins, audit and adapt it. Replace only when concrete incompatibilities with validation, transactions, authorization, runtime state, or maintainability cannot be repaired proportionately. Absence of a backend permits a minimal stack choice; it does not justify a platform zoo.

## 34. Schema Rewrite Constraint

After storage implementation begins, evolve through migrations and stable canonical IDs. Destructive recreate is limited to clearly disposable earliest local prototypes and cannot become normal workflow. Production-like or shared data is never reset for convenience.

## 35. Seed Data Safety

Seed/import tools are idempotent, scoped, reviewable, validated, versioned, and non-destructive. Stable keys prevent duplicates. A missing entry does not delete/retire durable canonical content silently; explicit lifecycle action handles removal. Dry-run/reporting is preferred before broad activation.

## 36. Network Constraint

Avoid unnecessary network calls during gameplay, local UI use, deterministic commands, and tests with fixtures/fakes. Retrieval/manufacturing integrations make explicit bounded network calls with timeouts, authorization, budgets, provenance, and observability. Offline failure should not corrupt local state.

## 37. Live Gameplay Network Rule

After GAME READY, selection does not call LLMs, web search, source fetch, embeddings, or media discovery. Runtime depends only on its application/database and qualified prepared media delivery where applicable, with fallback. No “temporary” live generation path may bypass this rule.

## 38. AI Cost Constraint

Use deterministic logic, then an evaluated cheap capability, then a stronger capability only for unresolved uncertainty. Attribute usage/cost to stage and approved output. High-capability models do not perform filtering, counting, state updates, or routine rewrites by default.

## 39. Repeated AI Call Constraint

Before external intelligence, query eligible FactRecords/evidence, Question Bank, KnowledgeMaps/entities, provider cache, and saved custom-category state. Reuse valid work. New calls require a freshness, coverage, language, difficulty, or quality gap—not a habit of regenerating.

## 40. Provider Fanout Constraint

Do not call many providers for every candidate “to be safe.” Follow source policy and capability routing; use one evaluated route, escalate for defined ambiguity/outage/coverage, and cap fanout. More vendors do not automatically create independent truth.

## 41. Scraping Constraint

No broad uncontrolled crawlers. Retrieval is targeted, bounded by domains/queries/pages/depth/time, respects terms and applicable policies, uses safe fetch rules, and records provenance. Do not crawl the internet or mirror sites from the developer laptop.

## 42. Current Data Constraint

Do not continuously refresh all facts. Stability policy drives work: immutable history rarely; periodic data on schedule/demand; current state within validity window; rapidly changing material with short expiry or exclusion. Revalidation is prioritized/incremental, never an endless universal loop.

## 43. Test Data Constraint

Use small representative fixtures covering canonical identity, duplicates, Arabic/English, ambiguity, currentness, package/fallback, memory, and failures. Do not generate millions of fake questions for basic correctness. Add bounded scale tests only after observed volume or query-plan need.

## 44. Test Environment Constraint

Default unit/contract/integration tests run without paid providers or internet using fakes, fixtures, deterministic clocks/IDs, and a local relational test database with relevant semantics. Real provider tests are explicit, limited, separately configured, budgeted, and safely skippable.

## 45. Test Side-effect Safety

Tests must not mutate production/shared data, publish content, send messages/email, incur surprise billing, or create uncontrolled cloud resources. Use isolated databases/namespaces/accounts, cleanup exact test artifacts, and fail closed when environment identity is uncertain.

## 46. Development Environment Parity

Keep Unicode, constraints, transactions, IDs, timestamps, migrations, and query semantics sufficiently aligned between local and production. Use the same relational engine locally when practical; if a lighter substitute is used, prove compatibility. Do not reproduce production size, availability topology, or cost locally.

## 47. Local Mac / Windows Portability

Support Windows and macOS where practical. Use project-relative/configured paths, portable runtime APIs/scripts, consistent line/Unicode handling, and documented commands. Avoid shell-only assumptions and case-sensitivity bugs. Do not embed `D:\...` or a user home path in application logic.

## 48. Path Safety

Documentation may name project locations, but code resolves paths from project root/config and validates destructive targets. Avoid unresolved globs/environment variables for deletion/moves. User-supplied filenames and media paths require normalization/traversal protection.

## 49. Cross-platform Dependency Review

Before native dependencies, verify supported Windows/macOS versions/architectures, install/download size, compiler/toolchain needs, binaries, maintenance, licensing, CI feasibility, and pure-language alternatives. One developer machine must not become a second-class environment.

## 50. CPU Constraint

Bound manufacturing concurrency and provide cancellation/backpressure. Do not continuously saturate every core for embeddings, parsing, media transforms, or tests. Normal editing, UI, and database work must remain responsive; defaults should be conservative.

## 51. Memory Constraint

Do not load the full Question Bank, exposure history, source corpus, or media catalog into RAM. Query/page/stream bounded sets and release large buffers. No giant in-memory vector/search index without measured need and explicit review.

## 52. Disk I/O Constraint

Avoid repeated full reindex, rewrite, export, transcode, or embedding loops. Make maintenance incremental and demand-driven, use hashes/versions, write safely, and bound temporary files. Monitor hot loops that continually touch unchanged records.

## 53. Build Time Constraint

Ordinary builds compile/package the application; they do not manufacture questions, fetch sources, process media libraries, or generate huge clients. Heavy content tasks use explicit commands/jobs. Reject tooling that makes each edit/build materially slow without current benefit.

## 54. Startup Time Constraint

Application startup initializes services and checks required schema/config. It does not rebuild maps, fetch the web, generate questions, re-embed content, scan all media, or validate every source. Maintenance/manufacturing are separate explicit workflows.

## 55. Migration Time Constraint

Migrations make deliberate schema/data changes with bounded restartable backfills. Never invoke web/provider/media discovery inside a database migration. Large backfills require batching, observability, compatibility staging, and rollback/forward-repair plan.

## 56. Code Generation Constraint

Generated API/ORM clients are acceptable only if the selected/current stack conventionally benefits. Pin generator/version, make regeneration deterministic, review diffs, and follow repo policy on committing outputs. Do not commit enormous generated artifacts or duplicate canonical definitions unnecessarily.

## 57. Logging Constraint

Never log secrets, raw tokens, unnecessary custom-category/user content, full provider responses/prompts, or answer/future-package payloads into player-accessible logs. Prefer structured IDs, stages, durations, counts, versions, and safe error codes. Restrict/redact sensitive diagnostic logs with retention.

## 58. Debug Artifact Constraint

Debug dumps are explicit, scoped, bounded, ignored or intentionally stored, free of secrets/private content, and easy to remove. Do not leave screenshots, fetched pages, databases, provider payloads, or duplicate builds as permanent root clutter.

## 59. Error Recovery Constraint

Never recover from integrity failure with random generated content. Use prepared fallback, eligible cached verified inventory, bounded safe retry, package rebuild before play, void, or graceful failure. Recovery preserves actual-served exposure/outcome and audit truth.

## 60. Quality Constraint

Never relax factual validation, answer uniqueness/defensibility, lifecycle eligibility, safety/moderation, rights, or same-game duplicate prohibitions for speed, quota, inventory, or cost. Soft personalization/diversity preferences may relax in documented order. Truth and player trust may not.

## 61. Unknown Is Allowed

If the Engine cannot confidently verify a claim, interpret scope, fill required category shape, resolve identity, or qualify media, it may limit, defer, request concise clarification, or fail. “Unknown” is valid state. It must not fabricate completeness.

## 62. Custom Category Resource Bounds

Bound searches, fetches, model calls/escalations, map branches/depth, candidate facts, media lookups, concurrency, elapsed preparation, output inventory, and cost. Deduplicate work and reuse saved knowledge. Scope that cannot meet viability within limits fails honestly.

## 63. Custom Category Cancellation

Longer preparation should eventually accept cancellation that stops new provider work, releases reservations, and marks state coherently. Completed verified reusable knowledge may remain under policy; orphan jobs must not consume resources. MVP may omit cancellation until asynchronous work exists.

## 64. Provider Timeouts

Every external call eventually has connect/read/overall deadlines appropriate to capability and stage. Cancellation propagates. Timeout becomes a normalized retryable/non-retryable failure; no stage waits forever. Exact values follow provider evaluation.

## 65. Provider Retries

Retries are finite, transient-only, backoff/jittered, idempotent, and counted against time/cost budgets. Do not retry invalid schemas/inputs, policy blocks, auth errors, or exhausted budgets blindly. Prevent nested layers from multiplying attempts.

## 66. Provider Circuit Breaking

Repeated route failures temporarily suppress calls and permit a probe after cooldown. Use the simplest counters/health state that works; do not add an enterprise resilience framework. Fallback/cache/defer remains stage-specific and quality-preserving.

## 67. Cost Ceiling

Manufacturing eventually enforces per-operation/capability ceilings. At the ceiling, reuse eligible inventory, reduce optional enrichment, defer, or fail safely. Never continue spending silently, lower truth gates, or shift cost onto live runtime.

## 68. Local Development Provider Safety

Provider calls are disabled by default in ordinary startup/tests unless explicitly configured. Use fakes, visible opt-in, small dev limits, non-production accounts/keys, and clear usage reporting. Commands that can spend materially should identify scope/estimate before running.

## 69. Database Size Monitoring

Occasionally inspect table row counts, database/volume and index size, large JSON/text/snapshots, exposure growth, and test-data accumulation using simple database tools. Investigate unexpected growth before retention/partitioning. No monitoring stack is needed.

## 70. Media Size Monitoring

Track original/derived/cache bytes, item counts, orphaned/expired assets, and largest formats separately from relational data. Set bounded local caches and inspect growth. Media can dwarf trivia; do not let it hide inside generic project-size metrics.

## 71. Cleanup Policy

Eligible cleanup includes expired provider/search caches, failed scoped downloads, old transcode intermediates, disposable test artifacts, and documented temp files. Resolve exact targets and preserve audit as required. Never casually purge canonical facts/evidence, games, exposures/outcomes, package snapshots, or user-owned history.

## 72. Code Organization

Logical modules may resemble:

```text
engine/
  domain/
  question_bank/
  assembly/
  runtime/
  memory/
  difficulty/
  foundry/
  knowledge/
  custom_categories/
  media/
  providers/
```

This is conceptual, not a command to create folders. Adapt to the chosen/current repository and keep MVP modules proportional.

## 73. Domain Dependency Direction

Canonical domain contracts do not depend on frontend, provider SDK, transport/framework, database/search vendor, or cloud. Application services coordinate domain transitions through ports/contracts; infrastructure adapters depend inward on semantics. Avoid circular subsystem dependencies.

## 74. Provider Dependency Direction

Provider code lives at the edge and maps provider requests/responses/errors into internal DTOs. FactRecord, QuestionRecord, GamePackage, storage, and runtime never expose provider types/IDs. Provider configuration and SDK upgrades remain localized.

## 75. UI Dependency Direction

Frontend consumes safe API/application views and intents. It does not understand SourceEvidence, provider routing, embeddings, validation traces, Machine Memory internals, or canonical tables. It renders server-authoritative state while retaining accessible tactile interaction.

## 76. No God Module

Do not create one enormous `guessEngine.ts`, `engine.py`, service, or controller containing every subsystem. A modular monolith uses coherent files/modules with explicit dependencies and focused tests. Monolith means one deployable boundary, not one file.

## 77. No Abstraction Theater

Avoid layers of generic repositories, factories for factories, universal event buses, abstract base classes, or dependency-injection ceremony without real variation/testing/boundary value. Add the smallest abstraction at actual provider, storage, transport, and domain seams. Three repeated clear lines may beat a premature framework.

## 78. No Premature Scale Patterns

No sharding, distributed locks, read replicas, CQRS, event sourcing, sagas, multi-region writes, service mesh, or global cache coherency until measured needs justify them. Begin with relational transactions, constraints, optimistic versions, idempotency, and a modular application.

## 79. Event-sourcing Constraint

Engine events are useful notifications/audit inputs; they do not mandate event-sourced state. MVP keeps authoritative relational state plus append-oriented audit/events/outbox only where needed. Do not require replay of all history to reconstruct every game.

## 80. CQRS Constraint

Do not split command/read models into separately deployed stores/pipelines. Focused application commands and indexed read queries/projections are sufficient. Introduce a derived read projection only for a measured query, keeping relational truth authoritative.

## 81. Serverless / Cloud Constraint

This file chooses no deployment paradigm. Managed app platforms, serverless, or simple containers may later be evaluated against runtime state, database connections, jobs, media, cost, and portability. Domain/application code must not hardwire a cloud unnecessarily.

## 82. Cloud Resource Creation

Codex must not create paid or persistent cloud databases, buckets, model endpoints, search indexes, queues, secrets, domains, or deployments without explicit user instruction and scoped approval. Provisioning is a separate deliberate task with ownership, cost, region, teardown, and security understood.

## 83. Third-party Account Creation

Do not register services, accept terms, create organizations/accounts, or initiate OAuth/billing automatically. Provider setup requires user participation/approval and separate credential handling. Local architecture work remains possible without accounts.

## 84. Billing Safety

Never enable paid features, upgrade plans, assume unlimited quota, or run high-cost operations automatically. Future paid integrations use explicit enablement, ceilings, usage visibility, and safe exhaustion. Payment-provider data stays outside core Engine contracts.

## 85. Licensing Safety

Review dependency/dataset/provider license, redistribution, attribution, commercial use, modifications, and compatibility before adoption. Pin/source records where required. Technical accessibility is not permission; uncertain licensing blocks inclusion pending review.

## 86. Content Rights Safety

Media follows `GUESSENGINE-8.md`: discovery is not qualification, rights are usage/region-specific, metadata is preserved, and fallbacks exist. Do not bulk-download copyrighted media, strip attribution, or build speculative archives during development.

## 87. Privacy Safety

Machine Memory remains game-relevant: exposure, outcomes, categories, disputes, and bounded group context. Do not add demographic, personality, sensitive-trait, or unrelated behavioral profiling “for recommendations.” Minimize provider sharing, identifiers, logs, and retention.

## 88. Security Safety

Never weaken authentication, authorization, ownership checks, player/admin DTO separation, input/output validation, source/provider trust boundaries, or secret handling for convenience. Default deny; least privilege; server-side enforcement; safe errors; dependency and URL scrutiny.

## 89. Player Payload Safety

Never send the full GamePackage, future questions/media clues, answers/aliases, fallback inventory, Fact/evidence internals, or selection traces to shared/player clients. Deliver one active presentation, reveal only at the allowed state, and assume network/browser inspection.

## 90. Development Shortcut Policy

Shortcuts must be explicit, reversible, scoped, tested, and compatible with canonical identity. Manual verified seeds and simple stored difficulty are valid. A permanent flat `questions.json` replacing Fact/Question/Exposure truth, live raw generation, or hidden provider coupling is not.

## 91. TODO Policy

Deferred work records the reason, intended later architecture/acceptance condition, relevant `GUESSENGINE-*` section, and owner/milestone when known. Avoid vague `TODO: fix later`, speculative TODO floods, or comments that conceal violated invariants.

## 92. Tech Debt Policy

Intentional MVP debt is named, bounded, risk-assessed, and tied to a trigger or milestone. Track architectural/security/data debt more strictly than cosmetic improvements. Unintentional drift, duplicated truth, missing authorization, and provider leakage are defects—not acceptable debt.

## 93. Codex Execution Boundary

Future Codex implementation work must:

1. Inspect the active repository/project and applicable instructions.
2. Read the relevant Guess Engine/UI specifications.
3. Identify one current milestone and acceptance criteria.
4. Preserve unrelated/user changes and stay project-scoped.
5. Make only milestone-sized changes with understandable architecture.
6. Validate input, errors, security, loading/empty states, and migrations as relevant.
7. Run proportionate tests/verification.
8. Report files, tests, caveats, and any deviations/risks.
9. Avoid unrelated cleanup, infrastructure expansion, or premature future phases.

Lack of Git, code, or a chosen stack is context to assess—not permission to invent everything or a reason to block valid documentation.

## 94. Codex Stop Conditions

Codex must **STOP and report before proceeding** if a proposed implementation requires or appears to require:

- a local model larger than normal library scale;
- a multi-gigabyte download or unexplained disk/RAM explosion;
- another database category, dedicated vector database, or search cluster;
- Kubernetes, a service mesh, or multiple new always-running services;
- destructive repository/schema/filesystem rewrite;
- paid/persistent cloud-resource creation or provider activation;
- third-party account creation;
- global system/toolchain configuration changes;
- major frontend/backend/framework replacement;
- an unreviewed giant/native/GPU dependency;
- weakening a hard quality, privacy, rights, or security invariant.

First gather read-only evidence, identify the exact boundary, explain alternatives/cost/reversibility, and request explicit approval. This section is binding.

## 95. Codex Autonomy Boundary

Codex may choose small, reversible, convention-aligned details such as helper names, internal module placement, test organization, ordinary data structures, and a modest utility dependency with clear current need. It may not independently choose providers, paid services, new datastore classes, major frameworks, distributed architecture, global configuration, destructive migration, or scope expansion outside these documents.

## 96. Deviation Record

Any necessary deviation records: exact spec/section; observed repository evidence; reason; alternatives considered; quality/security/resource effects; affected files/data; migration/rollback; reversibility; and approval when required. Put the record in the appropriate implementation/decision artifact. Never silently diverge or rewrite the source specification to hide divergence.

## 97. Review Gates

### Gate 1 — Canonical Core / Storage

One relational model, IDs/invariants, migrations/seeds, bilingual fixtures, and local tests are usable.

### Gate 2 — Question Bank / GamePackage

Eligible inventory queries, duplicate controls, package integrity/snapshots, and fallbacks work from manual seeds.

### Gate 3 — Runtime / Machine Memory

Board/dial flow, answer security, exposure/outcome, state versions, resume, and cross-category repetition work without providers.

### Gate 4 — Provider-assisted Foundry

One narrow adapter produces validated Questions from locked verified Facts with budgets/evaluation/fakes.

### Gate 5 — Custom Categories

Bounded scope→inventory manufacturing, privacy/safety, reuse, failure, and cancellation where needed are proven.

### Gate 6 — Richer Media

Rights, leakage, qualification, delivery, accessibility, prepared fallback, and cache bounds are proven.

Each gate must be independently useful/testable before the next sophistication begins.

## 98. MVP Resource Success Criteria

A healthy MVP runs comfortably on a normal laptop, needs no GPU or giant local model/corpus, uses one relational database and very few processes, starts quickly, runs default tests without paid calls, reveals prepared questions immediately, keeps storage/log/media ordinary and bounded, and remains understandable/debuggable by one developer.

## 99. Warning Signs

Overengineering is likely when nobody can explain each service; large RAM/disk is needed before users; every turn needs internet intelligence; multiple databases contain little data; local startup resembles a production cluster; provider SDK types spread across domain code; tests incur paid calls; simple changes require distributed coordination; folders mirror conceptual diagrams without behavior; or infrastructure work outpaces playable value.

## 100. Operating Constraint Invariants

1. No local heavyweight LLM for MVP.
2. No giant local knowledge corpus.
3. One relational database until proven otherwise.
4. No dedicated vector database for MVP.
5. No graph database for MVP.
6. No Elasticsearch/OpenSearch for MVP.
7. No Kubernetes/service mesh/Helm.
8. No microservices without demonstrated need.
9. No queue infrastructure before queued workload exists.
10. No heavyweight observability stack.
11. No paid/persistent cloud resources without approval.
12. No global/system modification without approval.
13. No destructive Git/filesystem/schema operation without approval and exact targets.
14. No future answers/package sent to shared/player clients.
15. No live question generation or acquisition after GAME READY.
16. No quality, safety, rights, or truth relaxation for latency/cost.
17. No provider secrets in source, Markdown, logs, or frontend.
18. No unrelated repository/project modifications.
19. No major framework rewrite without evidence and approval.
20. No giant/native/GPU dependency without review.
21. No infinite retry, generation, revalidation, or enrichment loop.
22. No uncontrolled web crawling or media hoarding.
23. No architecture cosplay or abstraction theater.
24. Keep the laptop cool.
25. No provider calls in default startup/tests.
26. No canonical truth stored only in a cache/derived index.
27. No destructive seed synchronization.
28. No full-table/corpus loading into RAM by default.
29. No expensive network/provider work in migrations/build/startup.
30. No specification phase blocked by absence of Git.

## 101. What This File Does Not Decide

This document defers exact RAM/disk/CPU thresholds, provider budgets, cloud host, database vendor, deployment topology, container strategy, CI/CD, monitoring provider, package manager, language/framework, job implementation, cache TTLs, concurrency numbers, timeout/retry values, and retention durations. Those choices must remain within these boundaries and follow measured need and the selected stack.

## 102. Follow-up Document

The next implementation-planning document should be `GUESSENGINE-TEST-PLAN.md`. It should define validation for canonical identity, storage, API authorization/answer security, Assembly/package integrity, runtime/dial state, exposure/outcomes, Machine Memory, difficulty, Arabic/English, custom categories, provider adapters, migrations, portability, resource limits, and failures. Do not create it during this task.

## 103. Operating Constraint Doctrine

1. Sophisticated product, boring infrastructure.
2. Logical subsystems are not services.
3. One machine should be able to build the Machine.
4. Keep the laptop cool.
5. No giant local models.
6. No giant knowledge dump.
7. No database zoo.
8. No service zoo.
9. No Kubernetes cosplay.
10. No provider SDK infestation.
11. External intelligence belongs at the edges.
12. Runtime stays lightweight.
13. Heavy work happens before gameplay.
14. Build only what current workload requires.
15. Measure before scaling.
16. Prefer reversible decisions.
17. Protect Git history when Git exists.
18. Protect the repository.
19. Protect the developer machine.
20. Stop before crossing major architecture boundaries.
21. The Guess Engine should be complex because trivia intelligence is complex, not because its infrastructure is.
