# Guess Engine 1: Foundational Product and System Architecture

**Status:** Foundational blueprint  
**Product:** Guess Machine / مخ ماشين  
**Scope:** Product doctrine, system boundaries, question manufacturing, data strategy, quality, personalization, and evolution  
**Implementation status:** Architecture only; this document does not authorize backend implementation

## 0. Purpose and Product Thesis

This document is the first source of truth for the Guess Engine: the system that supplies Guess Machine with trustworthy, varied, appropriately difficult, and increasingly well-selected trivia. It defines what the engine must accomplish and the principles future implementation decisions must preserve. It intentionally does not choose a database, model provider, vector store, cloud, search service, media service, or job framework.

Guess Machine must not feel like “ChatGPT generating trivia questions.” It should feel like an evolving machine that manufactures, verifies, remembers, calibrates, and selects genuinely good questions.

The player should experience a coherent product system, not a chatbot. Player-facing language should therefore avoid “AI-generated,” “powered by AI,” assistant personalities, conversational prompts, sparkles, and other AI-product clichés. Appropriate system language includes:

- **Guess Machine / مخ ماشين:** the complete player-facing product.
- **Guess Engine:** the central trivia manufacturing and game-assembly system.
- **Knowledge Engine:** the category, topic, entity, fact-retrieval, and fact-understanding layer.
- **Difficulty Engine:** the predicted and eventually empirically calibrated difficulty system.
- **Machine Memory:** account- and group-level history used to improve future games.
- **Media Engine:** legitimate media discovery, qualification, storage, and pairing.
- **Question Bank:** approved or conditionally approved inventory ready for assembly.
- **Question Foundry:** an optional manufacturing metaphor for generation and replenishment operations.

The commercial distinction is simple:

> Seen Jeem sells you a catalog.  
> Guess Machine sells you the machine that makes the catalog.

“Infinite Questions” does not mean making an uncontrolled live model call for every question. It means players should never meaningfully exhaust the system. That experience comes from broad knowledge maps, reusable verified facts, cached inventory, asynchronous replenishment, varied formats, custom categories, intelligent assembly, and Machine Memory.

## 1. Core Product Principles

### 1.1 Gameplay never consumes raw generation

No unverified model output should flow directly into a live game. A candidate must pass through structured stages for scope, fact establishment, validation, writing, difficulty, duplication, and quality. Generation is an internal manufacturing capability, not a gameplay endpoint.

### 1.2 Facts first, questions second

The engine first establishes a fact and its correct answer from acceptable evidence. Only then may a writing stage construct a clue around that fact. This ordering makes truth independently inspectable and prevents fluent wording from disguising an invented premise.

### 1.3 Reliability is a system property

Trust cannot depend on one prompt or one model declaring itself correct. It must emerge from source policies, structured evidence, validation, deterministic checks, uncertainty handling, lifecycle states, monitoring, and feedback. If confidence is insufficient, the engine should withhold the question.

### 1.4 Do not market the mechanism as AI

Models may assist at selected internal stages, but the player is buying the Machine: its inventory, memory, calibration, breadth, and craft. The value proposition is not novelty generation.

### 1.5 Infinite means effectively inexhaustible

The system combines pre-generated inventory, verified-fact reuse, controlled knowledge expansion, custom scopes, media formats, and personalization. It does not equate quantity with quality or promise mathematically unique strings.

### 1.6 Remember knowledge, not merely wording

Machine Memory and duplicate controls operate on facts, entities, relationships, scope, and semantic meaning. Two paraphrases of the same fact are normally one unit of trivia, even when their strings differ.

### 1.7 Difficulty is predicted, then measured

Initial difficulty can be estimated using explicit features and expert rules. Over time, real outcomes—correctness, response time, skips, disputes, and audience context—must become the stronger signal. A “hard” prompt is not a difficulty system.

### 1.8 Long-lived accounts become better machines

An account should accumulate useful, privacy-respecting Machine Memory. Continued play should reduce repetition, improve calibration, and produce better category and format mixtures. This is functional retention, not artificial lock-in.

### 1.9 Custom categories are first-class

A user-created category must use the same interpretation, retrieval, verification, writing, duplicate detection, quality, and assembly pipeline as a built-in category. It must never collapse into “give me six questions about X.”

### 1.10 Local intelligence is deliberate

The engine should understand its Arab and GCC audience rather than inheriting a default American center of gravity. Regional relevance is a configurable ranking and coverage signal, not a requirement to regionalize every topic.

### 1.11 Personalization must remain useful and non-creepy

Remember game-relevant behavior, explain benefits plainly, minimize sensitive data, and provide sensible controls. The system learns how a group plays trivia; it should not imply surveillance or psychological profiling.

### 1.12 Quality outranks inventory size

When evidence, wording, or answerability is weak, return fewer questions. Low stock is an operational condition to solve, not permission to ship garbage.

## 2. System Boundaries and Manufacturing Pipeline

The Guess Engine is conceptually composed of cooperating layers. These are logical responsibilities, not mandatory deployment services.

```text
                       ┌───────────────────────────────┐
Category / User Scope ─▶ Knowledge Engine              │
                       │ Knowledge Map + Topic Sampler │
                       └───────────────┬───────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │ Fact Retrieval + Evidence     │
                       │ Answer Establishment          │
                       └───────────────┬───────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │ Fact Validation               │
                       │ Confidence + Sensitivity      │
                       └───────────────┬───────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │ Question Construction         │
                       │ Native-language formulation   │
                       └───────────────┬───────────────┘
                                       ▼
             ┌─────────────────────────┴─────────────────────────┐
             ▼                                                   ▼
┌────────────────────────┐                         ┌────────────────────────┐
│ Difficulty Engine      │                         │ Media Engine           │
│ Predict + explain      │                         │ Qualify + pair         │
└────────────┬───────────┘                         └────────────┬───────────┘
             └─────────────────────────┬─────────────────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │ Duplicate + Quality Controls  │
                       │ Policy + Language Checks      │
                       └───────────────┬───────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │ Question Bank                 │
                       │ Lifecycle-managed inventory   │
                       └───────────────┬───────────────┘
                                       ▼
                       ┌───────────────────────────────┐
Game Request ──────────▶ Game Assembly / Ranking       │
Machine Memory ────────▶ Diversity + Fairness          │
                       └───────────────┬───────────────┘
                                       ▼
                                  Live Game
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │ Outcomes + Feedback           │
                       │ Machine Memory                │
                       │ Difficulty Recalibration      │
                       │ Lifecycle Decisions           │
                       └───────────────────────────────┘
```

The canonical conceptual flow is:

```text
Category
→ Knowledge Map
→ Topic/Subtopic Selection
→ Fact Retrieval
→ Fact Validation
→ Question Construction
→ Difficulty Estimation
→ Media Selection (when applicable)
→ Duplicate/Similarity Detection
→ Quality Scoring
→ Question Bank
→ Game Assembly
→ Player Feedback/Performance
→ Machine Memory + Difficulty Recalibration
```

Stages should expose structured inputs, outputs, confidence, provenance, and failure reasons. A candidate may be rejected or routed for review at any gate. A later implementation may combine stages for efficiency, but it must preserve their logical separability and auditability.

### 2.1 Why fact-first generation matters

Bad instruction:

> Generate a difficult World Cup trivia question.

This asks one generator to choose a topic, invent or recall a fact, decide the answer, write the question, and label difficulty without independent evidence. Fluent output may be wrong, ambiguous, repeated, culturally mismatched, or incorrectly calibrated.

Better process:

1. Select a World Cup topic and coverage target.
2. Retrieve a candidate fact from an acceptable source.
3. Normalize the fact and establish the correct answer and accepted variants.
4. Validate the fact, scope, time context, and source agreement.
5. Pass the locked fact package to a question writer.
6. Instruct the writer to create an answerable clue without altering the fact.
7. Independently check wording, ambiguity, leakage, difficulty, and duplication.

The verified fact package—not generated prose—is the truth-bearing object. A question can be rewritten, localized, or retired without losing the underlying evidence.

## 3. Knowledge Maps and Question DNA

### 3.1 Hierarchical knowledge maps

Every category should have, inherit, or dynamically construct a hierarchical map of its territory. A knowledge map is not only a menu. It is a coverage model used to prevent shallow repetition, identify stock gaps, balance eras and entities, and direct retrieval.

Example:

```text
Football
├── World Cup
│   ├── Finals
│   ├── Players
│   ├── Goalkeepers
│   ├── Records
│   ├── Host nations
│   └── Eras
├── Champions League
├── Premier League
├── La Liga
├── Transfers
├── Managers
├── Stadiums
├── Kits and badges
├── Arab football
├── Women's football
└── Historic matches
```

Nodes may carry aliases, languages, geographic relevance, time coverage, sensitivity, source preferences, desired inventory, format suitability, and parent/child relationships. Maps should evolve as coverage expands. They should support both deliberate editorial control and dynamic interpretation without forcing one fixed taxonomy onto every domain.

Topic selection should consider:

- target category and requested difficulty;
- inventory stock and coverage gaps;
- recently overused topics, eras, and entities;
- source availability and confidence;
- region and language relevance;
- suitability for text or media formats;
- custom-category boundaries;
- freshness requirements;
- Machine Memory and current game composition.

### 3.2 Question DNA

**Question DNA** is the structured identity of a trivia item. It allows the Machine to reason about what a question tests, where it came from, how it behaves, and whether it resembles something already seen.

A mature question record may include:

| Domain | Representative fields |
|---|---|
| Identity | `question_id`, lifecycle state, generation version, schema version |
| Classification | category, topic, subtopic, question type, tags |
| Fact | normalized fact, answer, accepted answers, aliases, subject-predicate-object representation |
| Entities | people, teams, works, countries, organizations, locations, events |
| Context | era/date range, time qualifier, region relevance, language |
| Evidence | sources, retrieval time, excerpts or evidence references, source confidence, validation result |
| Duplication | fact fingerprint/hash, normalized entity relation, semantic embedding reference, similarity decisions |
| Difficulty | predicted difficulty, calibrated difficulty, confidence, feature explanation |
| Media | media references, rights/attribution metadata, crop or cue data, availability checks |
| Quality | quality score, ambiguity checks, language checks, reviewer decisions |
| Performance | answer rate, average/median response time, skip rate, dispute/report rate |
| Serving | times served, last served, exposure cohorts, freshness/expiry |

This list is a conceptual envelope, not a requirement to store every field in one table or from day one.

### 3.3 Fact identity and paraphrased duplicates

These questions express the same underlying fact:

- “Who scored Spain’s winner in the 2010 World Cup Final?”
- “Which Spanish midfielder scored the decisive goal against the Netherlands in the 2010 World Cup Final?”

String matching alone will miss the duplicate. Detection should combine multiple signals:

1. **Normalized fact fingerprint:** canonicalized subject, relationship, object, qualifiers, and time.
2. **Entity overlap:** shared people, teams, event, date, competition, or work.
3. **Structured relationship:** for example, `Andrés Iniesta — scored winning goal in — 2010 World Cup Final`.
4. **Semantic similarity:** embeddings or equivalent meaning-level representations.
5. **Metadata proximity:** category, subtopic, answer, era, question type, and source fact.
6. **Rules and thresholds:** stricter within a game or account history; potentially looser for editorial discovery.

A similarity decision should retain its score, contributing signals, threshold/version, and disposition. Near-duplicates may sometimes be legitimate when they test distinct facts about the same event; a system must distinguish shared context from shared answer relationship.

No database, vector implementation, or provider is prescribed here.

## 4. Question Bank and Caching Strategy

### 4.1 Inventory-first gameplay

Most live gameplay should draw from pre-generated, previously validated inventory. The Question Bank may maintain logical pools by category, language, region, format, and difficulty, for example:

```text
Football
├── 100: available validated inventory
├── 200: available validated inventory
└── 300: available validated inventory
```

“Available” does not necessarily mean universally eligible. Assembly still considers freshness, history, evidence state, media availability, game balance, and account exposure.

Inventory can be replenished asynchronously through scheduled stock jobs, demand prediction, category expansion, or bounded work during pre-game preparation. Popular built-in categories should maintain a healthy buffer. Rare or custom scopes may justify on-demand preparation, but candidates still pass the same gates.

### 4.2 Latency budget by experience phase

Generation latency is acceptable primarily after teams, categories, custom scopes, language, and settings are chosen but before play begins. The preparation screen can turn necessary work into product theater:

- `INITIALIZING GUESS ENGINE`
- `INDEXING KNOWLEDGE`
- `CHECKING MACHINE MEMORY`
- `CALIBRATING DIFFICULTY`
- `MANUFACTURING QUESTIONS`
- `VALIDATING FACTS`
- `LOADING MEDIA`
- `GAME READY`

This sequence can blend truthful progress with theatrical UX. It does not need to map one-to-one to backend calls, but it must not make materially false claims. Progress should remain bounded, recoverable, and accessible.

Once play begins, normal operation must not show question-generation loading between questions. The complete game package, including fallbacks for media failures or quarantined items, should be ready before the first turn.

### 4.3 Cache intelligence, not only output

Reusable artifacts may include interpreted category scopes, knowledge maps, retrieved evidence, normalized facts, accepted-answer variants, validation results, embeddings, media qualification, and localized formulations. Reuse avoids paying repeatedly to rediscover the same truth while still permitting new question formats or language formulations.

Caches require versioning and invalidation. Current facts, vanished sources, policy changes, improved validators, and schema changes may invalidate downstream artifacts. Historical facts may remain stable much longer.

## 5. Difficulty Engine

Difficulty is a property of a question for a particular audience and context—not merely a label attached during writing.

### 5.1 Initial 100/200/300 rubric

| Level | Intended experience | Typical signals |
|---|---|---|
| **100** | Broad recognition and accessible recall | famous people/events, obvious visual clues, common cultural knowledge, generous clues |
| **200** | Familiarity with the category | secondary figures, meaningful dates/details, moderately specific relationships, fewer obvious clues |
| **300** | Specialist or deep-fandom knowledge | less prominent facts, historical detail, constrained clues, obscure but meaningful connections |

“Obscure but meaningful” is important. A 300 should reward genuine topic knowledge, not arbitrary minutiae or a deliberately unanswerable formulation.

### 5.2 Predicted difficulty

Initial estimates may consider:

- fame or prominence of the answer and referenced entities;
- fact obscurity and specificity;
- number and informativeness of clues;
- answer-pool size;
- era and recency;
- geographic and cultural relevance;
- ambiguity and plausible alternatives;
- entity prominence within the target category;
- format, crop, blur, audio cue length, or reveal amount;
- language and transliteration burden;
- historical performance of similar questions.

The estimate should preserve both a level and an explanation. A numeric internal score may exist later, but must not create false precision.

### 5.3 Calibrated difficulty

Observed outcomes progressively challenge the prediction. If 92% of relevant players answer a supposed 300 correctly and do so quickly, the item is likely easier than predicted. If almost no one answers a 100, it may need promotion, rewriting, audience-specific treatment, or retirement.

The engine should distinguish:

- **Predicted difficulty:** pre-play estimate based on content and comparable items.
- **Calibrated difficulty:** evidence-based estimate from actual play.
- **Difficulty confidence:** strength and relevance of the supporting evidence.

Calibration should consider sample size, audience composition, prior exposure, language, region, game format, and response-time quality. A handful of outcomes must not overrule sound estimates. Difficulty may differ by cohort; a Gulf football group and a general international audience may legitimately experience the same item differently.

## 6. Machine Memory and Account Learning

Machine Memory is the durable record that makes a long-lived account a better trivia machine. Its primary consumer is Game Assembly.

### 6.1 Useful signals

Subject to privacy and retention policy, Machine Memory may represent:

- questions served and facts encountered;
- when and how often an item was encountered;
- frequently selected and avoided categories;
- category-level strength and difficulty outcomes;
- text versus visual or audio performance;
- skips, reveals, disputes, and host overrides;
- response-time patterns at an aggregate game level;
- preferred or successful formats;
- repeated category combinations;
- entities, topics, or eras recently overrepresented;
- group-level tendencies where a stable group concept exists.

### 6.2 How memory improves assembly

Machine Memory should help the engine:

- suppress recently seen questions and facts;
- increase football difficulty for a group consistently dominating football;
- avoid topics or entities the group has exhausted;
- reintroduce older material only after a sensible cooldown;
- vary formats without creating unfairness;
- select clearer 100s and more meaningful 300s for that group;
- avoid repeating the same category mixture every session;
- distinguish a new player group from an experienced one where feasible.

Memory is a ranking input, not a license to manipulate. It should include uncertainty, decay, and explicit boundaries between account-wide and group-specific signals.

### 6.3 Player-facing framing and privacy

Appropriate concepts include:

- `Machine Memory`
- `Games remembered`
- `Questions encountered`
- `Machine experience level`
- `Your Machine is learning your group`

The product should explain the direct benefit: fewer repeats and better-calibrated games. Avoid claims that the Machine “knows you,” infers personality, or monitors unrelated behavior. Collect only game-relevant signals, secure them, establish retention rules, and support account-level transparency and controls as the product matures.

The retention promise is:

> The more you play, the better your Machine gets.

## 7. Custom Category System

“Make Your Category” / “اصنع فئتك” is a flagship expression of the Machine’s breadth. A user can submit scopes such as Manchester United 2008–2015, Nintendo games, Lebanese singers, Korean dramas, German cars, Barcelona under Guardiola, 2010s K-pop, Omani geography, or Pixar villains.

### 7.1 First-class pipeline

```text
User Concept
→ Input Safety Screening
→ Category Interpretation
→ Scope Definition and Confirmation Confidence
→ Temporary/Persistent Knowledge Map
→ Topic Coverage Plan
→ Fact Retrieval
→ Verification
→ Difficulty Distribution
→ Question Construction
→ Media Search (when suitable)
→ Duplicate Check
→ Quality Filters
→ Game Package
```

Interpretation should resolve boundaries such as time range, named entities, ambiguous titles, intended domain, language, and reasonable exclusions. If ambiguity is material and confidence is low, the product may request one concise clarification. Otherwise, it should make a sensible interpretation and communicate it during preparation.

The generated knowledge map should seek breadth within the requested scope. “Barcelona under Guardiola” should not become six Messi questions. Coverage should include players, matches, tactics, trophies, seasons, opponents, transfers, staff, and other defensible nodes as inventory and evidence permit.

### 7.2 Quality and failure behavior

Custom inventory is subject to the same evidence thresholds, lifecycle rules, anti-duplication logic, native-language quality, difficulty policy, and game assembly constraints as built-in inventory. If the engine can establish only four excellent questions, it should not invent two more merely to fill six slots. The product can offer a narrower game, request a scope expansion, or explain that the Machine needs a broader category.

### 7.3 Product and monetization intent

An initial concept is one free custom-category experience, with subsequent usage eligible for paid or subscription gating. Exact pricing and entitlements are outside this document.

The free experience must be especially polished: it demonstrates the central “infinite questions” promise. Preparation, scope interpretation, breadth, factual trust, difficulty distribution, and wording should all make clear that the Machine manufactured a category rather than dumping model output.

## 8. Media Engine

The Media Engine expands how verified facts can be tested. Potential formats include:

- plain text;
- image identification;
- image crop or zoomed detail;
- progressive reveal;
- blurred image;
- logo or badge identification;
- audio identification and sound effects;
- music clips where licensing permits;
- video clips where licensing permits;
- timelines;
- connection questions;
- odd-one-out;
- before/after;
- multi-image association.

Media should normally come from legitimate open, licensed, partner, public-domain, or otherwise permitted sources—not synthetic replacements pretending to depict the real subject. AI-generated media may have separate creative uses later, but it should not be the default substitute for authentic evidence.

Every media item should be paired with Question DNA and operational metadata: source, rights or license basis, attribution, retrieval date, local/cache status, file integrity, dimensions/duration, crop/cue instructions, moderation state, expiry, and fallback behavior.

Future engineering must address:

- licensing and territory restrictions;
- attribution requirements;
- source reliability and authenticity;
- hotlink breakage and remote latency;
- safe caching and takedown handling;
- media moderation;
- accessibility alternatives;
- format and device compatibility;
- availability checks before game start.

Copyright-infringing scraping must not be the foundation. If media becomes unavailable, assembly should choose another qualified item or a verified text fallback rather than breaking the live game.

## 9. Arab, GCC, and Local Intelligence

Generic trivia products often inherit a heavily American content distribution. Guess Engine should make regional intelligence a deliberate competitive advantage while retaining international breadth.

Important domains may include Oman, Kuwait, Saudi Arabia, the UAE, Bahrain, Qatar, GCC culture, Arab television, Ramadan series, Arabic and Khaleeji music, Arab football, regional internet culture, anime, K-pop, gaming, Spacetoon generations, and 1990s/2000s/2010s nostalgia.

Regional relevance should be represented as a controllable signal in knowledge maps, inventory targets, difficulty prediction, and ranking. It must not force a Gulf reference into every category. A chemistry category can remain chemistry; a world-football category can balance global and regional coverage according to the game context.

Local intelligence requires more than translation. It includes:

- recognizing regionally prominent entities and works;
- calibrating what counts as common knowledge for the intended audience;
- supporting Arabic naming and transliteration variants;
- sourcing regional facts from authoritative or credible local sources;
- avoiding stereotypes and treating GCC countries as distinct;
- balancing pan-Arab, national, generational, and global relevance.

Religion, politics, disputed history, current affairs, public safety, and other sensitive topics require stricter source thresholds, clearer date/context qualifiers, contradiction handling, and potentially editorial review. Religious content in particular should use careful, authoritative sourcing and avoid casually generated claims.

## 10. Game Assembly as Ranking

Game Assembly transforms eligible inventory into a coherent game package. It is a constrained recommendation and ranking problem, not random selection.

### 10.1 Inputs

Inputs may include:

- selected categories and requested difficulty slots;
- teams and game format;
- account and group Machine Memory;
- previously used questions and facts;
- current-game entity/topic distribution;
- media availability and desired format mix;
- language and region;
- freshness and expiry;
- custom categories and their scope confidence;
- group performance history;
- question quality and difficulty confidence;
- inventory health and fallback stock.

### 10.2 Objectives and constraints

Assembly should optimize for:

- zero duplicate facts within a game;
- category and subtopic breadth;
- requested difficulty spread;
- format diversity without gimmick overload;
- freshness and source validity;
- fairness between teams and turns;
- low ambiguity and high confidence;
- suppression of recent account/group exposure;
- media balance and technical reliability;
- entity diversity so the same stars/events do not dominate;
- a satisfying rhythm across the whole game.

Hard constraints—such as expired evidence, duplicate fact, missing required media, policy disqualification, or unavailable language—must exclude a candidate. Soft objectives—such as format balance or recent exposure—can contribute ranking penalties and bonuses.

The assembler should produce a complete package and reserve qualified fallbacks. It should record why each item was selected so that unexpected repetition or imbalance can be diagnosed.

## 11. Quality Control and Question Lifecycle

### 11.1 Lifecycle states

A representative lifecycle is:

```text
candidate
→ fact_verified
→ question_written
→ quality_checked
→ approved
→ available
→ served
→ calibrated
→ trusted
```

Exceptional or terminal states may include:

- `needs_review`
- `quarantined`
- `disputed`
- `stale`
- `source_invalid`
- `duplicate`
- `rejected`
- `retired`

State transitions must retain reason, timestamp, actor or automated rule, relevant metrics, and version. “Trusted” does not mean permanently correct; new evidence or reports can still reopen or quarantine an item.

### 11.2 Quality dimensions

Quality scoring should remain explainable and multidimensional. Relevant dimensions include:

- fact confidence and source quality;
- answer uniqueness and accepted-answer completeness;
- wording clarity and grammatical naturalness;
- clue sufficiency and leakage;
- predicted difficulty fit;
- duplicate risk;
- cultural and regional appropriateness;
- media authenticity and availability;
- freshness and time qualification;
- policy and sensitivity risk;
- observed player behavior.

A single composite score may assist ranking, but it must not erase a fatal defect. A high-style score cannot compensate for a weak fact.

### 11.3 Automatic quarantine

The engine should quarantine an item when signals suggest risk, including:

- repeated reports or high dispute rates;
- plausible multiple answers;
- contradictory validation evidence;
- disappeared or invalidated sources;
- malformed, missing, or incorrectly paired media;
- suspected semantic duplicate;
- wording corruption or failed language checks;
- implausible difficulty behavior;
- changed current facts;
- policy or rights concerns.

Quarantined questions must leave active eligibility immediately while preserving evidence for investigation.

### 11.4 Freshness policies

Facts should carry a stability class and review/expiry logic. “Who is the current manager/president/champion?” expires rapidly and must contain an explicit “as of” context or be refreshed. A well-sourced historical result can remain valid indefinitely unless challenged. Source disappearance alone does not necessarily falsify a stable historical fact, but it may reduce confidence and trigger source refresh.

## 12. Feedback Loop and the Ever-Improving Machine

Every game can generate useful signals:

- correct or incorrect outcome;
- response time;
- skip;
- answer reveal without an attempt;
- host override or manual adjudication;
- dispute or report reason;
- selected category and difficulty;
- question format;
- prior encounter with the same question or fact;
- technical media failure;
- game abandonment around an item.

Signals should be interpreted cautiously. In a host-scored social game, incorrect may mean “host ruled incorrect,” not objective semantic failure. Response time may include group discussion or interruptions. The event model should preserve context rather than pretending all observations are clean labels.

Aggregated feedback can improve:

- empirical difficulty calibration;
- per-group and global ranking;
- quarantine and retirement;
- category coverage and inventory targets;
- format balance;
- custom-category interpretation;
- duplicate detection thresholds;
- source and validator quality assessment;
- account personalization.

An “ever-improving machine” is credible only if outcomes cause controlled, observable changes. Improvement should be versioned, measured, reversible, and protected against noisy or malicious feedback. Global learning should require sufficient aggregated evidence; one player should not be able to poison inventory.

## 13. Anti-AI-Slop Design Rules

The following are explicit failure modes:

- repetitive stems and rhythms;
- obvious generic model prose;
- excessive “Which of the following…” constructions;
- suspiciously generic questions with no distinctive fact;
- factual hallucinations or fabricated premises;
- difficulty changed only by swapping “easy” for “hard” in a prompt;
- answers disclosed in the question;
- multiple valid answers without qualification;
- vague time periods or missing “as of” dates;
- 300s that are obscure merely for the sake of obscurity;
- fake quotations;
- invented captions or media descriptions;
- excessive US-centric coverage;
- repeated reliance on the same famous people, works, teams, or events;
- paraphrased duplicates of the same underlying fact;
- robotic translation or unnatural Arabic;
- essay-length answers unsuitable for social play;
- excessive trick questions;
- misleading negative questions;
- clues that depend on an unstated spelling or transliteration;
- filler produced because reliable facts were unavailable.

The system should use structural variety intentionally while maintaining clarity. It should not manufacture variety by adding gimmicks or hiding the target fact behind tortured prose.

Quality policy:

> Prefer fewer high-confidence questions to a full inventory of weak ones. Quality is more important than raw generation volume.

## 14. Language Strategy

Guess Machine requires strong Arabic and English support. Question formulations should ideally be authored natively for the target language from the same structured fact package rather than mechanically translating a finished question.

Arabic must feel natural to GCC players. This requires attention to register, idiom, punctuation, names, gender agreement, right-to-left presentation, and when familiar foreign terms are preferable to awkward formal translations. Content review and quality metrics should distinguish native formulation from literal translation artifacts.

A verified fact can support separate Arabic and English question records, each with its own wording, accepted answers, difficulty estimate, and quality state, while sharing fact identity and evidence.

Accepted answers may support:

- Arabic spelling variants;
- English spelling variants;
- sensible transliterations;
- definite-article variations where appropriate;
- common abbreviations;
- well-known aliases and nicknames when unambiguous;
- normalized punctuation and diacritics.

Accepted variants must not broaden the answer until a different entity becomes valid. The exact automated answer-checking system is not decided here; multiplayer hosts may continue to control scoring. Structured variants remain useful for display, search, adjudication support, and future modes.

## 15. Cost, Performance, and Resilience Philosophy

The architecture should control cost without weakening trust:

- use deterministic parsing, normalization, hashing, validation rules, and filters where suitable;
- cache expensive results and reuse verified facts;
- avoid regenerating identical knowledge or embeddings;
- separate expensive manufacturing from live gameplay;
- batch retrieval, validation, and inventory work where possible;
- replenish common inventory ahead of demand;
- allow custom categories more compute when their paid value and rarity justify it;
- escalate between tools or model capabilities based on uncertainty and stage complexity;
- permit different validation and writing mechanisms;
- measure cost per accepted—not merely generated—question;
- degrade gracefully if any external provider fails.

Graceful degradation may mean using cached stock, omitting a media format, delaying a custom category, choosing a qualified fallback, or presenting a clear preparation error. It must never mean silently relaxing fact standards or sending raw output into play.

No provider should become inseparable from Question DNA or pipeline contracts. Provider-specific adapters may exist later behind architecture-owned interfaces and evidence records.

## 16. Security, Abuse, and Custom-Category Moderation

User-supplied category text is untrusted input, not an instruction with authority over the engine. Future design must defend against:

- malicious prompts and prompt injection;
- attempts to reveal internal prompts, data, or credentials;
- illegal content;
- harassment focused on private individuals;
- misinformation and impersonation;
- sexual content involving minors;
- self-harm content;
- extremist propaganda or recruitment;
- hateful or degrading trivia;
- private personal information;
- attempts to bypass sourcing, safety, or quality gates.

Interpretation should isolate user text as data, enforce length and format limits, apply moderation and policy decisions before retrieval/generation, and restrict tools to minimum necessary access. Logs and admin views must avoid exposing sensitive user input unnecessarily. Rejection messages should be clear without teaching bypass methods.

This section acknowledges the boundary; detailed threat models and moderation policy belong in later security specifications.

## 17. Observability and Internal Administration

At scale, editorial and operational tooling is essential. Internal users will likely need to:

- inspect questions, facts, and accepted answers;
- inspect sources and validation evidence;
- inspect fact fingerprints and entity relationships;
- see semantic duplicate candidates and similarity explanations;
- approve, reject, quarantine, restore, or retire items;
- change or override difficulty with an audit trail;
- view correctness, response time, skip, report, and dispute statistics;
- regenerate wording without mutating the underlying fact;
- refresh or replace sources;
- inspect custom-category interpretation and coverage;
- view inventory by category, language, difficulty, region, format, and lifecycle;
- identify low-stock or overexposed categories;
- see generation, validation, and accepted-question cost;
- monitor media health and rights status;
- analyze report trends and validator failures;
- compare pipeline versions and rollout outcomes.

Observability should answer: What happened? Why was this question selected? Which evidence supported it? What version produced it? Why was it quarantined? How much did an accepted item cost? Where is inventory weak?

Operational metrics should distinguish candidates created from questions approved. High generation throughput with low acceptance is a quality or cost problem, not success.

## 18. Initial MVP and Future Evolution

These phases are orientation, not delivery commitments. Sequencing may change as product learning, cost, risk, and implementation constraints become clearer.

### Phase 1: Trustworthy structured foundation

- structured Question DNA schema;
- built-in category knowledge maps;
- fact-first generation;
- basic source verification and provenance;
- cached Question Bank;
- 100/200/300 predicted difficulty;
- structured and basic semantic duplicate controls;
- constrained Game Assembly;
- Arabic and English formulations;
- basic lifecycle and feedback capture.

The goal is not maximum scale. It is proving that the Machine can repeatedly supply reliable, varied, fast games.

### Phase 2: Breadth and Machine identity

- custom categories through the full pipeline;
- richer/dynamic knowledge maps;
- embedding-assisted semantic duplicate checks;
- theatrical pre-game manufacturing UI;
- stronger legitimate media questions;
- initial account/group Machine Memory;
- internal inventory and review tools.

### Phase 3: Empirical intelligence

- calibrated difficulty and confidence;
- user/group-aware ranking;
- automated lifecycle and quarantine policies;
- richer feedback analytics;
- adaptive inventory replenishment;
- stronger source-refresh and media-health operations.

### Phase 4: Mature Guess Engine

- sophisticated multi-objective recommendation and ranking;
- advanced media formats;
- self-improving category coverage;
- deeper regional and generational intelligence;
- highly useful long-lived Machine Memory;
- mature cost, quality, experimentation, and editorial operations.

Each phase should ship in small, inspectable increments. Later sophistication must not obscure the core truth path or make failures impossible to diagnose.

## 19. Non-Goals and Deferred Decisions

This document does **not** decide:

- the exact LLM or model provider;
- the exact embedding model or provider;
- the exact relational, document, graph, or vector database;
- the exact cloud vendor or deployment topology;
- the exact search or retrieval API;
- the exact media API or content partner;
- pricing, subscriptions, or entitlement tiers;
- the exact frontend implementation;
- the exact background-job or queue framework;
- final service boundaries;
- final automated-answer-checking behavior;
- complete safety policy or legal terms.

It also does not implement routes, models, migrations, workers, prompts, user interfaces, or infrastructure. Those decisions should follow from measurable requirements and preserve the contracts and doctrine established here.

## 20. Guess Engine Doctrine

Future development must not violate these rules:

1. **Facts first, questions second.** Establish and verify the answer before writing the clue.
2. **Generate before gameplay whenever possible.** Live play consumes prepared packages, not raw generation.
3. **Cache intelligence.** Reuse verified facts, evidence, interpretations, and qualified media.
4. **Remember facts, not just strings.** Paraphrases must not disguise repetition.
5. **Difficulty is measured.** Predict initially; calibrate from real, contextual performance.
6. **Custom categories are first-class.** They use the same pipeline and trust standards as built-ins.
7. **Machine Memory must provide genuine value.** Long-lived accounts should receive fewer repeats and better games.
8. **Never sacrifice trust for inventory size.** Low stock is better than unreliable stock.
9. **Build for Arab and GCC players deliberately.** Local intelligence is a product capability, not a translation pass.
10. **The player should experience a machine, not a chatbot.** Manufacturing, memory, calibration, and selection are the identity.
11. **Infinite means inexhaustible, not careless.** Breadth comes from architecture, not uncontrolled output.

> Seen Jeem sells you a catalog.  
> Guess Machine sells you the machine that makes the catalog.

