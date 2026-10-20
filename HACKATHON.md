# Hackathon delivery record

## Repository setup

- Working repository: https://github.com/jhud172/vibecoding-project-tracker
- Starter upstream: https://github.com/ignacioalvmar/vibecoding-project-tracker
- Portal: https://vc-hackathon-hub.vercel.app/dashboard
- The portal displayed **Repo Connected** for this fork on 20 October 2026.
- Local `origin` points to the fork; `upstream` retains the original starter.
- An active JSON push webhook delivers to `https://vc-hackathon-hub.vercel.app/api/webhooks/github`.
- A real `git-linked` commit pushed after configuring the webhook was recognised.
- The live dashboard subsequently recognised milestones 1–12 and advanced to Pitch.
- Vercel project `relay-jhud172` is owned by James's existing Hobby account and connected to the fork.
- Live app: https://relay-jhud172.vercel.app
- Presentation: https://relay-jhud172.vercel.app/presentation.html
- Reusable course setup instructions: [LECTURER_SETUP.md](LECTURER_SETUP.md).

## Pitch preparation

The live portal's Pitch milestone asks for a prepared presentation and demo.
`presentation.html` now provides eight slides with access preferences; `PITCH.md` provides the five-minute
script, live-demo sequence and recovery instructions. The `pitch-done` preparation
commit records these deliverables. The PRD additionally requires James's actual
timed rehearsal and on-stage copy demo. Neither is claimed to have happened.

All 13 portal milestones were recognised after the pitch-preparation commit.
The competition upgrade extends the finished product without reusing milestone
tags to claim additional assessment credit.

## Milestone names verified in the portal

The live dashboard asks for these identifiers in commit messages. Create matching
Git tags as well to meet the starter's documented workflow. Record completion
only after the corresponding work has been checked.

1. `git-linked`
2. `prd-done`
3. `design-done`
4. `data-model`
5. `crud-modal`
6. `tag-style`
7. `task-owner`
8. `due-tint`
9. `task-context`
10. `copy-context`
11. `project-deliverables`
12. `secret-sauce`
13. `pitch-done`

The starter uses different identifiers for some milestones: `context`,
`copy-prompt`, `anchors`, and `pitch-ready`. The live portal names above take
precedence for tracking; the product requirements remain those in PRD.md.

## Delivery gates

- Complete the team-specific PRD fields with confirmed information.
- Implement and verify each PRD feature using the existing React, Vite,
  Tailwind and localStorage architecture.
- Check task creation, editing, deletion, movement, ownership, deadline
  boundaries, context timestamps, clipboard output and deliverable persistence.
- Verify keyboard operation and a successful production build.
- Publish a working Vercel deployment and verify it in a browser.
- Prepare demo data, a five-minute pitch and supporting documentation.
- Verify milestone recognition in the portal. Pitch rehearsal requires a real
  rehearsal; preparation alone does not prove it happened.
