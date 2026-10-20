# Relay accessibility and inclusive design

Implemented for James’s request that visual and interaction choices be justified,
with multiple ways to see, navigate and listen. Use the labelled Accessibility
button in the app, guide or presentation. Choices persist in this browser under
`relay.accessibility:v1`; complete workspace backups can optionally include validated preferences.
Other open tabs pick up preference changes on reload.

## Features and reasons

| Feature | Why it exists |
|---|---|
| Light / dark / device appearance | Let users choose luminance; device mode responds to operating-system changes. |
| 100, 125, 150, 175 and 200% text | Let users enlarge text and controls without disabling browser zoom. |
| Adaptive large-text layout | At 150%+, stack grids, hide the sidebar, remove truncation and use a task list. |
| Blue/amber, teal/rose, monochrome | Offer alternatives to problematic hue pairs; do not simulate or claim to correct colour vision. |
| Explicit type/deadline labels | Preserve meaning without distinguishing colours. |
| Higher contrast | Strong neutral text/boundaries; takes precedence over palette. |
| Plain headings / underlined links | Offer familiar type and an extra non-colour link cue. |
| Reduced motion | Honour OS preference or an additional user choice. |
| Read aloud | Read a task, workspace briefing, design guide or current presentation slide on request. |
| Voice and rate selection | Let users choose a device/browser voice and 0.75–1.5× rate. |
| Pause / resume / stop | Keep speech controllable in a reading dock and inside dialogs. No autoplay. |
| Keyboard and screen-reader structure | Skip link, main landmark, headings, field labels, native controls, focus outlines and live feedback. |
| Drag alternative | Every stage change is available through a labelled select. |
| Optional single-character shortcuts | Disabled by default; avoids collisions with speech input and assistive technology. Ctrl/Command K remains available. |
| 2.75rem button targets | Aim for 44px at standard size; targets scale with text. Inline prose links remain conventional text links. |
| Explainable visual system | DESIGN_RATIONALE.md and /design.html record reasons for layout, fonts, colours, imagery, logo and icon families. |

## Implementation

Semantic palette values are resolved by `resolvePalette` in src/accessibility.js.
Tailwind utilities read RGB CSS variables, preserving opacity modifiers. Themes
change actual surfaces/text and native `color-scheme`, with matching theme-color
metadata. They do not use page-wide colour filters. Form boundaries use the
strong-line token. Forced-colours CSS preserves system focus and control edges.
System fonts avoid external font requests.

Text uses relative rem sizes. Small labels are at least 0.75rem at standard size.
At narrow widths and 200%, dialog headers stack and padding adapts. The access
panel stays scrollable so preferences can always be reduced/reset. Reset affects
access preferences only. Corrupt saved preferences produce a warning and are
left untouched until an explicit reset; ordinary storage failures are reported.

Speech uses SpeechSynthesis/SpeechSynthesisUtterance, not an external AI API.
Device voices can load asynchronously. Some browser voices are network services,
so the picker labels device/online voices. Text is split into bounded utterances,
and the first 12,000 characters are read per request with an explicit truncation
notice. An engine start event controls the Reading state; a startup timeout or
engine error gives recovery guidance. Starting a replacement, pressing Stop,
leaving the visible tab, unmounting, or changing slides cancels the current queue.
Late callbacks cannot restart an old reading. Audio is never requested on load.

The text-to-speech feature supplements assistive technology; screen readers have
independent navigation, form interaction and braille support that a speech button
does not provide. Relay does not claim that a font or palette treats a condition.

## Verification performed

- Automated tests: all defined normal-text foreground/background pairs reach
  4.5:1 across 16 theme/palette/contrast combinations. Focus and strong control
  boundaries reach 3:1 against the tested adjacent surfaces.
- Regression tests validate preference bounds, speech chunking, rate/voice
  propagation, engine start/pause/resume/end/error lifecycle, cancellation of
  stale callbacks, truncation notice and meaningful task fields.
- Browser: dark/device appearance, explicit light/dark, blue/amber, teal/rose,
  monochrome and contrast preferences; plain headings, link underlining and
  reduced-motion attributes; reload persistence and reset.
- Browser: 200% text at a 390px viewport, no horizontal page overflow in the
  tested board/list state, automatically selected task list, and scrollable
  settings with equal content/client widths after the mobile fixes.
- Browser: real device speech engine produced a start callback, with visible
  pause/resume/stop controls. An audible listening study is not claimed.
- Browser: Escape closed the dialog and restored focus; disabled/enabled
  single-character shortcut behavior and Ctrl/Command K were checked. Focus
  outline measured 3px in the tested keyboard state.

Final build and deployment verification are recorded in REPORT.md.

## Limits and next evaluation

These checks are evidence for specific behavior, not a claim of complete WCAG
conformance. No full audit with NVDA, VoiceOver, braille, OS forced colours,
all browser zoom settings or users with disabilities has been completed.
Actual speech output depends on installed voices, browser/OS support and output
hardware. Pause/resume support can vary by engine. Export/restore preferences is
not part of workspace backups. Desktop board layout intentionally has its own
horizontal scroll region; list view and large-text mode provide alternatives.

For evaluation, use the main tasks with keyboard only; repeat with NVDA/VoiceOver,
200% browser zoom, forced colours, OS reduced motion and long task text. Record
the device, browser, steps and outcome for any further accessibility claim.

## Sources

See DESIGN_RATIONALE.md for linked W3C WCAG 2.2, WAI, MDN speech synthesis and
Nielsen Norman Group guidance, with the specific decision each source supports.
