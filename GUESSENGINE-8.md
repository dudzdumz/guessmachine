# Guess Engine 8: Media Engine, Multimodal Questions, and Asset Qualification

**Status:** Foundational Media Engine specification  
**Product:** Guess Machine / مخ ماشين  
**Depends on:** `GUESSENGINE-1.md` through `GUESSENGINE-7.md`  
**Implementation status:** Architecture only; no media implementation is authorized

## 0. Purpose and Relationship to Previous Documents

This document owns media discovery, identity/authenticity, rights/provenance, technical qualification, accessibility, pairing/transformation, reveal/cue logic, leakage prevention, fallback, caching/expiry, moderation, delivery, and media-specific difficulty.

Media is downstream of verified facts. One FactRecord may support text and media variants. Media failure never changes truth. QuestionMediaUsage owns crop/blur/cue/reveal. Difficulty consumes treatment metadata. GamePackage resolves assets before play. Authentic legitimate media is preferred over synthetic substitutes.

> Media must earn its place in a question.  
> A media question that cannot survive its media failing is not ready for live play.

## 1. Media Engine Responsibilities

The engine owns suitability, discovery, source/identity/authenticity/rights qualification, attribution, metadata/technical integrity, caching/availability, accessibility/moderation, leakage checks, transformations/cues, fallback, package resolution, versioning, and performance signals.

It does not own fact validation, general source truth, final wording/ranking, payments, or future user-upload policy.

## 2. Media Philosophy

Media serves knowledge. Prefer authentic assets when identity matters; know rights for intended use; stabilize delivery; preserve identity through transformations; test visible/metadata leakage; qualify accessibility; version challenge-changing treatments; separate asset from usage; provide fallback; label synthetic content; and use format variety for rhythm rather than gimmicks.

## 3. Supported Media Types

Conceptual types include image, audio, video, animation/GIF, map, diagram, logo/badge, cover art, poster, photograph, screenshot, waveform/excerpt, generated non-factual graphic, and multi-image set. Semantic subtype matters even when MIME type is identical.

## 4. Question Media Formats

Formats include image identification/crop/progressive/blur reveal, badge/logo, cover/poster, map, audio and progressive audio, video identification, multi-image connection, odd-one-out, before/after, visual timeline, and zoom/detail. They are format concepts, not MVP commitments.

## 5. MediaAsset

```text
MediaAsset {
  media_asset_id, media_type, semantic_subtype,
  canonical_subject_refs, related_fact_refs,
  source_url, source_domain, source_title, creator, publisher,
  license_or_rights_basis, license_identifier, attribution,
  territory_constraints, usage_constraints,
  retrieved_at, cached_location_optional, content_hash,
  mime_type, dimensions, duration, file_size, language, region,
  authenticity_status, moderation_status, technical_status,
  availability_status, accessibility_metadata, expiry, version,
  created_at, updated_at
}
```

This is canonical meaning, not a database table.

## 6. QuestionMediaUsage

```text
QuestionMediaUsage {
  question_media_usage_id, question_id, variant_id, media_asset_id,
  usage_type, crop, focal_region, blur_level, reveal_sequence,
  start_time, end_time, cue_points, playback_limit,
  caption_policy, attribution_policy, answer_leakage_mask,
  difficulty_metadata, accessibility_fallback,
  fallback_usage_ref, status, version
}
```

Asset identity and question presentation remain separate.

## 7. Media Suitability Gate

Before discovery ask: does media test relevant knowledge, improve on text, support fair challenge, depict a distinctive subject, have plausible rights/reliability/accessibility, and permit fallback? Reject fragile decorative usage.

## 8. Media Discovery

Potential sources include official pages, public-domain/open-license/institutional archives, licensed catalogs, official artist/team/company collections, structured metadata services, and reputable databases. Search images are candidates only, never automatic assets.

## 9. Discovery vs Qualification

A thumbnail may reveal a candidate but establishes neither identity, rights, technical quality, nor stability. Discovery produces candidates; qualification promotes MediaAsset.

## 10. Media Identity Verification

Establish depicted/contained subject using source caption, official metadata, entity context, event/date, and recognition signals. Filenames and search labels are weak hints. Ambiguous identity blocks use.

## 11. Authenticity

Statuses may be `authentic_verified`, `authentic_probable`, `synthetic`, `edited`, `composite`, `uncertain`, or `rejected`. Real-world identification generally requires verified authenticity.

## 12. Edited Media

Cropping, blur, masking, resize, and trim are legitimate when lineage is preserved. They cannot alter identity, fabricate details, misrepresent context, or change uniforms/logos/scores into false evidence.

## 13. AI-generated Media

Acceptable roles may include decorative Machine graphics, neutral icons/backgrounds, or explicitly fictional puzzle art. It is not the default for real celebrities, events, landmarks, products, covers, or screenshots and must never counterfeit evidence.

## 14. Rights / Licensing Model

Conceptual classes: `public_domain`, `open_license`, `licensed_partner`, `first_party_permission`, `official_embed_allowed`, `platform_embed_allowed`, `fair_use_candidate_needs_review`, `unknown`, and `prohibited`. These preserve policy inputs without claiming legal conclusions.

## 15. Rights Are Usage-specific

Permission to link/embed/display may not permit download, crop, cache, commercial use, or redistribution. QuestionMediaUsage must stay within MediaAsset constraints.

## 16. Attribution

Support visible, end-of-question, source-panel, or internal-only provenance according to obligation. Keep play clear while respecting requirements.

## 17. Territory / Region Constraints

GamePackage cannot include an asset whose usage is invalid in the target territory. Territory metadata remains policy-driven and provider-neutral.

## 18. Hotlinking

Hotlinks can block, expire, change content, leak privacy, or add latency. Stabilize/cache where permitted; otherwise qualify dependable embeds and prepare fallback.

## 19. Caching Philosophy

Permitted caching improves latency, consistency, leakage testing, and resilience. Retain original source, hash, retrieval time, rights, and transformation lineage.

## 20. Content Hash

Conceptual content identity detects same-URL replacement, duplicates, stale cache, and unexpected change. Algorithm is deferred.

## 21. Availability Status

States include `available`, `degraded`, `temporarily_unavailable`, `expired`, `removed`, `blocked`, and `invalidated`. Packages rely only on eligible states.

## 22. Media Health Check

Before readiness verify access/cache, integrity, expected type, dimensions/duration, rights validity, and transformation applicability. Perform before live play.

## 23. Technical Validation

Images: dimensions, corruption, orientation, ratio, transparency, size. Audio: duration, decode, loudness/clipping/channels. Video: duration, decode, resolution, seekability, captions/subtitles, compatibility. Thresholds are deferred.

## 24. Media Normalization

Resize, transcode, loudness normalization, thumbnails, poster frames, and safe conversions may produce versioned derivatives without changing source identity.

## 25. Image Cropping

Record coordinates, focal subject, margins, and target ratio. Check for unfair clue removal, text leakage, and newly introduced ambiguity. Difficulty consumes crop strength.

## 26. Blur

Record strength and transformation version/reveal stages. More blur is not automatically better; beyond fair recognizability it becomes guessing.

## 27. Progressive Reveal

```text
RevealStage {
  stage_index, timing_or_trigger, transformation,
  difficulty_strength, version
}
```

Stages may widen crop, reduce blur, lengthen audio, or advance video.

## 28. Audio Cues

Define start/end, looping, fades, playback cap, and reveal sequence. Avoid accidental silence or irrelevant intro unless legitimately intended.

## 29. Music Audio

Support licensed clips and platform-approved previews/embeds with rights metadata. Never architect around full-song downloads or platform bypass.

## 30. Voice Identification

Actor/singer/character/public-speech formats require strong identity/authenticity, rights, deepfake awareness, and ambiguity checks.

## 31. Sound Effect Questions

Console/game/animal/iconic effects still require provenance and use rights; internet availability does not imply reusability.

## 32. Video Cues

Define start/end, crop, mute, subtitle/logo masking, playback count, and reveal stages. Masking may hide leakage but cannot misrepresent the event.

## 33. Subtitle / Caption Leakage

Inspect subtitles, lower thirds, names, team/song titles, and chyrons. Leakage checks cover all rendered frames/cues.

## 34. Image Text Leakage

Jersey names, badges, posters, albums, filenames, watermarks, scoreboards, and labels may destroy the question. Record intentional versus masked text.

## 35. Client-side Metadata Leakage

Use opaque refs. Do not expose answers in filenames, URLs, alt text, JSON labels, DOM IDs, metadata, or preload titles. Accessibility descriptions must remain safe.

## 36. Accessibility vs Leakage

For visual identity, a screen-reader label cannot simply name the answer. Use neutral descriptions, an equivalent accessible QuestionVariant, or host accommodation. Accessibility is qualification, not afterthought.

## 37. Accessible Fallback Variants

A logo question may have an approved text clue alternative. Do not exclude players who cannot use a modality.

## 38. Color Dependence

Do not rely on color alone without an equivalent cue/variant. Accessibility barriers are not difficulty.

## 39. Audio Accessibility

Support transcript where non-leaking, alternative text question, meaningful visualization, or prepared alternate. Captions do not automatically solve identification formats.

## 40. Media Moderation

Screen sexual/graphic/hateful/disturbing content, minors, privacy, and other sensitivity according to category policy. Detailed moderation is deferred.

## 41. Sensitive Historical Media

War, tragedy, conflict, and disaster may require non-graphic choices, stronger review, sensitivity metadata, and text alternatives.

## 42. Private Individual Media

Do not scrape/use photos of private individuals. Public-figure status, appropriateness, and rights remain necessary.

## 43. MediaDifficultyMetadata

```text
MediaDifficultyMetadata {
  recognition_strength, crop_strength, blur_strength,
  clip_length, visual_text_presence, subject_prominence,
  context_strength, reveal_stage_count, ambiguity_risk,
  treatment_version
}
```

## 44. Media Quality Assessment

Assess authenticity, resolution, recognizability, reliability, rights confidence, attribution, leakage, accessibility, stability, moderation, and relevance. Fatal defects override composite quality.

## 45. Multi-asset Questions

```text
MediaSet {
  media_set_id, asset_refs, ordering,
  relationship_type, layout_hint,
  shared_rights_status, fallback_policy, version
}
```

Supports connection, odd-one-out, timeline, and before/after without prescribing UI.

## 46. Connection Questions

Every asset identity and the shared relation must be verified, with one unique answer and no single asset leaking it excessively.

## 47. Odd-one-out

Use an objective relation—e.g., which player did not play for Club X—not subjective visual difference. Media presents entities; FactRecords establish relations.

## 48. Timeline Media

Ordering derives from verified effective dates, not image metadata alone.

## 49. Map Questions

Use official/open geographic sources or internally rendered maps from verified geometry. Generated maps visualize structured truth rather than pretending to be photographs; provenance remains attached.

## 50. Internally Generated Graphics

Maps, timelines, silhouettes, stat cards, icons, and diagrams may be programmatically created from verified facts. They are presentations, not authentic archival evidence.

## 51. Generated Silhouettes / Masks

Derived silhouettes retain source/transformation lineage. Scratch-generated art must not imply historical authenticity and must remain fair/rights-compliant.

## 52. Background Removal

Version the transformation and reassess challenge/ambiguity. Do not remove relevant identity cues or create a misleading composite.

## 53. Face Crops

Require public-figure appropriateness, rights, identity confidence, recognizability, and minor policy. Facial-recognition profiling is not an architectural requirement.

## 54. Logos and Trademarks

Logo trivia retains source, trademark/use constraints, and region metadata without making legal conclusions.

## 55. Product Images

Cars, consoles, devices, shoes, and products require model/edition specificity and ambiguity checks among visually similar variants.

## 56. Screenshots

Film/game/TV screenshots need legitimate source, work/episode/game identity, spoiler context, subtitle leakage checks, and usage constraints. Pirated screenshots are not a foundation.

## 57. Posters / Cover Art

Title text may trivialize identification. Qualified crop/masking/detail treatments can help, but rights remain applicable.

## 58. Album Covers

Check artist/title leakage, edition and regional variants, deluxe/reissue identity, and treatment-specific difficulty.

## 59. Game Art

Cover, screenshot, and character art need franchise/version/platform/remaster resolution and legitimate provenance.

## 60. Sports Media

Player images, badges, stadiums, kits, and match stills require rights plus jersey/scoreboard/sponsor/current-versus-historical leakage/context checks.

## 61. Arab/GCC Media Sources

Omani landmarks, Gulf badges, Ramadan TV posters, Arabic covers, and regional maps are first-class. Do not prefer Western media merely because APIs are richer.

## 62. Arabic Text in Media

Leakage detection covers Arabic badge names, posters, lower thirds, signage, numerals, and mixed scripts with the same seriousness as English.

## 63. Multilingual OCR Concept

Future OCR/text detection should support Arabic, English, mixed scripts, and numerals. OCR is a leakage signal, never truth evidence.

## 64. Media Authenticity Signals

Official source, provenance, metadata, archive identity, source captions, reverse matching, and content consistency contribute. No single signal is perfect.

## 65. Deepfakes / Synthetic Risk

Support provenance checks, source trust, synthetic labels, and rejection where authenticity matters. Automated deepfake detection is not required for MVP.

## 66. Media Duplication

Track asset identity, source copies, perceptual similarity, and crops so the same photo does not repeatedly appear under different facts.

## 67. Perceptual Duplicates

Resized, mirrored, recompressed, and cropped versions may be the same visual. Perceptual methods are future implementation, not specified algorithms.

## 68. Media Exposure Memory

Machine Memory may track MediaAsset, exact treatment/crop, and format. Identical imagery can feel repetitive even for a different fact and should be a soft ranking signal.

## 69. Media Saturation

Asset abundance must not make a category all images. Assembly balances formats; Media Engine supplies eligibility and quality.

## 70. Media Format Mix

No fixed text/image/audio/connection ratio. Mix depends on category, stock, rights, accessibility, performance, and group context.

## 71. Media and Custom Categories

Custom source landscapes may report excellent images but no legal audio/video. Engine 7 promises only qualified formats.

## 72. Custom Media Reuse

Saved custom categories reuse still-valid MediaAssets and treatments rather than rediscovering the same cover each game, while respecting exposure.

## 73. Media Freshness

Current logos, product designs, maps, and portraits can change. MediaAsset version/effective context must align with FactRecord; historical assets can remain stable.

## 74. Media Expiry

License, signed URL, source removal, embed-policy change, and stale context may expire eligibility without changing fact truth.

## 75. Fallback Hierarchy

1. Same variant with alternate qualified asset.
2. Same QuestionRecord with alternate approved media variant.
3. Approved text-only variant of same fact.
4. Same category/difficulty eligible question.
5. Package-level fallback slot.

No random live download.

## 76. Fallback Validation

Fallbacks are prepared before readiness and pass quality, difficulty, language, rights, freshness, duplicate, exposure, and technical checks.

## 77. Media Package Snapshot

GamePackage resolves opaque asset reference, transformation version, accessibility fallback, required attribution, safe technical metadata, and fallback ref. Avoid unnecessary internal source details in clients.

## 78. Preload Strategy

Preload near-future media for smooth play within bandwidth limits, while opaque naming/payload separation prevents upcoming-answer leakage. Frontend strategy is deferred.

## 79. Client Trust Boundary

Assume players inspect network and source. Do not send future answers, descriptive names, answer-bearing accessibility strings, or complete upcoming payloads unnecessarily.

## 80. Host View vs Player View

Host-only answers/metadata must never leak to shared view through asset URLs, captions, or cache keys. UI architecture is deferred.

## 81. Media Loading Failure

If prepared media still fails, switch instantly to fallback, record technical failure, exclude/down-weight outcome from difficulty calibration, and continue without generation.

## 82. Technical Failure Events

```text
MEDIA_DISCOVERED
MEDIA_QUALIFIED
MEDIA_REJECTED
MEDIA_CACHED
MEDIA_REFRESHED
MEDIA_INVALIDATED
MEDIA_TRANSFORMED
MEDIA_LEAKAGE_DETECTED
MEDIA_FALLBACK_ACTIVATED
MEDIA_PLAYBACK_FAILED
MEDIA_RIGHTS_EXPIRED
```

No event-sourcing mandate.

## 83. Media Versioning

Distinguish canonical asset, cached file, transformation, and QuestionMediaUsage versions. Each has lineage and active status.

## 84. Difficulty Calibration and Versioning

Changed crop, blur, cue, or clip length may invalidate old performance. Difficulty receives treatment version and transfer rules.

## 85. Media Performance

Signals include correctness, timing, skip, playback/fallback, replay, dispute, and accessibility fallback. Replays may indicate difficulty or technical failure, so interpretation is contextual.

## 86. Media Quality Feedback

High technical failure degrades eligibility. Disputes may reveal a misleading crop, wrong identity, or ambiguous subject and route to review.

## 87. Media Rights Review

Unclear licenses, high-value clips, unusual embeds, or disputed ownership may enter `requires_rights_review`. Human/legal review remains a policy gate.

## 88. Manual Media Overrides

Editors may approve/reject/replace, adjust treatment/cue/fallback, update attribution, or invalidate. Every action is auditable.

## 89. Media Admin Tools

Future tools preview asset/source/rights, test crops/blur/audio, inspect leakage/accessibility/usage/failures, replace, and invalidate globally.

## 90. Media Observability

For a media variant answer: why chosen, what it depicts, identity/authenticity evidence, rights, hosting, transformation, leakage checks, fallback, difficulty, failure history, expiry, and version.

## 91. Media Cost Metrics

Measure discovery, licensing, storage, bandwidth, transformation, moderation, and validation; cost per qualified/served asset, cache hit, and fallback rate. Cost cannot lower rights or quality standards.

## 92. Bandwidth Considerations

Use appropriate resolution, compression, short clips, bounded preload, caching, and reuse. Codec specifics are deferred.

## 93. Mobile Network Conditions

Support conceptually lighter variants, text fallback, and adaptive quality. One giant 4K video must not break a phone/hotspot game.

## 94. Offline / Degraded Network Future

A preloaded package with cached media could later survive outages. Offline mode is not promised, but contracts should not make it impossible.

## 95. Privacy

Do not collect player camera/microphone data unless a separately designed, consented feature requires it. Current scope is playback, not surveillance. User uploads are excluded.

## 96. Security

External media is untrusted: malformed codecs, trackers, redirects, scriptable files, huge payloads, malicious metadata, and injections. Sanitize/validate before delivery; sandbox details are deferred.

## 97. Metadata as Untrusted Input

EXIF, captions, filenames, ID3, subtitles, and page metadata cannot alter system policy and may be malicious or misleading.

## 98. EXIF / Hidden Metadata Leakage

Strip/withhold unnecessary GPS, subject, creator notes, titles, and names from player delivery while preserving internal provenance.

## 99. Audio Metadata Leakage

Do not expose title, artist, album, filename, or tags to player clients.

## 100. Video Metadata Leakage

Sanitize titles, filenames, chapters, subtitles, and embedded answer metadata.

## 101. Full Worked Example: Image Question

FactRecord identifies a historic football stadium as the verified answer. Suitability confirms visual distinctiveness. Discovery finds an official/open licensed photograph; caption/date establish identity; rights allow commercial display/crop/cache. Technical checks pass. QuestionMediaUsage crops signage that would leak the name while preserving architectural clues, records difficulty metadata and safe neutral accessibility description, and references an approved text fallback. Package health verifies the cached derivative before inclusion.

## 102. Full Worked Example: Progressive Image

One verified landmark MediaAsset has three usage stages: tight detail/high challenge, wider crop/medium, full structure/easier. Each stage records transform and clue strength; DifficultyProfile uses treatment version. A text clue variant is prepared if the reveal asset fails.

## 103. Full Worked Example: Audio Question

A verified song/artist FactRecord references a licensed platform preview. Rights allow the intended embed/segment. Usage selects a recognizable but non-trivial cue, strips title/artist tags from client metadata, caps playback, versions clip length, and predicts 200. An approved text question about the same fact is fallback. No full song is copied.

## 104. Full Worked Example: Video Question

An official/public-domain sports event clip is identity/rights/technical qualified. Usage selects a short moment, masks subtitles and a scoreboard name without altering action, records cue/mute/treatment, and provides a still/text alternate. All assets/fallbacks are package-ready before play.

## 105. Full Worked Example: Arab/GCC Media

An Arabic Omani landmark question uses a qualified official/open regional image. Arabic source caption verifies subject; rights/attribution and caching are recorded. OCR/leakage check masks Arabic signage if it reveals the name. Native Arabic wording and Oman-context difficulty are attached; a text fallback remains available.

## 106. Full Worked Example: Rejected Media

A beautiful high-resolution random-site image has unknown origin, uncertain subject, and no rights basis. It is rejected despite aesthetics. The engine seeks a legitimate asset or uses the approved text variant.

## 107. Full Worked Example: Broken Media Fallback

An asset qualified during preparation fails at runtime. The client activates the prepared text/alternate-media fallback instantly, emits failure/fallback events, excludes the broken presentation from clean difficulty calibration, and continues. No live search occurs.

## 108. Media Engine Invariants

1. Media never replaces FactRecord truth.
2. Media questions reference verified facts.
3. Asset identity is established before use.
4. Unknown rights block normal commercial use unless policy explicitly permits.
5. Search thumbnails are not qualified assets.
6. Every live media question has prepared fallback.
7. Broken media never triggers raw live generation.
8. Visible content and metadata are checked for leakage.
9. Client asset IDs are opaque.
10. Accessibility failure is not difficulty.
11. Transformations preserve factual identity.
12. Synthetic media never masquerades as authentic evidence.
13. Media difficulty is treatment/version-specific.
14. Rights expiry removes eligibility.
15. Source provenance remains auditable.
16. Hotlinks are not blindly trusted.
17. Metadata is untrusted input.
18. Custom categories use identical qualification.
19. Arabic leakage equals English leakage.
20. Media is optional; text is valid fallback.
21. A pretty asset is not worth a fragile game.
22. The question must remain good without spectacle.
23. Runtime failure does not mutate truth.
24. Fallback outcomes identify the actual treatment served.
25. Multi-asset relations are independently verified.
26. Media exposure may affect diversity but not fact identity.

## 109. MVP Media Engine

Phase 1: images, logos/badges, maps, MediaAsset/QuestionMediaUsage, provenance/rights, identity and technical validation, basic crop/leakage checks, permitted stable caching, prepared text fallback, and package readiness.

Later: progressive reveal, audio/video, multi-image connection, perceptual dedupe, rights automation, adaptive quality, richer accessibility, and media analytics. Prefer a few flawless formats over fragile multimedia everywhere.

## 110. What This File Does Not Decide

This document defers media/search/CDN/storage providers, licensing deals/fair-use policy, codecs/thresholds/cache TTL, OCR/moderation/deepfake providers, preload implementation, audio/video launch, attribution UI, and cost budgets.

It creates no fetchers, scrapers, downloaders, routes, services, queues, schemas, CDN logic, prompts, adapters, or frontend components.

## 111. Handoff to GUESSENGINE-9

`GUESSENGINE-1.md` defines doctrine.  
`GUESSENGINE-2.md` defines canonical contracts.  
`GUESSENGINE-3.md` defines the Question Foundry.  
`GUESSENGINE-4.md` defines knowledge acquisition and verification.  
`GUESSENGINE-5.md` defines Difficulty.  
`GUESSENGINE-6.md` defines Machine Memory.  
`GUESSENGINE-7.md` defines Custom Categories.  
`GUESSENGINE-8.md` defines the Media Engine.  
`GUESSENGINE-9.md` will define Game Assembly, package preparation, runtime behavior, fairness, ranking, fallback orchestration, session telemetry, observability, launch strategy, and subsystem convergence.

`GUESSENGINE-9.md` must not be created as part of this work.

## 112. Media Engine Doctrine

1. Media serves knowledge.
2. Authenticity matters.
3. Rights matter.
4. A search result is not an asset.
5. Beautiful media with unknown provenance is still bad.
6. Media must survive the real network.
7. Every media question has a fallback.
8. Metadata cannot leak the answer.
9. Accessibility is part of correctness.
10. Transformations change presentation, not truth.
11. Difficulty lives in the treatment.
12. Cache where permitted.
13. Version everything that changes challenge.
14. Regional media is first-class.
15. Arabic leakage is still leakage.
16. Synthetic media never impersonates authentic history.
17. Broken media never breaks the game.
18. Media creates memorable questions, not fragile ones.
19. If media does not improve the question, do not use it.
20. The Machine may have eyes and ears, but the FactRecord is still its brain.

