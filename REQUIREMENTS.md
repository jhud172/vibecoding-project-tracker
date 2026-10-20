# Relay requirements, in plain English

A requirement is something the project must do, or a condition it must meet.
It is not necessarily a feature, a technology, or a reason for choosing a colour.
This summary comes from the repository PRD and James's later instructions; it
does not replace any separate marking rubric supplied by the lecturer.

| Term | Meaning | Relay example |
|---|---|---|
| User need | The problem to solve | Returning to AI-assisted work without losing decisions and next steps. |
| Functional requirement | What a person must be able to do | Save task context and copy it into a briefing. |
| Non-functional requirement | A quality or condition of the experience | Keyboard access and readable text; failed saves must not silently discard existing work. |
| Constraint | A boundary on the solution | Build on the supplied React/Vite/Tailwind repository and preserve the Task/Anchor fields. |
| Acceptance criterion | An observable way to check a requirement | Save a task, reload, and confirm its title/context remain; copy and inspect the briefing. |
| Design justification | Why a particular solution was chosen | Keep labels beside icons so people need not guess an icon's meaning. |

## Original assignment: what the app must do

| ID | Requirement | A concrete check | Source |
|---|---|---|---|
| R1 | Create, edit and delete tasks with the specified fields. | Create a task, edit its title/description, save, reload and inspect it; exercise deletion and the added Recovery route. | PRD sections 4–5; `e2e/workspace.spec.js`, `e2e/finalisation.spec.js`. |
| R2 | Organise tasks into To Do, In Progress, Review and Done. | Change a task's stage and confirm it stays there after reload. | PRD sections 3, 7; stage/handoff browser workflow. |
| R3 | Distinguish features/bugs, assign an owner and show deadline states. | Check the written type, owner and due/completed labels; a completed task must not remain overdue. | PRD sections 5, 8–9; model boundary tests and browser handoff checks. |
| R4 | Store curated task context, source tool and context-update time. | Change context/tool and inspect the saved value/timestamp; an owner-only change must preserve the context timestamp. | PRD section 5; model timestamp and context-history checks. |
| R5 | Copy the task and its context for continuing work in an AI chat. | Inspect the actual copied Markdown; if clipboard access is denied, use selectable manual-copy text. | PRD sections 3–4; prompt formatting, exact-copy and denial-fallback checks. |
| R6 | Pin Presentation, Demo, Report and Documentation links. | Edit a valid destination, reload and open the correct link. | PRD sections 3, 5; anchor validation and browser persistence checks. |
| R7 | Save local work and deploy a functioning website. | Reload saved work in the same browser; check the production URL and build. | PRD sections 4, 6, 13; migration/storage/browser checks and CI/Vercel. |
| R8 | Include a visible distinguishing feature and prepare the pitch. | Demonstrate Resume work/Focus desk; push milestone tags; James performs the actual five-minute rehearsal and on-stage copy demonstration. | PRD sections 9, 13–14; `HACKATHON.md`, `PITCH.md`. |

James is solo. Demo Designer and Demo Reviewer are labelled fictional identities
for demonstrating the required owner/handoff dropdown; they are not real teammates.

## Requirements James added later

- **Resume Capsules (latest core purpose):** capture team/session notes; preserve
  original text; curate decisions, working state, next step and verification;
  record explicitly user-reported evidence; compare entered revisions; save
  immutable snapshots and continuation drafts; review copy/download/import;
  preserve complete backups and recovery. Provide a clear first-use journey.
  See CAPSULES.md, tests/capsules.test.js and e2e/capsules.spec.js.

- **Accessibility and control:** light/dark/device appearance, enlarged text,
  alternate palettes/contrast, keyboard controls, read-aloud and controllable
  motion. Speech supplements a screen reader; it does not replace one.
- **Reliability:** recoverable drafts, undo/redo, deleted-task recovery, safe
  imports/backups and clear failures instead of silent overwrites or data loss.
- **Explainable design:** reasons for the current layout, colours, typography,
  images, logo, icons and interactions, with evidence and honest trade-offs.
- **Original visual identity:** the authored Blender journal and smooth,
  preference-controlled animation with a static fallback.

These are user-requested extensions. They should not be described as mandatory
items from the lecturer's original PRD unless the lecturer separately says so.

## What is not required for the current competition release

The original brief did not require accounts, a shared backend, live collaboration
or real GitHub integration. Existing optional cloud controls are visibly a
preview, with email/real-device acceptance still open. James later removed
unnecessary expansions such as AI assistance, extra languages, calendar views and
advanced project-management features from the build commitment. See PRD section
18 and FINALISATION.md. They are not missing mandatory functions.

## How to explain it aloud

“My main requirements were to build a task tracker that saves work, shows task
stages, owners and deadlines, keeps the context behind each task, copies that
context for the next AI session, and links the four project deliverables. I built
on the supplied repository and deployed it. I then added accessibility, recovery,
Focus desk and an original animated journal. My justifications explain why those
solutions were chosen; my tests show which behaviours I have actually checked.”

If asked **“How do you know the requirement is met?”**, demonstrate its concrete
check and name the supporting evidence. Automated results do not establish a
human usability benefit, complete accessibility certification or an actual pitch
rehearsal. James's rehearsal and human evaluations remain unperformed unless
their real results are recorded.
