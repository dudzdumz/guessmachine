# Guess Engine 6: Machine Memory, Persistent Learning, and Personalization

**Status:** Foundational persistent-learning specification  
**Product:** Guess Machine / مخ ماشين  
**Depends on:** `GUESSENGINE-1.md` through `GUESSENGINE-5.md`  
**Implementation status:** Architecture only; no personalization implementation is authorized

## 0. Purpose and Relationship to Previous Documents

This document owns persistent account/group context and the local learning loop. FactRecord truth remains global and independent. Global DifficultyProfile and local effective difficulty remain separate. ExposureRecord tracks fact identity, not merely wording. PlayerOutcome is noisy evidence. Game Assembly consumes memory as ranking context, while new accounts still receive excellent default games.

> Machine Memory remembers how a group has played trivia. It does not attempt to define who those people are.

Personalization must be useful, explainable, privacy-aware, and felt through fewer repeats, better challenge, and richer composition.

## 1. Machine Memory Responsibilities

Machine Memory owns question/fact/entity/topic exposure, category selection and strength history, difficulty/format performance, skips/reveals/disputes, cooldown, local effective difficulty, returning-account and recurring-group context, uncertainty/decay, privacy controls, reset/delete behavior, and signals for Game Assembly.

It does not own evidence, truth, global difficulty/lifecycle, Foundry quality, payments, subscriptions, or final composition.

## 2. Core Machine Memory Philosophy

Memory must provide observable value. Remember facts, not strings. Local learning never changes global truth. Repetition suppression is the first benefit. Learn cautiously with explicit uncertainty; distinguish recent from lifetime behavior; decay estimates where appropriate; let normal play teach the Machine; never require “training the AI.” New accounts remain excellent, and privacy is architectural.

## 3. Machine Memory Layers

- **Account Memory:** persistent exposures, broad history, category use, custom categories, coarse difficulty context.
- **Group Memory:** optional recurring family/friends/work context and group-effective challenge.
- **Session Memory:** current-game duplicates, saturation, sequencing, and clue leakage.
- **Global Learning:** shared Difficulty/QuestionPerformance intelligence; explicitly not Machine Memory.

## 4. Account Memory vs Group Memory

One account may host family, university friends, and younger siblings. Account Memory safely tracks what passed through the account and broad history. Group Memory tracks group-specific strength, outcomes, and format context. Group creation is optional; MVP can start account-level.

## 5. Session Memory

Session signals include facts/entities/topics/categories/formats already used, prior clues, team order, and saturation. They prevent duplicates, repetitive rhythm, and cross-question leakage. Most session data may be ephemeral; only useful exposures/outcomes persist.

## 6. Exposure as the Foundation

ExposureRecord distinguishes exact QuestionVariant exposure, QuestionRecord exposure, underlying FactRecord exposure, entity exposure, and KnowledgeNode/topic exposure. Fact exposure is the strongest persistent anti-repeat signal because wording can change while knowledge does not.

## 7. Fact-level Repetition

“Who scored Spain’s winner in the 2010 final?” and “Which midfielder netted Spain’s decisive goal against the Netherlands?” share one FactRecord. Machine Memory marks the second as already encountered even in a new language or variant. This is a core anti-slop advantage.

## 8. Repetition Cooldown

Cooldown considers time, games since exposure, category size, prominence, difficulty, result, exact-versus-fact exposure, account/host/group context, and replay settings. Yesterday is strongly suppressed; two years and 100 games ago may be eligible. Exact durations are deferred.

## 9. Memory Decay

**Durable memory:** fact exposure lineage, game count, saved custom scopes, historical outcomes. **Decaying memory:** skill estimates, recent form, entity/topic saturation, and format context. Decay reduces current influence without falsifying history.

## 10. Recency vs Lifetime Signals

A lifetime-strong football group with five recent misses may face harder stock, changed composition, or variance. Recent evidence adjusts cautiously rather than erasing durable history.

## 11. MachineMemoryProfile

```text
MachineMemoryProfile {
  machine_memory_profile_id, account_id, group_id_optional,
  games_played, questions_seen, facts_seen,
  category_statistics, difficulty_statistics, format_statistics,
  category_strength_estimates, effective_difficulty_modifiers,
  recent_fact_exposure, recent_entity_exposure,
  recent_topic_exposure, custom_category_history,
  skip_patterns, dispute_patterns, memory_confidence,
  memory_updated_at, memory_version
}
```

This is a conceptual projection, not one database row.

## 12. Memory Events

Relevant vocabulary includes `GAME_COMPLETED`, `QUESTION_EXPOSED`, `FACT_EXPOSED`, `QUESTION_CORRECT`, `QUESTION_INCORRECT`, `QUESTION_SKIPPED`, `QUESTION_REVEALED`, `QUESTION_DISPUTED`, `HOST_OVERRIDE`, `CATEGORY_SELECTED`, `CUSTOM_CATEGORY_USED`, `FORMAT_SERVED`, and `GROUP_SESSION_COMPLETED`. Derive them from existing canonical events where possible rather than duplicating systems.

## 13. Memory Update Flow

```text
Game/Question Outcome → ExposureRecord → Eligibility/Noise Filter
→ Session Summary
   ├── fact exposure
   ├── category/difficulty/format statistics
   ├── recent topic/entity exposure
   └── group strength
→ MachineMemoryProfile → Future Game Assembly
```

Updates should not block gameplay.

## 14. Category History

Track selection frequency, last use, performance, displayed difficulty, built-in/custom origin, and category combinations. Use it to avoid repetitive defaults, estimate strength, detect saturation, and support continuity. Frequent selection does not automatically mean “favorite.”

## 15. Category Strength

Category strength combines eligible correctness, displayed/effective difficulty, response time, first exposure, sample, and question confidence. It includes estimate and confidence: Football high/strong evidence; Movies medium/moderate; Geography low/weak. This is trivia context, not intelligence scoring.

## 16. Difficulty History

Track 100/200/300 outcomes by category where samples permit. Football 300 frequently correct and Geography 100 frequently missed are useful Assembly signals, not reasons to alter truth or punish teams.

## 17. Effective Difficulty

A canonical Football 200 may be effectively 100 for an expert group. Machine Memory supplies that expectation to Assembly without globally relabeling the question.

## 18. Personalization Without Changing the Board

Keep 100/200/300 stable; do not expose “personal difficulty 247.” Personalization is mainly better inventory choice within the familiar board.

## 19. Entity Exposure

Track recent entity frequency so unique facts do not produce Messi, Messi, Messi, Ronaldo, Messi. Apply current-game and cross-game diversity penalties.

## 20. Topic Exposure

If World Cup finals are exhausted, prefer clubs, managers, transfers, stadiums, Arab football, historic leagues, kits, and records. Memory reinforces KnowledgeMap breadth.

## 21. Era Exposure

Track era saturation when useful—2010s football, recent K-pop, or 2000s films—without rigid quotas. Era is a diversity signal.

## 22. Format History

Remember text, image, audio, reveal, connection, and timeline usage to vary game texture and identify technical issues.

## 23. Format Performance

Groups may differ in image, text, and audio performance. Use this to balance challenge, not eliminate weak formats. Personalization must not become a format filter bubble.

## 24. Format Preference vs Performance

Poor image accuracy may coexist with love of image questions. Correctness is not preference. Preference needs explicit settings/feedback or cautious behavioral evidence—not fake psychology.

## 25. Skip Memory

Skips may reflect category, impossibility, confusion, media failure, or pacing. Aggregate cautiously; never conclude “they hate this” from sparse skips.

## 26. Dispute Memory

Disputes are quality signals. Repeated local disputes may suppress a fact for that group immediately while shared lifecycle reacts only to sufficient global evidence.

## 27. Correctness Memory

Correctness informs strength only after weighting repeat exposure, difficulty confidence, timer/media health, host scoring, and accidental reveals.

## 28. Response Time Memory

Fast answers strengthen evidence of familiarity. Slow social-game answers are ambiguous because groups discuss, joke, and pause. Timing remains secondary.

## 29. Game-level Summaries

```text
GameMemorySummary {
  game_id, account_id, group_id, categories,
  facts_exposed, entities_exposed, topic_distribution,
  difficulty_results, format_results, disputes, skips,
  technical_failures, completed_at
}
```

This may be a derived projection.

## 30. Machine Memory as Game Assembly Input

Assembly uses memory to suppress seen facts, penalize entity/topic saturation, estimate effective challenge, balance formats, diversify coverage, control exploration, and avoid local-problem items. Memory supplies signals, never final decisions.

## 31. Hard vs Soft Memory Constraints

Hard: same fact already in current game, group-blocked question, local quarantine. Strong soft: recently seen fact or repeated entity. Mild soft: older topic/format overuse. Graded constraints prevent memory from exhausting Assembly.

## 32. Repeat Suppression Hierarchy

Strongest to weakest: exact variant, QuestionRecord, FactRecord, near-identical fact, relationship/entity cluster, topic, entity, era. Semantic closeness controls penalty strength.

## 33. When Repeats Are Acceptable

Old exposure, tiny category, replay/review/nostalgia mode, foundational 100s, or explicit repeat-friendly settings can permit repetition. Policy is contextual, not an eternal ban.

## 34. Memory Confidence

One correct football answer proves little; twenty strong games can yield high confidence. No data means unknown, and unknown falls back safely.

## 35. Cold Start

Use canonical difficulty, selected language/region, excellent default stock, and broad diversity. Game one must work without personalization.

## 36. Warm Start

After a few games, enable fact suppression, early low-confidence strength, and recent entity/topic awareness without exaggerated claims.

## 37. Mature Memory

After many games, strong exposure, strength, saturation, effective difficulty, and format history should noticeably improve selection. Player-facing promise: “Your Machine remembers your games.”

## 38. Recurring Groups

Saved `Family`, `The Boys`, or `University` groups may have separate profiles while sharing appropriate account/host exposure. UI is deferred.

## 39. Account-level vs Group-level Exposure

A fact seen with Group A may receive a strong Group A penalty and mild Group B/account penalty because the host may remember the answer. Exact weighting remains a product/fairness decision.

## 40. Host Exposure

The account holder often sees both clue and answer across groups. Conceptually distinguish host/account exposure from group/team exposure without requiring every participant to create an account.

## 41. Group Identity Without Player Accounts

Lightweight saved names or host-created profiles support majlis/couch play without participant sign-up. Group learning must preserve casual social UX.

## 42. Machine Experience Level

Possible honest abstractions are games remembered, facts seen, and Machine experience. Avoid fake RPG levels unless backed by real accumulation.

## 43. Player-facing Memory Language

Use `Machine Memory`, `24 games remembered`, `Your Machine remembers 430 questions`, and `Fewer repeats as you play`. Avoid “AI profile,” personality claims, or surveillance language.

## 44. Account Retention Value

New account: excellent trivia. Returning account: excellent trivia plus fewer repeats, better challenge/variety, saved custom categories, and group continuity. Persistent accounts become objectively better without artificial punishment.

## 45. Burner-account Resistance Through Value

A burner voluntarily loses exposure history, calibrated group challenge, saved groups/categories, and Machine experience. Retention comes from accumulated intelligence, not restrictions.

## 46. Free vs Paid and Machine Memory

Entitlements and memory remain separate. If custom categories become paid, lapse should not erase owned history or exposure. Exact access rules are deferred.

## 47. Saved Custom Category Memory

Remember custom scope, facts served, performance, source viability, and map references so future use can continue rather than restart.

## 48. Custom Category Exposure

Custom-created facts enter normal ExposureRecord. If later served in a built-in category, the same FactRecord remains seen.

## 49. Cross-category Fact Memory

A Ronaldo transfer fact under Football, Real Madrid, Transfers, or Portugal has one exposure identity. Category aliases never disguise repetition.

## 50. Memory and Knowledge Maps

Memory may summarize Football World Cup heavily exposed, Premier League moderate, Arab football/managers low. Assembly selects underexposed existing stock; Foundry may manufacture valuable gaps without one account controlling global inventory.

## 51. Local Inventory Needs

When a mature account exhausts common Football 100 World Cup stock, use underexposed nodes, prepare new inventory, broaden format, or relax very old cooldowns—never trust standards.

## 52. Memory-driven Manufacturing Demand

Machine Memory may contribute `avoid_fact_ids`, underexposed nodes, effective target, and format gap to game-specific ManufacturingDemand. Pixar depletion may trigger full-quality pre-game manufacturing.

## 53. Personalization Boundaries

Memory may influence selection, challenge, diversity, repetition, and coverage. It never influences truth, answer correctness, source/safety standards, who is allowed to win, or hidden arbitrary handicaps.

## 54. Fairness

Default play should not give one team harder questions merely because it appears stronger. Apply personalization mainly across the whole game unless an explicit adaptive-team mode exists. Final fairness belongs to Game Assembly.

## 55. Adaptive Difficulty Transparency

Normal selection can adapt quietly while 100/200/300 stays coherent. Aggressive adaptive modes may later require explicit transparency; UX is deferred.

## 56. Memory and Question Quality

One group’s disputes/skips can trigger local suppression quickly. Many independent groups can trigger global lifecycle review conservatively.

## 57. Local Quarantine

Local suppression may follow a dispute, host report, device-specific media failure, or explicit block. It protects that group without globally condemning a valid question.

## 58. User Feedback

Future controls may include report, seen before, too easy/hard, bad question, and do not show again. Explicit feedback can outweigh inference locally but remains subject to quality and abuse controls. Memory must work without it.

## 59. “Seen This Before” Signal

If a player reports prior exposure absent from records, locally suppress it. They may have used another account or seen it elsewhere. Do not automatically mark a global duplicate.

## 60. Memory Reset

Support conceptual resets for recent personalization, group profile, account memory, or cooldown preferences. Reset does not alter global truth or QuestionPerformance. Exact UI and irreversible consequences require confirmation later.

## 61. Memory Deletion

Privacy/account deletion must permit removal of account/group association and saved ownership data. Appropriately anonymized aggregate outcomes may remain only where lawful and policy-approved. Exact legal behavior is deferred.

## 62. Memory Export / Transparency

Potential views include games remembered, facts-seen count, category strengths, and saved groups. Avoid exposing noisy internal scores as pseudo-scientific judgments.

## 63. Privacy by Design

Collect only game-benefit data: IDs, category selection, fact exposure, outcomes, group IDs, and time. Avoid unrelated browsing, contacts, precise location unless separately necessary, background microphone analysis, demographics, psychological traits, and off-platform behavior.

## 64. Data Minimization

Store “Group has high observed success on Football 200/300,” not “User loves football and is competitive.” The first is measurable operational state; the second is speculative profiling.

## 65. Retention Policy Concepts

Fact exposure can be long-lived, recent entity saturation short-lived, skill estimates decaying, and technical failures operationally short. Exact retention periods are deferred and must support deletion/privacy obligations.

## 66. Anonymized Global Learning

Separate user-linked local state from de-identified/aggregated global Difficulty learning. Global calibration should not require persistent identifiable profiles.

## 67. Anti-poisoning

Local memory can react rapidly because impact is local. Global learning requires independent accounts, adequate samples, confidence, anomaly filtering, and clean outcomes.

## 68. Multiple Devices

Canonical memory belongs to account/group identity and should survive device changes. Local/offline caches may exist later but are not authoritative ownership.

## 69. Guest Mode

Guests receive session memory and temporary repeat suppression without durable profiles. Optional account conversion may preserve recent history if product/privacy design permits; auth flow is deferred.

## 70. Account Merge / Migration

Future merges should consolidate fact exposures, group history, custom categories, and statistics while deduplicating identities and preserving provenance. Exact auth behavior is deferred.

## 71. Memory Versioning

MachineMemoryProfile records projection/algorithm version and migration history. Old PlayerOutcomes remain historical observations; derived strengths and cooldown projections may be recomputed.

## 72. Recomputable Memory

Where practical, profiles derive from durable ExposureRecords, PlayerOutcomes, and game history. Event sourcing is not mandated, but sufficient inputs must survive projection changes.

## 73. Confidence and Sample Size

Every strength/statistic includes sample and confidence. `Football strength: high` after two questions is invalid. Sparse evidence remains weak/unknown.

## 74. Uncertainty

Use `unknown`, `weak`, `moderate`, and `strong` evidence states or equivalent. Unknown falls back to canonical/default behavior.

## 75. CooldownAssessment

```text
CooldownAssessment {
  fact_id, last_seen_at, times_seen,
  same_variant_seen, same_question_seen, same_fact_seen,
  group_id, account_id, category_size,
  game_count_since_exposure,
  result: eligible|strong_penalty|medium_penalty|light_penalty|fully_fresh,
  assessment_version
}
```

Exact formulas are deferred.

## 76. Entity Saturation

Four current-game Messi appearances or eight across three football games justify diversity penalties even when facts differ. Saturation windows and caps are contextual.

## 77. Topic Saturation

When World Cup inventory dominates, memory helps surface clubs, managers, transfers, regional football, and historic leagues. This supports better questions and perceived breadth.

## 78. Memory and Difficulty Escalation

Expert groups receive stronger meaningful facts, deeper nodes, natural clue reduction, and richer formats—not obscure garbage. Quality gates remain unchanged.

## 79. Memory and Easy Questions

Experts still deserve excellent 100s and pacing relief. Personalization should improve calibration, not make every slot punishing.

## 80. Memory and Game Rhythm

Memory may inform accessible openings, format mix, avoidance of consecutive deep-history items, and entity variation. Exact pacing belongs to Assembly.

## 81. Machine Memory and Custom Categories

For returning `Manchester United 2008–2015`, remember served facts, covered branches, strength, and outcomes. Next use should be genuinely fresh. This continuity is essential to premium custom categories.

## 82. Custom Category Continuity

First use builds a map and verified facts. Later use reuses valid evidence/map, suppresses exposure, and expands undercovered branches. The category evolves without regenerating slop.

## 83. Machine Memory and Infinite Questions

“Infinite” depends on knowing what is new for this account. A million-question bank feels finite if the same 30 facts recur. Machine Memory converts inventory breadth into perceived inexhaustibility.

## 84. Memory Value Without AI Language

Use “Your Machine remembers what you’ve played,” “Fewer repeats every game,” “The more you play, the sharper the Machine gets,” and “Machine Memory: 42 games.” Sell the capability, not ML jargon.

## 85. Personalization Failure Modes

Avoid tiny-sample overfit, category elimination from low performance, equating correctness with preference, endless escalation, filter bubbles, forgetting exposure, cross-wording repeats, local data changing global truth, host mistakes as skill, inferred traits, account/group context conflicts, and unfair team adaptation.

## 86. Anti-filter-bubble Design

Do not personalize only toward strengths, easy formats, or familiar topics. Use memory to improve diversity and surface underexposed branches.

## 87. Serendipity

Retain surprising but fair topics, new formats, and controlled experimental questions. Personalization must not make games deterministic.

## 88. Exploration vs Exploitation

Exploit known good fit while exploring fresh topics/formats enough to learn and keep games alive. The algorithm is deferred; both objectives are explicit.

## 89. Memory Drift

New members, older children, or new obsessions change group behavior. Decay and recent clean data let memory adapt instead of fossilizing old estimates.

## 90. Group Composition Change

Future controls may reset a group, create a new group, or reduce confidence when composition changes. Individual participant accounts are not required.

## 91. Memory Health

Monitor profile age, samples, stale estimates, excessive suppression, inventory starvation, account/group conflicts, and uncertainty. Unhealthy memory degrades toward defaults.

## 92. Inventory Exhaustion for Mature Accounts

Prioritize underused nodes, manufacture new verified facts, create legitimate new formats, revisit very old exposure, then safely broaden scope. Never drop trust standards.

## 93. Memory-assisted Question Foundry

Game-specific Foundry demand may include `avoid_fact_ids`, `avoid_entity_ids`, `underexposed_nodes`, `effective_difficulty_target`, and `format_gap`. Global stock should remain reusable rather than bizarrely personalized.

## 94. Memory and GamePackage Preparation

`CHECKING MACHINE MEMORY` can truthfully mean suppressing repeats, calculating effective challenge, inspecting custom history, and locating inventory gaps. This connects the industrial UI to real work.

## 95. Memory Latency

Lookup/projections must be fast for package preparation. Heavy recomputation occurs after games, asynchronously, or through cached projections. Infrastructure is deferred.

## 96. Memory Resilience

If memory is unavailable, use session-only suppression, canonical difficulty, and standard ranking. Personalization failure must never block a valid game.

## 97. Observability

Internal tools should answer games/facts remembered, strength/confidence, saturated entities/topics, last category use, recent difficulty, which questions are suppressed and why, freshness reasoning, and why a canonical 200 is effectively easier. Debug detail is not exposed by default.

## 98. Memory Debugging

For “I keep seeing the same football questions,” inspect FactRecords, exposure lineage, duplicate mapping, cooldown, account/group/host identity, package selection reason, and custom overlap. Memory must be diagnosable.

## 99. Machine Memory Metrics

Track fact/exact repeat rate, repeat interval/complaints, returning-game quality, inventory exhaustion, strength confidence, personalization coverage, suppression counts, group-memory usage, and update failures. Do not optimize engagement time over trivia quality.

## 100. Product Success Metrics

Success means fewer repeats, better outcome-level fit, fresh returning custom categories, higher mature-account game quality, fewer complaints, and broader game diversity.

## 101. Security

User-linked memory requires authorization, group ownership, tenant isolation, deletion, least-privilege internal access, and safe logging. Auth architecture is deferred.

## 102. Memory Input Security

Group names and custom scopes are untrusted strings. They cannot inject instructions, alter policies/source standards, or access/modify other accounts.

## 103. Full Worked Example: New Account

Game one has no profile, so Assembly uses canonical difficulty and diverse fresh stock. After completion, ExposureRecords record facts/questions; category/difficulty statistics begin; strength remains low-confidence. The cold start was excellent and the next game already gains basic repeat suppression.

## 104. Full Worked Example: Returning Family Group

After 30 games: Football strong, Movies medium, Geography weak; World Cup heavily exposed; images overused. Assembly inputs suppress seen facts, favor underexposed football nodes, select meaningful stronger football 300s, preserve fair geography 100s, and diversify formats across the game—without handicapping individual teams.

## 105. Full Worked Example: Cross-wording Duplicate

Game 4 records FactRecord A. Game 20 encounters a new QuestionVariant under A. CooldownAssessment uses FactRecord exposure and strongly suppresses it despite novel wording. The Machine remembers facts, not strings.

## 106. Full Worked Example: Custom Category Return

First `Nintendo GameCube` game covers launch, Mario Sunshine, controller, Smash Bros., hardware, and Zelda. Months later, memory suppresses those FactRecords, reuses valid map/evidence, targets undercovered accessories/developers/regional releases, and manufactures fresh full-quality questions.

## 107. Full Worked Example: False Skill Signal

Three Football 300s are correct, but two were repeats and one leaked the answer. Eligibility filtering leaves almost no clean skill evidence. The group remains unknown/weak-confidence rather than instantly “expert.”

## 108. Full Worked Example: Group Difference

The same account’s Family group is strong at Football; University group is average. Group profiles preserve this difference. Account/host exposure still mildly suppresses facts seen elsewhere because the host knows answers.

## 109. Full Worked Example: Memory Decay

A group was weak in K-pop a year ago but recently performs strongly over sufficient clean games. Recent evidence gradually outweighs stale strength estimates while durable FactRecord exposure remains.

## 110. Machine Memory Invariants

1. Machine Memory never changes FactRecord truth.
2. Fact exposure is independent of wording.
3. Current-game duplicate facts are blocked.
4. Returning accounts receive fewer semantic repeats.
5. Local learning cannot redefine global difficulty/truth directly.
6. Group behavior cannot poison global systems.
7. Unknown memory falls back safely.
8. Small samples do not justify strong skill conclusions.
9. Correctness does not equal preference.
10. Low performance does not remove a category.
11. Personalization preserves serendipity.
12. Account, group, session, and global layers remain distinct.
13. Memory is resettable/deletable in principle.
14. Store game signals, not inferred personality.
15. Custom categories participate fully.
16. Cross-category facts retain one exposure identity.
17. Memory failure cannot prevent default gameplay.
18. Saved memory is auditable/versioned.
19. Mature memory improves challenge and variety, not merely hardness.
20. The Machine remembers games, not private lives.
21. Host exposure can matter without participant accounts.
22. Entitlement changes do not silently erase memory.
23. Privacy controls never mutate global truth.
24. Local quarantine does not automatically condemn global inventory.
25. Memory-driven manufacturing uses full Foundry quality.
26. Cooldown relaxation is preferable to unverified inventory.

## 111. MVP Machine Memory

Phase 1: persistent account FactRecord/QuestionRecord exposure, category history, basic category/difficulty outcomes, recent entity/topic exposure, cooldown, basic effective-difficulty context, game count, and a simple versioned profile projection. Optional lightweight group IDs if architecture permits.

Later: saved groups, nuanced decay, format performance, Foundry demand, exploration, local quarantine, richer custom continuity, host/group exposure, and advanced privacy controls. First win: **this account stops seeing the same damn facts.**

## 112. What This File Does Not Decide

This document defers exact personalization/cooldown/skill/confidence formulas; retention/privacy law; saved-group UX/identity; recommendation ranking; database/analytics/event architecture; subscription integration; Machine Experience UI; and account/auth systems.

It creates no routes, services, models, migrations, analytics jobs, personalization algorithms, recommendation code, prompts, or infrastructure.

## 113. Handoff to GUESSENGINE-7

`GUESSENGINE-1.md` defines doctrine.  
`GUESSENGINE-2.md` defines canonical contracts.  
`GUESSENGINE-3.md` defines the Question Foundry.  
`GUESSENGINE-4.md` defines knowledge acquisition and verification.  
`GUESSENGINE-5.md` defines challenge prediction and calibration.  
`GUESSENGINE-6.md` defines persistent Machine Memory and local learning.  
`GUESSENGINE-7.md` will define the Custom Category Engine: scope interpretation, temporary maps, viability, manufacturing, reuse, persistence, monetization boundaries, guarantees, and “Make Your Category / اصنع فئتك.”

`GUESSENGINE-7.md` must not be created as part of this work.

## 114. Machine Memory Doctrine

1. Remember facts, not just wording.
2. Memory must make games better.
3. Fewer repeats is the first promise.
4. The Machine learns through play.
5. Machine Memory is trivia memory, not personality profiling.
6. Local learning never changes truth.
7. Returning accounts should genuinely improve.
8. New accounts must still be excellent.
9. Account memory and group memory are different.
10. Exposure survives category changes.
11. Custom categories participate fully.
12. Skill estimates require evidence.
13. Correctness is not preference.
14. Personalization preserves surprise.
15. Memory may decay; history need not disappear.
16. Global learning is conservative; local learning can be faster.
17. Mature accounts receive better selection, not merely harder questions.
18. Privacy is an architectural requirement.
19. The Machine should know what it has already shown you.
20. Infinite Questions feels infinite only when the Machine remembers what you have seen.
21. The more you play, the better your Machine gets.

