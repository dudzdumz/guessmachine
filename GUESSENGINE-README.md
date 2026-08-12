# Guess Engine Documentation Map

## 0. What This Is

Guess Engine is the knowledge, question, selection, and game-runtime engine behind Guess Machine / مخ ماشين. It is not merely an LLM question generator. It combines canonical FactRecords, evidence and validation, Questions and language Variants, Question Bank, Difficulty, Machine Memory, Custom Categories, Media, Game Assembly, and prepared GamePackages.

The player experience stays simple:

```text
choose categories → choose difficulty → THUNK → question
```

The complexity stays behind the Machine.

## 1. Document Set

### Foundational Architecture

1. [`GUESSENGINE-1.md`](GUESSENGINE-1.md) — foundational product/system architecture and core Engine doctrine.
2. [`GUESSENGINE-2.md`](GUESSENGINE-2.md) — canonical domain model, identity, and Engine contracts.
3. [`GUESSENGINE-3.md`](GUESSENGINE-3.md) — staged Question Foundry and manufacturing pipeline.
4. [`GUESSENGINE-4.md`](GUESSENGINE-4.md) — knowledge acquisition, retrieval, evidence, and factual verification.
5. [`GUESSENGINE-5.md`](GUESSENGINE-5.md) — difficulty prediction, calibration, and adaptive challenge.
6. [`GUESSENGINE-6.md`](GUESSENGINE-6.md) — Machine Memory, persistent learning, and bounded personalization.
7. [`GUESSENGINE-7.md`](GUESSENGINE-7.md) — Custom Category interpretation and on-demand knowledge manufacturing.
8. [`GUESSENGINE-8.md`](GUESSENGINE-8.md) — Media Engine, multimodal questions, rights, qualification, and fallback.
9. [`GUESSENGINE-9.md`](GUESSENGINE-9.md) — Game Assembly, prepared runtime orchestration, and Engine convergence.

### Implementation Packet

- [`GUESSENGINE-MVP-IMPLEMENTATION.md`](GUESSENGINE-MVP-IMPLEMENTATION.md) — minimum trustworthy playable Engine scope and initial milestones.
- [`GUESSENGINE-STORAGE-DESIGN.md`](GUESSENGINE-STORAGE-DESIGN.md) — relational persistence, canonical identity, snapshots, exposure, and transactions.
- [`GUESSENGINE-API-CONTRACTS.md`](GUESSENGINE-API-CONTRACTS.md) — transport-neutral client/internal intents, state transitions, and trust boundaries.
- [`GUESSENGINE-PROVIDER-STRATEGY.md`](GUESSENGINE-PROVIDER-STRATEGY.md) — replaceable external capabilities, evidence boundaries, failures, and cost control.
- [`GUESSENGINE-OPERATING-CONSTRAINTS.md`](GUESSENGINE-OPERATING-CONSTRAINTS.md) — hard resource, infrastructure, repository, and implementation safety limits.
- [`GUESSENGINE-TEST-PLAN.md`](GUESSENGINE-TEST-PLAN.md) — invariant-driven test layers, fixtures, failure cases, and golden Engine proofs.
- [`GUESSENGINE-IMPLEMENTATION-PLAN.md`](GUESSENGINE-IMPLEMENTATION-PLAN.md) — exact milestone construction order from audit through mature media.
- [`GUESSENGINE-CODEX-HANDOFF.md`](GUESSENGINE-CODEX-HANDOFF.md) — authoritative Codex execution protocol, autonomy boundary, and stop rules.

## 2. Reading Order for Implementation

```text
GUESSENGINE-README.md
↓
GUESSENGINE-CODEX-HANDOFF.md
↓
GUESSENGINE-OPERATING-CONSTRAINTS.md
↓
GUESSENGINE-IMPLEMENTATION-PLAN.md
↓
GUESSENGINE-MVP-IMPLEMENTATION.md
↓
relevant storage / API / test / provider specifications
↓
relevant foundational GUESSENGINE documents
↓
inspect repository
↓
implement current milestone
```

The handoff contains the authoritative execution protocol. Every milestone must also read its specific governing sections.

## 3. Where Implementation Starts

> Initial implementation begins with Milestone 0 — Implementation Readiness Audit.

Milestone 0 is defined in [`GUESSENGINE-IMPLEMENTATION-PLAN.md`](GUESSENGINE-IMPLEMENTATION-PLAN.md). After its gate passes, proceed milestone by milestone. Do not start with providers, Question Foundry, automatic Custom Categories, embeddings, or rich Media.

## 4. The MVP Path

```text
Repository Audit
→ Canonical Core
→ Evidence / Knowledge Structure
→ Seed Inventory
→ Question Bank
→ GamePackage Storage
→ Game Assembly
→ Runtime Contracts
→ UI / Dial Integration
→ Outcomes + Exposures
→ Machine Memory v1
→ Diversity
→ Fallback Hardening
→ MVP Hardening
```

This prepared, bilingual, remembering trivia runtime is the first major target.

## 5. Post-MVP Path

```text
Provider Adapters
→ Question Writing Automation
→ Search / Fetch
→ Fact Verification
→ Question Foundry
→ Inventory Replenishment
→ Difficulty Calibration
→ Machine Memory v2
→ Automatic Custom Categories
→ Custom Category Continuity
→ Rich Media
```

Mature capabilities grow from the same canonical core; they do not replace it or make runtime provider-dependent.

## 6. Non-negotiable Engine Rules

1. Facts first, Questions second.
2. Models are not evidence.
3. FactRecord is canonical knowledge identity.
4. Arabic and English Variants share one FactRecord.
5. Exposure follows `fact_id`, not wording.
6. Question Bank contains prepared eligible Questions.
7. Game Assembly creates a prepared GamePackage.
8. Live gameplay consumes prepared slots.
9. No normal question generation after `GAME READY`.
10. Machine Memory retains game-relevant history, not personality profiles.
11. Custom Categories use the same canonical pipeline.
12. Weak evidence means fewer Questions, not invented Facts.
13. Providers are replaceable capabilities.
14. Media serves knowledge and has qualified fallbacks.
15. Quality beats inventory.

## 7. Non-negotiable Implementation Rules

[`GUESSENGINE-OPERATING-CONSTRAINTS.md`](GUESSENGINE-OPERATING-CONSTRAINTS.md) is binding. Keep development laptop-friendly; start with a modular monolith and one relational database; use no heavyweight local LLM/corpus, dedicated vector or graph database, Elasticsearch/OpenSearch, Kubernetes, microservice-per-subsystem, or service zoo for MVP. Do not create paid/cloud resources or perform destructive Git/filesystem work without approval. Preserve the all-visible category board, industrial dial, 100/200/300 detents, THUNK rhythm, and Guess Machine identity. Stop on major architecture or resource surprises.

## 8. Runtime Doctrine

> Live gameplay consumes prepared goods.

> Once GAME READY appears, the Machine should already know what it is going to serve.

The rotary dial does not trigger generation. It activates a prepared GameQuestionSlot. Provider outages after readiness should normally be irrelevant to game night.

## 9. First Engine Proof

```text
Fact
→ Question
→ Question Bank
→ Game Assembly
→ GamePackage
→ Runtime
→ Exposure
→ PlayerOutcome
→ next GamePackage avoids prior Fact
```

When this works across wording, categories, and languages, Guess Engine has a real heartbeat.

## 10. The “Infinite Questions” Meaning

“Infinite Questions” does **not** mean making an LLM call whenever the player presses the dial. It means reusable verified knowledge, an expanding approved Question Bank, Fact-level memory, bounded replenishment, Custom Category manufacturing, safe Question variation, and adaptive selection. The experience becomes effectively inexhaustible while remaining prepared and trustworthy.

## 11. Codex Execution Entry

When the user says **“let it rip,”** Codex follows [`GUESSENGINE-CODEX-HANDOFF.md`](GUESSENGINE-CODEX-HANDOFF.md):

```text
READ → INSPECT → MILESTONE 0 → IMPLEMENT → TEST → REPORT → NEXT MILESTONE
```

Continue only while gates pass, authorization remains clear, and no stop condition triggers.

## 12. Stop Conditions

See [`GUESSENGINE-OPERATING-CONSTRAINTS.md`](GUESSENGINE-OPERATING-CONSTRAINTS.md) and [`GUESSENGINE-CODEX-HANDOFF.md`](GUESSENGINE-CODEX-HANDOFF.md). Stop and report before a heavyweight local model or multi-gigabyte download; new datastore category/vector DB/graph DB/Elasticsearch; Kubernetes/services; framework rewrite; destructive repository/data operation; paid cloud/provider resource; global system change; major specification contradiction; or unexplained resource explosion.

## 13. Implementation Reporting

At each milestone report: milestone/status, implemented behavior, files changed, tests and results, known limitations, deferred work, specification deviations, dependency/infrastructure/resource impact, rollback note, and recommended next milestone. Never use vague “done” or claim unverified success.

## 14. Document Precedence

Current explicit user instruction comes first. [`GUESSENGINE-CODEX-HANDOFF.md`](GUESSENGINE-CODEX-HANDOFF.md) defines authoritative precedence and contradiction handling. Higher implementation documents may narrow timing and scope but do not casually override Fact identity, evidence, prepared runtime, answer security, or other foundational doctrine.

## 15. Current Status

```text
FOUNDATIONAL ARCHITECTURE: COMPLETE
IMPLEMENTATION SPECIFICATIONS: COMPLETE
IMPLEMENTATION: NOT YET STARTED
STARTING MILESTONE: 0 — IMPLEMENTATION READINESS AUDIT
```

The current project remains a specification-only, non-Git workspace; future Milestone 0 must verify the repository state again.

## 16. Final Orientation

> The architecture describes the Machine.  
> The implementation packet describes how to build it.  
> The handoff describes how Codex must behave while building it.

Start with the handoff. Start implementation at Milestone 0. Build one validated layer at a time.

The first goal is not maximum automation. The first goal is one excellent prepared question going **THUNK** exactly when the player asks for it.
