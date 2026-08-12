# Guess Engine 9: Game Assembly, Runtime Orchestration, and Engine Convergence

**Status:** Ninth and final document of Guess Engine Foundational Architecture v1  
**Product:** Guess Machine / مخ ماشين  
**Depends on:** `GUESSENGINE-1.md` through `GUESSENGINE-8.md`  
**Implementation status:** Architecture only; no runtime implementation is authorized

## 0. Purpose and Status as Final Foundational Document

This is the convergence document. It does not replace Engines 1–8; it consumes their canonical contracts. GameRequest expresses intent, Question Bank supplies eligible goods, Machine Memory local context, Difficulty challenge metadata, Media resolved usages/fallbacks, Custom Engine ordinary category inventory, and GamePackage the prepared runtime boundary. PlayerOutcome returns after serving.

> Game Assembly decides what is served. Manufacturing decides what is eligible to be served.

## 1. Game Assembly Responsibilities

Assembly resolves GameRequest and shape, loads eligible inventory, applies lifecycle/freshness/duplicate/memory/difficulty/category/media/accessibility/fairness/diversity rules, ranks as a set, selects primaries/fallbacks/variants/assets, constructs and validates GamePackage, then marks it ready.

It does not verify facts, write questions, discover media, calibrate global difficulty, interpret custom scope, authorize payment, or authenticate users.

## 2. Core Game Assembly Philosophy

Assembly is constrained ranking, not randomness. Hard invalidity removes candidates; soft preferences trade off. Optimize variety/fairness across the whole set. Personalization cannot break fairness. Only approved questions compete. Fallbacks are planned. Package first, play second. Selection is explainable, and no subsystem dominates overall game quality.

## 3. GameRequest Normalization

```text
ResolvedGameRequest {
  game_request_id, account_id, group_id_optional,
  teams, category_slots, custom_category_refs,
  language, region, difficulty_structure, game_mode,
  accessibility_requirements, permitted_question_formats,
  entitlement_context_optional, normalized_at, contract_version
}
```

Board dimensions and modes remain extensible.

## 4. Game Shape

```text
GameShape {
  categories, slots_per_category, difficulty_slots,
  team_turn_structure, total_question_slots,
  optional_special_slots, shape_version
}
```

Current 100/200/300 is primary but not the only possible future mode.

## 5. Slot Requirements

```text
SlotRequirement {
  category_id, custom_category_id_optional,
  target_difficulty, language, region,
  allowed_formats, required_accessibility,
  team_context_optional, uniqueness_scope,
  special_constraints
}
```

Assembly fills semantic requirements, not arbitrary arrays.

## 6. Candidate Eligibility

Candidates require eligible lifecycle, validated/fresh FactRecord, approved target-language variant, DifficultyProfile, acceptable duplicate/quality state, valid media/fallback where needed, custom-scope match, compatible sensitivity, and required accessibility. Failure means exclusion before ranking.

## 7. Hard Constraints

No same FactRecord twice; no quarantine/stale/current-expired/wrong-language item; no missing required media/fallback; no out-of-scope custom fact; no unsafe/inaccessible/leaking item; no unresolved required slot. Hard rules are filters, never penalties.

## 8. Soft Constraints

Prefer unseen facts, underexposed topics/entities, strong difficulty fit/confidence, format breadth, regional relevance, Machine Memory novelty, reliable media, healthy performance, and underrepresented nodes. Preferences may trade off.

## 9. Ranking Model

```text
eligible candidates → feature extraction → hard filtering
→ initial ranking → diversity adjustment
→ game-level optimization → slot assignment
```

Independent slot ranking is insufficient: six individually strong Messi questions still make a bad game.

## 10. Global Game Optimization

Optimize no duplicate facts, entity/topic/era/format breadth, difficulty integrity/confidence, fairness, native language quality, freshness, media reliability, and memory novelty as a coherent set-selection problem.

## 11. Category Integrity

Football cannot collapse to World Cup, Pixar to Toy Story, or LE SSERAFIM to birthdays. KnowledgeNode coverage should make each category feel broad and intentional.

## 12. Entity Diversity

Penalize repeated entities even across unique facts. Messi/Ronaldo dominance is a package-level defect.

## 13. Topic Diversity

Avoid repeated World Cup finals or one franchise branch. Prefer meaningful category traversal.

## 14. Era Diversity

Avoid accidental clustering where category scope is broad. Explicit scopes such as K-pop 2025 override generic era diversity.

## 15. Format Diversity

Balance text/image/audio/video/connection only where qualified stock exists. Quality beats spectacle.

## 16. Question Rhythm

Avoid consecutive stat/date/media/long-read or punishing 300 sequences where ordering is controlled. Rhythm is an objective, not a fixed formula.

## 17. Difficulty Integrity

Displayed 100/200/300 must match canonical/calibrated expectations. Avoid a category 100 harder than its 300 and use confidence where available.

## 18. Difficulty Confidence

Prefer calibrated high-confidence items for equivalent/high-stakes slots. Controlled exploration may use limited low-confidence approved questions without clustering them.

## 19. Effective Group Difficulty

Memory may steer an expert football group toward deeper canonical 300s and a weak geography group toward clearer canonical 100s. Board labels remain unchanged.

## 20. Fairness

Equivalent team opportunities should be reasonably comparable across calibrated challenge, confidence, format, clue/media strength, category, and regional familiarity. Perfect equality is impossible; parity is inspectable.

## 21. Fairness vs Personalization

Default play adapts the whole group experience, not hidden team handicaps. Team-specific adaptive difficulty requires an explicit future mode.

## 22. Team Turn Assignment

Prepare slots independently of teams when players choose category/difficulty. Runtime binds selection to current turn only when needed.

## 23. Player Choice and Prepackaged Questions

Football 100/200/300 each already has primary/fallback behind the slot. Dial selection reveals prepared content instantly; no manufacturing occurs.

## 24. Used Slot State

Runtime slot states: `available`, `selected`, `active`, `answered`, `skipped`, `voided`, `replaced_by_fallback`, `completed`. These differ from QuestionRecord lifecycle.

## 25. GamePackage Preparation Pipeline

```text
GameRequest → Normalize → Resolve Categories
→ Custom preparation if needed → Check Machine Memory
→ Resolve Slot Requirements → Load Eligible Inventory
→ Hard Filter → Rank → Diversity/Fairness Optimization
→ Assign Primaries → Assign Fallbacks
→ Resolve Variants → Resolve Media/Accessibility
→ Package Integrity Validation → GAME READY
```

## 26. Custom Category Waiting Point

Package remains `preparing` until enough eligible custom stock exists. At runtime custom and built-in QuestionRecords are indistinguishable.

## 27. Machine Memory Check

Load fact exposure, account/group history, strength, entity/topic saturation, and custom history. This truthfully supports `CHECKING MACHINE MEMORY`.

## 28. Preparation UI Truth Mapping

UI may show `INITIALIZING`, `CHECKING MEMORY`, `RESOLVING CATEGORIES`, `MAPPING CUSTOM KNOWLEDGE`, `SELECTING QUESTIONS`, `CALIBRATING DIFFICULTY`, `LOADING MEDIA`, `PACKING FALLBACKS`, `GAME READY`. Stages may combine operations theatrically without material lies.

## 29. Package Integrity Validation

Before ready: every slot filled, no duplicate facts/invalid lifecycle, all variants/answers/media/accessibility/fallbacks resolved, current facts fresh, versions supported, and obvious cross-slot leakage controlled. Any hard failure blocks readiness.

## 30. GamePackage Snapshot

Snapshot references teams/categories/slots, resolved variants/facts/answers/media/fallbacks, difficulty, attribution, selection reasons, and versions. It need not duplicate every canonical object but must remain resilient and auditable.

## 31. Package Stability

If a question is quarantined after creation but before serving, live invalidation—where supported—activates prepared fallback and records reason. A package snapshot is not permission to serve newly invalid content.

## 32. Package Expiry

Current facts, rights/URLs, package age, or contract incompatibility can expire a package. Stable historical packages may last longer. Exact TTL is deferred.

## 33. Package Invalidation

Critical quarantine, rights invalidation, source correction, corruption, security issue, or schema incompatibility may trigger fallback repair, pre-game refresh, or total invalidation—never raw live manufacturing.

## 34. Fallback Orchestration

Order: alternate approved variant; alternate media usage; text variant of same fact; alternate eligible question same category/difficulty; package reserve. Preserve fairness, language, exposure, and duplicates.

## 35. Fallback Diversity

Fallbacks are themselves assigned conflict-aware; one reserve cannot silently back five mutually reachable slots.

## 36. Fallback Activation

Record original failure and actual replacement, exclude broken presentation from clean calibration, and write Machine Memory exposure for the FactRecord actually served.

## 37. No Live Generation Doctrine

Runtime never calls models/search/Foundry/validation/media discovery to fill a missing slot. If all prepared options fail, void or use prequalified reserve. Reliability beats concealment.

## 38. Runtime State Machine

```text
created → preparing → ready → active → paused_optional → completed
exception: failed | invalidated | abandoned
```

## 39. Turn State Machine

```text
waiting_for_selection → slot_selected → question_presented
→ answer_phase → reveal → scoring → slot_completed → next_turn
```

## 40. Rotary Dial Integration Boundary

Runtime exposes visible categories, available/disabled difficulty slots, active team/category/slot, and readiness. UI keeps one shared dial, blocks used detents, launches on press, and returns neutral; animation is outside this document.

## 41. Slot Locking

Once selected, a slot is atomically/semantically locked against double selection, concurrent reveal, or two-team claims. Mechanism is deferred.

## 42. Active Question Payload

Shared view receives only active presentation needs. Do not expose upcoming questions/answers/fallbacks, ranking, or descriptive media names. Host authorization may separately receive answer data.

## 43. Answer Reveal

Use canonical AcceptedAnswerSet and approved display/explanation/attribution. Runtime cannot rewrite truth.

## 44. Host Scoring

Host may mark correct, incorrect, skipped, voided, or disputed; these produce PlayerOutcome. Automated checking is optional, not assumed.

## 45. Disputed Question Flow

Allow override/mark dispute, continue play, and route review after game. Do not pause for live research.

## 46. Voided Question

Mark void, activate prepared fallback where appropriate, exclude broken result from difficulty, and record cause.

## 47. Scoring Boundary

Team scores may be runtime state, but Fact/Question contracts do not depend on one scoring formula.

## 48. Team State

```text
TeamRuntimeState {
  team_id, display_name, score, turn_status, answered_slots
}
```

Runtime team identity is not necessarily Machine Memory identity.

## 49. Game Session Telemetry

Record slot/category/difficulty selection, question/media served, fallback, reveal, outcome, time, override/dispute, technical failure, and completion. Derive canonical outcomes/exposures.

## 50. Exposure Timing

Count FactRecord exposure only when enough of the question is actually shown to spoil future novelty—not package creation, preload, or hidden slot.

## 51. Machine Memory Writeback

After question/game update actual fact/question/entity/topic exposure, category/difficulty/format statistics, and custom memory asynchronously/non-blockingly.

## 52. Difficulty Feedback

Outcomes feed QuestionPerformance, global calibration, and local effective difficulty later—not synchronous mid-question reclassification.

## 53. Quality Feedback

Disputes, overrides, skips, reports, fallbacks, and media failures can later trigger review/quarantine/rewrite/revalidation. Runtime continues.

## 54. Session-level Diversity Enforcement

Fallback substitution remains package-aware and avoids used/duplicate facts or severe saturation when another valid reserve exists.

## 55. Cross-question Clue Leakage

Use fact/entity relationships to detect obvious freebies, such as an earlier question revealing the club asked later. Perfect inference is unnecessary; blatant leakage is avoidable.

## 56. Question Ordering

Ordered modes can optimize sequence. Dial-based selection is player-driven, so package coherence cannot depend on a fixed order.

## 57. Player-driven Order

Any available slot should work first. Only explicitly sequential modes may establish dependencies.

## 58. Category Availability State

Expose category active/exhausted, remaining difficulties, and custom readiness to UI lights/sockets.

## 59. Used Difficulty Slots

Completed slots become authoritative unavailable state; the dial detent disables and indicator updates.

## 60. Game Completion

Mode-specific completion may be all slots, score threshold, or host end. Finalize outcomes/exposures/session, update memory, emit completion, and preserve audit history.

## 61. Abandoned Games

Only served questions count exposure. Unplayed slots do not. Incomplete sessions are not treated as clean completed-game data.

## 62. Replay

Default new games use Machine Memory for freshness rather than replaying identical package. Explicit replay mode may preserve it. UX is deferred.

## 63. Session Resume

Future crash/reconnect resume requires durable authoritative package/slot/turn/score state without resurrecting used slots. Storage mechanism is deferred.

## 64. Runtime Resilience

Memory, analytics, logging, calibration, or one media failure should not destroy play. Prefer prepared package and local/session state.

## 65. Critical Runtime Failures

Package corruption, missing answer, exhausted invalid fallbacks, or security violation fails safely. Never invent content.

## 66. Degraded Mode

Use canonical difficulty, disable personalization, activate text fallback, buffer telemetry, or use cached package. Degrade toward reliable basic trivia, never unsafe generation.

## 67. Machine Memory Failure

Use canonical/global novelty plus session duplicate controls. Personalization may weaken; correctness does not.

## 68. Difficulty Engine Failure

Use stored canonical/calibrated DifficultyProfile. Game remains playable.

## 69. Media Engine Failure

Use prepared alternate/text fallback, not live random replacement.

## 70. Custom Category Failure

If full-quality custom inventory cannot prepare, fail/replace/broaden through UX without lowering standards.

## 71. Question Bank Shortage

Use eligible underexposed stock, broaden within category, request upstream manufacturing during preparation, relax old cooldown, or fail gracefully—in that order of safe options. Never bypass validation.

## 72. Preparation Deadline

At bounded latency, use only the best complete qualified package; unfinished candidates never enter. Exact duration is deferred.

## 73. Partial Personalization

If all fresh Football 300s were seen, relax an old cooldown before accepting poor knowledge. Trust outranks novelty.

## 74. Constraint Relaxation Order

Relax preferred format, mild topic saturation, entity freshness, then old exposure cooldown. Never relax validation, lifecycle, uniqueness, safety, rights, accessibility, or within-game duplicates.

## 75. Fairness Relaxation

Do not accept wild equivalent-slot mismatch to fill a package. Prefer alternative category/preparation failure. UX is deferred.

## 76. Package Quality Assessment

Assess completeness, difficulty confidence, novelty, diversity, media reliability, fairness, and category breadth per dimension. Fatal defects override any aggregate health score.

## 77. Selection Reason

Reasons include `fresh_for_group`, `underexposed_topic`, `high_difficulty_confidence`, `custom_category_requirement`, `format_diversity`, `regional_fit`, `older_fact_after_cooldown`, and `fallback_reserve`. They are key observability.

## 78. Assembly Rejection Reason

Track `recently_seen`, `duplicate_fact`, `entity_saturation`, `difficulty_mismatch`, `media_unavailable`, `stale`, `low_quality`, `fairness_mismatch`, and `lower_ranked` to diagnose stock.

## 79. Assembly Trace

For a package, operators can inspect request, eligible/filtered inventory, Memory suppression, difficulty signals, every selection/rejection, alternatives/fallbacks, resolved media, and readiness rationale.

## 80. Operational Observability

Measure preparation success/latency, custom latency, fill/fallback packing/activation, duplicate prevention, memory suppression, fairness confidence, media failure, invalidation, abandonment, and runtime errors.

## 81. Game Quality Metrics

Track repeat complaints, disputes, 100/200/300 separation, category/entity/format diversity, completion, void/fallback, and returning-account freshness—not engagement duration alone.

## 82. Fairness Metrics

Compare same-level correctness/timing, team-level challenge/confidence, and fallback imbalance. Diagnostics cannot prove perfect fairness but expose problems.

## 83. Package Experimentation

Introduce approved/verified low-confidence questions in limited, balanced slots; do not concentrate them on one team. This supplies calibration evidence.

## 84. Exploration vs Reliability

Explore high-quality predicted inventory without making games feel beta. Unfinished/unverified content is never exploration.

## 85. Custom Category Experimentation

Newer custom stock uses stronger fallbacks, conservative gates, exposure memory, and explicit preparation—not unstable live behavior.

## 86. GamePackage Versioning

Record engine, assembly, contract, ranking, and creation versions/times for diagnosis.

## 87. Runtime Versioning

Session history identifies package/runtime contract so bugs can be reproduced.

## 88. Package Reproducibility

Preserve exactly served variant/media treatment/fallback/version references. External disappearance may prevent byte-perfect reconstruction, but audit context remains.

## 89. Security Boundary

The player/shared client is untrusted. Hide future answers/slots/fallbacks, source notes, memory internals, provider secrets, ranking, and moderation data behind appropriate boundaries/opaque refs.

## 90. Host Security

Separate authorized host answer payload from shared-screen payload; CSS hiding alone is not security. Architecture details are deferred.

## 91. Concurrency

Two slot clicks, devices, retries, fallback/reveal races, and score collisions must yield one authoritative, auditable session outcome. Locking technology is deferred.

## 92. Idempotency

Repeated correct-marking cannot double score; selection cannot consume twice; exposure retry cannot duplicate; fallback activates once.

## 93. Game Events

```text
GAME_REQUESTED
GAME_PREPARATION_STARTED
GAME_MEMORY_LOADED
GAME_CATEGORIES_RESOLVED
GAME_ASSEMBLY_STARTED
GAME_SLOT_FILLED
GAME_FALLBACK_PACKED
GAME_PACKAGE_READY
GAME_STARTED
TURN_STARTED
CATEGORY_SELECTED
DIFFICULTY_SELECTED
QUESTION_SERVED
MEDIA_FALLBACK_ACTIVATED
ANSWER_REVEALED
QUESTION_OUTCOME_RECORDED
SLOT_COMPLETED
TURN_COMPLETED
GAME_COMPLETED
GAME_ABANDONED
GAME_INVALIDATED
```

No event-sourcing mandate.

## 94. Post-game Pipeline

```text
Game Completed → Finalize PlayerOutcomes/ExposureRecords
→ QuestionPerformance + Difficulty Calibration
→ Machine Memory + Quality Signals + Inventory Demand
→ Session Summary
```

## 95. Post-game Inventory Effect

Completion may influence low stock, saturation, calibration, media health, and custom expansion. One game never causes dramatic global change.

## 96. Ever-improving Machine Loop

```text
Knowledge → Facts → Questions → Question Bank
→ Game Assembly → GamePackage → Gameplay → Outcomes
→ Difficulty Calibration → Machine Memory → Quality Review
→ Inventory Demand → Knowledge / Foundry
```

## 97. Infinite Questions Loop

Broad bank, replenishing Foundry, custom scopes, exposure-aware Memory, fresh Assembly, semantic dedupe, node-driven demand, and legitimate format diversity create inexhaustibility. Infinite is a systems property, not a prompt.

## 98. Product Account Retention Loop

Persistent accounts retain exposure, novelty, effective challenge, custom continuity, saved groups/categories, and better assembly. Burners remain usable but lose accumulated Machine intelligence.

## 99. Performance Philosophy

Heavy retrieval/generation/verification/media/calibration happens before play. Runtime handles state, selection, reveal, scoring, and telemetry for instant feel.

## 100. Latency Budget Philosophy

Preparation may be visible for custom manufacturing; live slot selection is immediate. The industrial wait belongs before, never between normal questions.

## 101. Cache Strategy at Convergence

Conceptually cache inventory, Memory projections, DifficultyProfiles, Media readiness, and package snapshots. Technology is deferred.

## 102. Dependency Failure Matrix

| Subsystem | Preparation impact | Active game impact | Graceful fallback |
|---|---|---|---|
| Machine Memory | can prepare without personalization | none if package ready | canonical difficulty/session dedupe |
| Difficulty Engine | use stored profiles | none | canonical/calibrated stored level |
| Media Engine | media slots may fail readiness | use prepared fallback | text/alternate asset |
| Custom Category Engine | requested custom scope may not fill | none once packed | replace/broaden before play |
| Question Bank | critical to fill package | none if snapshot intact | cached package/reserve |
| Analytics | no blocking impact | no blocking impact | buffer/drop safely per policy |
| Global calibration | use stored profile | none | deferred update |
| Retrieval provider | blocks new preparation only | none | cached verified stock |
| Generation provider | blocks new manufacturing only | none | cached Question Bank |

## 103. Pre-game vs Live Dependencies

**Preparation-critical:** Question Bank, requested custom manufacturing, assembler, variant/media resolution. **Live-critical:** GamePackage, authoritative session, answer data, and prepared media/fallback/scoring state. **Noncritical live:** analytics, calibration, replenishment, retrieval, and generation.

## 104. Operations / Admin Overview

Future dashboard surfaces inventory/package health, disputes, media failures, low stock, custom failures, drift, repeat rates, fallbacks, and source invalidations. UI is not designed here.

## 105. Launch Strategy

- **Engine Alpha:** built-ins, verified seeded/manufactured stock, basic bank/100–300/packages, no live generation.
- **Engine Beta:** Memory, semantic repeat suppression, calibration, initial media.
- **Custom Beta:** one free full-quality pipeline with manufacturing UI.
- **Mature:** adaptive inventory, rich media, saved groups, continuity, sophisticated calibration.

These are orientation, not commitments.

## 106. MVP Game Assembly

Resolve categories/fixed requirements; query eligible bank; block duplicate facts; apply basic memory, difficulty, topic/entity diversity; resolve variant/media; pack one fallback per slot; validate package; run session; record outcomes/exposures.

## 107. Implementation Priority

One plausible order: canonical storage/contracts → manual seed → Question Bank → basic Assembly → GamePackage runtime → outcomes/exposure → Foundry automation → Knowledge retrieval → calibration → Memory sophistication → custom categories → media sophistication. Manual content proves runtime before automating supply.

## 108. Manual Seeding as Valid Early Strategy

Manually seeded content uses the same FactRecord/evidence/QuestionRecord/Difficulty/lifecycle contracts. No temporary inferior schema.

## 109. Test Fixtures

Future fixtures include easy history, specialist hard, Arabic/bilingual, current, custom, image, media fallback, disputed, duplicate, and stale specimens. No tests are implemented here.

## 110. Game Assembly Test Scenarios

Cover cold/mature accounts, exhausted category, unavailable images, partial custom stock, same-fact candidates, imbalance, saturation, expiry, and fallback activation.

## 111. Acceptance Criteria for Engine Foundation

A successful future implementation turns GameRequest into ready package; uses verified facts; contains no semantic duplicates; respects difficulty/novelty/diversity; handles media/fallback; runs without live manufacturing; records outcomes/exposures; and improves next selection.

## 112. Engine-wide Invariants

1. FactRecord is truth-bearing.
2. No unvalidated fact enters active play.
3. No package contains duplicate fact identity.
4. Assembly cannot override lifecycle invalidity.
5. Memory affects selection, never truth.
6. Difficulty affects challenge, never answer correctness.
7. Custom categories use normal contracts.
8. Media is qualified before readiness.
9. Every media slot has fallback.
10. Live play does not normally manufacture.
11. Exposure is recorded by FactRecord.
12. Hidden/preloaded content is not exposure.
13. Broken presentation is excluded from clean calibration.
14. Fallbacks are already approved.
15. Readiness requires all slots resolved.
16. Latency never relaxes hard quality.
17. Fairness cannot manipulate truth.
18. Arabic/English are first-class runtime languages.
19. Personalization does not require participant accounts.
20. Session state is authoritative for used slots.
21. Runtime actions are idempotent in principle.
22. Outcomes remain auditable.
23. Provider failure after readiness normally cannot affect play.
24. Unknown beats fabricated recovery.
25. Players experience one Machine, not eight systems.
26. Actual fallback exposure/outcome is recorded.
27. Package invalidation cannot silently serve forbidden content.
28. Soft constraints may relax; hard constraints may not.
29. Game one works without Memory.
30. Runtime never trusts client-hidden secrets.

## 113. Engine Boundary Map

```text
                       ┌──────────────────────┐
                       │   Knowledge Engine   │
                       └──────────┬───────────┘
                                  ▼
                           Verified Facts
                                  ▼
                       ┌──────────────────────┐
                       │  Question Foundry    │
                       └──────────┬───────────┘
                                  ▼
                            Question Bank
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
 Difficulty Engine        Machine Memory          Media Engine
          └───────────────────────┼───────────────────────┘
                                  ▼
Custom Categories ───────────────▶ Game Assembly
                                  ▼
                             GamePackage
                                  ▼
                             Runtime Game
                                  ▼
                            PlayerOutcome
              ┌───────────────────┼────────────────────┐
              ▼                   ▼                    ▼
         Difficulty          Machine Memory       Quality/Lifecycle
         Calibration              Update               Feedback
              └───────────────────┼────────────────────┘
                                  ▼
                         Future Engine Behavior
```

Custom Engine also feeds Knowledge/Foundry upstream; runtime sees ordinary inventory.

## 114. Complete Engine Data Flow

A returning family requests Football, Pixar, Omani Geography, and saved Nintendo GameCube. The request normalizes; custom scope/map/evidence are reused and gaps prepared; Memory loads facts/strength/saturation; Difficulty context loads; eligible stock hard-filters; recent facts suppress; set optimization balances topics/entities/formats/fairness; media and fallbacks resolve; package becomes ready. During play they choose Football and dial 200; the hidden prepared question appears instantly. Host marks correct; ExposureRecord and PlayerOutcome capture actual presentation. Post-game Memory and QuestionPerformance update, later calibration may change, and next game benefits.

## 115. Complete Failure Example

A custom image category’s preferred image loses rights, so it is excluded. The primary 300 FactRecord is recently seen and strongly suppressed; a second has low confidence and loses ranking; a third high-quality candidate wins. An approved text fallback is packed. At runtime the alternate image fails; text activates instantly, actual treatment is recorded, calibration excludes the failure, and play continues without live manufacturing.

## 116. Product Identity Convergence

Players never need to know embeddings, policies, validators, ranking, or calibration. They experience fresh categories, good questions, sensible difficulty, custom manufacturing, media variety, fewer repeats, instant play, Memory, and an industrial preparation sequence.

## 117. Anti-AI-Slop at Convergence

Random prose, assistant metaphors, endless spinners, inconsistent difficulty, famous-fact repetition, broken media, US-default bias, and paraphrased duplicates are failures of the entire Engine—not isolated content bugs.

## 118. Product Claims the Architecture Can Support

After implementation evidence exists, the product may honestly claim Infinite Questions, Make Your Category, Machine Memory, fewer repeats, questions built for the game, and improvement through play. Do not claim them before measurement proves them.

## 119. What “Infinite” Means at Final Architecture Level

Practically unreachable exhaustion emerges from expanding verified knowledge, cached bank breadth, map coverage, custom scopes, format diversity, semantic dedupe, persistent exposure, replenishment, and long-term expansion. It is not mathematically infinite strings.

## 120. What This File Does Not Decide

This document defers assembly formulas/queries, runtime/state/scoring/turn/UI details, loading durations, concurrency/cache/analytics/deployment/jobs, frontend/backend/API boundaries, subscriptions, and rollout dates. It defines semantics and runtime architecture only.

## 121. What Comes After GUESSENGINE-9

Engines 1–9 together form **Guess Engine Foundational Architecture v1**. The next phase is architecture review, contradiction/terminology audit, MVP extraction, implementation planning, provider evaluation, storage/data design, and prototype runtime—not more foundational doctrine.

Potential later implementation documents: `GUESSENGINE-MVP-IMPLEMENTATION.md`, `GUESSENGINE-STORAGE-DESIGN.md`, `GUESSENGINE-PROVIDER-EVALUATION.md`, `GUESSENGINE-API-CONTRACTS.md`, and `GUESSENGINE-TEST-PLAN.md`. None are created here.

## 122. Foundational Architecture Review Checklist

- Is FactRecord truth preserved and wording separate?
- Can semantic duplicates and prior fact exposures be suppressed?
- Is GamePackage complete without live generation?
- Are Arabic and custom categories first-class?
- Can media/current facts fail or expire safely?
- Can difficulty recalibrate without changing truth?
- Does default gameplay work without personalization/noncritical providers?
- Are providers replaceable and human review possible?
- Is every served presentation auditable?
- Can the game continue under noncritical failure?
- Does the player experience one coherent Machine?

## 123. Final Guess Engine Doctrine

1. Facts first. Questions second.
2. Evidence before confidence.
3. Models assist; they do not define truth.
4. Verified knowledge is reusable capital.
5. Manufacture before live play whenever possible.
6. GamePackages are the runtime boundary.
7. Live gameplay consumes finished goods.
8. Difficulty is predicted, then measured.
9. A 300 is hard for the right reasons.
10. Remember facts, not strings.
11. Returning accounts encounter fewer repeats.
12. Machine Memory is trivia memory, not surveillance.
13. Custom categories are first-class.
14. User text defines scope, not policy.
15. Weak evidence means fewer questions.
16. Media serves knowledge.
17. Broken media never breaks the game.
18. Arabic and regional knowledge are first-class.
19. Fairness matters.
20. Accessibility failure is not difficulty.
21. Providers are replaceable.
22. Provenance is permanent.
23. Human review is a feature.
24. Unknown is acceptable.
25. Quality beats inventory volume.
26. Personalization improves selection, never truth.
27. The Machine knows why it believes every fact.
28. The Machine knows what it has shown you.
29. The Machine learns how hard its questions are.
30. The Machine sharpens with every clean game.
31. Infinite means inexhaustible, not careless.
32. Seen Jeem sells you a catalog.
33. Guess Machine sells you the machine that makes the catalog.

> The Guess Engine is not an AI question generator.
>
> It is a knowledge acquisition system, question foundry, difficulty model, persistent memory, custom-category manufacturer, media qualifier, and game assembler operating together as one Machine.
>
> The player should never need to know any of that.
>
> They pick categories.  
> They turn the dial.  
> The Machine already has the question.

