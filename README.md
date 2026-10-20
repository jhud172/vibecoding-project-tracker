# Relay

**Keep the work moving. Keep the context.**

A local-first vibecoding project tracker built on Ignacio Alvarez's university hackathon starter. James (`jhud172`) is the solo project owner. Demo Designer and Demo Reviewer are explicitly fictional demo identities used to demonstrate the required handoff flow.

[Open Relay](https://relay-jhud172.vercel.app) · [Presentation](https://relay-jhud172.vercel.app/presentation.html) · [Why this design?](https://relay-jhud172.vercel.app/design.html) · [Accessibility](ACCESSIBILITY.md) · [Implementation report](REPORT.md) · [Pitch script](PITCH.md)

## Run locally

Use Node.js 22.12 or newer (Node 24 LTS recommended).

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open the URL printed by Vite. To verify or preview the production bundle:

```sh
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
npm run preview -- --host 127.0.0.1
```

## What you can do

- Explore an original Blender-made journal: the cover and four pages open when entering Focus desk. The hero responds gently to pointer movement and offers an explicit 3D pause control.
- Use perspective page transitions, layered deliverables, card hover/lift and tactile button/dialog responses. Reduced motion keeps the static Blender render and direct navigation.

- Track tasks in To Do, In Progress, Review and Done.
- Add, edit and delete tasks with a keyboard-accessible modal.
- Distinguish features and bugs through labels, icons and coloured stripes.
- Change stage or hand off to one of three named identities from a card.
- See overdue, due-today, upcoming and completed states; completed work is never marked overdue.
- Save curated context, the source tool and the automatic last-context-update time.
- Copy a task as a complete Markdown prompt context.
- Link Presentation, Demo, Report and Documentation above the board.
- Search titles, descriptions and context; filter by owner or task type.
- Use **Resume work** to copy a deadline-ordered briefing of all unfinished work and deliverable links.
- Download a JSON workspace backup and explicitly restore the sample workspace.
- Open **Focus desk** for an explained next-task suggestion and a queue ordered by deadline, with in-progress work breaking ties.
- Use the four-part **handoff checklist** and additive build, debug and handoff templates to improve your saved briefing.
- Review activity and recover earlier context versions into a draft before saving.
- Undo and redo saved changes across reloads; recover deleted tasks and recent workspace versions from **Recovery**.
- Import a backup with a validation preview; merge keeps existing task IDs and links, while replacement requires confirmation.
- Switch between the Kanban board and a deadline-ordered list. Narrow screens start in list layout.
- Drag cards by their grip or use the keyboard-accessible stage menus.
- Press **Ctrl/⌘ K** for quick actions. Optionally enable **N**, **F** and **/** shortcuts in Accessibility; they are off by default to avoid conflicts with assistive input.
- Open **Accessibility** for light/dark/device appearance, 100-200% text sizing, colour-vision alternatives, monochrome, higher contrast, plain headings, link underlines and reduced motion.
- Read a task, workspace briefing or presentation slide aloud with voice/speed selection and pause/resume/stop. Device/browser voice availability varies; speech starts only on request.
- Read the published design rationale explaining layout, cognitive intentions, logo, icons, typography and their trade-offs.
- Edit named briefing sections, inspect a safe Markdown preview, compare earlier context and append individual passages into the draft.
- Preview concise or detailed handoffs; save custom templates and use research, accessibility, deployment and pitch scaffolds.
- Keep unfinished task drafts through refresh, and explicitly continue them when returning to the editor.
- Export complete workspace bundles with optional accessibility preferences and inspect task/link conflicts before import.
- Open Workspace settings → **Accounts, cloud sync & collaboration** for optional authenticated cloud copies, explicit cross-device sync, project comments and viewer/editor access.

## Data and limitations

The authoritative workspace is one localStorage value, `relay.workspace:v3`. Tasks, links and history migrate together from the original keys; legacy values are retained. An empty saved board remains empty. First use offers an explicit choice between an empty workspace and labelled samples. Demo dates are relative to the time samples are requested.

Local work requires no account. The dedicated Relay Supabase project is in London on the existing organization's Free plan. Cloud controls load on demand; publishing requires sign-in and explicit upload confirmation. Sync is currently manual: preview and load cloud work, edit locally, then save the linked version. Concurrent saves reject stale versions; collaborators compare and merge locally. Comments refresh when the cloud preview is refreshed. This is not simultaneous live editing. Viewer/editor permissions are enforced by row-level database policies. The local owner dropdown remains the three PRD identities and sends no message.

Cloud account creation and password recovery need a working email provider. The Free project's default email service has delivery limits; external-user confirmation and a complete real-account cross-device workflow remain acceptance gates. No paid service was enabled. No AI API is connected.

Clearing site data removes local work and unfinished drafts. Complete version 3 backups include all projects, templates, task metadata, current activity and deleted-task recovery. Accessibility preferences are opt-in; drafts and undo stacks require the raw recovery download. Imports accept original/version 2 files (2 MB) and version 3 bundles (8 MB), up to 1,000 active tasks per project and 30 projects. Matching changed tasks/links have explicit conflict choices; merge defaults to keeping current content. Import/reset operations create a prior recovery version. Accessibility preference persistence uses a separate browser key and reports its own failure.

Each project keeps 80 activity entries and up to 50 deleted tasks. The editor offers up to eight available earlier context versions. Persistent undo/redo retains up to twelve recent versions per stack within a 1.2-million-character stack budget; large workspaces retain fewer versions. Quota recovery prunes optional undo/redo snapshots only and reports it. Task drafts use separate per-editor keys, a 350 ms delay and visibility/unload flushing. Cross-tab Web Locks serialize browser writes where available; a revision check rejects stale actions. Older browsers without Web Locks have a revision check but cannot guarantee simultaneous-write exclusion. Activity, drafts, cloud copies and backups can contain private context.

The handoff checklist checks for a task brief, sufficient context text, a labelled next step and a verification instruction. It ignores bracketed template placeholders. These are transparent presence checks, not an AI judgment of correctness. Focus ordering is deterministic and can be overridden by selecting any unfinished task.

Corrupt or incompatible workspace storage opens in protected mode. Recovery offers the original raw value before explicit reset. A failed workspace write keeps the prior complete value, while unfinished editor text stays available. Stale task saves keep the draft and require comparing with the latest task. Clipboard errors open a selectable manual-copy dialog. Only HTTP(S) links without embedded credentials are accepted; Markdown preview never renders raw HTML.

Date-only deadlines use the local calendar day. Today and the next two days are highlighted, yesterday is overdue, and Done overrides urgency. A context timestamp changes when the context text or source tool changes, not when an owner or stage changes.

## Project map

- `src/App.jsx`: workspace UI, task editing, cards, anchors and briefings.
- `src/model.js`: locked data model, validation, deadlines, demo data and Markdown formatting.
- `src/workspace.js`, `src/useWorkspace.js`: atomic workspace transactions, migration, cross-tab checks and persistent recovery.
- `src/drafts.js`, `src/useDraft.js`: bounded, isolated unfinished-editor recovery.
- `src/BriefingTools.jsx`, `src/briefing.js`: section editing, previews, comparisons and reusable templates.
- `src/WorkspaceTransfer.jsx`, `src/transfer.js`: complete bundles, preference opt-in and import conflict review.
- `src/CloudPanel.jsx`, `supabase/migrations/`: optional cloud accounts, version checks, comments and database permissions.
- `src/ErrorBoundary.jsx`: recoverable render failures without resetting saved data.
- `src/useLocalStorage.js`: accessibility preference persistence and storage warnings.
- `src/ui.jsx`: shared accessible fields and native dialog.
- `src/Studio.jsx`: Focus desk, handoff coaching, quick actions, list layout, activity and import preview.
- `src/competition.js`: focus ordering, checklist rules, activity validation and backup parsing/merging.
- `tailwind.config.js`: Relay design tokens.
- `tests/model.test.js`: focused tests for data and formatting behaviour.
- `PRD.md`: specification and recorded solo-project decisions.
- `DESIGN.md`: visual system and interface principles.
- `PITCH.md`: five-minute script and demo runbook.
- `presentation.html`: eight-slide, keyboard-operable presentation with print layout and shared access preferences.
- `design.html`, `src/design-main.jsx`, `src/designRationale.js`: published design rationale and source content.
- `src/Accessibility.jsx`, `src/accessibility.js`: saved preferences, semantic palettes and speech lifecycle.
- `DESIGN_RATIONALE.md`, `ACCESSIBILITY.md`: design reasons, access features and verification limits.
- `tests/accessibility.test.js`: contrast, preference validation and speech lifecycle regression tests.
- `tests/studio.test.js`: recovery, import compatibility, focus ordering and checklist regression tests.
- `e2e/workspace.spec.js`, `.github/workflows/verify.yml`: isolated Chromium/axe regression checks and CI validation.
- `IMPLEMENTATION_PLAN.md`, `ROADMAP.md`: all 75 requested improvements and evidence-based completion status.
- `src/Journal.jsx`, `src/journalScene.js`, `src/motion.js`: accessible journal navigation, on-demand Three.js rendering and view transitions.
- `assets/source/relay-journal.blend`, `assets/source/create_journal.py`: original editable Blender model and reproducible animation/export script; see assets/source/README.md.
- `REPORT.md`: implementation report and validation record.
- `HACKATHON.md`: portal setup and verified milestone names.
- `LECTURER_SETUP.md`: reusable student instructions for GitHub login, fork registration and webhook setup.

## Delivery and milestone tracking

Repository: https://github.com/jhud172/vibecoding-project-tracker

Portal: https://vc-hackathon-hub.vercel.app/dashboard

The portal watches **commit messages** through the configured push webhook. Matching Git tags are also created for the starter workflow. Verified identifiers are recorded in HACKATHON.md; several differ from the original README. Only mark a feature after verifying it.

Hosted in James's Vercel account as `relay-jhud172`, connected to this GitHub fork. Deploy as a Vite application: install `npm ci`, build `npm run build`, output `dist`. Pushes to `main` update the deployed project through the Git connection. Browser localStorage is isolated by origin, so local testing data does not transfer to the deployment.

The pitch materials are prepared. A real timed rehearsal and on-stage demonstration remain James's final PRD gates; a completed portal preparation milestone does not establish either.

Accessibility preferences use `relay.accessibility:v1`, separately from task and
backup data. Reload other open tabs to pick up changes made in a different tab.
Text of 150% or larger uses the list automatically. The design guide and pitch
share the same appearance/reading preferences. Read-aloud uses the browser’s
speech engine, and selected online voices may use a network service. Relay adds
no AI speech API, microphone access or server upload. See ACCESSIBILITY.md for
tested behavior and limits; this is not a blanket conformance certification.

## Development dependency note

Vite was updated from the starter's version 5 to version 7, and compatible dependency fixes were applied. React 18 and Tailwind 3 are retained. Remaining audit findings relate to Tailwind 3 build-time dependencies; the static production application does not ship these packages. Keep the development server on loopback and treat source files and build configuration as trusted input. See REPORT.md for the final audit result.

## Attribution

Based on https://github.com/ignacioalvmar/vibecoding-project-tracker by Prof. Dr. Ignacio Alvarez. The original PRD and four-stage task schema underpin this implementation.
