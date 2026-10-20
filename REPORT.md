# Relay — implementation report

Owner: James (`jhud172`). Built from the course's React, Vite and Tailwind starter.
Review date: 20 October 2026.

## Current roadmap increment

The complete 75-item goal remains active in ROADMAP.md. Current local checks pass: 45 unit tests, ESLint and a production build. Thirteen isolated Chromium/axe workflows cover migration, persistent recovery, drafts, stale edits, failed storage, denied clipboard access, invalid/reviewed imports, safe previews, templates, enlarged mobile layout and core accessibility scans. GitHub's Linux/Node 24 workflow also passes those checks: [verified run](https://github.com/jhud172/vibecoding-project-tracker/actions/runs/39418101856). The later sections retain baseline implementation history; ROADMAP.md records current feature and acceptance status.

The dedicated cloud database passes transaction-scoped outsider/viewer/editor/owner isolation checks and stale-version rejection with all fixtures rolled back. Supabase's security advisor reports zero findings after hardening. Real signup/email delivery, two-device account flows, collaborator UI checks, NVDA/VoiceOver evaluation, user studies and James's rehearsal remain unverified. See CLOUD.md for cloud setup and limits.

## Problem and outcome

AI-assisted work loses momentum when its decisions disappear into old chat
threads. Relay combines a four-stage Kanban board with curated context on each
task. The user can continue an individual task with Copy as Prompt Context or
resume the whole workspace with a deadline-ordered briefing.

The finish-line board provides the four specified deliverable slots above the
tasks. James is the real owner; the other two assignees are labelled demo
identities rather than invented collaborators.

## Implementation

The existing React entry point and Tailwind stylesheet remain in place.
`App.jsx` implements the interface; `model.js` contains the task schema,
validation, calendar dates, sample tasks and Markdown formatting.
`workspace.js` persists the complete workspace as one transaction with persistent recovery; `useLocalStorage.js` retains accessibility preferences separately. Native dialogs provide modal keyboard behaviour and restore
focus when closed. Fields have explicit label associations and hint descriptions.

Task IDs and creation dates remain stable. The original four stage IDs and the
specified Task/Anchor fields are retained. Context timestamps update when the
briefing or tool changes, rather than on unrelated edits. Calendar-day deadline
arithmetic avoids daylight-saving hour offsets. Urgency is communicated through
card tint, a date badge and text; completed tasks override urgency.

Optional Supabase accounts, explicitly synchronised project copies, comments and viewer/editor permissions now supplement local work. The dedicated Relay project uses the organization's Free plan in London. Cloud updates require the expected version; stale saves are rejected. No AI provider is connected. GitHub milestone tracking remains in the separate course portal.

## Distinctive feature

Resume work builds a previewable Markdown briefing containing only unfinished
tasks, ordered by deadline, with owners, curated context and deliverable links.
This directly addresses returning to a project after an interruption. It uses
saved facts rather than generating speculative summaries.

## Verification record

Twelve automated Node tests cover:

- The four-stage seed dataset and locked schema.
- Valid calendar dates and daylight-saving boundaries.
- Overdue, today, tomorrow, upcoming, safe and completed deadline states.
- Stable identity and creation dates while saving.
- Context timestamp changes and non-context edits.
- Input validation and empty/corrupt data shapes.
- HTTP(S) URL validation and exact anchor slots.
- Full prompt output and unfinished-task briefing order.

Browser checks on the running application:

- Created a temporary bug with description, owner, stage, deadline and context.
- Refreshed and reopened it; data persisted.
- Edited the task, changed its owner and stage, and checked the visible result.
- Read back the copied clipboard text and verified title, owner, deadline and context.
- Marked an overdue task Done and verified its label became Completed.
- Filtered by a task title; cleared the filter.
- Confirmed task deletion and verified the card remained absent after refresh.
- Rejected a `javascript:` deliverable URL; saved a valid repository link and
  verified it persisted after refresh.
- Copied Resume work; verified its unfinished count, deadline order, deliverable
  link and exclusion of the completed task.
- Closed the briefing with Escape and observed focus return to its launch button.
- Deleted all four disposable seed tasks on a separate local origin and refreshed:
  zero cards remained and all four empty-state columns were shown.
- Visually inspected the desktop board and a 390-pixel iframe viewport, including
  the narrow-screen horizontally scrolling board.

During these checks, explicit field-label associations and the date input event
handler were corrected. Subsequent date saving, editing and copying were verified.

Original-release local checks passed: all 12 tests, a Vite 7.3.7 production build, and zero
production dependency vulnerabilities (`npm audit --omit=dev`). The bundle was
185.11 kB JavaScript (59.65 kB gzip) and 19.86 kB CSS (4.78 kB gzip). Browser
console inspection reported no errors during the checked flows.

The live course portal recognised milestones 1 through 12 after the pushed
implementation commit. Deployment verification is recorded separately below.

## Deployment and presentation

- Live URL: https://relay-jhud172.vercel.app
- Hosting: Vercel, retained in James's existing Hobby account as `relay-jhud172`.
- Source: `jhud172/vibecoding-project-tracker`, connected through Vercel's Git integration.
- The initial hosted app rendered the complete board and successfully copied
  a task's prompt over HTTPS; clipboard contents were read back to verify it.
- `presentation.html` supplies eight slides, Back/Next controls, arrow-key
  navigation, a live-demo link and an all-slides print layout. Browser checks
  traversed the slides and verified navigation stops at the final slide.
- Pitch preparation is complete; the rehearsal record remains explicitly open.

## Dependency scope

Compatible dependency fixes were applied. Vite was moved to version 7 and its
React plugin to version 5, retaining React 18 and Tailwind 3. Remaining full-audit
findings are in the Tailwind 3 build tool chain (braces and selector parsing and
their dependants). Resolving those through the suggested Tailwind 4 upgrade
would require a separate styling-tool migration. Do not expose the development
server publicly or build untrusted source/configuration.

## Limitations and honest completion gates

- Browser storage can be cleared. Complete backup/import and optional explicit cloud sync provide portability. Live simultaneous editing and automatic background sync are not implemented.
- Demo identities do not represent real teammates or notifications.
- Context quality depends on what the user writes.
- Browser regression tests inject rejected clipboard access, quota failure, damaged storage, stale concurrent edits and invalid imports. This does not replace testing every operating-system permission or storage implementation.
- No user study or performance benchmark is claimed.
- PITCH.md supplies the five-minute script and demo procedure. James's rehearsal
  and the on-stage demonstration remain human activities and are not claimed
  complete by software checks.

## Competition upgrade

The second iteration adds Focus desk, a selectable task queue with explained
deadline ordering; a four-part handoff presence checklist; non-destructive
briefing templates; and filtering for incomplete handoffs. The user can copy
the focused task, advance it and choose a different priority.

Recovery includes persistent undo/redo within a twelve-version per-stack budget, up to fifty deleted tasks per project, an eighty-entry activity history, editor drafts and eight available earlier context versions. Complete version 3 bundles preserve projects, templates, metadata and recovery entries; original/version 2 imports remain supported. Import conflicts are inspectable and keep current content by default. Accessibility preferences are opt-in. A single atomic storage value prevents partly saved related collections, and failed writes preserve the previous complete value.

The interface adds actionable workspace counts, board/list layouts, drag grips
with stage-menu alternatives, a command palette, shortcuts and a compact mobile
layout. The presentation and five-minute script now demonstrate these features.

Eight additional automated tests bring the suite to 20. They cover checklist
placeholders and populated headings, focus ordering, activity snapshots,
legacy/versioned backup roundtrips, invalid imports, canonical field selection
and preservation of existing tasks/links during merge.

Browser checks verified Focus desk completion and undo; command-palette search;
task persistence; additive templates; live checklist changes; context editing,
earlier-version restoration and clipboard output; the activity timeline; invalid
file rejection; valid import preview; merge and undo; workspace replacement and
undo; matching board/list filters; native card dragging; and deletion recovery.
The 390-pixel layout was inspected using the real app in a narrow iframe.
Empty-workspace Focus desk and the `/` search shortcut were also checked.
Browser console inspection reported no errors in the tested desktop and empty
workspace flows. The upgraded production build passed with no new dependencies.

No external AI provider is involved in the checklist or ranking. Neither
heuristic claims correctness, and no competition result or user-study benefit
is asserted.

## Explained design and accessibility upgrade

The next iteration responds to James’s request for an explicit reason behind
each visual/UX choice and multiple access features. The published /design.html
guide covers layout, hierarchy, typography, colours, components, imagery, the
Relay logo and 18 icon families. Its shared content source also generates
DESIGN_RATIONALE.md. W3C/WAI guidance and Nielsen’s usability heuristics are
linked to the relevant decisions. Aesthetic choices and intended cognitive
benefits are distinguished from measured results; no user study is invented.

The labelled Accessibility panel offers light/dark/device appearance; 100–200%
text sizing with reflow; blue/amber, teal/rose and monochrome alternatives;
higher contrast; plain headings; link underlines; reduced motion; and optional
single-character shortcuts, off by default. Native keyboard controls, skip
links, heading structure, focus restoration and status announcements remain
available independently of speech. Shared button targets aim for 44px minimum
at standard text size, with stronger form-control boundaries.

Browser SpeechSynthesis provides explicit task/workspace/guide/slide narration,
voice and rate selection, pause/resume/stop, bounded utterances and a clear
12,000-character limit. Errors and a startup timeout offer a recovery message.
Late callbacks cannot restart cancelled speech. Controls remain available in
dialogs and a reading dock; hiding the page or changing slides stops playback.
Online voices are labelled; no microphone or external AI API was added.

The workspace, design guide and eight-slide presentation share preference
storage. Presentation is now a Vite HTML entry at presentation.html, preserving
its public URL while bundling the shared preference controls. The pitch script
includes the accessibility/design explanation within the five-minute outline.

All 28 automated tests pass. Eight access tests cover defined text contrast
pairs across 16 theme/palette/contrast combinations, strong boundary/focus
contrast, preference validation and speech lifecycle/cancellation/error handling.
The production build passes for all three HTML entries. No runtime dependency
was added.

Rendered checks covered light/dark and alternative palettes; preference
persistence/reset; plain headings, link underlines and motion preferences;
200% text at narrow mobile width; reflow into the task list; native dialog
scrolling and focus return; disabled/enabled shortcuts and Ctrl/Command K;
task editor access; and the published guide’s alt text and decorative SVG
semantics. A real device engine emitted the speech-start event and the UI
exercised pause, resume and stop. Eight-slide navigation and its access controls
were checked. A three-frame 390px harness visually inspected the actual workspace,
guide and pitch at 200%, rather than a static mockup. The tested main/pitch flows
had no console errors; a development-only duplicate-root warning after hot updates
was addressed with explicit HMR cleanup in the guide and pitch entry modules.

ACCESSIBILITY.md records the test scope and limits. These checks do not establish
full WCAG conformance, an NVDA/VoiceOver or braille audit, device audio quality,
or universal colour-vision support. James’s timed rehearsal and the on-stage
demonstration remain personal activities.
