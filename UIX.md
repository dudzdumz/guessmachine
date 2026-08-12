# Seen-Jeem Machine UI/UX Specification

## 1. Purpose and Status

This document defines the finalized UI/UX direction for the Seen-Jeem Machine (SJM). It is intended to guide later implementation alongside separate backend, dataset, game-rules, audio, and infrastructure specifications.

SJM should preserve the recognizable functionality and social clarity of the original Seen Jeem game while establishing a completely distinct interaction grammar. It must not feel like the original board with a new color palette. The defining experience is that the player selects a category and then physically operates the Machine through one shared rotary control.

The central interaction is:

> All categories remain visible. One shared physical difficulty dial controls the selected category.

The interface should feel expressive, tactile, polished, and satisfying while remaining immediately understandable to a group gathered around one screen.

## 2. Experience Goal and Rationale

SJM is a room-scale social interface. It may be controlled by one person at a time, but it is observed, discussed, and understood by everyone in the group. The board must therefore prioritize collective scanability over private browsing patterns.

The design should accomplish four things:

1. **Preserve group clarity.** Every category and its remaining question availability should be visible at once so players can discuss their choice without navigating hidden content.
2. **Create a distinctive SJM identity.** The shared rotary dial replaces the original grid or column of point buttons with a memorable interaction unique to SJM.
3. **Make selection feel consequential.** Difficulty should be felt through motion, sound, haptics, and resistance rather than communicated only as a number.
4. **Make the metaphor literal.** The player does not merely click through a quiz interface; the player operates the Seen-Jeem Machine.

The design must support the social rhythm of the game rather than compete with it. Visual effects should reinforce state, action, and anticipation—not create decorative noise.

## 3. Core Design Principles

### 3.1 Everything important is observable

- Show all categories simultaneously on the main board.
- Show the availability of all three difficulty/point levels on every category card.
- Keep team scores visible throughout play without making them the visual focus.
- Make the active category, selected difficulty, current team, and unavailable options legible from a distance.
- Avoid interactions that require the group to remember content hidden off-screen.

### 3.2 One hero control

- The rotary dial is the primary tactile and visual object.
- Category cards remain clean and restrained so the dial can carry the Machine's industrial character.
- Keep the dial in a stable physical location throughout the game to build spatial memory.
- Do not scatter competing knobs, switches, gauges, or ornamental machinery around the interface.

### 3.3 Physical cause and effect

- Every input should produce immediate visual feedback.
- Dial rotation should have discrete detents, perceived mass, increasing resistance, and a settling response.
- Audio and haptics should confirm meaningful state transitions.
- Unavailable actions should feel mechanically blocked, not merely ignored.
- The reset between turns should be visible as a purposeful mechanical return to neutral.

### 3.4 Clarity before spectacle

- Animation must preserve orientation and explain what changed.
- Text, availability, active states, and scores must remain readable under all themes and motion states.
- The board should work without sound, haptics, or high-end animation.
- Reduced-motion, keyboard, and direct-tap alternatives are first-class behavior.

### 3.5 Preserve the game, reinvent the interaction

- Retain the core loop of choosing a category and difficulty/point value, answering, and scoring.
- Do not reproduce the original Seen Jeem board skeleton.
- SJM's identity comes from category activation plus operation of a shared Machine control.

## 4. Main Board Layout

The main board has three persistent functional regions:

1. **Category field:** all category cards are visible simultaneously.
2. **Machine control:** the rotary dial occupies a stable, prominent location.
3. **Game status:** current turn and team scores remain visible but visually subordinate.

The precise composition may adapt by viewport, but the hierarchy must remain:

```text
┌──────────────────────────────────────────────────────────────┐
│ Current team / game prompt                                  │
│                                                              │
│ [Category] [Category] [Category] [Category] [Category]       │
│   ● ● ●      ● ● ○      ● ○ ●      ● ● ●      ○ ● ●          │
│                                                              │
│                   Active category name                       │
│                                                              │
│                     100   200   300                           │
│                           ◉                                  │
│                    shared rotary dial                        │
│                                                              │
│ Team 1 · score                         score · Team 2         │
└──────────────────────────────────────────────────────────────┘
```

This diagram describes hierarchy, not final styling.

### 4.1 Category field

- Use a grid or a single wrapping row based on category count and viewport width.
- The full set must fit without a horizontal carousel.
- Cards should be large enough for group-readable category names and distinct category identity.
- Category imagery or icons may be used, but should not overwhelm the availability indicators.
- Maintain consistent card dimensions to make scanning fast.
- Avoid giving each category its own visible point buttons. The indicators communicate availability; the dial performs selection.

### 4.2 Machine control area

- Keep the dial centered or otherwise compositionally anchored in the same place during category selection, difficulty selection, question launch, and reset.
- Before category selection, the dial appears dormant or neutral—not absent.
- After category selection, the dial wakes visually and exposes or emphasizes the valid detents.
- The active category name should be clearly associated with the dial.

### 4.3 Scores and turn status

- Scores should remain persistently visible near the lower or peripheral edge of the board.
- The active team needs a clear but restrained highlight.
- Score changes may animate briefly, then settle back into the background hierarchy.
- Do not let score panels visually compete with the category field or dial.

## 5. Category Cards

Each category card communicates:

- Category name.
- Category identity through a restrained icon, illustration, color nuance, or texture.
- Three small availability indicators corresponding to 100, 200, and 300.
- Whether the card is idle, hovered/focused, active, exhausted, or temporarily locked.

The indicators are status lights, not miniature buttons. Their order and relationship to 100/200/300 must be consistent across every card. A legend may be shown during onboarding, but the pattern should become self-evident during play.

### 5.1 Card states

#### Idle

- Uses the standard aubergine card treatment.
- Available difficulty indicators are visibly lit.
- Used difficulties are dark, muted, or recessed.
- The card remains selectable if at least one difficulty is available.

#### Hovered or keyboard-focused

- Gains a clear outline, lift, glow, or surface response.
- Keyboard focus must not rely on color alone.
- Feedback should remain modest; this is inspection, not commitment.

#### Active/selected

- Visibly connects to the dial through emphasis, light, motion, or an optional restrained visual path.
- Uses the warm/gold accent or a brighter magenta treatment.
- Its name is repeated or reinforced near the dial.
- Other cards remain visible and readable but become slightly quieter.
- Selecting another available category before launch transfers activation cleanly.

#### Partially used

- Used indicators go dark and appear unavailable.
- Remaining indicators retain their normal brightness.
- The card remains selectable.

#### Exhausted

- All three indicators are dark.
- The card remains visible for board comprehension but cannot be activated.
- Use reduced contrast plus a readable exhausted state; do not remove the card or cause the grid to reflow.

#### Temporarily locked

- During question presentation, scoring, and reset, category selection is disabled.
- Cards should visibly hold their state without appearing broken.

## 6. Rotary Dial: Structure and Behavior

The rotary dial is the hero interaction and the physical identity of SJM. It should feel like a premium industrial control placed within a clean digital surface—not a novelty image of a knob.

### 6.1 Physical model

The dial has:

- A neutral/rest position.
- Three discrete difficulty detents: 100, 200, and 300.
- A clear position marker.
- A pressable center used to engage the selected question.
- Labels that remain readable and directly selectable as an accessibility alternative.

The control must never behave like a smooth, ambiguous volume knob. It snaps into explicit game states.

### 6.2 Dormant state

- Shown before a category is selected.
- Visually powered down: reduced glow, dim labels, and no active position.
- Rotation and center press do not launch anything.
- A brief, restrained response may teach that a category must be selected first.

### 6.3 Awake state

- Entered after selecting a non-exhausted category.
- Available detents illuminate or become raised/active.
- Used detents remain dark, recessed, blocked, or otherwise mechanically unavailable.
- The selected category name is associated with the control.
- The dial begins at neutral unless product testing establishes that another position is clearer.

### 6.4 Difficulty selection

- Rotation moves between discrete valid positions rather than producing arbitrary values.
- 100 should feel light and close.
- 200 should feel firmer and more deliberate.
- 300 should feel heavy, dramatic, and consequential.
- Motion should imply increasing inertia as difficulty rises.
- The dial may subtly overshoot and settle at harder levels, especially 300.
- Overshoot must remain short, controlled, and readable; it must not suggest the wrong value was selected.

### 6.5 Unavailable detents

Used difficulty levels cannot engage.

When input attempts to move into a used detent:

- The dial approaches or nudges against the unavailable position but does not settle into it.
- Feedback is dull, short, and non-confirming.
- The unavailable label/indicator may briefly respond without lighting as active.
- No valid-selection glow, haptic confirmation, or celebratory sound should occur.
- Keyboard and direct-tap input must communicate the same unavailable result accessibly.

The implementation may either stop at the blocked detent or skip it when navigating toward another valid value. Whichever rule is chosen must be consistent and tested for clarity. Direct selection of a used value must always fail safely.

### 6.6 Center press to engage

Once the dial rests on a valid difficulty:

- The center becomes pressable and visibly ready.
- Pressing the dial center engages and launches the question.
- The press should have visible travel, compression, light response, and a decisive confirmation.
- Do not add a generic `Start`, `Continue`, or `Open Question` button for the primary flow.
- Ignore or explain center presses made before a valid difficulty is selected.
- Lock duplicate presses immediately after engagement.

## 7. Dial State Machine

The UI should implement the dial as an explicit state machine rather than scattered booleans.

```text
DORMANT
  └─ select available category → AWAKE_NEUTRAL

AWAKE_NEUTRAL
  ├─ rotate/select valid detent → DETENT_SELECTED
  ├─ select another category → AWAKE_NEUTRAL (availability refreshes)
  └─ deselect category → DORMANT

DETENT_SELECTED
  ├─ rotate/select another valid detent → DETENT_SELECTED
  ├─ attempt used detent → BLOCKED_FEEDBACK → DETENT_SELECTED
  ├─ select another category → AWAKE_NEUTRAL
  └─ press center → ENGAGING

ENGAGING
  └─ engagement animation completes → QUESTION_ACTIVE

QUESTION_ACTIVE
  └─ answer/reveal/scoring completes → RESETTING

RESETTING
  └─ mechanical return completes → DORMANT + NEXT_TEAM
```

Recommended conceptual state data:

```ts
type DialPhase =
  | 'dormant'
  | 'awake-neutral'
  | 'detent-selected'
  | 'blocked-feedback'
  | 'engaging'
  | 'question-active'
  | 'resetting';

type Difficulty = 100 | 200 | 300;
```

The authoritative game state should determine which detents are available. Visual state must not mark a question used until the game logic has committed that transition.

## 8. Tactile, Audio, and Haptic Feedback

Feedback should communicate increasing weight and commitment.

| Detent | Motion character | Sound character | Haptic character |
|---|---|---|---|
| 100 | Quick, light snap | light `tk` | short/light pulse |
| 200 | Firmer snap with slight settling | stronger `TOK` | medium pulse |
| 300 | Heavier travel, subtle overshoot, weighted settle | deep `THUNK` | strong but brief pulse |

These labels describe character, not literal required audio samples.

### 8.1 Audio rules

- Sounds must be short, clean, and responsive.
- Playback latency should be low enough that sound feels caused by the motion.
- Preload essential interaction sounds.
- Avoid stacking sounds during rapid or invalid input.
- The blocked-detent sound should be duller and less resonant than a valid selection.
- Center engagement should have its own decisive mechanical confirmation.
- Provide an easily discoverable mute or effects-volume control.
- Never make audio the sole carrier of state.

### 8.2 Haptic rules

- Use platform haptics only where supported and permitted.
- Haptics should correspond to detent arrival, not every movement frame.
- Use progressively stronger patterns for 100, 200, and 300 without becoming uncomfortable.
- Invalid detents should receive a muted or double-tap rejection pattern distinct from confirmation.
- Respect device, browser, and user preferences; failure to provide haptics must not affect gameplay.

### 8.3 Animation rules

- Rotation should be driven by a physically coherent spring/easing model.
- Heavier difficulty may use longer settling, but interaction must remain fast.
- Do not delay question launch solely to showcase animation.
- Prefer transform and opacity animation for performance.
- Provide reduced-motion behavior with immediate snapping and restrained fades.

## 9. Question Engagement and Transition

Pressing the center of the dial should feel like committing the selection and feeding it into the Machine.

Recommended transition sequence:

1. The center compresses and confirms engagement.
2. The active category and difficulty briefly lock together visually.
3. The board transitions to the question without disorienting the group.
4. The question becomes the dominant readable object.
5. Persistent scores and turn identity remain available in a quieter form.

The question transition may use a restrained aperture, pulse, focus shift, radial echo, or machine-light response originating from the dial. Avoid long cinematic sequences. The group should retain a clear sense that the selected category/difficulty caused the presented question.

During the question:

- Prevent further category and dial input.
- Present question text and media at group-readable scale.
- Preserve the established deep-aubergine identity.
- Provide clear states for question presentation, answer/reveal, adjudication if applicable, and scoring.
- Do not use a transition that makes participants lose track of the active team or point value.

## 10. Reset and Turn Flow

The intended interaction rhythm is:

> scan → discuss → select category → rotate dial → THUNK → press dial → question → answer → score → machine resets → next team

After the question and score are resolved:

1. Commit the used category/difficulty in game state.
2. Darken its corresponding availability indicator.
3. Return from the question view to the full category board.
4. Mechanically rotate the dial back to neutral.
5. Power down the dial.
6. Deselect the category.
7. Activate and announce the next team.
8. Unlock category selection.

The reset should be visible and satisfying but brief. The ordering must avoid implying that the next team inherits the previous selection. The dial should not jump to a new screen location or retain a stale active glow.

If scoring requires manual confirmation, the Machine remains locked until the result is committed. Error recovery should return to a valid known state without consuming another question accidentally.

## 11. Responsive Behavior

The experience must preserve simultaneous category visibility and a stable dial location across supported screens.

### 11.1 Wide desktop and landscape tablet

- Prefer the strongest room-scale layout.
- Show categories in a single row when count and width allow; otherwise use a balanced grid.
- Give the dial generous central or lower-central space.
- Keep category labels, indicators, scores, and active-team status readable from several feet away.

### 11.2 Narrow desktop and portrait tablet

- Reflow categories into a compact grid without hiding any category.
- Keep the dial anchored below or centrally between category groups.
- Reduce decorative spacing before reducing important text or hit targets.
- Avoid page-length scrolling during the selection phase where feasible.

### 11.3 Mobile

- Keep all categories visible simultaneously within a compact grid; do not replace them with a carousel.
- The dial must remain large enough for thumb rotation and center press.
- It is acceptable to reduce category artwork and decorative detail to protect names and availability.
- Scores may become compact edge labels, but must remain visible.
- Account for safe areas and prevent browser gestures from interfering with intentional dial manipulation.
- If all content cannot fit in one viewport for an unusually high category count, use a single stable board layout with minimal vertical scroll—not horizontal browsing or hidden category pages.

### 11.4 Layout stability

- Card dimensions should not change when indicators become unavailable.
- The dial should not move when labels change, a category activates, or a difficulty is selected.
- Question and reset transitions should avoid unexpected layout shifts.

## 12. Accessibility and Input Methods

The physical metaphor must enhance the experience without making the game inaccessible.

### 12.1 Desktop pointer input

- Drag around the dial circumference to rotate.
- Support mouse-wheel selection while the dial is hovered or focused.
- Click the center to engage.
- Avoid capturing page scroll unless the pointer is clearly interacting with the dial.

### 12.2 Touch input

- Support thumb/finger rotation around the dial.
- Support a deliberate press on the center.
- Use generous hit targets.
- Handle interrupted gestures, multi-touch, and movement outside the dial without accidental engagement.
- Do not require highly precise circular motion; infer intent and snap to detents.

### 12.3 Direct difficulty selection

- Difficulty labels 100, 200, and 300 are tappable/clickable alternatives.
- Selecting a label drives the same state transition, motion, availability checks, and feedback as rotating the dial.
- Labels for used values are disabled and expose that state programmatically.

### 12.4 Keyboard input

- Category cards participate in a logical tab order.
- Enter or Space selects a focused category.
- When the dial is active, Left/Right arrows move between detents; Up/Down may be supported if direction is intuitive and documented.
- Enter or Space engages the selected difficulty.
- Escape may return to neutral/deselect before engagement if consistent with the wider game rules.
- Focus must move predictably when transitioning into the question and back to the board.

### 12.5 Screen readers and semantics

- Category cards should expose name, available values, used values, and selection state.
- Treat interactive cards as buttons or equivalent semantic controls.
- Expose the dial using an appropriate composite control pattern, with current value, minimum/maximum conceptual range, and unavailable values communicated clearly.
- Announce valid difficulty changes, blocked values, question launch, score changes, reset completion, and next team through concise live-region updates.
- Avoid repeated announcements caused by animation frames.

### 12.6 Visual and motion accessibility

- Meet accessible contrast requirements for text, focus, active, and unavailable states.
- Do not communicate availability or team identity through color alone.
- Provide visible focus rings consistent with the visual identity.
- Respect reduced-motion preferences by removing overshoot, large-scale zoom, and prolonged mechanical reset.
- Ensure the complete game remains usable when sound and haptics are unavailable.

## 13. Visual Language

### 13.1 Palette

- **Primary environment:** deep aubergine.
- **Primary energy:** magenta and related luminous purple tones.
- **Active/high-difficulty accent:** optional restrained warm gold, amber, or brass-like light.
- **Unavailable states:** dark, low-energy aubergine/charcoal treatments with sufficient readable contrast.
- **Text:** warm light neutrals rather than clinical pure white where appropriate.

Exact tokens should be defined during visual-system implementation and contrast-tested in context.

### 13.2 Typography

- Use clean, confident typography suitable for group reading.
- Category names, question text, scores, and numeric difficulty values require distinct but coordinated hierarchy.
- Avoid novelty industrial fonts for body or question content.
- Arabic and Latin layouts, if both are supported, must receive equal typographic care and robust fallback fonts.
- Design for right-to-left behavior explicitly rather than mirroring the interface accidentally.

### 13.3 Surfaces and cards

- Cards should use restrained depth, tonal separation, and responsive glow.
- Fine texture may suggest a crafted object, but must not reduce legibility.
- Use borders and shadows sparingly.
- Active energy should appear to wake the interface rather than permanently illuminate every surface.

### 13.4 The dial's industrial character

- Concentrate tactile detail on the dial: material depth, edge ridges, a position marker, light behavior, and press travel.
- Suggested references include a high-quality studio, broadcast, laboratory, or industrial control—not a steampunk boiler.
- A small amount of brass/gold warmth may emphasize 300 or engagement.
- Keep the surrounding board clean enough that the dial reads as special.

### 13.5 Motion language

- Idle state: quiet, stable, faintly alive.
- Category activation: controlled wake-up.
- Rotation: weighted and detented.
- Engagement: compressed, decisive, causal.
- Question transition: focused and fast.
- Reset: mechanical return and release.

## 14. Implementation Notes

### 14.1 Component boundaries

A likely frontend decomposition is:

- `GameBoard`
- `CategoryGrid`
- `CategoryCard`
- `AvailabilityIndicators`
- `MachineDial`
- `DifficultyLabels`
- `TurnIndicator`
- `ScoreDisplay`
- `QuestionStage`
- `GameTransitionLayer`
- `AudioFeedbackProvider`
- `HapticFeedbackService`

Names may follow the project's established conventions. Keep game rules separate from presentation and animation state.

### 14.2 State ownership

- The authoritative game/session layer owns teams, turn, scores, categories, question availability, active question, and committed answer results.
- The board owns transient selection state only where appropriate.
- The dial owns gesture interpretation and animation state, but does not decide whether a question is available.
- Availability should be derived from authoritative data and validated again when engagement is committed.
- Prevent race conditions and duplicate launches by locking engagement immediately.

### 14.3 Interaction architecture

- Normalize drag, wheel, touch, direct-label, and keyboard input into the same semantic actions: previous detent, next detent, select difficulty, engage, and cancel.
- Route all selection methods through one availability check and state machine.
- Keep feedback effects downstream of confirmed semantic state changes so visual, audio, and haptic responses cannot disagree.
- Treat animation completion as presentation state, not as the source of game truth.

### 14.4 Performance

- Preload only the small set of critical interaction sounds.
- Use compositor-friendly transforms for dial movement.
- Avoid expensive full-screen filters and continuously animated background effects.
- Test on mid-range mobile devices and tablets, not only desktop hardware.
- Ensure input remains responsive while question media loads.

### 14.5 Persistence and failure handling

- A refresh or reconnect should restore authoritative game state without reviving used detents.
- If question loading fails after engagement, show a recoverable error and do not silently consume the question.
- If audio or haptic APIs fail, continue without interrupting play.
- If animation is interrupted, snap to the correct logical state.

### 14.6 Instrumentation and tuning

During prototyping, make these values easy to tune:

- Detent angles.
- Drag sensitivity.
- Wheel thresholds.
- Spring stiffness/damping.
- Overshoot distance and duration.
- Per-level audio gain and sample.
- Haptic patterns.
- Engagement/reset timing.

Playtest with groups, not only individual users. Observe whether spectators can identify the active category, remaining values, selected difficulty, current team, and result without explanation.

## 15. Required UI States and Edge Cases

Implementation must account for:

- No category selected.
- Category selected with all values available.
- Category selected with one or two values used.
- Attempt to select a used value.
- Exhausted category.
- Difficulty selected but not yet engaged.
- Rapid repeated rotation.
- Rapid repeated center press.
- Switching categories before engagement.
- Question loading.
- Question load failure and retry/recovery.
- Answer/reveal and score adjudication.
- Score update.
- Reset animation.
- Next-team activation.
- Game completion when all questions are used.
- Sound disabled or unavailable.
- Haptics unavailable.
- Reduced motion enabled.
- Keyboard-only and screen-reader operation.
- Right-to-left layout where applicable.

## 16. Acceptance Criteria

The UI/UX direction is successfully implemented when:

- Every category is visible at the same time during board selection.
- Each card clearly shows availability for 100, 200, and 300 without presenting a grid of point buttons.
- Used questions remain visibly unavailable and cannot be engaged.
- Selecting a category visibly wakes one shared dial.
- The dial has discrete, unambiguous 100/200/300 detents.
- Each valid detent has differentiated visual, audio, and optional haptic feedback.
- Higher difficulty feels heavier without making the interface sluggish.
- Pressing the dial center launches the selected question.
- Pointer, touch, direct-label, and keyboard alternatives all reach the same logical states.
- The dial remains in a stable location and mechanically returns to neutral after a question.
- Category selection clears and the next team activates after reset.
- Scores remain visible but subordinate.
- Reduced-motion and silent operation preserve complete usability.
- The result feels like operating the Seen-Jeem Machine rather than navigating a reskinned quiz board.

## 17. Explicit Anti-Goals

Do not implement any of the following:

- The original Seen Jeem column/grid skeleton with separate 100/200/300 point buttons under every category.
- A category conveyor, carousel, horizontal scroller, rotating shelf, or one-category-at-a-time browser.
- Hidden categories that require navigation to inspect during ordinary selection.
- A generic `Start`, `Continue`, or `Launch` button as the primary way to open a question.
- A dial that changes arbitrary continuous values or behaves like a volume control.
- A dial that moves to different locations between phases.
- Unavailable detents that appear to engage successfully.
- Industrial decoration spread indiscriminately across the interface.
- Pipes, bolts, gauges, grunge, or heavy skeuomorphism used as filler.
- A steampunk, boiler-room, military-console, or generic sci-fi cockpit aesthetic.
- Visual spectacle that delays play or obscures category availability.
- Sound- or haptic-only information.
- Small category labels, low-contrast used states, or interactions designed only for the person holding the device.
- A cosmetic reskin of the OG board.

## 18. Product North Star

At every design and implementation decision, ask:

> Can the whole group immediately read the board, agree on a choice, and feel that one player is physically operating the Machine on everyone's behalf?

If the answer is yes, the interface is serving SJM. If an idea hides categories, fragments shared attention, imitates the original point-button board, or weakens the dial as the defining object, it should be rejected or revised.
