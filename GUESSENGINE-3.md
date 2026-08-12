# Guess Engine 3: Question Manufacturing Pipeline

**Status:** Foundational pipeline specification  
**Product:** Guess Machine / مخ ماشين  
**Depends on:** `GUESSENGINE-1.md` and `GUESSENGINE-2.md`  
**Implementation status:** Architecture only; this document does not authorize backend implementation

## 0. Purpose and Relationship to GUESSENGINE-1/2

`GUESSENGINE-1.md` defines the Machine’s philosophy and architecture. `GUESSENGINE-2.md` defines its canonical objects and contracts. This document defines the machinery between those objects: how a demand becomes scope, coverage, evidence, a verified FactRecord, an answer lock, a well-formed QuestionRecord, approved QuestionVariants, and eligible Question Bank inventory.

The binding model is unchanged. FactRecord is truth-bearing. QuestionRecord references a verified fact. QuestionVariant is downstream presentation. SourceEvidence and ValidationResult establish inspectable trust. DifficultyProfile may evolve without mutating truth. DuplicateAssessment operates on fact identity and meaning. GamePackages consume prepared inventory. Live gameplay does not normally manufacture questions. Custom categories use this same foundry.

> A pipeline stage may enrich, reject, defer, quarantine, or promote a candidate, but it must never silently weaken an earlier trust guarantee.

The Guess Engine is not `prompt → model → question`. Its operating shape is:

```text
demand → scope → coverage target → candidate fact → evidence → validation
→ answer lock → question construction → localization → difficulty
→ duplicate checks → quality gates → media qualification
→ lifecycle promotion → inventory
```

## 1. Pipeline Goals

The pipeline optimizes for factual reliability, a unique defensible answer, low ambiguity, varied structures, semantic non-duplication, natural Arabic and English, meaningful 100/200/300 difficulty, appropriate Arab/GCC relevance, broad knowledge-map coverage, reliable media, controlled cost, inspectability, recoverability, deterministic processing where possible, and graceful failure.

Throughput is secondary to accepted-question quality. A line that produces fewer usable questions while preserving trust is healthier than one that produces many strings and rejects—or worse, serves—garbage.

## 2. Pipeline Entry Points

Manufacturing may begin because of:

- **Inventory replenishment:** an InventoryView pool is below target.
- **Game preparation:** a GameRequest cannot be satisfied from eligible stock.
- **Custom category manufacturing:** a safe CustomCategoryDefinition needs inventory.
- **Editorial expansion:** operators request deeper or more balanced coverage.
- **Freshness refresh:** time-sensitive facts need revalidation or replacement.
- **Format expansion:** a verified fact may support image, audio, video, or another format.
- **Rewriting/localization:** a fact remains good while a variant is missing or weak.

Not every entry starts at discovery. Localization reuses FactRecord, ValidationResult, and AnswerLock and begins at QuestionIntent/QuestionVariant construction. Revalidation begins at evidence retrieval. Format expansion begins at intent/media eligibility. Entry-point routing must prevent needless rediscovery and preserve lineage.

## 3. Master Manufacturing Flow

```text
Manufacturing Demand
        │
        ▼
Demand Normalization
        │
        ▼
Scope + Knowledge Map Resolution
        │
        ▼
Coverage Target Selection / Node Sampling
        │
        ▼
Candidate Fact Discovery
        │
        ▼
Entity Resolution + Fact Normalization
        │
        ▼
Pre-validation Duplicate Check ──existing──▶ Reuse canonical FactRecord
        │ novel
        ▼
Evidence Retrieval → Source Qualification
        │
        ▼
Fact Validation
   ┌────┼──────────────┐
 reject/defer      review/verify
   │                    │
   ▼                    ▼
EngineFailure      Answer Lock → Fact Promotion
                            │
                            ▼
                    Question Intent
                            │
                            ▼
                  Question Construction
                            │
                            ▼
                  Language Formulation
                            │
                            ▼
            Accepted Answers + Ambiguity + Leakage
                            │
                            ▼
                  Difficulty Prediction
                            │
                            ▼
              Post-writing Duplicate Check
                            │
                            ▼
                    Quality Assessment
                  ┌─────────┼─────────┐
               rewrite    review    reject
                  └─────────┬─────────┘
                            ▼ approve
                 Media Qualification (if needed)
                            │
                            ▼
                   Lifecycle Promotion
                            │
                            ▼
                      Question Bank
                            │
                            ▼
                Game Assembly Eligibility
```

Feedback returns indirectly:

```text
PlayerOutcome → QuestionPerformance → Difficulty calibration
       └──────→ Lifecycle review → rewrite/revalidate/quarantine
       └──────→ Machine Memory → future priorities and assembly
```

## 4. Stage Contract Template

Every stage specification should identify:

```text
StageContract {
  stage_name, purpose, required_inputs, produced_outputs,
  canonical_objects_touched, hard_failures, soft_warnings,
  retryability, confidence, stage_version, provenance,
  metrics, possible_next_stages
}
```

Stages should avoid hidden mutation. The preferred conceptual operation is `input identity/version → TransformationResult → new or versioned canonical object + audit context`. This does not mandate functional programming or event sourcing; it mandates inspectable change. Each result carries correlation, cause, timing, capability/provider reference where relevant, cost, warnings, and structured EngineFailure values.

## 5. Stage 1: Demand Normalization

Raw alerts and requests become one engine-owned contract:

```text
ManufacturingDemand {
  manufacturing_demand_id, trigger_type, category_id,
  custom_category_id, knowledge_node_scope, language, region,
  difficulty_target, question_type_target, target_count,
  urgency, freshness_requirement, source_policy_profile,
  sensitivity_profile, account_context_optional,
  game_request_id_optional, created_at, contract_version
}
```

Normalization validates identifiers, resolves defaults, deduplicates overlapping demands, and separates hard requirements from preferences. **Global inventory demand** represents broad reusable stock and must not inherit one account’s tastes. **Account-specific preparation demand** may use Machine Memory and exposure to fill a particular GameRequest, while any resulting reusable question must still satisfy global quality.

## 6. Stage 2: Scope Resolution

For built-ins, resolution uses CategoryDefinition and KnowledgeNodes. For custom categories, it uses the sanitized `normalized_scope` of CustomCategoryDefinition. It resolves named entities, aliases, transliterations, time range, geography, exclusions, sensitivity, source policy, and language/region context.

`Barcelona under Guardiola` becomes `FC Barcelona men’s first team during Pep Guardiola’s managerial tenure, 2008–2012`. The engine may safely infer when one interpretation is dominant and low-risk. It requests a concise clarification only when competing interpretations materially change retrieval or answerability. Scope resolution produces a versioned ScopeResolution with confidence and ambiguity flags.

## 7. Stage 3: Coverage Planning

Coverage planning decides **what knowledge should be tested** before anyone writes prose.

```text
CoveragePlan {
  coverage_plan_id, demand_id, scope_ref,
  target_node_refs, desired_fact_shapes,
  inventory_gaps, excluded_nodes, entity_caps,
  era_targets, region_targets, format_targets,
  difficulty_targets, source_feasibility,
  rationale, plan_version
}
```

It considers inventory gaps, overused nodes/entities, era balance, regional relevance, difficulty and format stock, source availability, sensitivity constraints, and—only for game-specific work—Machine Memory.

Bad Barcelona plan: Messi, Messi, Messi, Messi, Messi, Xavi. Good plan: trophies, seasons, players, opponents, major matches, tactics, transfers, records, and staff. Coverage planning is a central anti-slop control because it separates “what should we test?” from “how should we phrase it?”

## 8. Topic / KnowledgeNode Sampling

The sampler ranks or weights KnowledgeNodes using underrepresentation, recent manufacturing, eligible stock, entity saturation, target difficulty, media opportunity, freshness, evidence feasibility, and account repetition where permitted. It is not naive random choice.

Sampling should retain selection rationale and permit diversity constraints across a batch. Randomness may break ties and prevent predictability, but must not override hard coverage, policy, or saturation rules.

## 9. Candidate Fact Discovery

Discovery seeks candidate claims—not finished questions. Sources may include structured reference data, official records, reputable publications, editorial seeds, qualified search results, existing EntityRecords/FactRecords, and designated refresh sources.

Models may extract relationships, summarize source material, suggest fact shapes, or normalize text. Their output is never SourceEvidence by itself.

```text
FactCandidate {
  fact_candidate_id, knowledge_node_refs,
  candidate_subject, candidate_predicate, candidate_object,
  candidate_qualifiers, candidate_answer_target,
  discovery_source_refs, discovery_method,
  initial_confidence, created_at, discovery_version
}
```

Discovery confidence means “worth investigating,” not “true.”

## 10. Entity Resolution

Candidate names map to canonical EntityRecords through alias matching, transliteration matching, type constraints, time-context disambiguation, external identifiers, and merge/split history. The stage may create a provisional entity, but unresolved identity blocks fact promotion.

`Ronaldo` may mean Cristiano Ronaldo or Ronaldo Nazário. Arabic spellings such as `محمد صلاح`, `محمّد صلاح`, or Latin `Mohamed Salah` may resolve to one person, while similar names must not. If ambiguity affects the answer, subject, or qualifier, the line stops or requests review.

## 11. Fact Normalization

Normalization converts prose into one objective, testable relationship:

```json
{
  "subject": "2010 FIFA World Cup Final",
  "predicate": "winning_goal_scorer",
  "object": "Andrés Iniesta",
  "qualifiers": {"opponent": "Netherlands", "minute": 116},
  "answer_target": "object"
}
```

Rules: remove rhetoric, isolate one relationship, preserve qualifiers required for uniqueness, distinguish derived interpretation from source quotation, use canonical entities, and reject unsupported subjective predicates. “Messi was incredible in 2011,” “The Godfather is the greatest film,” and “the club had an amazing season” are not objective FactCandidates.

## 12. Pre-validation Duplicate Check

Before costly retrieval and validation, compare the normalized candidate using a provisional deterministic fingerprint, subject-predicate-object relation, entity overlap, fact aliases, qualifiers, and semantic fact search.

Outcomes are: exact existing fact → reuse; probable same fact → merge/review; related but distinct → continue; novel → continue. Reusing a current validated FactRecord prevents repeated cost and fragments neither evidence nor exposure history.

## 13. Evidence Retrieval

Retrieval gathers SourceEvidence sufficient for the assigned SourcePolicyProfile. It locates sources, records publisher and dates, extracts the relevant reference, classifies support/contradiction, checks freshness and access, and detects syndicated or copied material.

Ten copies of one report are one evidentiary lineage, not ten independent sources. Independence considers shared wire copy, upstream citations, common datasets, and circular references. Retrieval should preserve rejected and contradictory evidence where material.

## 14. Source Qualification

Qualification asks whether a source is authoritative **for this claim**, primary where required, current enough, independent, explicit, and about the correct entity, edition, place, or year. It rejects content farms, scraped snippets, circular citations, misleading search summaries, and claims absent from the underlying source.

Source tier is an input, not a conclusion. An official club site may establish a match result while remaining unsuitable for a subjective superiority claim.

## 15. Fact Validation

Validation executes SourcePolicyProfile checks: trusted-source count, official-source requirement, independence, evidence agreement, temporal consistency, entity/qualifier consistency, answer uniqueness, freshness, contradiction handling, and sensitivity rules.

It produces ValidationResult status `verified`, `provisionally_verified`, `insufficient_evidence`, `contradictory`, `ambiguous`, `stale`, `rejected`, or `requires_review`. Methods may combine deterministic checks, model-assisted comparison, specialist tools, and editorial judgment. “Ask a second model whether the first is right” is not evidence architecture.

## 16. Contradiction Handling

- Formatting differences such as `1998-07-01` versus `July 1, 1998` normalize harmlessly.
- Rounding differences require a unit, basis, or precision qualifier.
- Conflicting records remain recorded; the engine does not select the convenient source silently.
- Disputed historical claims require explicit framing or rejection as ordinary trivia.
- Current-state disagreement may indicate rapid change, wrong effective dates, or stale evidence.

Contradicting SourceEvidence survives whichever decision follows. Resolution records the policy, rationale, confidence, and reviewer/escalation when applicable.

## 17. Answer Lock

After acceptable validation, the engine freezes what the player must supply:

```text
AnswerLock {
  answer_lock_id, fact_id, answer_target,
  canonical_answer, answer_entity_refs,
  accepted_answer_candidates, known_confusables,
  qualification_requirements, locked_at,
  validation_ref, lock_version
}
```

The writer cannot change `winning_goal_scorer = Andrés Iniesta` into “Which country won?” That would require a different predicate, answer target, and FactRecord. Later accepted-answer refinement may add safe forms, but cannot broaden the canonical truth.

## 18. Fact Promotion

A FactCandidate becomes FactRecord only after it has normalized structure, canonical entities, a versioned fact fingerprint, SourceEvidence, an acceptable ValidationResult, satisfied source/sensitivity policy, and freshness metadata. Promotion occurs before QuestionRecord creation.

If canonical identity already exists, new evidence may enrich/revalidate it instead of creating another fact. Promotion emits/records lineage from candidate to canonical ID.

## 19. Question Intent Design

QuestionIntent defines the planned test before exact prose:

```text
QuestionIntent {
  question_intent_id, fact_id, answer_target,
  target_difficulty, clue_budget, allowed_context,
  forbidden_leakage, question_type,
  target_language, target_region,
  intended_media_role, intent_version
}
```

It chooses which clues to expose or withhold, how direct to be, and whether media carries part of the clue. Construction is not merely turning a declarative sentence into an interrogative.

## 20. Question Construction

Inputs are AnswerLock, FactRecord, QuestionIntent, language, category constraints, target difficulty, and anti-slop rules. Outputs are a candidate QuestionRecord identity and candidate QuestionVariants.

Rules: invent no details; leak no answer; use no unverified quote; avoid needless exposition; test one answer target; remain concise for social play; preserve essential time qualifiers; vary structure naturally; avoid tricks unless an approved format requires them.

Bad: “Andrés Iniesta, who scored in extra time, scored the winner against which team?” The clue leaks a different relationship and tests a different target. Better, for the locked scorer target: “Who scored Spain’s winning goal against the Netherlands in the 2010 World Cup Final?”

## 21. Structural Question Variety

Supported structures may include direct recall, identification from an event, multi-clue identity, date/year, location, connection, ordered relationship, record/statistic, image-assisted, and audio-assisted. Quotes are permitted only with valid provenance/rights.

Variety is a batch objective, not a quota that forces gimmicks. Clear direct recall is better than an unnatural template invented solely to look different. The system should monitor repeated stems without making every question structurally exotic.

## 22. Language Formulation

Arabic and English are independently authored from FactRecord and QuestionIntent. Arabic review checks natural GCC-readable phrasing, names, agreement, register, directionality, familiar terminology, and sensible transliteration. English receives equivalent native-language checks.

Multiple candidates may be produced, but only variants passing language and full quality gates become eligible. A strong English variant does not validate a weak Arabic one, and vice versa.

## 23. Accepted Answer Generation

AnswerLock plus EntityRecords produce AcceptedAnswerSet candidates from canonical names, aliases, Arabic/English forms, transliterations, abbreviations, and common nicknames. Confusable analysis then removes unsafe over-acceptance.

`Ronaldo` may be too ambiguous; `Iniesta` may be safe when the clue uniquely anchors the 2010 final. This contract supports host adjudication but does not decide automated scoring.

## 24. Ambiguity Analysis

The analyzer actively searches for alternate valid answers: another entity matching every clue, missing time boundaries, shared records, surname collisions, category-induced ambiguity, multi-subject media, or wording broader than AnswerLock.

Fixable presentation ambiguity routes to rewrite. Inherent fact/answer ambiguity routes to revalidation, reframing as a different objective fact, review, or rejection. It cannot be hidden with more confident prose.

## 25. Clue Leakage Check

Leakage includes both content and technical presentation: answer text in the clue, surname disclosure, visible badge text, filenames, captions, alt text, URLs, client-visible metadata, subtitles, ID3 tags, or an Arabic/English form that accidentally gives away the answer.

Checks operate on final delivery payloads as well as prose. Accessibility text must remain useful without exposing the answer; where that is impossible, the format is unsuitable.

## 26. Difficulty Prediction Stage

DifficultyProfile is predicted after formulation because clue wording and media affect difficulty. Inputs include entity prominence, fact obscurity, clue specificity, language, regional relevance, type, reveal strength, answer pool, comparable performance, and target audience.

If demand requested 200 but the result predicts 100, the pipeline may adjust clue budget, choose another FactRecord, or accept the item into 100 inventory. It must not force a bad question into the requested slot.

## 27. Difficulty Rewrite Loop

```text
target 300 → write → predicted 100 → adjust legitimate clue structure
→ predicted 200 → adjust once more → still 200
→ stop → store as 200 or select a deeper fact
```

Retries are bounded. The line never tortures an easy fact into unreadable prose. Difficulty integrity and clarity outrank slot pressure.

## 28. Post-writing Duplicate Check

DuplicateAssessment compares FactRecord identity/fingerprint, answer and entity overlap, relationship, semantic question similarity, and relevant account/game exposure. An existing same fact should reuse a suitable QuestionRecord/Variant. Better wording may create a new version and retire the weaker variant. Related but distinct relationships remain allowed.

This second check catches presentation-level repetition and facts missed before canonicalization.

## 29. Quality Assessment

QualityAssessment evaluates fact confidence, answer uniqueness, wording clarity, language naturalness, difficulty fit, leakage, ambiguity, duplicate risk, regional fit, media quality, freshness, and policy risk. Dispositions are `approve`, `approve_with_warning`, `rewrite`, `revalidate`, `review`, and `reject`.

Fatal defects cannot be averaged away. The assessment records per-dimension findings, versions, and ownership of each defect.

## 30. Quality Rewrite Loop

Rewrites are bounded and routed to the owning layer:

- unnatural Arabic, excessive length, or leakage → QuestionVariant rewrite;
- difficulty mismatch → intent/variant rewrite or different pool/fact;
- incomplete AcceptedAnswerSet → answer-set review;
- inherent ambiguity → FactRecord/validation stage;
- weak evidence → evidence/validation stage;
- duplicate fact → reuse/merge, not paraphrase.

Bad wording should not restart fact retrieval. Bad evidence cannot be repaired with prose.

## 31. Media Eligibility Decision

Media is selected only when format suitability, rights availability, distinctiveness, clue value, technical reliability, accessibility, leakage risk, and difficulty effect justify it. Not every question needs media; decorative assets increase cost and failure surface without improving play.

The decision records media’s intended clue role and required fallback before discovery begins.

## 32. Media Qualification Subpipeline

```text
media discovery → source qualification → rights/licensing check
→ authenticity check → technical validation → moderation
→ leakage check → crop/cue/reveal specification
→ fallback creation → MediaAsset + QuestionMediaUsage
```

Failure normally routes to another approved asset, text-only variant, or non-media question. It does not regenerate the fact. Provider-specific discovery and deeper Media Engine rules are deferred to a later specification.

## 33. Lifecycle Promotion

An approved item requires: verified FactRecord, candidate QuestionRecord, written approved variant, passing QualityAssessment, safe DuplicateAssessment, assigned DifficultyProfile, AcceptedAnswerSet, and qualified media/fallback where required.

The lifecycle moves `candidate → fact_verified → question_written → quality_checked → approved → available`. `trusted` normally requires observed performance and history; it is not awarded at generation. Every transition records reason, actor/stage, version, and correlation.

## 34. Question Bank Insertion

Insertion eligibility requires a current valid FactRecord and ValidationResult, approved QuestionRecord, at least one approved language variant, AcceptedAnswerSet, DifficultyProfile, safe duplicate disposition, passing quality disposition, current freshness, and valid media/fallback for media-dependent formats.

Insertion updates or invalidates InventoryView projections and emits the appropriate inventory/approval events. “Stored” is not synonymous with “eligible.”

## 35. Inventory Replenishment Loop

Replenishment reads InventoryView, low-stock/target levels, play demand, category popularity, difficulty/language/region/format demand, freshness churn, rejection rate, and manufacturing cost.

If Football Arabic 300 text is healthy, Football Arabic 200 image is low, and Omani geography Arabic 100 is critically low, the line targets the latter gaps rather than generating generic football. Demand is re-evaluated after each batch to prevent overshoot.

## 36. Inventory Saturation and Overgeneration

Saturation signals include high eligible count, fact overlap, entity overuse, weak play demand, high recent exposure, and poor engagement. Saturated nodes receive ranking penalties or pause manufacturing; undercovered nodes receive priority when evidence is feasible.

One verified fact must not become six near-identical variants merely to inflate inventory.

## 37. Game-Specific Preparation Pipeline

Game preparation uses selected categories, exact slots, Machine Memory, exposures, group difficulty, custom categories, and format balance. Its ManufacturingDemand is deadline-aware and account-scoped, but its quality gates are identical.

Questions made for one game may join reusable inventory if scope, rights, policy, and general quality permit. “Ephemeral” never means lower-trust.

## 38. Pre-game Deadline Behavior

When time is short, the engine should:

1. use eligible cached inventory;
2. use an approved alternate format;
3. broaden within allowed category scope;
4. relax soft personalization/cooldown constraints carefully;
5. use prepared high-quality fallbacks;
6. fail clearly or request a category adjustment.

It must never bypass validation, lower evidence thresholds, or serve raw output.

## 39. Custom Category Pipeline

```text
untrusted user input → safety screening → normalization
→ scope resolution → KnowledgeMap → CoveragePlan
→ fact discovery → evidence/validation → question manufacturing
→ Question Bank eligibility → Game Assembly
```

Custom categories may receive more pre-game compute because their knowledge is not cached. They never receive weaker source, duplicate, language, difficulty, or quality rules.

## 40. Custom Category Knowledge Map Building

Map building identifies the central entity/topic, time boundary, major branches, evidence availability, exclusions, coverage balance, source policy, and sensitivity—without writing questions.

For `LE SSERAFIM`, branches may include members, songs, albums/EPs, releases, performances, awards, music videos, eras, and collaborations. Unsupported or subjective branches are removed before coverage planning.

## 41. Custom Category Failure Modes

- Too broad (`everything`) → safely narrow or clarify.
- Too narrow/private → broaden with consent where sensible or reject.
- Ambiguous name → resolve or request one clarification.
- Insufficient reliable sources → return fewer questions or reject.
- Rapidly changing niche topic → apply strict freshness or defer.
- Unsafe/harassing scope → reject.
- Mostly subjective scope → identify objective subdomains or reject.
- Too few facts → do not hallucinate to fill slots.

Failure is a product outcome with a safe explanation, not permission to degrade the foundry.

## 42. Reuse of Verified Facts

One verified FactRecord may support Arabic and English variants, legitimate difficulty formulations, text/media presentations, and future games. Reuse preserves evidence investment and identity.

Variation must change presentation meaningfully. It must not manufacture fake inventory or allow one account to see the same fact repeatedly through paraphrase.

## 43. Revalidation Pipeline

Triggers include expiry, invalid source, contradiction report, current-state refresh, high dispute rate, editorial request, and policy changes. The existing FactRecord re-enters evidence retrieval/qualification and validation, not discovery by default.

Outcomes include unchanged validity, new evidence, confidence/qualifier update, stale, quarantine, or retirement. Previous ValidationResults and evidence remain auditable.

## 44. Question Rewrite Pipeline

Triggers include unnatural Arabic, repetitive wording, comprehension problems, excess length, leakage, difficulty mismatch, or localization updates. The line reuses valid FactRecord, AnswerLock, and ValidationResult and returns to QuestionIntent/Variant construction.

Fact discovery is reopened only if rewriting exposes a truth or ambiguity defect.

## 45. Duplicate Merge / Consolidation

When duplicate facts or questions are discovered later, the engine chooses a canonical identity, records aliases/merged IDs, migrates eligible variants and evidence, preserves exposures and outcomes, updates Machine Memory references, and retires the duplicate identity.

Nothing is silently deleted. Exact persistence and redirection mechanics are deferred, but semantic history must survive.

## 46. Human Review Escalation

Automated work stops for conflicting authoritative sources; sensitive religion, politics, or disputed history; uncertain rights for important media; high-value ambiguous answers; suspicious report patterns; uncertain custom scopes; or major entity conflicts.

Human review is a designed quality mechanism. Its decisions use EditorialAction and LifecycleTransition and remain reviewable.

## 47. Provider Escalation Strategy

Conceptual capability tiers are deterministic processing, lightweight reasoning, stronger reasoning, external retrieval, independent validation capability, and human review. The line begins with the cheapest capability that can satisfy the stage and escalates when uncertainty, sensitivity, or complexity warrants it.

Provider selection never changes canonical contracts, evidence policy, or acceptance criteria.

## 48. Retry Strategy

- **Retryable:** transient provider failure, rate limit, timeout, temporary media access issue.
- **Retry with changed strategy:** weak evidence, poor wording, duplicate candidate, difficulty mismatch.
- **Non-retryable without new input:** subjective fact, unsupported scope, unsafe request, inherent ambiguity.

Retries are bounded by stage, attempt history, cost, and deadline. Every attempt retains lineage. Infinite generation loops are prohibited.

## 49. Pipeline Cost Accounting

Track cost per discovered fact, verified fact, candidate question, approved question, custom category, evidence retrieval, media qualification, and rewrite; also track rejection rate and capability escalation.

The meaningful unit is **cost per approved, usable question**, not cost per generated string. Cost data must be correlated with quality and later dispute/quarantine rates.

## 50. Pipeline Quality Metrics

KPIs include verification pass rate, contradiction rate, approval/rewrite rates, duplicate rejection rate, Arabic quality rejection, difficulty mismatch, media failure, later disputes/quarantines, manufacturing time, and coverage growth.

Metrics should segment by category, language, region, difficulty, format, source policy, and pipeline version. Throughput alone is not a success measure.

## 51. Pipeline Observability

For any QuestionRecord, operators must be able to answer: why was its topic chosen; where was the claim found; what supported or contradicted it; how entities resolved; which policy passed; which variants existed; why difficulty was assigned; what duplicates were considered; which checks failed; how many rewrites occurred; which capabilities/versions participated; what it cost; and its current lifecycle state.

This trace is a core debugging and editorial capability, not optional logging.

## 52. Correlation and Traceability

One manufacturing attempt carries a correlation ID through demand, discovery, retrieval, validation, writing, quality, media, and promotion. Each action also records causation and canonical entity IDs.

No distributed-tracing technology is mandated. The semantic requirement is that the full line can be reconstructed across retries and escalations.

## 53. Idempotency

Retries must not create duplicate FactRecords, lose candidate lineage, or overfill stock. Validation retries update/supersede results for the same fact; variant retries remain candidates under the same QuestionRecord or explicit lineage; repeated inventory jobs recognize satisfied demand.

Idempotency keys and techniques are implementation decisions; canonical identity and effect are not.

## 54. Concurrency Concerns

The design must tolerate two workers discovering one fact, two custom jobs resolving one entity, simultaneous revalidation, quarantine during package assembly, and changing inventory counts.

Desired semantics are one eventual canonical identity, auditable conflict/merge resolution, no weakened evidence, and package readiness based on an internally consistent eligibility snapshot. Locking/transaction mechanisms are deferred.

## 55. GamePackage Handoff

Manufacturing ends at eligible Question Bank inventory. Game Assembly consumes it and chooses final slots, team/turn arrangement, and package composition. Game-specific manufacturing may create candidate stock but does not usurp assembly.

The handoff contract is eligibility plus canonical references, variants, answers, difficulty, media/fallbacks, quality, freshness, and selection metadata. A later Game Assembly/runtime specification will deepen this boundary.

## 56. Player Feedback Return Path

PlayerOutcome never rewrites FactRecord. It may cause difficulty recalibration, quality review, quarantine, variant rewrite, source refresh, duplicate suspicion, or inventory reprioritization.

High incorrect rate alone may mean difficulty, not falsity. High disputes plus host overrides and alternative answers may justify ambiguity review. Routing uses combined signals and confidence.

## 57. Anti-poisoning Principles

Global decisions use sample thresholds, cohort context, confidence, abuse detection, and editorial review for severe changes. One account cannot retire or rewrite global truth.

Machine Memory may react faster within that account/group—for example suppressing a disliked format—because the impact is local and reversible.

## 58. Full Worked Example: Built-in Category

**Demand:** one new Arabic Football 200 text question.

1. `ManufacturingDemand` targets `cat_football`, `ar`, 200, text, count 1.
2. InventoryView shows World Cup star questions saturated but Arab football records undercovered.
3. CoveragePlan selects the Africa Cup of Nations / Arab players node and caps repeated superstar entities.
4. Discovery finds a candidate claim that Egypt won the inaugural Africa Cup of Nations in 1957. A model-extracted phrase is only a lead.
5. Entity resolution identifies the Egypt national team and the 1957 tournament edition; normalization creates `1957_AFCON — champion — Egypt`, with answer target `object` and edition qualifier.
6. Pre-validation dedupe finds no canonical fact.
7. Retrieval collects an official/authoritative tournament record and an independent reference. A fan page is rejected as unnecessary Tier D evidence.
8. Validation checks edition, winner, source independence, historical stability, and unique answer; result is `verified` with high confidence.
9. AnswerLock fixes Egypt / `منتخب مصر`, with safe accepted variants and no material confusable.
10. FactCandidate promotes to FactRecord `fact_afcon_1957_champion`.
11. QuestionIntent requests direct historical recall at target 200 with year and competition exposed.
12. Arabic candidate: `أي منتخب تُوّج بالنسخة الأولى من كأس الأمم الإفريقية عام 1957؟`
13. AcceptedAnswerSet includes `مصر`, `منتخب مصر`, `Egypt`, and `Egypt national team`; it does not accept unrelated abbreviations.
14. Ambiguity/leakage pass. Difficulty predicts 200 for the intended GCC general audience with medium confidence. If testing showed it was broadly obvious, it would move to 100 rather than be obscured artificially.
15. Post-writing dedupe finds related AFCON questions but no same fact. Quality passes naturalness, clarity, uniqueness, freshness, and regional fit.
16. Lifecycle moves to approved/available and inventory health updates.

If authoritative evidence had disagreed on what counted as the “first edition,” the item would have routed to contradiction review instead of writing.

## 59. Full Worked Example: Custom Category

**Input:** `Nintendo GameCube`.

1. Safety passes; CustomCategoryDefinition normalizes scope to the Nintendo GameCube console, its officially released games, hardware, first-party franchises, and commercial history.
2. The temporary map branches into hardware, launch, games, accessories, franchises, regions, and development history. Private rumors and subjective “best games” are excluded.
3. CoveragePlan sees games are broad and chooses an underrepresented hardware node.
4. Discovery proposes: the GameCube used optical discs smaller than standard DVDs. Normalization chooses the objective relation `Nintendo GameCube — primary game medium — Nintendo optical disc (8 cm)`.
5. Evidence retrieval obtains official technical/reference evidence; validation checks dimensions and avoids unsupported claims about capacity unless separately evidenced.
6. AnswerLock targets the medium, not disc capacity. FactRecord is promoted.
7. English intent produces: `What physical medium did Nintendo GameCube games primarily use?` Accepted answers include `Nintendo optical disc`, `GameCube disc`, and context-safe `mini optical disc`; overly broad `CD` is rejected.
8. Difficulty predicts 100 or 200 depending on clue/region cohort. The engine accepts the honest result, performs dedupe/quality, and makes it eligible.
9. Game Assembly may select it for the custom category. The objects and gates are identical to a built-in category.

## 60. Full Worked Example: Rejection

Candidate: “Who is the greatest football player of all time?”

The predicate `greatest` is subjective, the answer is not unique, sources express opinions rather than establish one truth, and no qualifier repairs the claim. Validation returns `rejected` or `ambiguous`; no AnswerLock or QuestionRecord is created.

A recoverable transformation changes the fact target: “Which player has won award Y the most times as of date Z?” The line must then retrieve the official award record, qualify ties and date, and validate a unique objective answer. Better wording cannot turn opinion into fact.

## 61. Full Worked Example: Difficulty Failure

Demand requests a Football 300. A verified fact—Brazil has won five men’s World Cups—produces a clear question predicted at 100. The writer removes a clue, but it remains broad common knowledge.

The line stops the difficulty loop. It stores/reuses the item at 100 and selects a deeper FactRecord for 300. It does not use tangled negatives, vague clues, or trivia tricks to disguise an easy fact.

## 62. Pipeline Invariants

1. Question construction cannot precede an acceptable FactRecord and ValidationResult.
2. A model-generated statement is never SourceEvidence by itself.
3. Answer target cannot silently change during writing.
4. Duplicate checks occur before validation expense and after writing.
5. A failed fact cannot be fixed by better prose.
6. A failed variant does not automatically invalidate its fact.
7. Difficulty mismatch never justifies confusing wording.
8. Custom categories pass the same gates as built-ins.
9. Current-state facts obey freshness policy.
10. Media-dependent questions require qualified media and fallback.
11. Approval requires every fatal quality check to pass.
12. Raw generation is not a live-game fallback.
13. Retries preserve canonical identity and lineage.
14. Contradictory evidence remains auditable.
15. Provider failure cannot lower trust requirements.
16. Global inventory demand is not over-personalized to one account.
17. `trusted` is earned through history, not assigned at birth.
18. Coverage is planned before prose.
19. A ready item has at least one approved native-language variant.
20. Expired or quarantined items are ineligible immediately.
21. Reuse does not permit paraphrased repetition.
22. Human overrides create EditorialAction records.
23. Cost pressure may defer work but cannot waive policy.
24. Manufacturing stops at Question Bank eligibility; Game Assembly owns final composition.

## 63. MVP Manufacturing Pipeline

Phase 1 should implement conceptually: structured ManufacturingDemand, built-in KnowledgeMaps, basic CoveragePlan, fact discovery, SourceEvidence and trust tiers, validation, FactRecord/AnswerLock, Arabic and English writing, AcceptedAnswerSet, basic fingerprint/entity dedupe, predicted 100/200/300 difficulty, QualityAssessment, lifecycle eligibility, Question Bank, and manual review hooks.

Later maturity adds adaptive replenishment, richer capability escalation, advanced semantic dedupe, empirical calibration, sophisticated media, large-scale custom categories, automated editorial routing, and deeper cost/quality optimization. MVP should be trustworthy and inspectable, not prematurely elaborate.

## 64. What This File Does Not Decide

This specification does not choose provider names, prompts, model topology, search APIs, retry counts, confidence thresholds, ranking formulas, worker/queue technology, database implementation, cloud infrastructure, admin UI, media providers, or automated scoring mechanics.

It creates no routes, schemas, ORM models, services, workers, queues, prompts, infrastructure, or provider adapters.

## 65. Handoff to GUESSENGINE-4

`GUESSENGINE-1.md` defines doctrine.  
`GUESSENGINE-2.md` defines canonical data contracts.  
`GUESSENGINE-3.md` defines the manufacturing pipeline.  
`GUESSENGINE-4.md` will go deeper on retrieval, evidence, source strategy, source trust, fact verification, freshness, contradiction handling, and knowledge acquisition.

`GUESSENGINE-4.md` must not be created as part of this work.

## 66. Question Foundry Doctrine

1. Decide what knowledge is needed before generating prose.
2. Discover claims, then verify them.
3. Models may help reason about evidence; they are not evidence.
4. Lock the answer before writing the question.
5. Write questions from facts, never facts from wording.
6. Reject ambiguity.
7. Difficulty targets cannot override clarity.
8. Reuse verified knowledge.
9. Duplicate checks save money and player patience.
10. Arabic and English are independently crafted.
11. Media must earn its place.
12. Weak evidence stops the line.
13. Quality failure routes backward to the correct stage.
14. Custom categories enter the same foundry.
15. Live gameplay receives finished goods.
16. The Machine may manufacture fewer questions, but it must never manufacture bullshit.

