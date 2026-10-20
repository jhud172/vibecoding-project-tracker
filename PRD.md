# Relay — my Product Requirements Document

**Project owner:** James Hudson (`jhud172`) · solo project

**Updated:** 20 October 2026

**Live app:** https://relay-jhud172.vercel.app/

**Repository:** https://github.com/jhud172/vibecoding-project-tracker

This document explains what I want Relay to do, the choices I made about its
direction, and how AI helped turn those instructions into a working project.
It is an AI-assisted rewrite based on my recorded requests and the repository.
The first-person wording describes my role as project owner; it does not mean
I personally wrote every line of code or this document without assistance.
I still need to read and confirm the wording before using it for assessment.

My starting point was the university's
[Vibecoding Project Tracker starter](https://github.com/ignacioalvmar/vibecoding-project-tracker)
by Prof. Dr. Ignacio Alvarez. The original task-tracking brief and Task/Anchor
model came from that starter. I am not claiming I created the starting project
or the original assignment requirements.

## 1. The problem I want to address

I want to make it easier to return to an AI-assisted coding project after a
break. A task title tells me what needs doing, but I also need the decisions,
failed approaches, current progress and next step behind it.

Relay gives that information a place alongside the tasks. The intended benefit
is a clearer restart, including when someone moves to a different AI tool.
I have not measured time savings or run a user study, so I describe this as the
problem I am targeting rather than a proven productivity improvement.

## 2. Who I am building it for

- **Main users:** students and solo developers working on coding projects with AI.
- **Other intended users:** small teams sharing notes and a briefing for the next
  session. A capsule can be copied or downloaded for another person.
- **My own use:** organising my university project, its context and its submission links.

I am working solo. Team-note support does not mean the main local workspace is
automatically shared with other people. Real-account cloud collaboration is
still a preview with checks outstanding.

## 3. What Relay is

Relay is a local-first web app. Its main purpose is now **Resume Capsules**:
saved stopping points containing the notes and next action for another session.
The task board supports the work around those handoffs.

The app has three main parts:

1. **Resume Capsules:** original notes, curated sections, reported evidence and
   a clear place to take off next.
2. **Task tracking:** features and bugs, owners, deadlines and four stages.
3. **Deliverable links:** Presentation, Demo, Report and Documentation together.

The main app is at `/`. The explanation of the design is at `/design.html`,
and the eight-slide presentation is at `/presentation.html`.

I chose to make capsules central after asking how Relay could stand out more.
The AI assistant suggested the capsule direction. I chose to have it built and
specifically asked for team notes, clear sections, an easier first-use flow,
design justification, testing and a working live release. I am not claiming I
invented the idea without that suggestion or that no other product has similar features.

## 4. The experience I want users to have

### Main capsule journey

1. Open Relay and understand the three steps: **Add notes → Shape the handoff → Review and save**.
2. Paste notes or load/drop a plain `.txt` or `.md` file.
3. Keep the original notes, then organise Goal, Decisions, Tried/rejected,
   What works, Next step, How to verify and Risks/unknowns.
4. Optionally use recognised headings to fill empty sections. This is text
   extraction; it does not invent a summary or use an AI service.
5. Optionally add a task link, contributors, repository reference, revision,
   file names and evidence. Goal and Next step are required before saving.
6. Review the briefing and save a capsule, or explicitly save a draft to finish later.
7. Return to a saved capsule, read **Take off here**, review its evidence and
   copy or download the handoff for the next session.
8. Start another session from it. The earlier capsule remains unchanged;
   check names carry forward but results reset to **Not run**.

For my presentation, I asked for **Try an example draft** to fill every section
with fictional Campus Companion data, so I can walk through without typing.
Opening this example alone does not save it or replace existing tasks.

### Original task journey I am retaining

Create a task, save its context, move it through the stages, change its owner
label and copy its task/context briefing. The four deliverable links must also
remain editable and saved. Deleting a task must leave an available recovery route.

### Checks against my requirements

| Requirement | How I can demonstrate it |
|---|---|
| Create, edit and delete tasks | Add a task, change it, reload it, delete it and recover it. |
| Preserve task context and copy it | Save decisions and a next step; inspect the actual copied briefing. |
| Keep the four submission links | Edit a destination, reload, and open the correct link. |
| Capture a capsule without losing original notes | Compare the original notes with the editable sections. |
| Give the next session an actionable start | Open a saved capsule and show its goal and next step. |
| Preserve earlier stopping points | Save a continuation and show the original is unchanged. |
| Keep evidence honest | Show Not run and user-reported outcomes; compare differing revision labels. |
| Support beginners | Walk through the prefilled example without entering data. |
| Protect local work | Demonstrate a backup/import, Undo and a failed-save message. |

## 5. The information the app stores

The implementation retains the original Task and Anchor fields. Extra capsule
information sits alongside them in the workspace rather than replacing them.

```js
Task = {
  id: string,
  title: string,
  description: string,
  type: 'feature' | 'bug',
  status: 'todo' | 'in-progress' | 'review' | 'done',
  assignee: string,
  dueDate: string | null,        // YYYY-MM-DD
  createdDate: string,           // YYYY-MM-DD
  context: string,
  contextTool: string | null,
  contextUpdatedAt: string | null // ISO timestamp
}

Anchor = {
  id: 'presentation' | 'demo' | 'report' | 'documentation',
  label: string,
  url: string | null
}
```

Each capsule records its ID and save time, title, original notes, contributors,
seven handoff sections, relevant files, repository/revision labels, evidence,
an optional task ID and an optional parent capsule ID. Evidence contains a name,
command/source, result and outcome: Not run, Reported pass, Reported failure or Blocked.

Task context-tool choices remain Claude, ChatGPT, Cursor, Lovable, Replit and
Other, or no specified tool. These labels record where context came from;
selecting one does not connect Relay to that service.

Capsules and one saved capsule draft are optional fields in the existing
version-3 project envelope. Older saved work remains supported. The technical
validation and limits are in `src/capsules.js`, `src/workspace.js` and [CAPSULES.md](CAPSULES.md).

## 6. The technology used and why

I asked the assistant to build on the supplied repository. The implementation
keeps its React/Vite/Tailwind foundation rather than starting a different project.

| Part | Current choice | Reason |
|---|---|---|
| Interface | React 18 and Vite 7 | Continues the starter's approach with updated build tooling. |
| Styling | Tailwind 3 and shared CSS | Reuses the design system, responsive rules and motion controls. |
| State and saving | React hooks and an atomic workspace store in localStorage | Keeps core work usable without an account and saves related data together. |
| 3D | Original Blender source/export and optional Three.js rendering | Provides the journal identity with a static fallback. |
| Speech | Browser/device speech synthesis | Provides optional reading without an AI speech API. |
| Deployment | GitHub-connected Vercel project | Publishes changes through the existing repository connection. |
| Optional cloud | Dedicated Relay Supabase project on the Free plan | Separate preview for authenticated copies and collaboration; not required for the local workflow. |

I required approval before any paid plan or charge. No paid service was added
for the capsule feature. The deployed app itself has no connected AI provider.
Using AI to develop Relay is separate from the app running AI for its users.

## 7. Task stages and deadline behaviour

The required stage labels remain **To Do**, **In Progress**, **Review** and **Done**.
Users can change stage through a labelled menu as an alternative to dragging.

Dates use the local calendar day. Past deadlines are overdue; today and the next
two days have urgency cues; completed tasks show Completed rather than overdue.
Missing dates remain neutral. Written labels carry the meaning alongside colour.

## 8. My solo-project setup

| Identity | Role |
|---|---|
| James (`jhud172`) | Actual solo project owner. |
| Demo Designer | Fictional identity for demonstrating the owner dropdown. |
| Demo Reviewer | Fictional identity for demonstrating a handoff. |

These three names are the allowed local task owners. Selecting a demo identity
does not invite, notify or synchronise with a real person. I told the assistant
I was solo rather than providing invented real teammates.

## 9. Milestones and responsibility

I am responsible for the project and its presentation. Being the owner of a
milestone does not mean I wrote all of its implementation personally.

| # | Portal identifier | What it covers | Project owner |
|---|---|---|---|
| 1 | `git-linked` | Repository connection | James |
| 2 | `prd-done` | Requirements document | James |
| 3 | `design-done` | Design system and explanation | James |
| 4 | `data-model` | Task model and board | James |
| 5 | `crud-modal` | Task creation, editing and deletion | James |
| 6 | `tag-style` | Feature/bug presentation | James |
| 7 | `task-owner` | Owner labels and handoff | James |
| 8 | `due-tint` | Deadline presentation | James |
| 9 | `task-context` | Saved task context | James |
| 10 | `copy-context` | Copyable task briefing | James |
| 11 | `project-deliverables` | Four submission links | James |
| 12 | `secret-sauce` | Visible distinguishing functionality | James |
| 13 | `pitch-done` | Prepared pitch/demo materials | James |

The delivery record reports all 13 recognised by the portal, and matching Git
tags were pushed. [HACKATHON.md](HACKATHON.md) records the evidence and naming
differences from the starter. A preparation milestone is not proof that I have
rehearsed or delivered the pitch. The original on-stage task-copy requirement
still applies alongside the capsule demonstration.

## 10. How I contributed and how AI helped

I used the ChatGPT/Codex assistant throughout this project, including its tools
for repository work, browser interaction and verification. Its contribution was
substantial. It generated and edited much of the implementation, wrote and ran
automated checks, diagnosed failures, handled deployment work and drafted
documentation and pitch material. I should not describe it as only spellchecking.

My contribution was directing the project through requests, constraints and
decisions. These are concrete examples from the work:

| Area | What I contributed | What the AI assistant did |
|---|---|---|
| Starting point | I supplied the repository and portal links and asked it to use the existing PRD as the specification. | Inspected and built on the starter, connected the working repository and implemented the brief. |
| Solo setup and access | I confirmed I was solo and approved the requested GitHub verification prompts. | Configured the project connection through tools and retained clearly labelled demo identities. |
| Competition improvements | I asked for substantial improvements and questioned what made Relay useful compared with other tools. | Suggested approaches, explained trade-offs and implemented the authorised changes. |
| Accessibility | I requested read-aloud, larger text, colour-vision alternatives and light/dark modes. | Wrote the controls, preference handling and relevant automated checks. |
| Design and motion | I requested reasons for visual choices, more immersive design and original Blender animation. | Developed the visual implementation, created the Blender source/export workflow and documented the reasons and limits. I did not manually model that asset in Blender. |
| Scope | I later told it to prioritise necessary work and skip unnecessary additions. | Narrowed the release scope, preserved deferred items as history and completed the agreed checks. |
| Costs and database | I required approval before spending, chose a dedicated Relay project and selected the Crystal Powers organisation. | Set up the dedicated Free cloud preview and documented the remaining service checks. |
| Resume Capsules | After its suggestion, I chose to make capsules the main purpose and specified team notes, clear sections, a simpler flow and live verification. | Designed and implemented the capsule data, interface, portability, recovery and tests. |
| Demo usability | I asked for example data, a short five-minute outline, and then a fully prefilled example requiring no typing. | Prepared the material and changed the example button to preload the complete fictional capsule. |
| Understanding and explanation | I asked what the requirements and PRD meant and requested wording I could explain to my lecturer. | Explained the terms and rewrote this document from my recorded instructions. I still need to review and understand it myself. |

I am not claiming I personally authored every function, ran every test manually,
completed a full accessibility audit or developed every design idea unaided.
Equally, I did make decisions about the product direction and how I wanted it
to work. My role should be described accurately as directing an AI-assisted
development project, with responsibility for understanding and presenting it.

## 11. Project identity

- **Name:** Relay — James's solo studio.
- **Tagline:** Keep the work moving. Keep the context.
- **Main message now:** Team notes in. A clear next session out.
- **Live URL:** https://relay-jhud172.vercel.app/

The journal imagery supports the idea of keeping a stopping point and returning
to a page. It is decorative; real task and capsule information remains readable
HTML. I asked for original 3D work, while the assistant produced the asset and code.

## 12. What is outside the current release

The original assignment did not require a shared backend, accounts or real
GitHub integration. Some optional account/cloud controls were later added as a
preview, but core tasks and capsules must work without them.

I am not presenting the following as finished product capabilities:

- Simultaneous live team editing or fully accepted real-device cloud collaboration.
- Automatic reading of AI conversations or repository files.
- Automatic test execution, code verification or detection of finished work.
- GitHub issue synchronisation, AI-generated assistance inside Relay or an installable offline app.
- The additional languages, calendar views and advanced project-management additions I removed from scope.

## 13. How I judge completion

The software needs to meet the original task/link requirements and the capsule
requirements above, preserve existing data, pass appropriate checks and work at
the deployed URL. The requirements handout and test files provide specific
acceptance checks rather than relying only on a completion percentage.
The original tracking requirement is all 13 milestone tags pushed and recognised
on the hackathon dashboard, as recorded in section 9.

Before this document rewrite, software commit `97194a5` passed **59 unit tests
and 39 browser workflows**, alongside lint, generated-document checks and the
production build in [the recorded GitHub workflow](https://github.com/jhud172/vibecoding-project-tracker/actions/runs/39434973136).
The assistant wrote and ran these checks through tools. They cover specific
behaviour; they do not prove the app is bug-free, fully accessible or better
for people than other products.

My personal presentation gates remain: rehearse the five-minute pitch, check
the room/browser clipboard and audio if used, and perform the actual on-stage
copy demonstration. These must not be claimed complete from automated tests.

## 14. Important implementation decisions and limits

- **Local-first:** work is saved in this browser and origin. Clearing site data
  can remove it; another device does not automatically see it. Backups matter.
- **Context:** the timestamp changes when task context or its source tool changes,
  rather than on an unrelated owner/stage change.
- **Capsule history:** resuming creates a new draft; earlier snapshots stay intact.
  Previous check outcomes reset to Not run in the continuation.
- **Evidence:** results are supplied by the user. Matching revision text does not
  establish that code was inspected or a check passed.
- **Privacy:** copied capsule Markdown excludes original notes until selected.
  Full capsule JSON, complete backups and explicitly confirmed cloud uploads
  include them. Users should review private information before sharing.
- **Drafts:** capsule typing alone is not saved. Save draft persists it; dirty-close
  and reload warnings explain the unsaved boundary.
- **Bounds:** capsules, history, notes and imports have size/retention limits.
  Storage can fill earlier than the headline limits. [CAPSULES.md](CAPSULES.md)
  describes the values and recovery behaviour.

## 15. Improvements beyond the starter

I asked for a stronger competition project. In response, the assistant proposed
and implemented additions such as Focus desk, Resume work briefings, context
templates/history, recovery, backup/import, board/list layouts and quick actions.
I later asked to reduce unnecessary expansion and finish the essential work.

After discussing differentiation, I authorised the capsule extension as the
main direction. Those capsules now lead the experience, while the existing
task board and deliverable links remain. The eight-slide presentation and
[short pitch outline](PITCH_OUTLINE.md) reflect that direction.

## 16. Why design and accessibility are requirements for me

I explicitly asked for visual and interaction choices to have a reason. I want
to explain how layout, labels, icons, imagery and motion support the user, rather
than only saying they look good.

The assistant documented those choices in the shared
[design guide](https://relay-jhud172.vercel.app/design.html#register) and
[DESIGN_RATIONALE.md](DESIGN_RATIONALE.md). Design intentions are distinguished
from measured psychological effects. The reasons are not evidence of a human study.

My requested controls include light/dark/device appearance, text sizing up to
200%, alternate palettes, higher contrast, reduced motion and read-aloud. The
implementation also provides keyboard controls, labels, focus handling and
written status cues. Speech supplements screen readers; it does not replace them.

Automated accessibility checks and specific layouts were exercised. Full
NVDA/VoiceOver evaluation, broader browser/device coverage and testing with
disabled users remain unperformed unless real results are separately recorded.
[ACCESSIBILITY.md](ACCESSIBILITY.md) explains the checked behaviour and limits.

## 17. How my scope changed

The project grew through several requests from me:

1. Build the original PRD on the supplied repository and connect the hackathon setup.
2. Improve the competition entry, accessibility, explained design and animation.
3. Consider a much larger improvement list, then reduce the commitment to necessary work.
4. Discuss a stronger purpose, then explicitly authorise Resume Capsules as the main workflow.
5. Make the example complete enough to demonstrate without typing.

The old 75-item roadmap remains a historical record, not a claim that every
suggestion was delivered. [FINALISATION.md](FINALISATION.md) and
[CAPSULE_PLAN.md](CAPSULE_PLAN.md) record the later scope decisions.

## 18. My current release scope

My current requirements are the original task and deliverable flows, the complete
local capsule workflow, understandable first use, the prefilled example,
recovery/portability, the requested accessibility and motion controls, explained
design, verified software and prepared presentation material.

Unrelated optional roadmap additions remain deferred. Cloud stays visibly a
preview until real email/account/device and collaborator checks are completed.
I still require approval before any paid plan or charge. Human evaluation and my
own rehearsal are separate activities, not things the assistant can declare done
from simulated data or a generated script.

## 19. How I can explain my role to my lecturer

“I started with the supplied university repository and PRD. I worked solo and
used AI extensively as a development assistant. I directed the project through
my requirements: accessibility, explained design, original animation and a
clearer workflow. When the assistant proposed Resume Capsules, I chose to make
that the main purpose and specified team notes, handoff sections and an example
I could demonstrate without typing. The assistant generated much of the code,
wrote and ran tests, handled deployment work and helped draft the documentation.
My contribution was choosing the direction, setting constraints and priorities,
and asking for improvements and explanations. I am responsible for understanding
what was built and presenting its behaviour and limitations honestly.”

Before submission, I need to review this wording, be able to demonstrate the
main flows and follow the lecturer's rules for declaring AI assistance. No
separate marking rubric or course AI-use policy is asserted by this document.
