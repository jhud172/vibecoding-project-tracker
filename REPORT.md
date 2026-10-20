# Relay — implementation report

Owner: James (`jhud172`). Built from the course's React, Vite and Tailwind starter.
Review date: 20 October 2026.

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
`useLocalStorage.js` persists data while surfacing failures rather than silently
claiming success. Native dialogs provide modal keyboard behaviour and restore
focus when closed. Fields have explicit label associations and hint descriptions.

Task IDs and creation dates remain stable. The original four stage IDs and the
specified Task/Anchor fields are retained. Context timestamps update when the
briefing or tool changes, rather than on unrelated edits. Calendar-day deadline
arithmetic avoids daylight-saving hour offsets. Urgency is communicated through
card tint, a date badge and text; completed tasks override urgency.

There is no database, authentication, AI provider API, shared backend or live
GitHub integration inside Relay. The separate course portal receives real GitHub
push events for milestone tracking.

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
- `public/presentation.html` now supplies seven slides, Back/Next controls, arrow-key
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

- Browser storage is not shared and can be cleared. JSON export and validated
  import provide manual portability, not automatic synchronisation.
- Demo identities do not represent real teammates or notifications.
- Context quality depends on what the user writes.
- Clipboard fallback and storage-error handling exist, but OS permission failure
  and storage-quota failure have not been induced in the browser checks above.
- No user study or performance benchmark is claimed.
- PITCH.md supplies the five-minute script and demo procedure. James's rehearsal
  and the on-stage demonstration remain human activities and are not claimed
  complete by software checks.

## Competition upgrade

The second iteration adds Focus desk, a selectable task queue with explained
deadline ordering; a four-part handoff presence checklist; non-destructive
briefing templates; and filtering for incomplete handoffs. The user can copy
the focused task, advance it and choose a different priority.

Recovery features include one-step undo, an 80-entry local activity history,
up to eight available earlier context versions in the editor, and versioned
backup export. Import supports original and version 2 Relay backups, rejects
invalid shapes and unsafe links, previews the contents, and offers either a
non-overwriting merge or confirmed replacement. Unknown imported properties
are discarded. Undo lasts until the next mutation or page reload.

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
