# Relay - five-minute pitch and demo

Prepared for James, solo project owner. This is a script and runbook, not a claim that a live pitch or rehearsal has occurred. Adapt the wording to your own voice.

The eight-slide presentation is at `/presentation.html` on the deployed app (source:
`presentation.html`). Use the Back/Next buttons or arrow keys. Printing
includes all eight slides. The Open live demo link returns to the app. Appearance,
text sizing and read-this-slide controls are available in its header.

## 0:00-0:40 - The problem

"When I build with AI, the code is not the only thing I need to keep. I need to keep the reasoning: what I asked, what worked, what failed, and what I was going to do next. Ordinary task lists track the work, but the context gets left behind in a chat. Relay puts those two things back together."

Show the board. Point out four exact stages and the finish-line deliverables.

## 0:40-1:25 - One clear task

"This is a deliberately small workspace. I can add a feature or bug, describe the outcome, choose an owner and set a deadline. It stays in my browser when I refresh."

Create a task named **Polish the first-run experience**. Add a short description. Set today's date. Save and show its date label. Move it to In Progress using the stage dropdown.

## 1:25-2:15 - Keep the useful context

Open the new task and paste this briefing:

> Decision: retain React, Vite and localStorage. The first-run board should explain the product through four labelled demo tasks. What works: task editing and reload persistence. Next: review the empty-state wording and test keyboard navigation. Done when a new user can create and move a task without guidance.

Select ChatGPT as the source tool and save.

"This is curated context, not an unfiltered chat dump. Relay checks for a brief, useful context, a next step and a verification instruction. It is a transparent checklist, not an AI quality score. Templates help me get started without replacing what I already wrote."

## 2:15-3:05 - The hero moment

Click **Context** on the card. Paste the clipboard into an empty text editor or AI chat draft; sending it is unnecessary for the demo.

"One click gives me the title, description, state, owner, deadline and context in a reusable Markdown prompt. I can continue in my preferred tool without reconstructing the conversation."

Hand off to Demo Reviewer and explain that this is a sample identity. Mark the task Done; show that its date label becomes Completed.

## 3:05-3:50 - Secret sauce: Focus desk

Open **Focus desk**. Show its suggested task and the explanation beneath it.

"When I return tomorrow, I do not want to read every card. Focus desk suggests the next task and explains why. Deadlines come first; work in progress breaks ties. I can choose another task, improve its handoff, or copy its briefing immediately. Resume work also prepares one briefing for the whole workspace."

Select another task in the queue to show that the user remains in control.

## 3:50-4:15 - Trust it with real work

Advance a focused task and click **Undo**. Open the task's earlier-context section
if a version is available. Briefly point to the four deliverable links.

"An accidental click should not erase the work. I can undo the last change, recover earlier context, or take a backup to another browser. Import validates the file first, and merging preserves existing tasks. The final deliverables stay linked above the board."

## 4:15-4:40 - Design with a reason

Open **Accessibility**. Change text size to 125% or appearance to Light/Dark,
then point to **Why this design?** Avoid starting a long narration during the
timed pitch; demonstrate a short task reading only if the audio setup is ready.

"The design is explainable. Visible labels reduce the need to remember icons.
Colour is an extra cue, not the only one. People can enlarge text, choose a
palette or listen to a briefing. The guide documents each choice and its source.
These features have specific checks; I am not claiming a complete accessibility
certification or a measured psychological effect."

## 4:40-5:00 - Tradeoffs and close

"I built this as a solo project on the course starter. The competition workspace runs locally without an account. Optional cloud controls are a preview: database permissions are tested, while real-account email and cross-device acceptance remain open. The local assignee labels demonstrate handoffs and send no notification. Human accessibility evaluation is still needed."

"Relay: keep the work moving, keep the context."

## Before presenting

1. Open the deployed URL in the browser you will use on stage.
2. Export a backup if the workspace contains work you want to keep.
3. Restore demo data only after confirming that replacement is intended.
4. Add real links to the four deliverables. The repository's README, REPORT.md and this script can serve as documentation, report and pitch outline links.
5. Check clipboard copying in the presentation browser. If blocked, use the manual-copy dialog.
6. Have a text editor ready for the paste demonstration; never paste private context into a public screen.
7. Test a short narration with the room’s output device if you intend to demonstrate it. Voices and playback depend on the browser and operating system.
8. Set an appropriate appearance/text size for the projection; keep Accessibility available to show the choices.
9. Run a timed rehearsal and adapt the script. Record the actual date, duration and anything to improve below.

## Rehearsal record

Not yet rehearsed by James. Record an actual run here before claiming the PRD's rehearsal gate is complete.

## Demo recovery

- Clipboard denied: use the manual-copy dialog.
- Empty board: add a task or deliberately restore the sample workspace.
- Different browser: it has separate local storage; initialise and check it before the pitch.
- Network failure: run the local production preview from the already built project.
