# Relay - design system

Status: ready for implementation. Owner: James. 20 October 2026.

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

Tokens live in tailwind.config.js. Urgency includes text and an icon, not colour alone. Done is neutral regardless of deadline.

## Typography

| Role | Font | Rationale |
|---|---|---|
| Heading / wordmark | Georgia, serif | Editorial warmth with a reliable system font |
| Body / controls | System sans-serif | Familiar and crisp |
| Section labels / IDs | System monospace | Subtle structure for metadata |

Page heading: 36-44 px. Section heading: 18 px. Task title: 15 px semibold. Body: 14 px. Metadata: 12 px.

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
| Delete confirmation | Delete this task? This removes its saved context too. |
| Handoff toast | Handed off to {name}. |
| Persistence | Saved in this browser |
| Extra feature | Resume work |

## Identity

- Product: Relay
- Team: James's solo studio
- Tagline: Keep the work moving. Keep the context.
- Wordmark: lowercase serif lettering beside a Lucide workflow icon.
- One light theme. No theme picker or decorative animation.
