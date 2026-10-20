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
npm run build
npm run preview -- --host 127.0.0.1
```

## What you can do

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
- Undo the last task, deliverable, import or demo-reset change until the next change or page reload.
- Import a backup with a validation preview; merge keeps existing task IDs and links, while replacement requires confirmation.
- Switch between the Kanban board and a deadline-ordered list. Narrow screens start in list layout.
- Drag cards by their grip or use the keyboard-accessible stage menus.
- Press **Ctrl/⌘ K** for quick actions. Optionally enable **N**, **F** and **/** shortcuts in Accessibility; they are off by default to avoid conflicts with assistive input.
- Open **Accessibility** for light/dark/device appearance, 100-200% text sizing, colour-vision alternatives, monochrome, higher contrast, plain headings, link underlines and reduced motion.
- Read a task, workspace briefing or presentation slide aloud with voice/speed selection and pause/resume/stop. Device/browser voice availability varies; speech starts only on request.
- Read the published design rationale explaining layout, cognitive intentions, logo, icons, typography and their trade-offs.

## Data and limitations

Tasks live under `vibetracker.tasks`; deliverables under `vibetracker.anchors` in browser localStorage. An empty saved board remains empty. Four labelled demo tasks are created only when no saved board exists. Their dates are relative to the first load, so use Workspace settings to refresh the demo before presenting.

There is no server database, account system, AI API, or real-time collaboration. Handoff changes a local owner field; it sends no message. Another browser or device has a separate workspace. Clearing site data removes the stored workspace. Export a JSON backup to move data between browsers. Import accepts original Relay backups and version 2 backups, up to 2 MB and 1,000 tasks. Imports validate the locked schema and safe URLs before changing anything.

Activity is stored under `relay.activity:v1`, bounded to 80 entries. Context changes retain the previous task snapshot; the editor offers the latest eight available context versions for that task. Undo is a one-step in-memory snapshot and does not survive reload. Activity and backups can contain task context; treat them with the same care as the original tasks.

The handoff checklist checks for a task brief, sufficient context text, a labelled next step and a verification instruction. It ignores bracketed template placeholders. These are transparent presence checks, not an AI judgment of correctness. Focus ordering is deterministic and can be overridden by selecting any unfinished task.

Corrupt or incompatible stored data is not silently overwritten. A warning explains that changes may not be persisted; an explicit demo reset replaces that data. Clipboard errors open a selectable manual-copy dialog. Only HTTP(S) deliverable links without embedded credentials are accepted.

Date-only deadlines use the local calendar day. Today and the next two days are highlighted, yesterday is overdue, and Done overrides urgency. A context timestamp changes when the context text or source tool changes, not when an owner or stage changes.

## Project map

- `src/App.jsx`: workspace UI, task editing, cards, anchors and briefings.
- `src/model.js`: locked data model, validation, deadlines, demo data and Markdown formatting.
- `src/useLocalStorage.js`: persistence and storage error handling.
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
