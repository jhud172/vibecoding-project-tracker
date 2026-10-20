# Relay

**Keep the work moving. Keep the context.**

A local-first vibecoding project tracker built on Ignacio Alvarez's university hackathon starter. James (`jhud172`) is the solo project owner. Demo Designer and Demo Reviewer are explicitly fictional demo identities used to demonstrate the required handoff flow.

[Open Relay](https://relay-jhud172.vercel.app) · [Presentation](https://relay-jhud172.vercel.app/presentation.html) · [Implementation report](REPORT.md) · [Pitch script](PITCH.md)

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

## Data and limitations

Tasks live under `vibetracker.tasks`; deliverables under `vibetracker.anchors` in browser localStorage. An empty saved board remains empty. Four labelled demo tasks are created only when no saved board exists. Their dates are relative to the first load, so use Workspace settings to refresh the demo before presenting.

There is no server database, account system, AI API, or real-time collaboration. Handoff changes a local owner field; it sends no message. Another browser or device has a separate workspace. Clearing site data removes the stored workspace. JSON backup is an export for safekeeping; importing a backup is not part of this version.

Corrupt or incompatible stored data is not silently overwritten. A warning explains that changes may not be persisted; an explicit demo reset replaces that data. Clipboard errors open a selectable manual-copy dialog. Only HTTP(S) deliverable links without embedded credentials are accepted.

Date-only deadlines use the local calendar day. Today and the next two days are highlighted, yesterday is overdue, and Done overrides urgency. A context timestamp changes when the context text or source tool changes, not when an owner or stage changes.

## Project map

- `src/App.jsx`: workspace UI, task editing, cards, anchors and briefings.
- `src/model.js`: locked data model, validation, deadlines, demo data and Markdown formatting.
- `src/useLocalStorage.js`: persistence and storage error handling.
- `src/ui.jsx`: shared accessible fields and native dialog.
- `tailwind.config.js`: Relay design tokens.
- `tests/model.test.js`: focused tests for data and formatting behaviour.
- `PRD.md`: specification and recorded solo-project decisions.
- `DESIGN.md`: visual system and interface principles.
- `PITCH.md`: five-minute script and demo runbook.
- `public/presentation.html`: six-slide, keyboard-operable presentation with print layout.
- `REPORT.md`: implementation report and validation record.
- `HACKATHON.md`: portal setup and verified milestone names.
- `LECTURER_SETUP.md`: reusable student instructions for GitHub login, fork registration and webhook setup.

## Delivery and milestone tracking

Repository: https://github.com/jhud172/vibecoding-project-tracker

Portal: https://vc-hackathon-hub.vercel.app/dashboard

The portal watches **commit messages** through the configured push webhook. Matching Git tags are also created for the starter workflow. Verified identifiers are recorded in HACKATHON.md; several differ from the original README. Only mark a feature after verifying it.

Hosted in James's Vercel account as `relay-jhud172`, connected to this GitHub fork. Deploy as a Vite application: install `npm ci`, build `npm run build`, output `dist`. Pushes to `main` update the deployed project through the Git connection. Browser localStorage is isolated by origin, so local testing data does not transfer to the deployment.

The pitch materials are prepared. A real timed rehearsal and on-stage demonstration remain James's final PRD gates; a completed portal preparation milestone does not establish either.

## Development dependency note

Vite was updated from the starter's version 5 to version 7, and compatible dependency fixes were applied. React 18 and Tailwind 3 are retained. Remaining audit findings relate to Tailwind 3 build-time dependencies; the static production application does not ship these packages. Keep the development server on loopback and treat source files and build configuration as trusted input. See REPORT.md for the final audit result.

## Attribution

Based on https://github.com/ignacioalvmar/vibecoding-project-tracker by Prof. Dr. Ignacio Alvarez. The original PRD and four-stage task schema underpin this implementation.
