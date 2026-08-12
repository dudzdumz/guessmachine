# Guess Engine 5: Difficulty Engine, Calibration, and Adaptive Challenge

**Status:** Foundational challenge-model specification  
**Product:** Guess Machine / مخ ماشين  
**Depends on:** `GUESSENGINE-1.md` through `GUESSENGINE-4.md`  
**Implementation status:** Architecture only; no scoring or analytics implementation is authorized

## 0. Purpose and Relationship to Previous Documents

This document owns the Guess Engine’s challenge model. FactRecord represents truth; QuestionVariant controls presentation; DifficultyProfile stores prediction and calibration; PlayerOutcome and QuestionPerformance provide noisy behavioral evidence; and MachineMemoryProfile supplies account/group context. Difficulty evolves without mutating FactRecord.

100/200/300 remain the stable player-facing levels. Wording must never be tortured to meet a requested slot.

> Difficulty is predicted before play and measured after play.  
> A question should fit a level naturally. The Machine must never make a fact “hard” by making the wording bad.

## 1. Difficulty Engine Responsibilities

The engine owns initial prediction; clue, answer-space, prominence, obscurity, language, region, cohort, media, and format analysis; empirical calibration; confidence; promotion/demotion; drift/outlier detection; group-effective challenge; and difficulty-quality monitoring.

It does not own factual validation, final GamePackage ranking, account identity, truth, host scoring rules, or final fairness decisions. It publishes inspectable challenge metadata for those systems.

## 2. Core Difficulty Philosophy

Difficulty is contextual, not synonymous with obscurity. Clear writing and hard knowledge coexist; confusion is not legitimate challenge. Facts have natural ranges. Performance should eventually outrank intuition, once the sample is clean and sufficient. Region, language, cohort, format, media, exposure, and category expertise matter. Confidence is explicit, and different variants of one fact may differ.

## 3. Player-facing Difficulty Model

- **100:** accessible recognition, famous entities/events, generous clues, casual players, small plausible answer space.
- **200:** real category familiarity, secondary entities, specific relationships, moderate narrowing, meaningful fandom knowledge.
- **300:** specialist yet satisfying knowledge, deeper facts, subtle but sufficient clues, larger plausible space.

300 never means unreadable, arbitrary, trick-based, typo hunting, meaningless exact-date recall, or irrelevant trivia dust.

## 4. Fact Difficulty vs Question Difficulty

**Fact difficulty** is the inherent obscurity/specificity of the knowledge. **Presentation difficulty** is the information exposed by QuestionVariant and media. “Cristiano Ronaldo played for Real Madrid” is easy; hiding it behind “Which Iberian football institution…” only creates bad prose. Conversely, generous contextual clues can make a deeper fact accessible.

## 5. Difficulty Dimensions

Dimensions include answer/referenced-entity prominence, fact popularity/specificity, era, plausible answer-space size, clue count/value/directness, contextual narrowing, linguistic/transliteration burden, region/cultural familiarity, media clarity/reveal, prior exposure, category expertise, format, and temporal relevance. They remain explainable dimensions before any composite score.

## 6. Answer Prominence

Messi, Paris, Mario, and Michael Jackson are broadly prominent; a backup goalkeeper, deep-cut track, or secondary cast member is less so. Prominence is domain/cohort-specific: an entity globally obscure may be central to K-pop or Omani football fans.

## 7. Fact Obscurity

Entity fame and fact obscurity are independent. Messi’s nationality is easy; the opponent for his first Champions League goal is much deeper. The Difficulty Engine models the relationship being tested, not merely the fame of nearby entities.

## 8. Answer-space Size

The plausible alternatives for “Which country won the 2022 World Cup?” are constrained; “Which player scored this goal?” may be vast. Larger plausible spaces generally increase challenge, all else equal. Exact enumeration is unnecessary, but the scope must be reasoned about.

## 9. ClueBudget

```text
ClueBudget {
  clue_count, clue_specificity, direct_associations,
  date_or_era, nationality, team_or_work,
  media_information, category_information,
  intended_information_value, version
}
```

One fact may support natural 100 and 200 variants when clue budgets differ meaningfully. It must not generate fake inventory through paraphrase.

## 10. Clue Information Value

Clues are not equal. Nationality may narrow slightly; exact club and season may narrow sharply; an iconic nickname may reveal the answer. Prediction evaluates information value and interaction, not raw clue count.

## 11. Category Context as a Clue

Visible category, subcategory, custom scope, prior questions, and media all narrow answers. “Who directed Inception?” inside a `Christopher Nolan` category is effectively leaked. Difficulty must be evaluated in the actual presentation context.

## 12. Language Difficulty

Arabic and English variants may differ because of name spellings, translation conventions, wordplay, acronyms, grammar, and transliteration. They may have distinct DifficultyProfiles or cohort modifiers. Arabic never inherits English difficulty blindly.

## 13. Region and Cultural Familiarity

An Omani cultural fact may be 100 in Oman and 300 globally; a US sports fact may reverse that pattern. Regional relevance modifies familiarity and prediction, never factual truth.

## 14. Generational Familiarity

Spacetoon, classic Gulf television, old football eras, and 2010s K-pop may vary by cohort. The engine should infer context from aggregate behavior and category choice rather than requiring intrusive age/demographic profiles.

## 15. Format Difficulty

Text depends on wording; images on crop, blur, angle, rarity, logos, and distinctiveness; audio on duration, segment, vocals, distortion, and playback; video on duration, context, captions, and logos. Difficulty consumes Media Engine strength metadata without owning media sourcing.

## 16. Media Reveal Curve

Progressive reveal produces a challenge curve: tight crop → partial reveal → full image; one-second audio → longer segment → iconic chorus. Each treatment version may calibrate separately. Gameplay mechanics are deferred.

## 17. Question Format Priors

Exact-year, image recognition, identity clues, statistics, connection, and timeline questions may exhibit different performance baselines. Format-specific priors may be learned, but no format receives a permanent level by assumption.

## 18. Predicted Difficulty

Prediction consumes FactRecord, QuestionVariant, QuestionIntent, answer/entity prominence, KnowledgeNode depth, ClueBudget, region, language, format, media strength, and comparable calibrated performance. It returns intended level, predicted level/score, confidence, and explanatory features.

## 19. Intended vs Predicted Difficulty

If ManufacturingDemand asks for Arabic Football 300 and the candidate predicts 200, the label remains 200. The Foundry may naturally adjust clues, place it in 200 inventory, or choose another fact. Requested stock never overrides integrity.

## 20. Prediction Confidence

Confidence rises with calibrated comparables, rich metadata, stable prominence estimates, mature format data, cohort coverage, and strong language analysis. New formats and rare categories begin with lower confidence.

## 21. Difficulty Feature Explanation

```text
Predicted: 300; confidence: medium
+ low-prominence answer
+ specific historical detail
+ large plausible answer pool
+ minimal clue narrowing
- competition and season are named
```

Explanations are internal diagnostics, not necessarily player-facing.

## 22. Bounded Difficulty Rewrite Loop

```text
target 300 → candidate 100 → remove excessive clue leakage
→ candidate 200 → one natural revision → still 200
→ STOP → store as 200 → seek deeper fact for 300
```

Readability cannot be degraded indefinitely.

## 23. Inherent Difficulty Range

Conceptually, facts may have `natural_min_level` and `natural_max_level`. “Paris is France’s capital” is naturally 100. A cult film’s cinematographer may support 200/300. This range prevents absurd writing attempts.

## 24. Difficulty Floor and Ceiling

A variant has a minimum fair challenge and maximum fair challenge. Below the floor, clues give away the answer; above the ceiling, wording becomes unfair. Outside that envelope, choose another fact.

## 25. Pre-calibration Sources

Before gameplay data, use explicit rubrics, entity prominence, map depth, clue analysis, comparable questions, region/category rules, and editorial judgment. No one source dominates blindly.

## 26. QuestionPerformance Data

Use attempts, correct/incorrect, skips, reveals, response time, disputes, overrides, language, region, cohort, format, and prior exposure. Accuracy alone cannot distinguish legitimate challenge from ambiguity, broken media, or bad wording.

## 27. PlayerOutcome Noise

Host misjudgment, discussion after time, interruptions, blurting, repeat exposure, manual errors, near-answers, and accidental reveal create noise. Every outcome is an observation with context, not perfect ground truth.

## 28. Correctness Rate

Very high correctness suggests ease; very low correctness may mean hard, broken, ambiguous, or wrong. Calibration must consult disputes, timing, skips, media health, and quality before interpreting low accuracy as desirable 300 behavior.

## 29. Response Time

90% correct in one second is easier than 90% after long discussion. Forty percent correct quickly may indicate binary familiarity. Timing is normalized by mode, group size, host behavior, pauses, and interruptions where possible.

## 30. Skip Rate

Skips may signal challenge, boredom, confusion, broken media, poor fit, or perceived impossibility. They are supporting evidence only.

## 31. Dispute Rate

Abnormal disputes are quality alarms: ambiguity, multiple answers, staleness, answer-set gaps, or host uncertainty. Route to quality review before normal calibration.

## 32. Host Overrides

Frequent overrides suggest incomplete AcceptedAnswerSet, unclear wording, or ambiguous fact. These samples are down-weighted or excluded until reviewed.

## 33. Prior Exposure

ExposureRecord distinguishes first and repeat encounters. Repeat correctness is weak evidence of inherent difficulty and should be weighted accordingly. Machine Memory should already suppress repeated facts.

## 34. Sample Size

Confidence progresses from `insufficient_sample` to `early_signal`, `moderate_calibration`, and `strong_calibration`. Three games cannot promote/demote a question. Exact thresholds remain empirical decisions.

## 35. Calibrated Difficulty

```text
calibrated_level
calibrated_score
calibration_confidence
sample_size
cohort_context
last_calibrated_at
```

Reliable observations gradually outweigh the prediction prior.

## 36. Calibration Blending

Conceptually: `final estimate = prediction prior + weighted observed performance`. Early clean data moves the estimate modestly; large representative samples can dominate. No exact statistical formula is selected.

## 37. Global Calibration

Global calibration estimates default challenge across the relevant population. It prevents one account, region, or specialist cohort from dominating and supplies canonical Question Bank classification.

## 38. Regional Calibration

Preserve a global profile plus regional/language modifiers when samples support them. An Omani-culture question can be global 300 and Oman 100 without duplicating FactRecord.

## 39. Category-expert Cohorts

A group repeatedly excelling at football can be recognized as stronger than baseline in Football. This primarily influences Machine Memory and Game Assembly, not global difficulty. One cracked group does not redefine the world.

## 40. Machine Memory Difficulty

```text
CategoryStrength {
  category_id, strength_estimate, difficulty_success_rate,
  confidence, recent_form, sample_size, last_updated
}
```

This is trivia-performance memory—Football strong, Movies medium, Geography weak—not invasive intelligence profiling.

## 41. Group-specific Effective Difficulty

**Canonical difficulty** is default calibrated challenge. **Effective difficulty** is expected challenge for one group. A canonical Football 200 may feel like 100 to experts; Assembly may select canonical 300 to deliver a satisfying 200-like experience.

## 42. Personalization Without Relabeling

The board remains coherently 100/200/300. The engine selects better-fitting canonical inventory rather than visibly redefining every label per account.

## 43. Adaptive Challenge

Football experts receive deeper selections, weaker movie groups clearer 100s, dominant categories stronger candidates, and low-confidence areas conservative stock. Adaptation should feel like better choosing, not secret cheating.

## 44. Fairness Between Teams

Difficulty metadata exposes canonical/calibrated level, confidence, format, media strength, category, and cohort modifiers so Game Assembly can avoid giving one team a monster 200 and another a trivial 200. Final balancing belongs downstream.

## 45. Difficulty Confidence in Game Assembly

High-stakes/fairness-sensitive slots should prefer high-confidence estimates. Low-confidence items may appear less often or in lower-stakes controlled exploration; they are not banned.

## 46. Calibration Eligibility

Outcomes carry eligibility/weight flags. Technical failure, void, known exposure, dispute, media failure, override, or major interruption may exclude or down-weight the sample.

## 47. Performance Cohort Context

Relevant context includes language, region, category experience, mode, format, first exposure, and aggregate group strength. Unnecessary demographics are not collected.

## 48. Outlier Detection

If a stable 100 suddenly becomes unanswered, inspect media breakage, variant/answer changes, category context, deployment issues, and cohort shift before recalibrating. Sudden change creates a drift/quality alert.

## 49. Version-aware Calibration

Substantial wording changes may invalidate or discount old data. Calibration tracks QuestionRecord, variant ID/version, localization version, and media treatment; FactRecord-level performance is insufficient.

## 50. Media Versioning and Difficulty

Crop, blur, clip length, asset, and reveal sequence materially change challenge. Media treatment versions maintain separate or explicitly transferable calibration.

## 51. Language Version Calibration

Arabic and English variants may calibrate separately when phrasing or transliteration changes behavior. A language modifier cannot conceal a broken variant; it may trigger rewrite.

## 52. Difficulty Promotion

A 100 may move to 200 after sufficient clean evidence shows lower correctness/longer response with low disputes and healthy media. Promotion is versioned and auditable.

## 53. Difficulty Demotion

A widely and quickly answered 300 may move to 200 or 100. A good question is reclassified, not retired merely for being easier than predicted.

## 54. Retirement Due to Difficulty

A factually correct item may retire when near-zero success, high skips, and satisfaction/quality evidence show arbitrary obscurity rather than meaningful expertise. Review distinguishes impossible trivia from a fixable variant.

## 55. Impossible vs Hard

Hard means a specialist could reasonably know or infer the answer. Impossible means arbitrary memorization without meaningful domain relevance. The Question Bank should contain satisfying specialist challenge, not impossibility for its own sake.

## 56. Satisfying Difficulty

A good 300 should make knowledgeable players say, “FUUUCK, I knew that,” not “Who the hell would know that?” This qualitative north star informs editorial review, later satisfaction signals, and retirement policy.

## 57. Difficulty and Question Value

Difficulty is not quality. A brilliant 100 can be the game’s best moment; a terrible 300 can poison trust. Assembly should value entertainment, clarity, and meaningful knowledge across all levels.

## 58. Category-specific Rubrics

Football may weigh star prominence, club/tournament history, and tactics; music artist recognition, album tracks, producers, and chronology; film actors, directors, scenes, and cinematographers; geography countries, capitals, landmarks, and boundaries. Category features specialize one shared system rather than fragmenting it.

## 59. KnowledgeNode Depth

Deeper nodes often correlate with difficulty—World Cup → 2014 → Germany → substitutes → match—but a deep node may contain a famous fact. Depth is one feature, never a label.

## 60. Entity Overexposure and Perceived Difficulty

Repeated Messi questions prime context and make later Messi facts easier. Recent entity exposure should modify effective difficulty and encourage entity diversity.

## 61. Cross-question Context

Earlier questions can reveal clubs, dates, people, or relationships needed later. Difficulty metadata should expose entity/fact relations so Game Assembly can penalize leakage and sequence effects.

## 62. Custom Category Difficulty

Selecting `Manchester United 2008–2015` signals some familiarity, but not expertise. Custom scope is both category context and a cohort hint, so default global football estimates may need a cautious modifier.

## 63. Custom Category Calibration

Repeated custom scopes can reveal whether 100s are trivial, 300s random, and which map branches yield satisfying depth. Aggregated, privacy-safe results can improve future maps and Foundry targets.

## 64. Custom Category Difficulty Failures

A narrow category may not support three honest levels; evidence may cover only basics; all facts may be trivial or absurdly niche; the title may reveal answers. The Machine may broaden safely, offer fewer levels, warn Assembly, or use adjacent defensible branches—never fake a spread.

## 65. Difficulty and Current Facts

Recency sometimes raises prominence, as with a current champion, but a foreign current office-holder may remain obscure. Recency is one feature and also a freshness obligation, not a guarantee of ease.

## 66. Difficulty and Record Claims

Record/stat questions may be hard because of exact number, scope, era, and close contenders. They should reward memorable domain knowledge, not force blind number guessing.

## 67. Number Questions

Exact numeric answers require cultural/domain meaning, clear unit/scope, and sensible answer handling. Tolerance or multiple choice may change difficulty, but exact mechanics are deferred.

## 68. Year Questions

Year difficulty depends on event prominence, era, chronology, and category expertise. Avoid mass-producing “what year?” filler merely because dates are structured.

## 69. Name Recognition Questions

An obscure fact may become an easy image question when the face/object is iconic. Visual recognizability and treatment often matter more than textual fact obscurity.

## 70. Connection Questions

Challenge depends on clue count, overlap, specificity, and association strength. More weak, unrelated clues are not automatically helpful; the combined path must remain fair and coherent.

## 71. Multi-step Questions

Avoid needless chained arithmetic or transformations unless the format explicitly intends reasoning. Challenge should measure topic knowledge, not accidental computation burden.

## 72. Cognitive Load vs Knowledge Difficulty

Separate knowledge challenge from reading complexity, working memory, computation, and linguistic complexity. Guess Machine should primarily reward knowledge/recognition, not clutter.

## 73. Accessibility

Tiny text, weak contrast, inaudible audio, illegible imagery, color-only clues, and unnecessarily complex Arabic are defects, never difficulty. Technically inaccessible outcomes are excluded from calibration.

## 74. Time Pressure

DifficultyProfile should represent question challenge independently of one timer. Game modes may apply timing modifiers later; canonical difficulty must not bake in one UI configuration.

## 75. Calibration Windows

Familiarity drifts as people become famous, songs go viral, or history becomes topical. Recent observations may receive more relevance, especially for dynamic cultural knowledge, while stable baselines remain available. Exact decay is deferred.

## 76. Cultural Drift

A 300 can become 100 after a viral moment. Recalibration updates DifficultyProfile and history without changing FactRecord or pretending the original estimate never existed.

## 77. Seasonal Difficulty

Ramadan series during Ramadan, football during tournaments, and film during awards season may temporarily become easier. Seasonal context should be a modifier, not a permanent truth mutation.

## 78. Difficulty Drift Monitoring

Material divergence triggers analysis of calibration, variant, media, cohort mix, exposure, context, and quality. Actions include recalibration, review, rewrite, or media repair.

## 79. New Question Exploration

Fresh high-quality items need controlled exposure to calibrate. Assembly may place limited low-confidence inventory in appropriate slots without flooding games with untested questions. Ranking details are deferred.

## 80. Experimental Difficulty State

Derived states may be `predicted_only`, `early_calibration`, `calibrated`, `high_confidence`, and `drift_suspected`. They need not become a new canonical enum if Confidence/Profile fields express them sufficiently.

## 81. Editorial Difficulty Overrides

Editors may override for expert knowledge, launch calibration, cohort mismatch, or obvious prediction failure. EditorialAction records reason and prior values. Later clean empirical evidence may challenge the override.

## 82. Model, Editor, and Data Disagreement

If prediction says 300, editor says 200, and clean observed data says 100, preserve all three signals and ultimately favor strong representative evidence. History is appended, never overwritten.

## 83. Calibration Pipeline

```text
PlayerOutcome → Eligibility/Noise Filtering
→ QuestionPerformance Update → Cohort Segmentation
→ Observed Difficulty Signal → Blend with Existing Profile
→ Confidence Update → Drift/Quality Checks
→ DifficultyProfile Update
   ├── no level change
   ├── promote
   ├── demote
   └── route to review
```

## 84. Machine Memory Update Flow

```text
PlayerOutcome → account/group CategoryStrength
→ effective-difficulty estimates → future Game Assembly
```

This local path is separate from global calibration.

## 85. Global vs Local Learning

**Global learning** uses aggregated clean evidence for default classification. **Regional learning** uses sufficiently large language/region cohorts. **Machine Memory learning** adapts one account/group faster because consequences are local and reversible.

## 86. Anti-poisoning

Use minimum samples, abnormal-outcome detection, account weighting caps, group concentration controls, game-quality filters, confidence caps, and editorial escalation. Exact anti-fraud rules are deferred.

## 87. New Account Behavior

Without memory, use canonical difficulty, language/region defaults, and broadly balanced selection. The game must be excellent before personalization.

## 88. Returning Account Behavior

As memory grows, suppress repeats, refine category strength, choose better effective challenge, and maintain tension. This is genuine account-retention value.

## 89. Group Identities

Future saved family, friend, or work groups may maintain separate MachineMemoryProfiles under one account. Skill patterns must not bleed across groups without reason. UX is deferred.

## 90. Player-specific Difficulty

Guess Machine is group trivia. Individual skill models are optional future work and must not be required for MVP.

## 91. Difficulty Fairness Metrics

Track correctness/response by displayed level, distribution overlap, team imbalance, confidence, promotion/demotion, and dispute by level. Healthy difficulty shows separation without rendering 300 impossible.

## 92. Target Performance Bands

100 should generally succeed more often than 200, and 200 more than 300. Exact bands must come from playtesting and may differ by mode/cohort; this document sets no percentages.

## 93. Difficulty Distribution Health

Monitor impossible 100s, trivial 300s, category collapse, language/region mismatch, low-confidence stock, and gaps between intended and calibrated levels.

## 94. Question-level Diagnostics

Show predicted/calibrated level and reasons, confidence, sample, correctness, timing, skips, disputes, region/language, exposure, variant/media versions, history, overrides, and drift alerts.

## 95. Category-level Diagnostics

Show distribution, average performance by level, calibration confidence, weak stock, overused fact types, trivial 300s, impossible 100s, and language/cohort divergence to guide Foundry work.

## 96. Calibration Cost

Routine updates should use cheap deterministic aggregation/statistics. Expensive reasoning may diagnose anomalies, not process every PlayerOutcome.

## 97. Difficulty Engine Events

```text
DIFFICULTY_PREDICTED
DIFFICULTY_REASSESSED
DIFFICULTY_CALIBRATION_UPDATED
DIFFICULTY_PROMOTED
DIFFICULTY_DEMOTED
DIFFICULTY_DRIFT_DETECTED
DIFFICULTY_REVIEW_REQUESTED
GROUP_STRENGTH_UPDATED
```

This vocabulary does not mandate event sourcing.

## 98. Full Worked Example: 100 Question

FactRecord: `France — capital — Paris`. English variant: “What is the capital of France?” The answer is highly prominent, scope tiny, clue direct, and regional familiarity broad. Prediction is 100/high confidence. Early first-exposure outcomes show high correctness, fast response, low skips/disputes; calibration confirms 100. It remains valuable because accessible recognition creates game rhythm.

## 99. Full Worked Example: 300 Question

Football FactRecord: a specific substitute scored a decisive goal in a historically meaningful continental final. Variant names competition, year, teams, and decisive event but not the player’s club/nationality. The fact is deep yet meaningful to specialists, answer space bounded by participants, wording clear, and evidence strong. Prediction is 300/medium. Clean outcomes show low-to-moderate success, longer discussion, low disputes, and positive host behavior; it calibrates 300/high confidence—a satisfying near-recall, not random dust.

## 100. Full Worked Example: Failed 300

Demand wants Football 300; fact is “Brazil has won five men’s World Cups.” Direct variant predicts 100. One natural reduction removes an unnecessary giveaway but still predicts 100/200. The loop stops, stores/reuses it honestly, and retrieves a deeper fact. No riddling or vague euphemism is added.

## 101. Full Worked Example: Calibration Demotion

A 300 launches predicted from sparse comparables. After a sufficient clean, representative sample it has very high first-exposure correctness, fast median response, low skips/disputes, and stable media. DifficultyProfile appends calibration evidence and transitions to 200 (or 100 if evidence warrants), preserving prediction, version, date, and reason.

## 102. Full Worked Example: False Hardness

A question has extremely low correctness, high disputes, long reading time, and frequent overrides. Noise/quality checks block 300 promotion. Review finds ambiguous wording and an incomplete answer set. The variant is quarantined/re-written; old samples remain tied to the old version. Misery is not celebrated as difficulty.

## 103. Full Worked Example: Oman/GCC Cohort

Fact: an Omani cultural institution/event well known locally but obscure globally. Global prior predicts 300. Sufficient Oman first-exposure outcomes show high success and fast responses, producing an Oman modifier near 100/200 while the global profile remains 300. FactRecord is unchanged; Assembly uses the regional context.

## 104. Full Worked Example: Machine Memory

A recurring group has 30 games: Football strong/high confidence, Movies average, Geography weak. A canonical Football 200 is effectively 100 for them; Assembly selects stronger canonical football inventory, ordinary movies, and clearer geography. Labels remain 100/200/300. The more they play, the better their Machine chooses.

## 105. Difficulty Engine Invariants

1. Difficulty never changes FactRecord truth.
2. Difficulty belongs to presentation/context, not raw fact alone.
3. Bad wording is never legitimate challenge.
4. Requested difficulty cannot override prediction integrity.
5. Candidates may enter another difficulty pool.
6. Some facts cannot support all three levels fairly.
7. PlayerOutcome is noisy evidence.
8. Low correctness alone does not prove good difficulty.
9. High dispute triggers quality review.
10. Technical failures do not calibrate difficulty.
11. Prior exposure affects weighting.
12. Clean empirical data eventually outranks weak prediction.
13. Regional calibration does not create separate truth.
14. Machine Memory cannot directly poison global calibration.
15. Arabic and English variants may calibrate separately.
16. Media treatment changes difficulty.
17. Significant rewrites invalidate or discount prior variant calibration.
18. Difficulty history remains auditable.
19. 300 means specialist and fair, not arbitrary.
20. Accessibility failure is never difficulty.
21. Category context is part of the clue budget.
22. Cohort learning requires sufficient context and privacy restraint.
23. Overrides are evidence, not unquestionable truth.
24. Impossible questions may be retired despite factual correctness.
25. Player-facing 100/200/300 remains stable under personalization.
26. Global, regional, and local learning remain distinguishable.

## 106. MVP Difficulty Engine

Phase 1: explicit rubric, explainable prediction features, variant-specific DifficultyProfile, editorial override, basic correctness/response capture, QuestionPerformance aggregates, review-based promotion/demotion, account-level category strength, and a basic Machine Memory challenge signal.

Later: statistical calibration, regional cohorts, format priors, automated drift, adaptive ranking, media reveal models, controlled exploration, and stronger anti-poisoning. MVP should be inspectable, not a black box.

## 107. What This File Does Not Decide

This document defers exact formulas, target rates, sample thresholds, ML models, weights, databases, analytics platforms, cohort definitions, personalization algorithms, anti-fraud rules, timer/scoring behavior, and Game Assembly ranking.

It creates no models, routes, services, prompts, workers, migrations, scoring code, analytics infrastructure, or provider integrations.

## 108. Handoff to GUESSENGINE-6

`GUESSENGINE-1.md` defines doctrine.  
`GUESSENGINE-2.md` defines canonical contracts.  
`GUESSENGINE-3.md` defines the Question Foundry.  
`GUESSENGINE-4.md` defines knowledge acquisition and verification.  
`GUESSENGINE-5.md` defines challenge prediction and empirical calibration.  
`GUESSENGINE-6.md` will define Machine Memory, persistent account/group learning, exposure memory, personalization boundaries, retention value, privacy-aware learning, and how the Machine improves for returning players.

`GUESSENGINE-6.md` must not be created as part of this work.

## 109. Difficulty Engine Doctrine

1. Hard knowledge is good. Bad wording is not.
2. Difficulty is contextual.
3. Facts have natural difficulty ranges.
4. Clues change challenge.
5. Category context itself is a clue.
6. Region and language affect familiarity.
7. Predict first; measure later.
8. Clean player data eventually outranks intuition.
9. Incorrect answers alone do not prove difficulty.
10. Disputes are quality alarms.
11. Some facts belong only at 100.
12. Some facts naturally belong at 300.
13. Do not torture an easy fact into a hard question.
14. A 300 rewards expertise, not random memorization.
15. Machine Memory adapts selection, not truth.
16. Difficulty history is auditable.
17. The board remains intuitively 100/200/300.
18. The best hard question makes knowledgeable players groan because they almost knew it.
19. Difficulty creates tension, not resentment.
20. The Machine learns what hard actually means.

