# Relay - design system

Status: implemented and extended for competition. Owner: James. 20 October 2026.

## Mood

A quiet studio desk for keeping momentum: paper, ink, generous margins and a single confident green. The board is the workspace; context is always close.

Conceptual references: the hierarchy of an editorial contents page, the legibility of a paper project planner, and the utility of a studio pinboard. These are not reproductions of another product.

Avoid neon gradients, decorative dashboard metrics and heavy card shadows.

## Palette

| Token | Hex | Use |
|---|---|---|
| brand-primary | #264F3D | Actions, wordmark and focus |
| brand-accent | #DCE8C7 | Active navigation and highlights |
| surface-page | #F6F5F0 | Warm page |
| surface-card | #FFFFFF | Cards and dialogs |
| text-primary | #252B27 | Body text |
| text-muted | #647066 | Secondary text |
| type-feature | #426746 | Feature label and stripe |
| type-bug | #A44235 | Bug label and stripe |
| due-safe | #E8EFE5 | Later deadlines |
| due-warning | #FBEDCB | Today and upcoming |
| due-overdue | #FBE5DF | Earlier deadlines |
| due-neutral | #EDF0EC | Done or no date |

These are the original light palette values. Semantic tokens now live in src/accessibility.js and are exposed through tailwind.config.js. Secondary text was strengthened to #536056. Dark, alternate and contrast palettes are resolved there as complete foreground/background pairs. Urgency includes text and an icon, not colour alone. Done is neutral regardless of deadline.

## Typography

| Role | Font | Rationale |
|---|---|---|
| Heading / wordmark | Georgia, serif | Editorial warmth with a reliable system font |
| Body / controls | System sans-serif | Familiar and crisp |
| Section labels / IDs | System monospace | Subtle structure for metadata |

At standard size: page heading 36-44 px, task title 15 px semibold, body 14 px and metadata at least 12 px. Text and spacing use rem values and support 100-200% scaling. The optional plain-heading mode uses the body font throughout.

## Component principles

- Cards: white paper, fine border, type stripe, subtle hover shadow.
- Buttons: forest green primary; bordered secondary; visible focus rings.
- Modal: native dialog, scrollable, labelled, initial focus, Escape close, focus restoration.
- Empty states: quiet dashed outlines and a clear action.
- Movement: labelled status select on every card, no drag-only interactions.
- Anchors: four compact document slots above the board, separate edit and open actions.
- Layout: slim sidebar on large screens; compact header on small screens; four columns on desktop with an explicitly scrollable board on narrow screens.
- Icons: Lucide, consistent 16-20 px strokes, no custom icon set.
- Motion: short hover/focus/toast transitions; respect reduced motion.

## Voice

| Surface | Copy |
|---|---|
| Add task | New task |
| Empty column | Room for your next move. |
| Copy success | Copied. Pick up where you left off. |
| Delete confirmation | Move this task to Recovery? Restore it there or use persistent Undo. |
| Handoff toast | Handed off to {name}. |
| Persistence | Saved in this browser |
| Extra feature | Resume work |

## Identity

- Product: Relay
- Team: James's solo studio
- Tagline: Keep the work moving. Keep the context.
- Wordmark: lowercase serif lettering beside a Lucide workflow icon.
- Light, dark or device appearance. Optional blue/amber, teal/rose and monochrome palettes, higher contrast, link underlines and reduced motion. No automatic decorative animation.

## Competition extension

- Focus desk uses a deep forest surface to give one task clear visual priority.
  Its suggestion includes the reason, a user-selectable queue, a briefing action
  and a stage-appropriate next action.
- Four actionable workspace indicators lead to the relevant view: completion,
  overdue work, handoff essentials and deliverable links. Counts describe saved
  data; they do not claim productivity gains.
- The checklist distinguishes missing from present with text and icons. Templates
  append rather than replace user context; placeholder text does not pass checks.
- Board and list layouts share the same filters. List layout is the default
  below 768 pixels; deliverables use a compact two-column grid on small screens.
- Dragging has a visible grip and highlighted destination. Stage menus remain
  available for keyboard and touch interaction.
- Quick actions use a labelled native dialog and standard Tab/Enter navigation.
- Recovery is visible: undo in the header and toast, earlier context in the
  editor, import preview before mutation, and confirmation for replacement.

## Rationale and accessibility

[DESIGN_RATIONALE.md](DESIGN_RATIONALE.md) explains each component family, colour,
typographic role, image treatment, logo and icon, including the intended cognitive
benefit and limits. It is generated from the same source as the live
[Why this design? guide](https://relay-jhud172.vercel.app/design.html).

[ACCESSIBILITY.md](ACCESSIBILITY.md) documents the controls, implementation,
evidence and outstanding assistive-technology checks. Future visual or interaction
changes require a rationale entry and relevant rendered verification.
