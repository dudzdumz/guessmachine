# Guess Engine Test Plan

## 0. Purpose

This is the sixth implementation-planning document for Guess Engine. Tests must prove code behavior **and system doctrine**: one Fact persists across categories/languages/wording; semantic repeats stay suppressed; future answers remain secret; runtime never drops into raw generation; broken media does not poison calibration; Machine Memory improves the next game; custom categories converge on ordinary runtime; and Arabic remains first-class.

The plan is binding with `GUESSENGINE-1.md` through `GUESSENGINE-9.md`, the MVP plan, storage design, API contracts, provider strategy, and operating constraints. It specifies capabilities and acceptance, not a test framework.

## 1. Testing Principles

1. Test invariants before implementation details.
2. Prefer deterministic tests.
3. Keep ordinary tests provider-independent.
4. Use small realistic curated fixtures.
5. Require an end-to-end core-loop proof.
6. Add regression coverage for serious bugs.
7. Inject failure intentionally.
8. Test canonical identity across representations.
9. Test authorization at the server boundary.
10. Test retries, idempotency, and concurrency.
11. Test Arabic and English explicitly.
12. Test stale/current content with a controlled clock.
13. Test Machine Memory across games.
14. Test runtime with intelligence providers unavailable.
15. Avoid giant synthetic datasets for correctness.
16. Keep the suite comfortable on a normal laptop.

## 2. Test Layers

| Layer | Proves |
|---|---|
| Domain / unit | Pure identity, normalization, eligibility, ranking/state rules |
| Storage integration | Constraints, transactions, migrations, joins, snapshots |
| API contract | Intent payloads, authorization, DTO separation, errors, versions |
| Engine integration | Question Bank → Assembly → Package → runtime → Memory |
| Provider adapter | Normalization/failure/budget behavior through fakes/recordings |
| End-to-end | Realistic full game across actual internal boundaries |
| Manual / UX | Dial, group board, bilingual layout, sound/motion/media quality |
| Load / scale | Deferred until meaningful measured workload |

Do not replace a lower-layer semantic test with a brittle UI test or mock away the subsystem under test.

## 3. Test Environment

MVP testing uses a local isolated relational test database, curated fixtures, fake provider/media adapters, controllable clock/randomness, and local application runtime. The core suite requires no GPU, local LLM, giant corpus, internet, cloud, or paid API. Provider-live tests, if later needed, are explicit opt-in jobs with small budgets and never block ordinary local development.

## 4. Fixture Philosophy

Fixtures are human-reviewable, stable, versioned with contracts, bilingual where useful, and use fixed canonical IDs. Each exists to prove a named behavior. Prefer dozens of purposeful records over thousands of random ones. Builders may reduce repetition, but checked-in expected semantics must remain obvious.

## 5. Core Fixture Set

Maintain compact inventory for Football, Movies/TV, Music, Games, Geography, and Oman/GCC. Each playable category includes eligible 100/200/300 questions; selected Facts have independently authored Arabic/English variants and accepted answers. Include multiple nodes/entities/formats so diversity can be observed without a huge dataset.

## 6. Special Fixtures

Include: one Fact with multiple Variants; cross-category and Arabic/English links; related-but-distinct Facts; exact/paraphrased duplicates; stale current Fact; quarantined Question; missing language/answer; media failure and fallback; dispute; custom-category link; low-confidence difficulty; prior exposure; conflicting evidence; package expiry; and one invalid lifecycle transition. Each fixture documents expected eligibility and why.

## 7. Golden Fact Fixtures

Maintain a few immutable “golden” graphs with exact Category/Node/Entity/Fact/Evidence/Question/Variant/Answer relationships. The Iniesta 2010 winning-goal Fact is suitable: Football plus custom membership, Arabic/English wording and aliases, evidence, 200 assessment, exposure, and fallback. Reuse golden graphs for joins, identity, suppression, snapshots, and DTO tests.

## 8. Fact Identity Tests

Assert one `fact_id` across category memberships, Arabic/English presentation, and wording revisions. A different predicate about the same event may be a distinct Fact with explicit relationship. Same-Fact fallback creates one exposure; exact fingerprint collision/duplicate promotion is rejected or merged according to policy.

## 9. Question Identity Tests

Every Question references exactly one Fact and every Variant one Question. A semantic-equivalent wording revision remains the same Question/version lineage; a different QuestionIntent may create another Question for that same Fact. Variant IDs never become Fact identity or memory keys.

## 10. Category Relationship Tests

Link one Fact to built-in and custom categories without copying it. Retiring/removing membership does not delete the Fact or history. Exposure under one membership suppresses the Fact through another where memory policy applies. Ownership filters protect account custom links.

## 11. Knowledge Node Tests

Test parent/child validity, cycle prevention if hierarchy requires it, Fact-node links, branch queries, diversity selection, and node retirement without canonical Fact deletion. Prove relational adjacency is sufficient; tests must not assume a graph database.

## 12. Entity Tests

Test canonical reuse, English/Arabic names, aliases/transliterations, normalization, external IDs as noncanonical, Fact relation roles, ambiguous alias rejection, and later entity-saturation scoring. One person with multiple spellings remains one Entity.

## 13. Source Evidence Tests

Test provenance/timestamps/trust-policy fields, multiple evidence rows, supported claim granularity, contradiction preservation, invalid/uninspectable source behavior, and source correction. Required missing/invalid evidence blocks eligibility. Evidence/internal notes never appear in player DTOs.

## 14. Validation Tests

Verified Facts meeting policy become eligible; candidate/rejected/stale/unresolved contradiction do not. Revalidation appends history and may restore eligibility without erasing prior results. Test actor/method/version/confidence and manual override audit where supported.

## 15. Current Fact Tests

With a controllable clock, assert eligibility within `valid_from`/`valid_until`, ineligibility after expiry, revalidation restoration, and stable historical unaffected behavior. Package assembly uses its as-of time; no sleeping or wall-clock flakiness.

## 16. Question Lifecycle Tests

Exercise `candidate`, `approved`, `available`, `quarantined`, `retired`, and `rejected` transitions, including forbidden jumps and audit. Only eligible available states enter Question Bank/new packages. Historical package snapshots remain readable after quarantine/retirement.

## 17. Question Variant Tests

Arabic games select approved Arabic variants; English games select English. Missing requested language makes that candidate ineligible unless a documented product fallback exists. Editing/versioning one language leaves the other unchanged, and completed GameSlots preserve the served version snapshot.

## 18. Accepted Answer Tests

Test canonical display answer, reviewed aliases, transliteration, Arabic/English forms, spacing/case/punctuation normalization, and rejected confusables or overly broad answers. Empty answer sets fail eligibility. Host scoring may remain manual, but stored answer integrity and privilege rules are mandatory.

## 19. Arabic Normalization Tests

Cover diacritics, tatweel, hamza/alef and yaa variants according to versioned policy, Arabic-Indic/Western digits, whitespace, punctuation, mixed scripts, and transliteration. Matching uses derived normalized forms while stored display/source text round-trips byte/Unicode-correct and unchanged.

## 20. English Normalization Tests

Cover case-folding, repeated/edge whitespace, punctuation policy, common reviewed aliases, apostrophes/hyphens, accents where relevant, and Unicode normalization. Do not accept a different answer merely because aggressive normalization collapses it.

## 21. Difficulty Storage Tests

Accept only public values 100/200/300; reject invalid values. Test intended/predicted/calibrated/effective optionality, confidence/version, controlled override/audit, and snapshot preservation. Missing required MVP difficulty makes a slot candidate ineligible.

## 22. Difficulty Integrity Tests

Provide clearly classified 100 and 300 candidates and assert the assembler does not swap them into wrong slots. Test low-confidence handling and fallback compatibility. Later calibrated/effective difficulty may change ranking, not historical snapshots or Fact truth.

## 23. Question Bank Eligibility Tests

Query by category, difficulty, language, lifecycle, validity, evidence/validation, and exclusions. Assert only complete eligible presentation records return, with stable compact descriptors rather than raw storage graphs. Ordering/tie-breaks are deterministic under a test seed.

## 24. Question Bank Exclusion Tests

Exclude Fact IDs as hard memory/within-package rules and Question IDs when needed. Also exclude stale Facts, quarantined/retired Questions, missing variants/answers, invalid media usage, account-ineligible custom links, and already reserved/used slots. Verify exclusions compose rather than overwrite.

## 25. Duplicate Fact Tests

Within one package, a `fact_id` can appear at most once across categories, questions, variants, primaries, and different-Fact fallbacks as policy requires. Test application rejection and database uniqueness/transaction behavior where modeled. The package never becomes ready on violation.

## 26. Paraphrase Repeat Test

Fixture Variants ask the same Fact with visibly different wording. After an account/group sees one, next Assembly must suppress the other at Fact level. This flagship regression test must exercise real Question Bank/memory filtering—not a mocked final candidate list.

## 27. Cross-language Repeat Test

Serve Fact A in Arabic, persist exposure, prepare English game, and assert all English Questions/Variants for Fact A are suppressed under current cooldown policy. Exact-variant exposure may differ, but canonical Fact memory wins.

## 28. Cross-category Repeat Test

Serve a Fact under Football, then assemble a custom Barcelona category containing the same Fact. It must remain excluded even though membership/display changes. Confirm unrelated Facts sharing an Entity are penalized/diversified, not automatically treated identical.

## 29. Game Creation Tests

Test valid teams/category IDs/language/region/mode/accessibility; duplicate/invalid teams; unauthorized custom category; unsupported language/mode; empty/excess selections per rules; and idempotent retries. Result creates draft/awaiting-preparation state without questions.

## 30. Game Preparation Tests

Exercise preparing→ready, insufficient inventory→failed, package retry idempotency, duplicate/stale filtering, Machine Memory input, custom readiness, media preparation, and progress-safe stages. A ready result always points to a complete integrity-valid package; failures reveal no provider internals.

## 31. GamePackage Tests

Validate exact required slot shape/count, unique Facts, category/difficulty/language coverage, prepared fallbacks, snapshots, expiry/status/version, selection provenance internally, and no exposure before serve. Package serialization remains server-side.

## 32. GamePackage Snapshot Test

Create package, then edit/replace canonical QuestionVariant/answer/difficulty/media metadata. Assert its GameSlot retains exact question text, answer display, language, difficulty, and media-use snapshot for play/audit. Future packages receive the new version.

## 33. GamePackage Invalidation Test

Quarantine a Question after preparation but before serving. According to state/policy, activate a qualified fallback, rebuild before start, or invalidate/fail safely. Assert no raw generation, no invalid primary exposure, and no partially ready state.

## 34. Fallback Packing Tests

Media-dependent/required slots contain ordered qualified fallbacks where policy requires. Each fallback is eligible, correct category/difficulty/language, nonleaking, and does not create an avoidable duplicate Fact elsewhere. Package integrity rejects unqualified fallback chains/cycles.

## 35. Fallback Activation Test

Inject primary availability failure before presentation. Engine atomically serves fallback, returns only safe fallback view, records reason, and binds exposure/outcome to actual content. Board/turn/scoring continues consistently and no provider is called.

## 36. Same-Fact Fallback Test

Primary media Variant fails and prepared text fallback asks the same Fact. Assert one activation and one Fact exposure, actual Variant/presentation recorded, no abandoned-media outcome, and package uniqueness still interprets both as one knowledge unit.

## 37. Different-Fact Fallback Test

When policy permits a fallback using Fact B, inject failure before Fact A is shown. Assert Fact B/Question/Variant are the served snapshot/exposure/outcome; Fact A is not exposed; diversity/used-slot state remains coherent; and retry returns the same fallback.

## 38. Board State Tests

Assert categories remain simultaneously represented, difficulty status is `available/selected/used/disabled`, active team/scores/status/version are authoritative, and used values cannot engage. Active safe summary appears only when allowed. No future question, answer, fallback, Fact/Variant ID, or selection trace leaks.

## 39. Rotary Dial Contract Test

Simulate select category → choose 200 → center-press ActivateSlot → active prepared question → reveal/outcome → Football 200 used → next-team/reset state. Assert activation makes zero generation calls, direct click/keyboard routes enforce identical availability, and duplicate press is idempotent/conflicted safely.

## 40. Slot Activation Tests

Cover valid activation, wrong/inactive team, wrong/unselected category, invalid/used/disabled difficulty, package not ready/expired, another active slot, stale state, repeated key, conflicting key intent, and concurrent double-click. Exactly one slot/exposure is created on success.

## 41. Active Question Security Test

Automated negative assertions recursively verify shared/player payload contains no answer/aliases, future questions/IDs, fallback inventory, evidence/source notes, FactRecord, quality/ranking/selection reason, or answer-bearing media filename/metadata. Deny-by-default DTO mapping is tested when internal objects gain fields.

## 42. Answer Reveal Test

Before reveal, host/shared attempts cannot access display or accepted answers. Valid reveal of active slot returns allowed answer view and state/version, without correctness mutation or future answers. Repeated reveal is idempotent; wrong/completed/other-game slot fails safely.

## 43. Host vs Shared View Test

Use separate capabilities against the same game. Host may perform allowed transitions and receive post-reveal adjudication guidance; display remains read-only/presentation-safe. Server authorization—not hidden UI—blocks display mutation, answer endpoints, cross-game token use, and admin details.

## 44. Record Outcome Tests

Exercise correct, incorrect, skipped, voided, and disputed outcomes plus allowed override/technical failure. Validate reveal/state rules, team, score delta, turn, slot completion, audit, and actual served canonical bindings. Caller-supplied Fact/score cannot override server truth.

## 45. Outcome Idempotency Test

Submit identical outcome twice with the same actor/key, including simulated timeout after commit. Assert one durable outcome, score delta, completion, turn advance, event, and projection contribution. Same key with different outcome returns idempotency conflict.

## 46. Exposure Creation Test

Exposure is created transactionally when a safe question becomes visible. Assert none at package build, board read, client media preload, hidden-slot existence, or failed pre-presentation primary. Activation retry does not create another exposure.

## 47. Unanswered Exposure Test

Serve a question, record no outcome, then disconnect/abandon. Fact remains exposed with served time/actual IDs and affects next Assembly. No fabricated correctness result is created.

## 48. Abandoned Game Test

Abandon from draft, prepared, active, and post-outcome states as allowed. Served Facts remain exposures; hidden slots remain unexposed; resolved outcomes remain; unserved slots gain no fake outcomes. Terminal/idempotent behavior and resume policy are explicit.

## 49. Complete Game Test

Validate permitted completion conditions, terminal status/time, final authoritative scores, resolved/void counts, post-game event/projection trigger, immutable served history, and idempotent retry. Further activation/outcome mutation is rejected unless an explicit correction contract exists.

## 50. Resume Test

Interrupt at ready, active-unrevealed, revealed, and between turns. Read/resume restores teams, scores, used slots, active team/question stage, permitted actions, and version from server state. Returning the already active presentation creates no second exposure.

## 51. State Version Test

Two clients read version N; one commits N+1. The stale mutation fails/reconciles and cannot overwrite state. Reads/live updates converge on authoritative version. Versions increment once per successful semantic mutation, not per idempotent replay.

## 52. Double Slot Activation Test

Coordinate two near-simultaneous activation requests for the same or competing slots. Exactly one wins; the other gets current-state conflict/already-active. Assert one slot selection, snapshot, exposure, score opportunity, and state increment, using real transaction/constraint behavior.

## 53. Score Idempotency Test

Retry correct/incorrect/void/dispute requests across timeout and concurrent delivery. Authoritative total changes at most once and equals recomputed permitted deltas. The client cannot submit a total or replay a key for another slot/team.

## 54. Machine Memory Cold Start Test

New account/group yields no historical Fact exclusions, uses canonical difficulty, and assembles a diverse package from eligible inventory. Empty/absent projection and memory-service failure are distinguished; no invented preference/profile appears.

## 55. Machine Memory First Return Test

Play Game 1 and expose several Facts. Prepare Game 2 for the same account/group and assert recent Facts are excluded wherever inventory permits, while unseen eligible alternatives fill slots. This is MVP’s flagship retention/memory proof and runs through durable exposure.

## 56. Machine Memory Fact-level Test

After a Fact exposure, new Question, new Variant/version, alternate wording, or alternate media for the same Fact remains suppressed. Exact-variant history supplements diagnostics only. A related distinct Fact remains eligible subject to diversity penalties.

## 57. Machine Memory Category History Test

Persist/query selected and played category history, counts, recency, and saved custom usage according to minimal policy. Assert summaries derive only from actual game data and do not infer personalities or mutate exclusions arbitrarily.

## 58. Machine Memory Difficulty History Test

Outcomes by 100/200/300, language/region/group context, disputes, skips, and technical failures can be projected with correct inclusion rules. MVP need not calibrate; test raw durable inputs and ensure broken/void media is not clean evidence.

## 59. Machine Memory Failure Test

Make the memory-context projection unavailable during preparation. Assembly uses canonical defaults/available session exclusions, records degraded status, and can produce a valid package without crashing or leaking repeats within the game. It does not erase durable exposure history.

## 60. Diversity Tests

With alternatives, assert Assembly avoids avoidable concentration in Entity, topic/KnowledgeNode, era, and format while satisfying hard constraints. Use deterministic seed and accept a documented score/range rather than mathematically perfect balance. Hard identity/eligibility always outranks diversity.

## 61. Entity Saturation Test

Offer many top-ranked Messi Questions and adequate other Football entities. The selected package must not be dominated beyond configured fixture expectation. If alternatives become ineligible, assert explicit constraint relaxation/trace rather than a mysterious failure.

## 62. Topic Saturation Test

Offer many World Cup Final Facts plus club, player, rules, regional, and historical branches. Assert package distributes avoidable concentration across KnowledgeNodes and does not mistake category membership for topic diversity.

## 63. Difficulty Balance Test

For each category, ensure intended 100/200/300 slots receive eligible matching assessments and a meaningful fixture separation. Detect swapped labels, missing-level substitution, and fallback mismatch. Later calibration tests are version/cohort-aware.

## 64. Fairness Tests

Given comparable choices, teams should not receive obvious large stored-difficulty/quality imbalance because of ordering or fallback. MVP tests canonical values and deterministic assignment. Later tests add effective difficulty/confidence cohorts without exposing personalization or guaranteeing perfect symmetry.

## 65. Custom Category Contract Test

A manually seeded CustomCategoryDefinition uses the same Category/Fact/Question/Variant/Package/Slot/runtime contracts as built-ins. Assert ownership/readiness at setup, ordinary activation/outcome, no custom-only runtime branch, and no manufacturing provider call during play.

## 66. Custom Category Reuse Test

Link a canonical Fact to built-in and saved custom scopes. Serving through either creates shared Fact memory, and preparation reuses verified Fact/question inventory rather than duplicating or re-manufacturing. Removing ownership does not delete global canonical/history.

## 67. Custom Category Safety Test

With a fake interpreter, submit prompt-injection-like scope, oversized input, private-person/sensitive examples, and mixed Arabic/English instructions. Treat text only as data, enforce normalization/moderation/limits, expose no secrets/tools, and prevent lifecycle/storage bypass.

## 68. Custom Category Failure Test

When scope is ambiguous, unsupported, unsafe, too narrow, or lacks verified inventory within budget, return clarification/limited/failure state. Do not fabricate slots, expose provider detail, leave a package ready, or run indefinitely. Repeated submission respects idempotency.

## 69. Provider Adapter Unit Tests

Using fakes/recorded synthetic fixtures, test request mapping, normalized DTO, structured validation, timeout, malformed/oversized output, authentication, rate limit/quota, policy block, outage, fallback route, cancellation, prompt/source injection handling, usage/cost hooks, and redaction. No paid calls.

## 70. Provider Isolation Test

Swap two fake Reasoning/Search adapters with different raw shapes but identical normalized behavior. Canonical domain, pipeline tests, storage, GamePackage, and player API remain unchanged; provider types/IDs cannot appear in Fact/Game objects or shared DTOs.

## 71. Model-as-not-evidence Test

Fake model emits a fluent confident unsupported claim/citation. Pipeline may retain a FactCandidate but cannot promote verified Fact or approved Question without qualified SourceEvidence and validation. Repeating or escalating the claim never counts as corroboration.

## 72. Search-snippet Test

Fake search result snippet supports a claim while source fetch is unavailable and policy requires inspection. Validation fails/defers and records retrieval status; snippet alone is not durable evidence. A different inspectable authoritative source may allow normal validation.

## 73. Provider Failure After Game Ready Test

Prepare a valid package, then make every reasoning/search/fetch/embedding/media-discovery adapter throw. Play all slots, reveal, score, resume, and complete successfully using prepared content/fallbacks. Assert zero adapter invocations. This is a release-critical architectural proof.

## 74. Provider Budget Test

Set tiny deterministic search/fetch/model/media budgets. When exhausted, orchestration reuses eligible knowledge, omits optional enrichment, limits/fails safely, records reason/cost, and stops. No infinite escalation, hidden overspend, lowered truth gate, or ready incomplete package.

## 75. Provider Retry Test

Fake transient failures followed by success and permanent failures. Assert bounded attempts/backoff policy through a fake scheduler/clock, idempotent promotion, circuit state, and budget accounting. Auth/schema/policy failures do not retry blindly; nested layers do not multiply retries.

## 76. No Provider Call During Slot Activation Test

Instrument all fake reasoning, search, fetch, embedding, moderation, and media-discovery adapters with fail-on-call counters. Activate/reveal/resolve multiple slots and resume. Assert exactly zero calls; only database/application and prepared media delivery are permitted.

## 77. Media Basic Tests

If lightweight image MVP ships, test qualified image selection, rights/region, technical validity, availability, safe presentation, accessible alternative, invalid source, leakage, and fallback. Otherwise mark these as future without fake passing tests. Text-only runtime still tests optional media absence.

## 78. Media Metadata Leak Test

Use an asset whose filename/title/EXIF/URL/query/caption reveals the answer. Qualification or delivery must sanitize/reject it; shared payload and fetched client artifact metadata expose nothing answer-bearing. Test audio/video tags when those formats arrive.

## 79. Media Failure Calibration Test

Serve a broken/incomplete media presentation, record technical failure/void/fallback, and assert it is not counted as clean correctness/response-time difficulty evidence for the abandoned question. Actual qualified fallback outcome may count under its own identity/policy.

## 80. Arabic UI Contract Test

API returns the native approved Arabic Variant, `language: ar`, direction metadata or derivable rule, Arabic category/answer display, and safe mixed-script names. No mojibake, reversed text data, or silent English substitution unless an explicit fallback mode authorizes it. Manual layout review supplements automation.

## 81. UTF-8 Storage Test

Round-trip Arabic letters, diacritics, tatweel, punctuation, Arabic-Indic digits, emoji if allowed, and Latin transliteration through seed/import, database, query, snapshot, API serialization, and readback. Compare canonical display strings exactly; normalized search fields are separate.

## 82. Oman/GCC Content Test

Fixture inventory includes queryable Oman/GCC categories, entities, Arabic/English names, region context, evidence, and all public difficulties as practical. Assert regional content is eligible under correct region/language and not treated as an unsupported afterthought. Human review assesses authenticity.

## 83. Security Tests

At minimum test unauthenticated/unauthorized game mutation, display credential answer access, cross-account game/custom-category access, arbitrary exposure/outcome Fact injection, canonical Fact/lifecycle mutation, host/admin capability confusion, future package leakage, untrusted custom input, and safe error/log redaction.

## 84. Input Validation Tests

Reject malformed/unknown/foreign IDs, invalid language/region/difficulty/outcome/status, duplicate teams/categories, excessive strings/arrays, invalid timestamps, unsafe URLs, missing idempotency keys where required, and forbidden transitions. Errors are structured/user-safe and cause no partial mutation.

## 85. Secret Leak Test

Seed fake recognizable secrets/tokens only in adapter configuration/test context. Scan API responses, rendered errors, structured logs, snapshots, fixtures, traces, and player media URLs to assert absence/redaction. Real secrets/user data are never test inputs.

## 86. Storage Transaction Tests

Inject failure at each write step for package construction/readiness, slot activation/snapshot/exposure, fallback swap, reveal/outcome/score/turn, and lifecycle+audit. Assert atomic rollback or coherent retryable intermediate state according to design; no split truth.

## 87. Partial Package Failure Test

Fail after some slots insert but before integrity/readiness. Package must remain preparing/failed or roll back; never `ready`. Retry with same key completes once or returns prior state without duplicates. Runtime refuses incomplete package.

## 88. Outcome + Exposure Consistency Test

For every resolved outcome, verify served slot snapshot and actual Fact/Question/Variant match exposure/outcome, timestamps order, one exposure per serve policy, and idempotency. Different-Fact fallback specifically proves the abandoned primary is absent.

## 89. Retirement Test

Retired/quarantined Question cannot enter new packages or rebuilt fallbacks. Existing completed/active policy-allowed package snapshots remain readable and auditable. Fact/category deletion does not cascade away history.

## 90. Account Deletion Test

When privacy/auth exists, test authorized idempotent deletion/anonymization of account/group links, memory, saved custom ownership, and game history per policy while canonical public Facts/evidence remain. Verify cross-account isolation, derived projection rebuild/removal, audit/legal exceptions, and no orphan identifiers. Until then mark deferred.

## 91. Performance Smoke Test

Use representative small/medium fixtures to detect obvious N+1/full scans and ensure Question Bank query, package assembly, board read, activation, and reveal remain sensibly fast locally. Assert runtime invokes no external intelligence. Record trends rather than inventing launch SLAs.

## 92. Startup Test

Starting application initializes only required local components/config/schema checks. Instrument network/providers and assert no web fetch, question generation, full validation, embedding rebuild, giant scan, or media discovery. Missing optional provider credentials does not prevent manual-seed runtime.

## 93. Resource Smoke Test

Observe suite time, peak memory where practical, disk/temp growth, process count, and network/provider usage. Fail/review gross regressions such as gigabyte fixture downloads, GPU dependency, runaway processes, or unbounded caches. Exact thresholds await stack evidence.

## 94. Test Data Cleanup

Each test uses an isolated transaction/schema/database/namespace and deterministic ownership. Cleanup targets only its artifacts, including temp media. Tests never mutate a developer’s canonical local data or shared/production environments; failure preserves enough scoped diagnostics without clutter.

## 95. Regression Test Policy

Every material fixed bug gains the smallest meaningful regression at the layer that catches root cause: duplicate Fact, Arabic corruption, wrong fallback exposure, double score, answer leak, stale eligibility, or provider call on activation. Name the prior failure and keep the test permanently unless invariant changes explicitly.

## 96. Snapshot Test Policy

Snapshots are appropriate for small stable player DTO/presentation structures and deliberate GameSlot snapshots. Avoid enormous canonical graphs, volatile IDs/timestamps, raw provider outputs, and auto-accepted diffs. Explicit assertions are mandatory for identity, authorization, lifecycle, and exposure semantics.

## 97. Mocking Policy

Fake external/time/random edges: providers, media delivery, clock, ID generator, and perhaps event delivery. Use a real test database for storage integration. Never mock Assembly inside an Assembly test, Memory filtering in a memory test, authorization in a security test, or candidate selection in the golden loop.

## 98. Test Clock

Inject/control time for Fact/source expiry, package expiry, cooldown/decay, retries/circuit breakers, served/revealed/completed ordering, and retention. Advance virtually and assert boundaries exactly. Never sleep to wait for correctness.

## 99. Randomness

Ranking/tie-break/exploration accepts an explicit deterministic seed or injectable RNG in tests. Log seed on failure and assert invariants across a small selected seed set where useful. Production randomness never controls hard eligibility, security, or uniqueness.

## 100. Golden End-to-End Test

Returning account, categories Football/Movies/Oman Geography/Games, with Arabic and English fixture variants:

1. Create game and teams.
2. Prepare a complete GamePackage from manual inventory.
3. Load prior exposures and exclude seen Facts.
4. Fill every category’s 100/200/300 requirements.
5. Assert no repeated Fact and safe snapshots/fallbacks.
6. Read safe board with no future content.
7. Activate a slot instantly through the dial contract.
8. Reveal its answer and record outcome once.
9. Assert exposure uses actual served content.
10. Continue and complete game.
11. Prepare a second game for same memory scope.
12. Assert the newly served Fact cannot reappear across variant/category.

Instrument providers and assert zero calls throughout active gameplay. This is the Machine’s primary heartbeat test.

## 101. Second Golden Test: Cross-language Memory

Game 1 serves Arabic Variant of Fact A and persists exposure. Game 2 uses English with an eligible English Variant of A plus alternatives. Assembly suppresses A by canonical Fact identity while filling the slot. Assert no accidental identity duplication during Arabic normalization/import.

## 102. Third Golden Test: Fallback

Prepare media primary and qualified fallback. Fail primary before display, activate fallback, expose/resolve actual fallback, preserve correct board/score/turn, and finish. Assert abandoned primary exposure absent when never shown, no generation/search, and retry returns same result.

## 103. Fourth Golden Test: Provider Outage

Prepare successfully, disable every external intelligence adapter, and play the entire package including resume/reveal/outcomes/completion. It must work with zero calls. If prepared media delivery fails, use prepacked fallback rather than intelligence.

## 104. Fifth Golden Test: Custom Category Path

Manually seed `Nintendo GameCube` as an owned ready CustomCategoryDefinition linked to ordinary canonical Facts. Run Fact → Question → Variant → GamePackage → runtime → exposure → next-game suppression. Assert no separate runtime state machine or custom provider dependency.

## 105. Test Matrix

| Subsystem | Domain | Storage | API | Integration | E2E | Manual |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Fact identity/evidence | ✓ | ✓ | admin-safe | ✓ | ✓ | review |
| Question/Variants/answers | ✓ | ✓ | ✓ | ✓ | ✓ | bilingual quality |
| Question Bank | ✓ | ✓ | internal | ✓ | ✓ | — |
| Difficulty | ✓ | ✓ | display | ✓ | ✓ | feel |
| Game Assembly/Package | ✓ | ✓ | status | ✓ | ✓ | board shape |
| Runtime/score/state | ✓ | ✓ | ✓ | ✓ | ✓ | dial/game rhythm |
| Machine Memory | ✓ | ✓ | summary | ✓ | ✓ | non-creepy framing |
| Custom Category | ✓ | ✓ | ✓ | ✓ | ✓ | scope clarity |
| Media | ✓ | metadata | safe DTO | ✓ | fallback | presentation/rights |
| Providers | normalization | trace only | hidden | ✓ | outage | evaluation |
| Security/privacy | rules | isolation | ✓ | ✓ | ✓ | session capability |

## 106. MVP Test Gate

Engine MVP is not done until critical domain tests pass; storage constraints/transactions pass; API authorization and answer-leak tests pass; Golden E2E, cross-language memory, provider-offline runtime, and fallback tests pass; Arabic UTF-8/contract tests pass; default suite uses no paid calls; and the shared board/dial flow is manually verified. Known failures require explicit blocking status, not waiver by coverage percentage.

## 107. Milestone Test Gates

### Canonical Core

Identity, relations, Unicode, evidence/validation, lifecycle, migrations/seeds.

### Question Bank

Eligibility, language/difficulty, exclusions, duplicate suppression, query smoke.

### Game Assembly

Package completeness, uniqueness, diversity, snapshots, fallbacks, memory input.

### Runtime

State machine, dial activation, authorization, answer secrecy, idempotency, concurrency, resume.

### Machine Memory

Exposure timing, cross-game/cross-category/cross-language suppression and degraded behavior.

### Foundry

Answer lock, evidence gates, provider isolation/failure/budgets, quality lifecycle.

### Custom Categories

Scope safety, ownership, viability, reuse, bounded failure, ordinary runtime.

### Media

Rights/technical/leakage/accessibility qualification, delivery failure, fallback, calibration hygiene.

Each gate must pass its relevant golden/regression tests before dependent sophistication.

## 108. Test Failure Triage

Classify failures as canonical identity, data integrity/migration, runtime state/concurrency, authorization/security/privacy, content quality/evidence, provider boundary, media, localization, performance/resource, or fixture/test defect. Reproduce deterministically, inspect actual IDs/state/correlation, find root cause, add regression, and fix implementation. Never weaken expected behavior merely to turn the suite green.

## 109. False-positive Test Avoidance

Mocks must not precompute the behavior being proven. An Assembly test with mocked selected candidates, a memory test with mocked exclusions, or a security test bypassing authorization proves little. Use realistic small object graphs, real domain services, and real relational transactions at integration layers. Include negative assertions for hidden side effects and calls.

## 110. Test Coverage Philosophy

Do not chase arbitrary 100% line coverage. Prioritize invariants, high-risk transitions, canonical/storage integrity, authorization/data leakage, retry/concurrency, failure/fallback, bilingual behavior, and the full feedback loop. Coverage reports may identify blind spots; they cannot substitute for semantic test review.

## 111. Manual Game Night Test

Before launch, play complete games with real groups on the intended shared screen/controller. Observe category scanability, discussion, 100/200/300 feel, dial detents/THUNK/reset, pacing, repeats, unclear/disputed wording, answer reveal, media failures, accessibility, and recovery. Record structured question/game feedback with actual IDs; do not treat anecdotes as automatic canonical edits.

## 112. Arabic Human Review

Native reviewers assess natural MSA/Gulf phrasing as chosen, cultural fit, Arabic names/aliases, transliteration, awkward literal translation, grammatical clue leakage, accepted-answer fairness, direction/mixed-script rendering, and Oman/GCC terminology. Automated Unicode/normalization tests are necessary but cannot certify naturalness.

## 113. Difficulty Human Review

Before empirical calibration, reviewers/playtests verify that 100 feels accessible, 200 satisfying, and 300 hard but defensible—not merely obscure or confusing. Record rationale, disputes, skips, response behavior, and media effects. Calibration gradually supplements/replaces intuition without rewriting historical snapshots.

## 114. Content Quality Review

Sample every category/language/difficulty/format for factual provenance, one defensible answer, ambiguity, clue leakage, wording, fun/reveal payoff, obscurity, repetition, regional relevance, sensitivity, and media rights/accessibility. Review failures quarantine/revise through lifecycle rather than being patched only in UI.

## 115. Test Fixture Governance

Fixture changes are reviewed like code: stable IDs, documented purpose, source/evidence status, language accuracy, expected eligibility, and schema/migration compatibility. When contracts change, migrate fixtures deliberately. Do not let convenient but invalid fixture data teach implementation to ignore invariants.

## 116. CI Future

Future CI should run deterministic domain/unit, storage/migration integration, API contract/security, and practical golden E2E tests on supported platforms. Keep live-provider/internet/media-rights probes separate, opt-in/scheduled, budgeted, and nonessential to ordinary pull requests. This plan selects no CI vendor or configuration.

## 117. Precommit Future

Optional precommit checks should be quick: formatting/lint/type checks and a focused fast test subset. Full integration/golden suites may run before merge/CI. Do not make every commit painfully slow, network-dependent, or provider-billed.

## 118. Load Tests Future

After meaningful usage, test concurrent package assembly, many active games/controllers, large exposure history, growing Question Bank, custom-manufacturing queues, and media delivery based on observed profiles. Define targets from product telemetry/capacity. Do not manufacture million-user infrastructure through synthetic assumptions now.

## 119. Chaos / Failure Injection Future

Lightweight controlled injection should cover provider outage/rate limit, database transient/transaction failure, media timeout/unavailability, stale/invalid package, delayed event/projection, and worker cancellation. Prove safe state and recovery using fakes/hooks; no enterprise chaos platform is needed.

## 120. Test Observability

On failure show concise game/package/slot/fact/question IDs, expected/actual state and version, idempotency/correlation ID, fixture/seed, clock/random seed, and relevant safe event sequence. Avoid giant logs, secrets, full provider content, or unrevealed answer dumps in broadly visible CI output.

## 121. Test Security Data

Fixtures use synthetic/reviewed accounts, teams, custom scopes, credentials, media, and provider responses. Never commit real API keys, personal data, private categories, production exports, copyrighted bulk media, or live session tokens. Secret-leak tests use obvious fake markers.

## 122. Test Plan Invariants

1. The same Fact cannot repeat inside one package.
2. Fact identity survives category, wording, format, and language.
3. Exposure follows the actual served Fact.
4. Hidden prepared content is never exposure.
5. Outcomes bind to actual served slot/content.
6. Idempotent mutation applies once.
7. Shared clients cannot access answers early or future content.
8. A ready game completes with intelligence providers offline.
9. Quarantined, retired, stale, or incomplete content is ineligible.
10. Broken media uses an approved prepared fallback or fails safely.
11. Fallback reality, not primary intent, is recorded.
12. Arabic survives storage/API round-trip unchanged.
13. Machine Memory suppresses prior Facts across games.
14. Custom categories use ordinary canonical/runtime contracts.
15. Storage failure cannot produce a half-ready package.
16. Default tests do not depend on paid APIs/internet.
17. The suite stays laptop-friendly.
18. Every serious fixed bug receives regression coverage when practical.
19. Reveal and outcome remain separate transitions.
20. Client-supplied Fact/score cannot override server truth.
21. Cross-account/session authorization is enforced server-side.
22. Answer lock precedes provider question writing.
23. Model output and search snippets are not evidence by themselves.
24. Test clocks/randomness make time/ranking reproducible.
25. Tests never mutate production/shared data.
26. Hard quality/security/rights rules are not relaxed for passing tests.

## 123. What This File Does Not Decide

This plan defers the test framework, assertion library, fixture format/builders, CI provider, coverage percentage, load targets, browser automation framework, performance SLAs, test database vendor/container choice, mocking library, visual-regression tool, supported-browser matrix, and exact suite partitioning. Choose them after the application stack exists, using its conventions and operating constraints.

## 124. Follow-up Document

The next implementation-planning document should be `GUESSENGINE-IMPLEMENTATION-PLAN.md`. It should define exact milestone order, dependencies, governed specifications, scoped deliverables, acceptance/test gates, rollback boundaries, resource checks, provider deferrals, and Codex handoff/reporting when implementation begins. Do not create it during this task.

## 125. Test Plan Doctrine

1. Test the Machine's promises.
2. Test identity before appearance.
3. Test the Fact, not just the string.
4. Test Arabic explicitly.
5. Test failure intentionally.
6. Test retries.
7. Test no answer leakage.
8. Test no live generation.
9. Test Machine Memory twice, across games.
10. Test fallback reality.
11. Test providers at the edges.
12. Keep tests deterministic.
13. Keep tests small.
14. Keep tests local.
15. Human game nights still matter.
16. A passing homepage test does not mean Guess Engine works.
17. The golden test is GameRequest → GamePackage → Runtime → Exposure → better next GamePackage.
18. If that loop passes, the Machine has a heartbeat.
19. If it fails, do not ship the THUNK.
