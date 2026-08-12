# Guess Machine / مخ ماشين

Guess Machine is a shared-screen multiplayer trivia machine. The current implementation is the first complete Guess Engine MVP: it prepares a full 12-question game from locally verified bilingual inventory, serves only prepared content during play, records durable Fact-level history, and suppresses repeats across Arabic and English games.

The product and architecture specifications remain in the root `GUESSENGINE-*.md` files. `GUESSENGINE-README.md` is the specification map; this file is the application runbook.

## Requirements

- Node.js 24 or newer.
- No package installation and no external service credentials are required for the MVP.

## Run locally

On Windows:

```text
npm.cmd run seed
npm.cmd start
```

On macOS/Linux, use `npm` in place of `npm.cmd`.

Open `http://localhost:3000`. The machine creates `data/guess-machine.sqlite` on first run and idempotently imports the bundled MVP inventory. The database and its sidecar files are intentionally ignored by Git.

Optional environment variable names:

- `PORT` changes the HTTP port (default `3000`).
- `GUESS_MACHINE_DB` changes the SQLite database path.

No `.env` file is required. Do not commit real credentials if provider-backed post-MVP work is enabled later.

## Test

```text
npm.cmd test
npm.cmd run test:core
npm.cmd run test:engine
npm.cmd run test:foundry
npm.cmd run test:api
```

The default suite is deterministic, local, and makes no paid or external provider calls. The release-critical golden test plays all 12 slots while global network access is forced to fail.

## Runtime shape

- `src/storage`: migrations, database opening, and idempotent seed import.
- `src/engine`: eligible inventory queries, package assembly, snapshots, diversity, fallbacks, runtime state, exposures, outcomes, and anti-repeat memory.
- `src/http`: same-origin JSON API and static application server.
- `public`: dependency-free bilingual shared-screen UI with the all-visible category board and one industrial 100/200/300 dial.
- `tests`: domain, storage, API/security, memory, fallback, UI-contract, and golden full-game tests.

Post-MVP modules also provide provider-neutral Reasoning/Search/Fetch ports, answer-locked draft assistance, deterministic quality review, fetched-evidence Fact verification, a human-approved Question Foundry, bounded replenishment, difficulty-data auditing, and custom-category scope/map/manufacturing workflows. They are not exposed as public player endpoints and remain disabled unless explicitly composed by trusted internal tooling.

The host token is required for all state-changing and answer-reveal operations. The display token can read only safe board/question views. Future questions, package internals, answers, evidence, and canonical IDs are not serialized to the shared display.

## Operational checks

- `GET /api/health` returns the local engine health signal.
- A game must be fully prepared before category/difficulty activation.
- Exposure is written when a question becomes visible, not during package preparation.
- If a prepared primary becomes ineligible before presentation, the machine uses its prepared qualified fallback. It never generates an emergency live question.
- Removing `data/guess-machine.sqlite` creates a fresh local database on the next start; do this only when intentionally discarding local game history.

## MVP content caveat

The bundled 36-Fact bilingual inventory is implementation and acceptance-test stock. It includes evidence and validation records, but it still requires a formal editorial/source review before a public production release. Runtime quality gates must not be weakened to compensate for thin inventory.

## Advanced-feature boundaries

- Provider-backed manufacturing is disabled by default; only deterministic fakes are configured in tests.
- The Foundry cannot publish without a named human approval after deterministic quality passes.
- Difficulty calibration is not enabled because representative production outcome data does not exist yet.
- Rich media is not enabled because no reviewed source, rights, territory, attribution, delivery, and accessibility plan has been approved. Text remains the complete fallback product.
