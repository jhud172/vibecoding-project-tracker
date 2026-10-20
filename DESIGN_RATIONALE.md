# Relay: design rationale

Published at https://relay-jhud172.vercel.app/design.html. The app and this document share src/designRationale.js as their content source. Regenerate with npm run docs:design.

## Principles

### Recognition before recall

Keep the owner, stage, deadline and next action visible so people can inspect the work instead of remembering hidden state. This is a design intention, not a measured memory improvement.

### One clear place to continue

Focus desk presents one suggested task, a reason and an editable queue. The stronger surface establishes visual hierarchy while preserving the user’s choice.

### More than one way to perceive and act

Use text with colour, labels with icons, stage menus with drag grips, and keyboard controls with pointer controls. A palette picker alone cannot make an inaccessible interface accessible.

### Control and a way back

No automatic speech. Themes and reading preferences are reversible. Undo, context history and import previews make consequential changes inspectable.

## An open journal: 3D and purposeful motion

### Original animated journal

A book makes the saved-context concept tangible: the board is an overview, while opening the book leads to Focus desk. The hardcover, linked-square emblem, foil frame, paper, ribbon and page animation were modelled in Blender for Relay. The model is decorative; task information and controls remain semantic HTML.

### Chapter composition and subtle orbits

The framed hero gives the headline and next action a distinct starting point. Fine orbit lines, a faint grid, layered paper edges and a contact shadow add depth without adding information or moving task controls. Serif type carries the journal identity; the existing plain-heading preference remains available.

### Opening, page turns and pointer response

The cover and four staggered page hinges use an exported Blender animation. Pointer movement gives a small bounded change of perspective; leaving returns to rest. Opening Focus desk plays toward the open-book pose, connecting movement to the actual change of work mode. No task depends on hovering or interacting with a canvas.

### Lift, press and entrance timing

Actionable cards lift on pointer hover, buttons compress on press, and dialogs open with a short perspective entrance. These responses acknowledge interaction and establish hierarchy. Brief card entrances are bounded to the first few cards, without an endless animation over a large board.

### Page transitions with immediate navigation fallback

Supported browsers use a short perspective transition between board and Focus desk. Other browsers change views directly. Repeated navigation skips the previous transition so animation does not become a queue that delays the user's work.

### Motion controls and resource limits

OS or in-app reduced motion uses a small Blender-rendered still and skips downloading the renderer and animated model. Save-data and forced-colour modes also keep the static view. A labelled pause button stops 3D motion. Enlarged text separates artwork from naturally sized captions and controls, preventing overlap. The scene draws only while responding, stops when hidden, caps pixel density and batches static meshes by material. This targets smoothness while limiting ongoing GPU work; frame rate still depends on the device.

## Recovery and inspectable handoffs

### Complete backup and conflict review

Export names what it includes and makes accessibility preferences optional. Import separates current and incoming text, defaults to keeping current content and labels the scope of replacement. A prior workspace version provides a recovery route after an import.

### Optional cloud controls and explicit sync

Account, sharing and comments load in a separate panel so everyday local work is not gated by sign-in. A visible preview notice names the unverified email and real-account acceptance checks. Cloud preview precedes loading, and upload names the data it sends. Visible versions and stale-save rejection make conflicts inspectable. Account IDs enable deliberate sharing without searching or exposing an email directory.

### Recoverable error screen

A render failure presents a raw-download and reload action, preserving saved work. The message describes what happened without displaying implementation stack traces or inventing a successful recovery.

### Explicit first-use choice

An empty workspace is offered alongside labelled samples. The choice establishes what is the user’s work and what is an example; a short introduction explains the task-context-handoff sequence.

### Recovery beside save status

A labelled header control keeps recovery discoverable. Deleted tasks and persistent undo/redo reduce the cost of accidental edits. Storage estimates and last backup-request dates describe observed browser state without promising that a download completed; unreadable storage is reported rather than displayed as zero usage. Raw recovery reads the latest saved workspace and drafts, preserves the protected original and labels a partial export when storage cannot be read. Normal backup and raw recovery explain their different import purposes.

### Draft status and deliberate recovery

A saved-time message acknowledges unfinished input. Recovered drafts are offered explicitly and never silently replace the editor. Stale-task checks preserve the draft when another tab has saved newer work.

### Section editor alongside free text

Named decisions, progress, next-step, verification and risk fields provide recognition cues. Editing a section preserves unknown headings and existing prose. The full context remains visible so the structure is optional and inspectable.

### Preview before sharing

Markdown and handoff previews let people check the actual text before copying. Concise export foregrounds ownership, next action and verification; detailed export retains the complete task. Missing sections are stated explicitly rather than invented.

### Versions and passage recovery

Text labels identify added and removed lines, with coloured edges as a secondary cue. A paragraph can be appended to the draft without replacing unrelated context. The comparison states that it checks line presence rather than promising a full edit diff.

### Templates and session wrap-up

Templates sit in an optional disclosure to keep the everyday editor manageable. A wrap-up view prompts progress, next action, verification and risks before the session is saved. Presence checks describe measurable text or populated sections, never quality or correctness.

## Layout, navigation & visual hierarchy

### Warm page, distinct cards and fine boundaries

The page, content cards and grouped areas use separate surface tokens. Borders separate resting content; hover adds stronger optional depth. Warm paper is a brand preference; no claim that it reduces clinical eye strain is made.

### Whitespace and alignment

Repeated spacing groups a title with its description and separates unrelated controls. Left alignment creates a predictable reading start. Space is functional grouping, rather than decoration that displaces the work.

### Sidebar on wide screens; wrapping header on small screens

Stable navigation stays visible where there is room. On narrow screens or enlarged text it gives way to the header and labelled view buttons so navigation does not compete with task content.

### Breadcrumb and browser-save status

The workspace name establishes location. The save label explains that data is local, rather than implying account sync. A storage failure changes the wording and presents a warning.

### Four actionable counts

Completion, overdue work, handoff essentials and linked deliverables answer specific workspace questions. Each opens a relevant view. They are counts of saved data, not invented scores or productivity claims.

### One primary action style

A filled button distinguishes the main action from bordered secondary actions. The wording names its outcome. The same hierarchy is preserved in dark and alternate palettes.

### Focus desk and its faint ring

A deep surface isolates the chosen task from the queue. The faint static ring echoes a target and gives depth; it carries no data, is hidden from assistive technology and can disappear in forced-colour modes without losing meaning.

### Explained priority and selectable queue

Deadlines order unfinished tasks; active work breaks ties. Visible explanations let people check the recommendation and select another task. The system does not claim AI judgment or know a task’s real business value.

### Separate deliverable group

Four labelled slots make Presentation, Demo, Report and Documentation discoverable. Open and edit are separate actions so inspecting a submission does not accidentally change its link.

### Board and list

Columns show workflow stage spatially. The ordered list helps sequential reading and narrow screens. At 150% text size and above, the list is used automatically so enlarged content does not require a wide board.

### Eight-slide presentation

One main argument per slide separates the problem, workflow, briefing, focus, recovery, accessibility and scope. Explicit Back/Next controls supplement arrow-key navigation. Read-this-slide and the same appearance preferences make the pitch adaptable; a design-guide link supplies the detailed rationale.

## Typography, colour & readable content

### Georgia headings

A system serif gives the product an editorial identity and separates headings from controls without another font download. This is an aesthetic choice; the plain-heading option lets users remove it.

### System sans-serif controls

Familiar device fonts keep controls consistent with the operating system and avoid a font-loading delay. Relative sizes scale with user preferences and browser zoom.

### Monospace metadata and prompt preview

A different type style separates counts and structured text from prose. Task and owner/date metadata normally uses at least 0.75rem, while the tiny decorative journal edition is not task information. Font size is a layout choice that still needs rendered and human evaluation.

### Heading size, weight and line length

A single page heading, section headings and task titles provide an outline for scanning and screen-reader navigation. Paragraphs use comfortable line spacing; long task titles wrap instead of covering actions.

### Forest green and pale accent

Green is Relay’s identity colour, used for active navigation and useful actions. It is not justified as a universal calming or motivational stimulus. Foreground/background contrast is checked as a pair, rather than judging a colour alone.

### Task type and deadline colours

A feature has a Feature label and a bug has a Bug label. Deadlines say overdue, due today or completed. The tint is an additional cue, so colour-vision differences do not remove the underlying information.

### Done overrides urgency

A completed task is labelled Completed even if its old deadline passed. This avoids a conflicting warning on work that no longer needs action.

### Light, dark and device appearance

People choose the luminance they prefer. Device mode follows the operating system. Dark mode changes real semantic foregrounds, surfaces and native controls, rather than applying an inversion filter to the page.

### Colour-vision alternatives

Blue/amber reduces reliance on red/green separation; teal/rose provides another option for blue/yellow differences; monochrome removes hue distinctions. These are selectable alternatives, not medical corrections, simulations or guarantees for every person.

### Higher contrast and underlined links

Higher contrast replaces subtle accents with strong neutral boundaries and text. Optional underlining gives links a shape cue. Browser forced colours remain supported.

## Interaction, access & feedback

### Visible Accessibility button

A text label and human figure icon make preferences available in the header at every width, with a second entry in the footer and command menu. Finding accessibility does not require recognising an unlabeled icon.

### 100–200% text sizing

Relative text and spacing scale together. At 150% and above, grids stack, the sidebar hides and the list replaces the board. The settings dialog remains scrollable so the user can reduce the size again.

### Text-to-speech with explicit playback

Read a task’s title, owner, stage, due date, description and saved context, or the whole workspace briefing. Voice, speed, pause, resume and stop are available. Nothing starts automatically. Automatic voice selection uses local device voices; an online voice or potentially online browser default requires a deliberate choice. If no local voice is ready, guidance explains how to choose. Long readings are bounded and clearly announced. Device/browser voices and output are external dependencies.

### Screen-reader structure

The app has a skip link, main landmark, named sections, real headings, labelled inputs, native buttons and polite status feedback. Read-aloud is a supplement: it does not replace a screen reader’s navigation, braille or form interaction.

### Focus and keyboard

Visible focus outlines show location. Native dialogs contain keyboard focus, accept Escape and return focus to the opener. Single-character shortcuts are off by default and can be enabled; Ctrl/Command K remains available.

### Pointer targets and movement alternatives

Shared buttons and ordinary form controls aim for a 2.75rem target (44px at standard size). Compact controls such as the 32px journal pause button are exceptions; this is not a universal 44px claim. Dragging uses a grip and destination highlight, but every stage change also has a labelled select menu.

### Motion preferences

Transitions communicate hover or state change. Reduced motion from either the operating system or the panel removes these transitions. There is no blinking or automatically scrolling content.

### Forms, errors and context templates

Visible labels remain after typing; hints and validation messages are associated with the affected fields. Invalid fields are marked and focused so a keyboard or screen-reader user can correct the problem. Dialogs return to their trigger, or the workspace when that task has been removed; clearing filters returns to search. Empty-list text distinguishes a new workspace from a search with no results. Context templates append rather than overwrite, and the checklist distinguishes present from missing using symbols and accessible text.

### Undo and context history

Persistent Undo and Redo support recovery across reloads with up to twelve versions per stack within a storage budget. Earlier context is loaded into a draft for review before saving. Recovery versions, deleted tasks and per-task context have separate, explicitly bounded histories.

### Toasts, copy fallback and import preview

A polite message confirms an action. The stable header keeps Undo available after a toast disappears. Clipboard failure offers selectable text. Backup import validates and previews data before a merge or confirmed replacement.

### Owner initials and demo labels

Initials make owners easier to locate beside their full names. They are not photographs, identity verification or real collaborator presence. Demo Designer and Demo Reviewer are explicitly fictional.

## Logo, images and icons

The Relay logo uses connected square nodes to represent continuing work and context between stages. The adjacent wordmark names the product; its dot is decorative. The vector favicon preserves the silhouette at small and enlarged sizes. The guide logo has a descriptive alternative, while repeated interface symbols reinforce labelled controls.

Relay includes an original Blender journal, its animated GLB and a still WebP rendered from the same native scene. The cover, four page hinges, foil, paper, ribbon and emblem are original authored geometry/materials; there are no stock photographs, downloaded models/textures or AI-generated raster illustrations. The hero grid/orbits/contact shadow, layered paper edges and static Focus ring are decorative. Semantic HTML carries every task fact and navigation action.

### Workflow / connected squares

Used for: Logo, local workspace identity and handoff. Two connected nodes represent work continuing between stages. The favicon uses the same shape at small sizes. The adjacent Relay name or link label supplies the meaning.

### Layout grid / list

Used for: Board and list selectors. The shapes suggest spatial or sequential layouts; accessible names and selected states remove the need to interpret the shapes alone.

### Target

Used for: Focus desk. Suggests a chosen priority. The accompanying text says Focus desk; it does not imply measured concentration.

### Folder, flag, presentation screen, code, file and book

Used for: Deliverables and their four types. Familiar document metaphors help distinguish destinations. Presentation, Demo, Report and Documentation remain fully written.

### Plus

Used for: Create task / append template. A conventional addition cue paired with text or a specific accessible name. It does not hide a destructive action.

### Bug / check marks / circle

Used for: Task type, completed work and checklist state. Shape reinforces a written state. Missing/present checklist states also have screen-reader text.

### Clock

Used for: Deadlines and overdue count. Signals time next to a date or explicit urgency label, independent of tint.

### Clipboard

Used for: Copy briefing. Represents copying structured task context. A success message or manual-copy fallback confirms the result.

### Sparkles

Used for: Curated context and resume briefing. Draws attention to the distinctive briefing feature. Text explains its operation; it is not a claim that an AI model is running.

### Magnifier / command symbol

Used for: Search and quick actions. Suggests finding and keyboard access. Labels and the shortcut are provided.

### History / curved return arrow

Used for: Activity and undo. Separate past-event review from reversing the most recent change, with different written labels.

### Link / outward arrow

Used for: Deliverable links and external destinations. Indicates a URL or opening a destination. External guide links explicitly announce a new tab.

### Arrow right

Used for: Continue, save, next workflow action. Supports the action’s direction. The verb still specifies exactly what will happen.

### Grip dots / ellipsis

Used for: Dragging and task edit. Grip dots make a drag handle discoverable; the edit control has a task-specific accessible name. Stage menus and task-title buttons remain alternatives.

### Sliders / human accessibility figure

Used for: Workspace settings / access preferences. Different icons separate data settings from reading preferences, each with an explicit label.

### Speaker / headphones / play / pause / square

Used for: Read aloud and playback. Standard audio metaphors accompany written controls and status. Speech is opt-in and can be stopped.

### Download / upload

Used for: Backup export / import. Indicates direction of data movement. Labels and preview clarify the contents and effect.

### Trash / cross

Used for: Delete task / close or dismiss. Trash is tied to a deletion confirmation; cross closes the named dialog or notification. They are never the sole programmatic name.

## Complete implemented-choice register

The register covers implemented interface/component families and the asset/icon inventory. Guidance supports principles; exact timings, spacing, colour/material choices and aesthetic details remain design judgments unless a specific observation is recorded. Source coverage is not proof of psychological benefit or full accessibility. The live guide provides search, expandable entries and individual narration.

### Resume Capsules: team notes, stopping points, evidence and taking off (capsules)

Area: Core workflow.

**User need:** Return to a project or change assistants without losing the team's decisions, evidence and next action. New users need to understand the purpose before encountering a task board.

**Implemented choice:** Capsules are the landing area and first navigation item. A three-step notes/sections/review editor keeps original text separate, offers explicit heading extraction into empty sections, optional named contributors and task links, saved drafts, immutable snapshots and continuation drafts. Numbered steps stack at narrow/enlarged sizes. Search, example draft, written empty states and an expandable introduction explain the journey.

**Reason / intended benefit:** A sequence reduces the number of simultaneous decisions; Goal and Next step make the starting point explicit. Preserved raw notes let people check the curation. Immutable snapshots retain earlier reasoning. Labelled examples demonstrate the flow without inventing teammates or recorded checks. This is intended usability value, not a measured productivity benefit.

**Basis and psychological claim limits:** Progressive disclosure, recognition and user control inform the design. The three steps, required fields, 40-capsule limit, text limits and 450 KB record bound are engineering/design choices. No worldwide uniqueness or measured reduction in errors is claimed.

**Accessibility:** Shared semantic fields/dialogs, numbered written steps, current-step state, heading focus after navigation, focusable error feedback, keyboard controls, readable wrapping, shared themes/text/motion and optional narration. User-reported status labels convey evidence without relying on colour. Per-reading speech remains limited to 12,000 characters, while the complete handoff is selectable/downloadable.

**Trade-offs and limits:** Capture still requires user input. Notes files are local text only; heading extraction does not interpret meaning. Reported results are never executed or independently verified. Freshness compares entered revision strings from the same repository, not code. Matching revisions do not prove validity. Original notes are excluded from copied Markdown unless selected, but full capsule JSON, backups and explicit cloud uploads include them. Saved drafts require Save draft; dirty-close and reload warnings protect unsaved typing. Recovery/Undo and explicit import preview preserve user control.

**Verification and remaining checks:** Validation, extraction, immutable continuation, export/import, revision comparison and backup compatibility have targeted tests. Browser acceptance covers capture, saved drafts, errors, continuation, reviewed import/export, recovery and enlarged layouts. Test results are recorded in CAPSULE_PLAN.md and REPORT.md after actual execution; human benefit and screen-reader evaluation require people.

**Implementation:** `src/Capsules.jsx`, `src/capsules.js`, `src/workspace.js`, `src/transfer.js`, `src/App.jsx`, `src/Recovery.jsx`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Browser speech synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

### Name, connected-square logo, favicon and wordmark (identity)

Area: Identity.

**User need:** Identify the product and make its context-and-handoff purpose recognisable.

**Implemented choice:** Relay names a continuation of work. Connected square nodes repeat in the SVG favicon, interface Workflow icon and embossed journal emblem; the serif relay. wordmark supplies the name.

**Reason / intended benefit:** Repetition makes the same product easier to identify across the browser tab, workspace and guide. The dot, rounded corners and forest/ivory silhouette are aesthetic identity choices.

**Basis and psychological claim limits:** Design judgment informed by consistent identification; no tested brand-recognition or psychological effect is claimed.

**Accessibility:** The guide logo has a descriptive alternative. Repeated icons sit beside labels; the favicon and 3D emblem carry no task information.

**Trade-offs and limits:** The connector can lose detail at very small sizes. Text remains the primary identifier; no claim of a universally meaningful symbol is made.

**Verification and remaining checks:** The guide/presentation browser workflow checks the informative logo alternative. Visual recognition with users has not been measured.

**Implementation:** `public/relay.svg`, `src/App.jsx`, `src/design-main.jsx`, `assets/source/create_journal.py`.

**Guidance:** [Consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [Image alternatives](https://www.w3.org/WAI/tutorials/images/).

### Workspace navigation, header, hierarchy and repeated entry points (layout)

Area: Layout.

**User need:** Know where work is saved and reach the board, focus, recovery and access controls without memorising their locations.

**Implemented choice:** Capsules are the initial main area and first navigation item, with the existing task board below and separate board/focus views. A wide-screen sidebar, wrapping header, one main heading, named sections, breadcrumb, visible save status and footer access/design links supply orientation. Main content is bounded at 1700px; the guide uses a narrower reading column.

**Reason / intended benefit:** Stable placement and headings provide recognition and orientation cues. Repeated access entries reduce the distance from common tasks to preferences. The width cap prevents the workspace spreading indefinitely.

**Basis and psychological claim limits:** Usability guidance plus layout judgment. Exact widths, margins and repeated entry placement have not been optimised in a user study.

**Accessibility:** Skip links and main landmarks bypass repeated navigation. The sidebar hides on narrow/enlarged layouts; labelled header controls remain.

**Trade-offs and limits:** Repeated actions occupy space. View/filter choices currently reset on reload; navigation is not a saved-view or deep-link feature.

**Verification and remaining checks:** Core axe/navigation checks, enlarged mobile tests and the 320px task workflow cover specific layouts. Full magnification/screen-reader evaluation remains open.

**Implementation:** `src/App.jsx`, `src/index.css`, `src/design-main.jsx`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).

### Spacing, surfaces, radii, borders and shadows (spacing)

Area: Visual system.

**User need:** Separate related information and actions without making every item equally prominent.

**Implemented choice:** Repeated rem spacing, 1px boundaries, stronger form borders, rounded control/card/panel families, and a 3px task-type stripe. Layered paper edges, restrained shadows and the hero frame add depth.

**Reason / intended benefit:** Proximity groups fields and metadata; boundaries separate groups; depth distinguishes foreground actions from the page. Rounded forms support the journal/studio identity.

**Basis and psychological claim limits:** Grouping and hierarchy are design intentions. The spacing scale, radius sizes and shadow values are author choices, not scientifically optimal numbers.

**Accessibility:** Labels and document order explain groups independently of shadows. High-contrast/forced-colour modes use boundaries, while enlarged text allows wrapping.

**Trade-offs and limits:** Borders and shadows add visual density. Transparent surfaces require checking the final rendered colour pair, not just an isolated token.

**Verification and remaining checks:** Palette-pair unit checks and scoped rendered axe/reflow checks support legibility. They do not cover every possible overlapping/translucent state.

**Implementation:** `src/index.css`, `src/ui.jsx`, `src/App.jsx`, `tailwind.config.js`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Text contrast](https://www.w3.org/TR/WCAG22/#contrast-minimum), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

### Fonts, size, weight, line length and microcopy (typography)

Area: Visual system.

**User need:** Distinguish headings, actionable controls and metadata while keeping task text readable.

**Implemented choice:** Georgia headings, device sans-serif controls, monospace metadata, mostly 0.75rem or larger task labels, flexible title sizing and bounded prose widths. Buttons name outcomes; the studio voice frames a concrete next step.

**Reason / intended benefit:** Type size/weight establish a scanning hierarchy. System fonts avoid an additional font download. Familiar action verbs clarify what a control does; the editorial voice supplies identity.

**Basis and psychological claim limits:** Hierarchy and wording judgment, not evidence that serifs improve comprehension, a particular line length suits everyone, or encouraging copy increases productivity.

**Accessibility:** Plain-heading mode removes the serif. Relative sizes scale with preferences/zoom. The tiny decorative journal edition is hidden from assistive technology and carries no essential information.

**Trade-offs and limits:** Uppercase/letter-spaced metadata can be harder to read for some people; it is limited to short labels. Device fonts differ, and human reading-comfort testing remains open.

**Verification and remaining checks:** Enlarged-text and text-spacing browser checks cover tested flows. No reading-speed, dyslexia-treatment or universal legibility claim is made.

**Implementation:** `src/index.css`, `src/App.jsx`, `src/Studio.jsx`, `src/Accessibility.jsx`.

**Guidance:** [Text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Text contrast](https://www.w3.org/TR/WCAG22/#contrast-minimum).

### Every semantic colour, theme and palette alternative (colour)

Area: Visual system.

**User need:** Identify action, hierarchy, task type and urgency across different viewing preferences.

**Implemented choice:** Page/card/subtle/tint surfaces; ink/muted text; line/strong-line boundaries; brand/accent and action/action-ink pairs; feature/bug and safe/warning/overdue/neutral states; dedicated focus text/surface pairs. Light, dark and device modes use complete palettes.

**Reason / intended benefit:** Semantic roles keep equivalent states consistent. Forest/ivory is brand identity; amber and rose support warning differentiation. Blue/amber, teal/rose, monochrome, higher contrast and underlining offer alternatives.

**Basis and psychological claim limits:** Contrast and non-colour guidance support the encoding. Specific hues are design choices, not proof that green calms, red motivates, or a palette corrects colour blindness.

**Accessibility:** Type names, dates, icons, selected states and errors remain textual. Higher contrast takes precedence; native form controls and theme-colour follow the active appearance.

**Trade-offs and limits:** Some users prefer other combinations. Palette-pair checks do not certify every rendered opacity, focus/hover combination or user's perception.

**Verification and remaining checks:** Unit checks evaluate declared text pairs at 4.5:1 and tested strong boundaries/focus at 3:1; browser checks cover selected rendered states. Human colour-vision evaluation remains unperformed.

**Implementation:** `src/accessibility.js`, `tailwind.config.js`, `src/Accessibility.jsx`, `src/App.jsx`, `tests/accessibility.test.js`.

**Guidance:** [Meaning beyond colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [Text contrast](https://www.w3.org/TR/WCAG22/#contrast-minimum).

### Chapter frame, grid, orbits, captions and contact shadow (hero)

Area: Motion and 3D.

**User need:** Introduce the saved-context idea and connect the workspace to its original journal identity.

**Implemented choice:** A framed hero separates headline/action from the original journal. A faint grid, elliptical orbits, static contact shadow, chapter caption and stacked-paper details add depth.

**Reason / intended benefit:** The frame establishes a starting hierarchy; the caption relates the book to continuation. Grid/orbit/shadow treatments are aesthetic scaffolding and do not encode task data.

**Basis and psychological claim limits:** Art direction and spatial-hierarchy judgment. These details have no claimed psychological or task-performance benefit.

**Accessibility:** Decorations do not intercept pointers or replace HTML information. Enlarged layouts separate artwork from captions/buttons; forced colours and reduced motion retain ordinary navigation.

**Trade-offs and limits:** Ornament consumes space and can distract. It is subdued, static or preference-controlled, and can disappear without removing information.

**Verification and remaining checks:** Motion/mobile workflows and the enlarged-caption bounding-box check cover the current composition. A human distraction study has not been performed.

**Implementation:** `src/Journal.jsx`, `src/index.css`, `src/App.jsx`.

**Guidance:** [Image alternatives](https://www.w3.org/WAI/tutorials/images/), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

### Original Blender book, materials, emblem and rendered poster (journal-asset)

Area: Motion and 3D.

**User need:** Give the context journal metaphor a distinctive, reproducible visual form.

**Implemented choice:** A forest-cloth hardcover, darker binding, champagne-foil frame/bands/wordmark, ivory paper, cut edges, forest ink, ochre ribbon, printed lines/folio and four curved turning sheets. A transparent WebP is rendered from the same native scene.

**Reason / intended benefit:** Cover/binding/paper make the object recognisable as a journal. Foil and rounded geometry are craft/style choices; the bookmark suggests returning to a place. The repeated emblem links it to Relay. Printed lines are decorative, never hidden real task content.

**Basis and psychological claim limits:** Original art direction. Gold is not claimed to increase trust, the ribbon does not track progress, and the paper text is not a real task preview.

**Accessibility:** GLB/canvas and poster are decorative; the poster has empty alternative text. Opening the focus chapter is a separate labelled HTML button. No user needs to interpret tiny 3D text.

**Trade-offs and limits:** The GLB and optional renderer cost bandwidth/GPU work. Editable .blend and the build script establish provenance; neither is a browser download. No stock model/texture or generated raster illustration is used.

**Verification and remaining checks:** The GLB unit test checks real cover/page animation channels, buffer independence and size; browser motion checks inspect rendering/fallback. Original sources are committed.

**Implementation:** `assets/source/create_journal.py`, `assets/source/relay-journal.blend`, `public/models/relay-journal.glb`, `public/models/relay-journal-poster.webp`, `src/Journal.jsx`.

**Guidance:** [Image alternatives](https://www.w3.org/WAI/tutorials/images/), [Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

### Camera, lighting, pointer tilt, animation and resource limits (journal-runtime)

Area: Motion and 3D.

**User need:** Reveal the book's depth while keeping ordinary task work responsive and controllable.

**Implemented choice:** An oblique perspective camera, warm key/cool fill and environment lighting expose cover/page forms. Bounded pointer tilt and damped seeking of the exported cover/four-page clip settle at an open or closed pose. DPR is capped at 1.25; rendering stops at rest/offscreen/hidden.

**Reason / intended benefit:** Lighting and camera make geometry readable; damping avoids abrupt pose jumps. Idle loading, static batching and disposal limit unnecessary rendering. Chapter navigation determines the open pose, connecting motion to a real view change.

**Basis and psychological claim limits:** Art/engineering judgment. Camera angle, exposure, damping and the pixel-ratio cap are compromises, not validated ideal values or a guaranteed frame rate.

**Accessibility:** Pause stops animated movement; OS/in-app reduced motion, save-data and forced-colour paths use the poster. Load failure keeps navigation and an explicit retry action.

**Trade-offs and limits:** The decorative 3D chunk is large and depends on WebGL. Lower DPR can look softer. Pause permits immediate pose updates, rather than promising a frozen view across navigation.

**Verification and remaining checks:** Motion tests cover real pixels/pose change, pause, idle scheduling, navigation, teardown and fallback. Performance varies by device; no universal 60fps claim is made.

**Implementation:** `src/journalScene.js`, `src/Journal.jsx`, `src/motion.js`, `MOTION.md`.

**Guidance:** [Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [Image alternatives](https://www.w3.org/WAI/tutorials/images/).

### Hover, press, entrance and page-transition timing (timing)

Area: Motion and 3D.

**User need:** Acknowledge input and changes of layer or work mode without making animation a required task.

**Implemented choice:** 160ms quick feedback and 340ms settling; 400ms bounded card entrances with 45/80ms early stagger; 300ms dialog and 200ms backdrop; 220ms outgoing and 420ms incoming chapter transitions. Hover lift/sheens are limited to fine pointers; presses compress briefly.

**Reason / intended benefit:** Short feedback connects an action to its response; layer/chapter movement supplies a spatial cue. Only early cards enter, avoiding a long stagger over a large board. Repeated navigation can skip an unfinished transition.

**Basis and psychological claim limits:** Motion-design judgment. Exact durations, easing curves, lift distances and perspective values have not been proved psychologically optimal.

**Accessibility:** OS/in-app reduced motion disables choreography. Keyboard focus is visible independently, and controls act without needing hover or a successful transition API.

**Trade-offs and limits:** Motion may distract or cause discomfort; the preference/fallback path is essential. Sheens and shadows are optional ornament and do not indicate hidden states.

**Verification and remaining checks:** Motion browser workflows verify reduced motion and ordinary chapter/direct navigation. Rapid-transition cancellation is implemented but has no isolated automated check here. No user comfort study or fixed timing-performance claim is made.

**Implementation:** `src/index.css`, `src/motion.js`, `src/ui.jsx`.

**Guidance:** [Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).

### Empty versus sample workspace and demo identities (welcome)

Area: Workspace.

**User need:** Start work without confusing example content or fictional people with real saved work/collaboration.

**Implemented choice:** Explicit empty/sample choices, a short create-context-copy introduction, Demo labels, James plus two named demo assignees, and confirmed sample restoration with a recoverable prior version.

**Reason / intended benefit:** The choice distinguishes exploration from ownership. Samples demonstrate all four stages without requiring setup; confirmation/recovery reduces the cost of replacement.

**Basis and psychological claim limits:** Control, recognition and error-recovery judgment; sample content is not evidence of adoption or real teammates.

**Accessibility:** Ordinary buttons and written explanations name the effect. An intentionally empty workspace remains empty after reload.

**Trade-offs and limits:** First use asks for a decision. Restoring samples replaces current task/link content; a backup and prior version remain important.

**Verification and remaining checks:** Empty/migration unit checks and demo-reset/reload/Undo browser checks cover the implemented paths. Real onboarding research is unperformed.

**Implementation:** `src/Recovery.jsx`, `src/App.jsx`, `src/model.js`, `src/workspace.js`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html).

### Four counters, progress bar and save indicator (metrics)

Area: Workspace.

**User need:** Inspect completion, urgent work, handoff gaps and submission readiness without recalculating the board.

**Implemented choice:** Work completed, needs attention, handoff essentials and deliverable counts open the corresponding view; a done/total bar duplicates the written count. The save indicator explicitly says this browser.

**Reason / intended benefit:** Small, actionable summaries shorten the route to relevant saved facts. Written totals make the bar inspectable and prevent a decorative productivity score.

**Basis and psychological claim limits:** Visible-status and recognition judgment; counts are data summaries, not scores of work quality or personal performance.

**Accessibility:** Buttons/links have text, and the progress ratio is written independently of bar width or hue. Save failures change the message.

**Trade-offs and limits:** Presence counts can appear reassuring without good context; wording states the checks' limited meaning. Completion counts do not estimate task effort.

**Verification and remaining checks:** Model/checklist tests and core board/focus browser checks verify defined calculations and navigation, not a productivity improvement.

**Implementation:** `src/Studio.jsx`, `src/App.jsx`, `src/competition.js`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Meaning beyond colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

### Kanban columns, cards, metadata, stage menus and drag grips (board)

Area: Tasks.

**User need:** See task state, owner, type and deadline, and change a task without losing its identity or context.

**Implemented choice:** Four fixed PRD stages, cards with title/brief/type stripe/date/demo/owner/check count, task-title/edit buttons, owner and stage selects, and a drag grip with destination highlight.

**Reason / intended benefit:** Spatial columns expose workflow state. Visible metadata supplies recognition cues; separate controls allow a direct change without opening the whole editor.

**Basis and psychological claim limits:** PRD workflow plus grouping/recognition judgment. A clickable card surface is a pointer convenience, not the keyboard interaction contract.

**Accessibility:** Title buttons and native selects provide keyboard/touch alternatives to dragging. Type and urgency have text and icons, not colour alone.

**Trade-offs and limits:** Four columns need horizontal room; the region is labelled and scrollable, while list view is the narrow/enlarged alternative. Counts do not measure context quality.

**Verification and remaining checks:** PRD handoff/stage persistence browser checks and model identity/date tests cover saved behaviour. Drag hardware and all assistive technologies are not fully audited.

**Implementation:** `src/App.jsx`, `src/model.js`, `src/competition.js`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Meaning beyond colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

### Deadline wording, urgency tints, timestamps and stable identities (dates)

Area: Tasks.

**User need:** Distinguish current urgency from historical metadata without false overdue warnings.

**Implemented choice:** Local calendar dates, explicit no-deadline/today/tomorrow/overdue/completed labels, warning for today/next two days, and neutral completed work. Context timestamps change only with context/tool edits; IDs/creation dates survive other edits.

**Reason / intended benefit:** Written labels state the actual timing rule. Separating context changes from ownership/stage changes keeps the briefing's age meaningful.

**Basis and psychological claim limits:** Product-rule and consistency judgment. A two-day warning window is a transparent chosen threshold, not a scientifically optimal urgency interval.

**Accessibility:** Date and state wording accompany tints. Date-only arithmetic avoids daylight-saving hour differences; displayed timestamps use the browser locale/time zone formatting policy.

**Trade-offs and limits:** Calendar-day urgency ignores task effort and working days. A saved timestamp does not prove the context is accurate or current.

**Verification and remaining checks:** Unit checks cover impossible dates, DST, urgency boundaries and timestamp/identity stability; PRD browser edits survive reload.

**Implementation:** `src/model.js`, `src/App.jsx`, `src/Studio.jsx`, `tests/model.test.js`.

**Guidance:** [Meaning beyond colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [Consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html).

### Search, filters, list order and empty states (find)

Area: Tasks.

**User need:** Find relevant work and understand whether a workspace is empty or a filter hides existing work.

**Implemented choice:** Search title/description/context, owner/type/readiness filters, visible Clear filters, a deadline-ordered list with done tasks following, and distinct empty-list wording. Matching is case-insensitive text containment.

**Reason / intended benefit:** Familiar criteria let people reduce the visible set. A list supports sequential reading; clearing returns to the search field so keyboard work can continue.

**Basis and psychological claim limits:** Recognition and control judgment; not a semantic search, saved filter or personalised ranking system.

**Accessibility:** Each input/select has a name. Narrow screens start with list view; 150%+ text forces list layout. Board scroll remains optional.

**Trade-offs and limits:** Filters are not saved/shared in URLs, and searching hidden context can reveal that a match exists without highlighting the passage. These are current limits, not completed features.

**Verification and remaining checks:** Large-text/list and clearing-focus browser checks cover the tested paths; search usefulness with users is not measured.

**Implementation:** `src/App.jsx`, `src/Studio.jsx`, `src/competition.js`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).

### Focus desk, suggested task, queue and progress action (focus)

Area: Workspace.

**User need:** Return to one concrete starting point while retaining the ability to choose different work.

**Implemented choice:** A deep-forest task surface, decorative target ring, stated recommendation reason, selectable unfinished queue, context preview/copy/refine actions and the next stage action.

**Reason / intended benefit:** The contrasting surface establishes hierarchy; explanation makes the deadline/stage ordering inspectable. Queue selection keeps the user in control instead of treating a recommendation as a command.

**Basis and psychological claim limits:** Attention-hierarchy and control intentions; there is no AI priority inference, measured focus improvement or knowledge of business value.

**Accessibility:** Queue controls expose selected state. Task details and actions remain text/HTML; the ring is decorative. Progress can be reversed through Undo.

**Trade-offs and limits:** A single suggested task may be the wrong priority. Date-first ordering is deterministic and deliberately limited.

**Verification and remaining checks:** Focus ordering unit cases, core axe checks and chapter-navigation browser workflows verify the defined behaviour; human attention benefits are untested.

**Implementation:** `src/Studio.jsx`, `src/competition.js`, `src/App.jsx`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Image alternatives](https://www.w3.org/WAI/tutorials/images/), [Meaning beyond colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).

### Task editor, field labels, validation, save/cancel and deletion (editor)

Area: Tasks.

**User need:** Create or revise work with clear field meanings and a safe route out of mistakes.

**Implemented choice:** A labelled dialog with task brief/type/stage/assignee/date/context/tool fields, primary Save, secondary Cancel, associated errors and an explicit delete confirmation leading to Recovery.

**Reason / intended benefit:** Labels remain visible after typing; field-specific messages and focus point to the correction. Save is the commitment boundary, while preview and history actions affect the draft first.

**Basis and psychological claim limits:** Error identification, control and hierarchy guidance plus form layout judgment.

**Accessibility:** Native controls, required-title semantics, aria-invalid/described errors, keyboard submission and labelled icon actions. Initial focus is the title; focus returns to its trigger or workspace after deletion.

**Trade-offs and limits:** The editor can be long. Grouping and optional tools reduce scanning, but do not replace testing with screen readers or prove every field's experience is equally usable.

**Verification and remaining checks:** Create/edit/delete, invalid-title/unsafe-link focus and stale-save browser checks cover concrete paths. Model tests reject invalid fields; a complete human form audit is open.

**Implementation:** `src/App.jsx`, `src/ui.jsx`, `src/model.js`.

**Guidance:** [Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).

### Draft autosave, saved-time status and stale-tab protection (drafts)

Area: Recovery.

**User need:** Keep unfinished thinking through refresh and avoid overwriting newer saved work.

**Implemented choice:** A 350ms draft delay with hide/unload flushing, per-editor draft keys, explicit Continue recovered draft, persistent saved-time wording, Web Locks/revision checks and rejected stale saves/deletes.

**Reason / intended benefit:** A short delay avoids a write on every keystroke while offering a recoverable draft. Explicit recovery prevents silently replacing current input. Rejection keeps both the latest saved task and the user's draft available for comparison.

**Basis and psychological claim limits:** Reliability/control judgment. 350ms is a chosen responsiveness/write compromise, not proof against every browser shutdown or simultaneous edit.

**Accessibility:** Recovery status is written, actions are labelled and failure explains the next step. Recovery changes the draft rather than auto-committing it.

**Trade-offs and limits:** A hard shutdown can beat a pending write. Blocked/full storage can prevent autosave; older browsers without Web Locks cannot guarantee simultaneous-write exclusion.

**Verification and remaining checks:** Draft reload/recovery and two-tab stale-save/delete browser checks pass; pure draft validation is tested. Broader browser coverage remains limited.

**Implementation:** `src/drafts.js`, `src/useDraft.js`, `src/useWorkspace.js`, `src/App.jsx`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html).

### Context coaching, named sections, templates and session wrap-up (briefing)

Area: Handoffs.

**User need:** Leave enough concrete information for the next session or teammate without forcing a fixed writing style.

**Implemented choice:** Free text plus optional Decisions/What works/Next step/Verify/Risks editing, seven additive templates, reusable custom templates and a session wrap-up. Four presence checks use stated text thresholds/section population.

**Reason / intended benefit:** Named prompts are recognition cues for information that is easy to omit. Appending preserves existing decisions; optional modes retain control over prose and structure.

**Basis and psychological claim limits:** Recognition and external-memory design intention. The 20/60-character checks and headings are transparent heuristics, not AI evaluation or proof of handoff quality.

**Accessibility:** Labels identify every section. Checkmarks/circles have written present/missing meaning; placeholders do not pass as complete content. Individual sections can be read aloud.

**Trade-offs and limits:** Templates can produce formulaic or stale text. Users must replace scaffolds and judge accuracy; meeting a threshold says nothing about correctness.

**Verification and remaining checks:** Section preservation, placeholder checks, all built-in/custom templates and wrap-up save/reload are covered by unit/browser checks. Real handoff success is unmeasured.

**Implementation:** `src/BriefingTools.jsx`, `src/briefing.js`, `src/Studio.jsx`, `src/competition.js`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Meaning beyond colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [Consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html).

### Safe Markdown, concise/detailed previews, Resume work and manual copy (preview-copy)

Area: Handoffs.

**User need:** Inspect exactly what will be shared and continue work even when clipboard permission fails.

**Implemented choice:** A safe text-rendered Markdown subset, concise owner/action/check export, complete task export, a deadline-ordered unfinished-workspace briefing, Read aloud and a selectable manual-copy fallback.

**Reason / intended benefit:** Preview makes the outbound content inspectable. Different detail levels suit short handoffs or full context transfer. A manual route avoids making clipboard permission a prerequisite.

**Basis and psychological claim limits:** Visibility, user-control and privacy judgment; no AI summary or inferred missing detail is supplied.

**Accessibility:** Previews wrap/scroll, have labels, and are ordinary text. Unsafe links/HTML are not executed. Missing sections are stated explicitly; copy failure offers a focused selectable textarea.

**Trade-offs and limits:** Copied text can include private context. Users choose where to paste it; there is no automatic secret detector, external message or upload in the local copy flow.

**Verification and remaining checks:** Exact preview-to-clipboard fixtures, denied-clipboard fallback and unsafe Markdown browser checks cover tested behaviour. Permission/device combinations can differ.

**Implementation:** `src/BriefingTools.jsx`, `src/briefing.js`, `src/model.js`, `src/App.jsx`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

### Activity, context versions, comparison and passage recovery (history)

Area: Recovery.

**User need:** Understand a change and recover useful earlier wording without replacing unrelated work.

**Implemented choice:** An 80-entry activity list, up to eight available earlier context versions, written added/removed line labels and buttons to append a selected paragraph or load an earlier draft context.

**Reason / intended benefit:** Time/action labels create an inspectable trail. Passage recovery offers a smaller, reviewable change than replacing the whole current context.

**Basis and psychological claim limits:** Recognition/control judgment. The comparison checks line presence, not a full edit script; stored history is not a complete audit log.

**Accessibility:** Added/removed wording accompanies coloured edges. Native disclosures expose details on request; task links and recovery buttons are labelled.

**Trade-offs and limits:** Reordering/repeated lines are not represented as edits. Bounded history can omit an older version; saving is still needed to commit a recovered draft.

**Verification and remaining checks:** Comparison/passage append, unchanged saved data before Save and wrap-up preservation are verified in browser/unit checks. Retention limits are explicit.

**Implementation:** `src/Studio.jsx`, `src/BriefingTools.jsx`, `src/App.jsx`, `src/workspace.js`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Meaning beyond colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [Consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html).

### Four deliverables, document icons, hostname and separate edit/open (deliverables)

Area: Workspace.

**User need:** Keep the competition's four submission destinations visible beside the work.

**Implemented choice:** Presentation, Demo, Report and Documentation slots above the board, type-specific outline icons, Not linked state, linked hostname, separate edit/open actions and a linked count.

**Reason / intended benefit:** A fixed labelled group reflects the PRD's finish line. Separating navigation from editing avoids changing a URL while inspecting the deliverable; hostname identifies its destination compactly.

**Basis and psychological claim limits:** PRD requirement and recognition/error-prevention judgment; paper layering is decorative.

**Accessibility:** Each slot is named in text. External open actions announce a new tab and use safe HTTP(S) destinations without embedded credentials; edit validation focuses the field.

**Trade-offs and limits:** A hostname alone does not prove content correctness. The owner must check the actual submission destination; the tracker does not assess the deliverable.

**Verification and remaining checks:** Anchor validation and browser edit/reload/link checks verify destinations persist. Production was inspected with four linked slots; lecturer assessment is not inferred.

**Implementation:** `src/App.jsx`, `src/model.js`, `src/index.css`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html).

### Persistent Undo/Redo, deleted tasks, snapshots and storage estimates (recovery)

Area: Recovery.

**User need:** Reverse mistakes and understand browser-local storage limits.

**Implemented choice:** Visible Recovery and Undo/Redo, up to twelve snapshots per stack within a size budget, fifty deleted tasks per project, prior versions before reset/import, approximate usage and last backup-request date.

**Reason / intended benefit:** A visible route back lowers the cost of a mistaken change. Limits bound browser storage; last-request wording avoids pretending a download is safely retained.

**Basis and psychological claim limits:** Control/reliability judgment. Twelve/fifty entries and byte budgets are explicit capacity compromises, not optimal retention periods or guarantees against loss.

**Accessibility:** Written state, labelled restore buttons, confirmation before version replacement, and explicit unreadable-storage wording. Recovery remains independent of colour/motion.

**Trade-offs and limits:** Large workspaces retain fewer snapshots. Browser clearing and quota failures can remove/limit local recovery, so an external backup still matters.

**Verification and remaining checks:** Persistent Undo/Redo, delete/reload/restore, saved-version restoration, demo reset and failed-write preservation have unit/browser checks.

**Implementation:** `src/Recovery.jsx`, `src/workspace.js`, `src/App.jsx`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

### Backup contents, import conflicts, preference opt-ins and raw recovery (transfer)

Area: Recovery.

**User need:** Move saved work while understanding precisely which data will change or leave the browser as a file.

**Implemented choice:** Complete bundles with optional access preferences; validation/size limits; current-versus-backup conflict text; keep-current defaults; merge versus confirmed replacement; prior snapshots. Raw recovery separately captures original stored strings/drafts and labels partial reads.

**Reason / intended benefit:** Preview and explicit choices make replacement inspectable. Independent preference opt-ins avoid unexpectedly changing a new device. Raw export preserves damaged data for manual recovery rather than silently normalising it.

**Basis and psychological claim limits:** Error prevention and privacy/control judgment. File limits and retention budgets are implementation constraints, not malware scanning or guaranteed long-term archiving.

**Accessibility:** Named file input, text errors, labelled conflict choices and status feedback. The active WorkspaceTransfer is the current control; the older ImportBackup component remains unmounted compatibility code.

**Trade-offs and limits:** Backups contain private context; raw files are not normal import bundles and omit default account/session keys. Normal exports exclude drafts and undo stacks. A download request does not prove the user kept the file.

**Verification and remaining checks:** Import conflict/invalid-file workflows, preference roundtrip/failure and latest-workspace-plus-draft download checks verify the named behaviours; raw allowlist is unit tested.

**Implementation:** `src/WorkspaceTransfer.jsx`, `src/transfer.js`, `src/Recovery.jsx`, `src/rawRecovery.js`, `src/Studio.jsx`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

### Buttons, hover/focus, disabled/busy states, toasts and error boundaries (feedback)

Area: Interaction.

**User need:** Know what can be acted on, whether an operation is running, and how to recover from failure.

**Implemented choice:** Filled primary/bordered secondary actions; hover/press and independent focus cues; disabled controls where an action cannot run; Saving/Processing status; an eight-second dismissible toast; persistent Undo; a raw-download/reload error screen.

**Reason / intended benefit:** Consistent action hierarchy and feedback connect intent to outcome. Persistent controls and inline errors carry important information beyond a temporary message.

**Basis and psychological claim limits:** Visible-status and recovery guidance plus visual/timing judgment. Eight seconds is not guaranteed enough reading time for everyone.

**Accessibility:** Native button/disabled semantics, focus rings and written status/alerts. Icons have accompanying text or an accessible action name. Recovery does not depend on the toast remaining visible.

**Trade-offs and limits:** Disabled states can be hard to discover; nearby explanations matter. Render-boundary recovery does not guarantee recovery from every event-handler, network or browser failure.

**Verification and remaining checks:** Induced render failure, raw export/reload, quota failure, clipboard denial and rejected cloud credentials are tested. Those are specific failure paths, not universal reliability proof.

**Implementation:** `src/ui.jsx`, `src/App.jsx`, `src/ErrorBoundary.jsx`, `src/CloudPanel.jsx`.

**Guidance:** [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).

### Dialogs, focus management, command menu and shortcut policy (dialogs)

Area: Interaction.

**User need:** Complete a focused task and return to work using pointer, keyboard or assistive navigation.

**Implemented choice:** Native labelled modal dialogs, initial field/close focus, Escape, scrollable content, trigger/workspace focus return; Ctrl/Command K actions with search; optional N/F/slash shortcuts off by default.

**Reason / intended benefit:** A dialog separates the current decision from background work. Explicit actions and a predictable exit reduce hidden navigation; opt-in single-key shortcuts avoid commandeering common assistive input.

**Basis and psychological claim limits:** Focus-order/control guidance. Exact dialog widths, maximum 90dvh height and backdrop blur/radii are layout/style judgments.

**Accessibility:** Native modal behaviour confines keyboard focus. Fields and commands have names; dragging and shortcuts are conveniences rather than exclusive routes.

**Trade-offs and limits:** Long dialogs still require scrolling; mobile initial input focus can summon a keyboard. Native dialog/voice behaviour varies, and a full assistive-technology audit is outstanding.

**Verification and remaining checks:** Escape/return, invalid-field/delete/filter focus, enlarged dialog reflow and axe checks cover the current tested flows; not every assistive combination is verified.

**Implementation:** `src/ui.jsx`, `src/Studio.jsx`, `src/App.jsx`, `src/Accessibility.jsx`.

**Guidance:** [Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

### Text sizing, plain headings, reflow, contrast and labelled toggles (access-display)

Area: Accessibility.

**User need:** Choose a readable presentation without changing task content or requiring a special account.

**Implemented choice:** Shared display preferences, 100/125/150/175/200% text, plain headings, underlined links, contrast and palette preview, labelled checkbox cards and Reset preferences. At 150%+ the list replaces the board and the sidebar hides.

**Reason / intended benefit:** A few reversible choices make the supported range understandable. Cards combine control/label/hint; the preview shows labels and shapes as well as hue. Reset supplies a route back.

**Basis and psychological claim limits:** Resize/reflow/non-colour guidance plus chosen presets/breakpoints. The five sizes and 150% switch are design choices, not medical prescriptions.

**Accessibility:** Preferences are shared by workspace, guide and pitch. Toggles separate their short names from explanatory descriptions; native selections remain usable with keyboard. Browser zoom is not disabled.

**Trade-offs and limits:** Preferences can fail to persist when storage is denied. A tested 200% text state or 320px emulation is not a full 400% zoom, NVDA, VoiceOver or braille certification.

**Verification and remaining checks:** Preference validation/persistence/failure, mobile 200% text and 320px spacing/forced-colour task checks cover named states. Human access evaluation remains unperformed.

**Implementation:** `src/Accessibility.jsx`, `src/accessibility.js`, `src/index.css`, `src/useLocalStorage.js`.

**Guidance:** [Text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Meaning beyond colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [Text contrast](https://www.w3.org/TR/WCAG22/#contrast-minimum).

### Read-aloud controls, local voices, rates, reading limits and playback dock (access-audio)

Area: Accessibility.

**User need:** Listen to saved content on request, control playback and understand any network/privacy implications.

**Implemented choice:** Task/workspace/section/guide/slide reading; automatic local device voices; explicit online/browser-default choice; .75/1/1.25/1.5 rates; pause/resume/stop; 240-character chunks, 12,000-character request limit and a 12-second startup recovery timeout.

**Reason / intended benefit:** Selectable content and transport controls let users choose what and when to hear. Local-first selection avoids quietly sending context to an online voice. Limits bound engine requests and avoid an indefinitely Starting state.

**Basis and psychological claim limits:** Browser capability, privacy and control judgment. Rates, chunk/length/timeout values are engineering choices, not clinically validated listening settings.

**Accessibility:** Speech starts only on request; controls remain available in dialogs/dock. No local voice produces guidance. Screen-reader semantics remain independently available.

**Trade-offs and limits:** Voices/output depend on OS/browser and may fail. Online choice can disclose text to its provider. Long reading is truncated with notice; per-section/entry reading avoids treating one long narration as complete access.

**Verification and remaining checks:** Speech lifecycle/cancellation/error units, online-choice browser fixture and a real Windows engine start event are recorded. Audible quality and cross-browser listening studies are not claimed.

**Implementation:** `src/Accessibility.jsx`, `src/accessibility.js`, `src/presentation-access.jsx`, `src/BriefingTools.jsx`.

**Guidance:** [Browser speech synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis), [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).

### Cloud preview, account forms, manual sync, versions, comments and permissions (cloud)

Area: Optional services.

**User need:** Offer an explicit optional way to carry/share work without making local competition use depend on an account.

**Implemented choice:** Lazy cloud panel with visible Preview limits, named account/email/password controls, sign-in/confirmation/recovery/sign-out, explicit upload/preview/load, linked version, refresh, owner/editor/viewer roles, account-ID sharing and project comments.

**Reason / intended benefit:** Separate controls make network/data movement deliberate. Preview/version checks make loading and stale-save rejection inspectable; roles constrain access. IDs avoid exposing a searchable email directory.

**Basis and psychological claim limits:** Privacy, least-authority and error-prevention design judgment. These controls do not establish finished real-account delivery or simultaneous collaboration.

**Accessibility:** Forms/roles/status are written and labelled, waiting/failure states are explicit, and the local workspace remains usable without opening the panel.

**Trade-offs and limits:** Uploads/shares expose the complete cloud payload; permissions and comment removal affect remote data. Sync/comments refresh manually. Real email, two-device and collaborator UI acceptance are still open; no paid plan is enabled.

**Verification and remaining checks:** Rolled-back database role/isolation/stale-version checks and rejected-credential browser checks are recorded. Those do not prove end-to-end real-account collaboration.

**Implementation:** `src/CloudPanel.jsx`, `src/cloudConfig.js`, `CLOUD.md`, `supabase/migrations/20261020113943_relay_cloud_workspaces.sql`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

### Eight-slide pitch, slide counter, controls, print and shared access (pitch)

Area: Supporting pages.

**User need:** Explain and demonstrate the project in a bounded presentation with a navigable fallback.

**Implemented choice:** Eight slides separate key arguments; Back/Next, arrow/Home/End navigation, explicit slide count, disabled boundary controls, print styles, current-slide narration and shared accessibility preferences.

**Reason / intended benefit:** Separating arguments controls information density; visible position and ordinary buttons make navigation inspectable. Print retains an exportable reading route.

**Basis and psychological claim limits:** Presentation/recognition judgment. Eight slides and five-minute script are authored choices, not measured attention-span limits.

**Accessibility:** Slides have headings, hidden inactive content and written navigation. Read-this-slide and appearance controls supplement keyboard navigation; changing slides cancels speech.

**Trade-offs and limits:** Projection, room audio, print devices and pacing need actual checks. A prepared script is not James's timed rehearsal.

**Verification and remaining checks:** Slide navigation, named controls and axe are in the browser suite. Rehearsal/room listening results remain unperformed.

**Implementation:** `presentation.html`, `src/presentation-access.jsx`, `PITCH.md`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [Text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [Browser speech synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

### Design guide, searchable decision register, disclosures and evidence labels (guide)

Area: Supporting pages.

**User need:** Let users and the lecturer find the reason for a specific implemented choice and distinguish evidence from intention.

**Implemented choice:** Contents links, a searchable register, stable decision IDs, native detail disclosures, need/choice/reason/basis/access/trade-off/verification fields, per-entry read-aloud, asset/icon inventories, code references and direct guidance sources.

**Reason / intended benefit:** Search and closed details keep a long audit inspectable. Stable IDs support review; common fields expose missing reasoning instead of hiding it in marketing language. Per-entry narration avoids the whole-guide reading cap.

**Basis and psychological claim limits:** Recognition, disclosure and transparency judgment; a static coverage check cannot establish the quality or truth of a justification.

**Accessibility:** Visible labels, result count, keyboard disclosures, hash targets, ordinary source links and shared preferences. Clearing search preserves input focus. Inventory reason links clear a filter, open the target explanation and focus its summary.

**Trade-offs and limits:** More documentation increases reading load. The registry covers implemented component/asset families, not a claim that every pixel has a unique psychological effect. Human review of usefulness remains open.

**Verification and remaining checks:** Coverage validation catches undocumented declared components, referenced Lucide names and shipped assets; guide browser checks exercise searching, disclosure, reading controls and axe. Neither certifies human benefit.

**Implementation:** `src/design-main.jsx`, `src/JustificationRegister.jsx`, `src/designInventory.js`, `scripts/generate-design-doc.mjs`.

**Guidance:** [Usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [Consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html), [Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [Browser speech synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

## Source inventory

Static source coverage checks declared component names, referenced Lucide imports, shipped public assets and HTML pages against this register. It catches omissions/stale entries, not whether the rationale is convincing or every runtime state was tested.

### Components

- `src/Capsules.jsx`: `CapsuleHome` → capsules; `CapsuleEditor` → capsules; `CapsuleDetail` → capsules.
- `src/Accessibility.jsx`: `AccessibilityProvider` → access-display; `AccessButton` → access-display; `ReadButton` → access-audio; `Playback` → access-audio; `ReadingDock` → access-audio; `Toggle` → access-display; `AccessibilityPanel` → access-display.
- `src/App.jsx`: `App` → layout; `TaskEditor` → editor; `AnchorEditor` → deliverables; `TaskCard` → board.
- `src/BriefingTools.jsx`: `Inline` → preview-copy; `MarkdownPreview` → preview-copy; `BriefingTools` → briefing; `ContextComparison` → history.
- `src/CloudPanel.jsx`: `CloudPanel` → cloud.
- `src/design-main.jsx`: `DesignGuide` → guide.
- `src/JustificationRegister.jsx`: `JustificationRegister` → guide.
- `src/ErrorBoundary.jsx`: `ErrorBoundary` → feedback.
- `src/Journal.jsx`: `Journal` → journal-asset.
- `src/presentation-access.jsx`: `PresentationAccess` → pitch.
- `src/Recovery.jsx`: `WelcomePanel` → welcome; `RecoveryPanel` → recovery.
- `src/Studio.jsx`: `ContextCoach` → briefing; `WorkspacePulse` → metrics; `FocusDesk` → focus; `CommandMenu` → dialogs; `ActivityPanel` → history; `ImportBackup` → transfer; `TaskList` → find.
- `src/ui.jsx`: `Modal` → dialogs; `Field` → editor.
- `src/WorkspaceTransfer.jsx`: `WorkspaceTransfer` → transfer.

### Every referenced Lucide symbol

- **Workflow** → identity: Connected nodes repeat Relay's handoff identity; the adjacent name supplies meaning.
- **LayoutGrid, List** → find: Spatial versus sequential layout cues, accompanied by names and selected state.
- **Target** → focus: A chosen starting point, not a measured concentration score.
- **FolderOpen, Flag, Presentation, Code2, FileText** → deliverables: Workspace/finish-line/document metaphors distinguish the four written destination names.
- **BookOpen** → capsules: A kept page/stopping-point metaphor identifies capsules and the empty-state journal. The same outline marks written documentation; adjacent labels specify each destination.
- **Plus** → editor: Addition cue for task/capsule creation and appended templates; wording names what is added.
- **Bug, Check, CheckCheck, Circle** → board: Reinforce written task type, completion, checklist and empty-state meaning without relying on hue.
- **Clock3** → dates: Signals time beside the actual date or written deadline state.
- **Clipboard** → preview-copy: Supports the task/capsule copy/briefing action with success or a manual-copy alternative.
- **Sparkles** → briefing: Marks the distinctive curated-context feature; it does not imply an AI service is running.
- **Search, Command** → find: Finding and keyboard-action cues with a visible name or shortcut.
- **History, RotateCcw, RotateCw** → recovery: Past changes, reversal/reset and redo are distinguished by their written action names. The arrow alone is ambiguous.
- **Link2, ArrowUpRight** → deliverables: Link/outward-direction cues; external destinations announce the new tab, while the journal's arrow labels its local chapter action.
- **ArrowRight, ArrowLeft** → dialogs: Forward/return direction reinforces an explicit save, stage or navigation verb.
- **GripVertical, MoreHorizontal** → board: Pointer drag handle and compact edit affordance; task-specific buttons/menus remain alternatives.
- **Settings2, Accessibility** → access-display: Separate workspace data settings from viewing/reading preferences, each with a specific name.
- **Volume2, Headphones, Play, Pause, Square** → access-audio: Conventional audio transport cues. Play/Pause also control decorative 3D; each action has a label so the same shape is not the only meaning.
- **Download, Upload, ArrowDownToLine** → transfer: Data-movement direction supports explicit backup/import wording and preview.
- **Trash2, X** → feedback: Delete/recover or close/dismiss cues with distinct accessible action names and the relevant confirmation/recovery route.

### Shipped assets

- `public/relay.svg` → identity: Vector logo/favicon; informative only where its alternative is supplied in the guide.
- `public/models/relay-journal.glb` → journal-asset: Original decorative animated Blender geometry; text/buttons carry the actual task/navigation information.
- `public/models/relay-journal-poster.webp` → journal-asset: Still from the same Blender scene for loading, reduced-motion, limited-data and failure paths; empty alt.

### Public pages

- `index.html` / `src/main.jsx` → layout: Primary local-first competition workspace.
- `design.html` / `src/design-main.jsx` → guide: Public design explanation, inventory and evidence reference.
- `presentation.html` / `src/presentation-access.jsx` → pitch: Eight-slide presentation with print and shared access controls.

## Sources and evidence

- [Nielsen Norman Group: usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/): Recognition, visible status, consistency, user control and recovery inform the interface. These are general heuristics, not evidence that Relay has already improved outcomes.
- [W3C: resize text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html): Text enlargement up to 200% without losing content or functionality.
- [W3C: use of colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html): Meaning must not depend only on colour.
- [WCAG 2.2: contrast minimum](https://www.w3.org/TR/WCAG22/#contrast-minimum): Text contrast targets: 4.5:1 for normal text and 3:1 for large text.
- [W3C: character key shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html): Allow character shortcuts to be turned off, remapped or limited to focus.
- [W3C: target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): WCAG 2.2 minimum target guidance; Relay aims above the 24 CSS-pixel minimum for buttons.
- [W3C: image alternatives](https://www.w3.org/WAI/tutorials/images/): Describe informative images; keep purely decorative imagery out of the accessibility tree.
- [MDN: speech synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis): Browser speech controls, voice availability and playback events.
- [W3C: reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html): Content should remain usable when the effective viewport narrows; a tested emulation is not a complete zoom audit.
- [W3C: focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html): Focus should preserve meaning and operability when navigating sequentially.
- [W3C: consistent identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html): Equivalent functions should be identified consistently; Relay's particular symbols remain design judgments.
- [W3C: error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html): Detected input errors need a textual description identifying the affected input.
- [W3C: status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): Relevant status updates should be available to assistive technology without requiring focus movement.
- [W3C: animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html): Non-essential interaction motion can be disabled. This guidance does not prescribe Relay's exact animation timing.

General heuristics and WCAG guidance inform this design; they are not a user-study result for Relay. ACCESSIBILITY.md records tested behavior and limitations. No universal psychological response or full conformance certification is claimed.

## Rule for future changes

Every new visual asset, component or interaction must record: the user need; the design choice; the intended benefit and source (or label it a design judgment); the keyboard/screen-reader/colour/resize implications; the verification and remaining limits. Add the rationale to src/designRationale.js, regenerate this file, and inspect the relevant rendered states before shipping.
