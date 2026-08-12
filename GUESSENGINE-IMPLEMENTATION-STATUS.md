# Guess Engine Implementation Status

## Current status

- **Authorization:** Full milestone-by-milestone implementation authorized.
- **MVP phase:** Complete through Milestone 13.
- **Current phase:** Post-MVP complete through Milestone 28 local/fake gates; stopped before media.
- **Repository:** Git `main`, tracking `origin/main`; implementation changes are currently uncommitted.
- **Stop conditions:** None triggered for the local MVP.

## Foundation decision

- Node.js 24 modular monolith.
- Node built-in HTTP server and SQLite storage.
- Node built-in test runner.
- Vanilla bilingual HTML/CSS/JavaScript frontend.
- No third-party runtime or development dependencies.
- One application process and one project-local relational database.

## Completed milestone gates

| Milestone | Delivered proof |
|---|---|
| 0 | Specification audit, stack lock, repository and safety preflight. |
| 1 | Canonical relational core, migrations, normalization, deterministic IDs/fingerprints. |
| 2–3 | Fact/evidence/validation spine and 36-Fact, 72-Variant bilingual MVP inventory. |
| 4 | Question Bank with language, difficulty, lifecycle, freshness, validation, evidence, answer, and exclusion gates. |
| 5–6 | Game/Package/Slot storage, immutable presentation snapshots, deterministic 12-slot assembly, prepared fallbacks. |
| 7 | Secure host/display contracts, answer protection, version conflicts, idempotent runtime transitions. |
| 8 | Shared-screen board with every category visible and one tactile 100/200/300 rotary control; manually exercised in-browser. |
| 9–10 | Transactional exposures/outcomes and cross-game/cross-language Fact-level anti-repeat memory. |
| 11–12 | Node/entity diversity, post-preparation eligibility checks, fallback reality, package expiry, safe no-content failure. |
| 13 | Full 12-slot provider-offline golden game, resume proof, complete automated suite, runbook and health endpoint. |

## Locked MVP invariants

1. A canonical Fact is the anti-repeat identity across categories, languages, wordings, versions, and media treatments.
2. Hidden prepared content is not exposure; visible unanswered content is exposure.
3. Outcomes and scores bind to the server-owned served snapshot and cannot accept caller-supplied canonical IDs or score deltas.
4. Live activation never calls a generation, search, fetch, embedding, or media-discovery provider.
5. A quarantined/ineligible primary either uses a qualified prepared fallback or fails before presentation.
6. Shared/display responses never contain answers before reveal, future questions, fallback stock, canonical Fact IDs, evidence, or ranking traces.
7. Arabic and English are native stored variants, not runtime machine translations.

## Commands

```text
npm.cmd run seed
npm.cmd test
npm.cmd start
```

See `README.md` for the application runbook and `GUESSENGINE-README.md` for the complete specification map.

## Intentionally deferred beyond MVP

- Live provider credentials, paid calls, and configured real-adapter smoke tests.
- Production editorial approval of bundled inventory.
- Empirical difficulty calibration, which requires sufficient representative clean play samples. The Milestone 21 audit correctly reports `insufficient_data`; Milestone 22 is not started.
- Rich media acquisition/delivery and licensing operations.
- Production identity/authentication, deployment, backups, telemetry, and moderation console.

## Post-MVP implementation gates

| Milestone | Status | Evidence |
|---|---|---|
| 14 | Local boundary complete; real smoke blocked | Provider-neutral Reasoning/Search/Fetch router, deterministic fakes, normalized errors/usage, persistent redacted run audit, disabled by default. |
| 15 | Complete against fake | Answer-locked bilingual draft writing; malformed/oversized/answer-changing output rejected; review-only persistence. |
| 16 | Complete | Deterministic bilingual quality checks for script, length, question form, answer leakage, machine language, ambiguity, aliases, and duplicate wording. |
| 17 | Local boundary complete; real evaluation blocked | Bounded Search/Fetch ports, private-target rejection, capped results/bodies, snippets marked non-evidentiary. |
| 18 | Complete against fake acquisition | Trusted-host fetched evidence can promote one canonical Fact; unsupported candidates remain rejected; fingerprints are idempotent. |
| 19 | Complete against fake | Foundry composes writing/quality/named human approval/publication with persistent audit events. |
| 20 | Complete against fake | Exact deduplicated inventory demands replenish only to target and then stop. |
| 21 | Audit complete; gate blocked | Inclusion/exclusion/cohort audit exists and reports insufficient representative data without calibration. |
| 22 | Not started | Correctly blocked by Milestone 21’s insufficient-data gate. |
| 23 | Not started | Requires stable reviewed real outcome data; MVP Fact memory remains authoritative. |
| 24 | Complete | Owned manually ready custom category uses ordinary package/runtime/exposure/memory and enforces ownership/retirement. |
| 25 | Complete against fake | Safe bounded Arabic/English scope interpretation, clarification, preservation, and injection rejection. |
| 26 | Complete against fake | Persisted viable KnowledgeMap with bounded branches, difficulty capacity, and source plans; no Fact/Question creation. |
| 27 | Complete against fake | Nine-item custom manufacture through ordinary retrieval/verification/quality/human-review gates within an exact provider-call budget. |
| 28 | Complete against fake | Second custom use reuses saved scope/map/evidence/inventory, suppresses prior Fact, and makes zero new provider calls. |
| 29+ | Stopped before start | Media needs a reviewed rights/source/delivery plan and dated evaluation. None exists, so text fallback remains the safe product boundary. |

No live provider should be selected or called until credentials, budget, terms/privacy review, and an explicit production provider decision exist. No rich-media milestone should begin until provenance, territory, license, attribution, delivery, accessibility, and fallback policy are reviewed with an actual permitted asset source.
