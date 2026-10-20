# Resume Capsules

Relay's main purpose is preserving the stopping point of a team or solo coding
session so the next session has a clear place to take off. This extension was
explicitly requested after the earlier necessary-feature release.

## First session

1. Open Relay. Capsules is the initial view. Existing tasks are retained below;
   Task board and Focus desk remain available in navigation.
2. Select Create a Resume Capsule in the hero or Create capsule in the landing
   area. Try an example draft provides fictional notes without saving a capsule.
3. Add a recognisable title. Paste team notes or drop/load one plain .txt/.md
   file. Names are optional context, not invitations or account identities.
4. Use headings from notes optionally copies recognised headings into empty
   sections. Original notes stay intact. It does not generate or interpret text.
5. Shape Goal, Decisions, Tried/rejected, What works, Next step, How to verify and
   Risks/unknowns. Goal and Next step are required; other unknowns stay explicit.
   Optionally link a task. Saving a capsule does not edit that task.
6. Record a repository label, revision, relevant files and up to 12 evidence
   items. Outcomes are Not run, Reported pass/failure or Blocked. Name each item;
   describe the actual result for any outcome other than Not run.
7. Preview the curated handoff and Save capsule. Save draft at any step keeps an
   unfinished version across reloads. Typing alone does not persist this editor;
   dirty-close/reload warnings and explicit save feedback explain this boundary.

## Returning

Open a saved capsule. Take off here shows the next action and goal first. Enter
the current revision from the same repository to compare with the recorded one.
Different strings mean recheck earlier evidence; matching strings are not proof
that tests passed. Missing revisions stay unknown. Relay never inspects code.

Review the selectable handoff, then copy it or download Markdown. Original notes
are excluded from that text until selected. Download full capsule always includes
the original notes and reported evidence, so review private material first.
Paste into your preferred AI tool; Relay does not read chats, send messages,
execute commands or detect completed work.

Start next session from this capsule creates a continuation draft carrying its
parent ID. Edit the next action and newly observed results, then save a new
snapshot. The earlier capsule remains unchanged. Linked tasks open only if they
still exist; missing tasks never invalidate the historical snapshot.

Continuation carries check names/commands, but resets outcomes to Not run and
clears result text. Earlier passes stay with the original snapshot; they cannot
silently become claims about the new session. Revision matching uses exact text
after trimming, including case, and assumes both values refer to the same repo.

## Persistence, portability and recovery

Capsules and one saved capsule draft are optional project fields in the existing
version-3 envelope, preserving legacy workspaces. Complete backups, explicit
cloud uploads and raw recovery include them. Cloud stays preview; its existing
real-account/device acceptance limits are unchanged. No paid service was added.

Import capsule JSON previews the full content before committing. Identical IDs
are idempotent; different content using the same ID rejects instead of overwriting.
Workspace merges add new capsules and preserve the current saved draft. A
conflicting capsule aborts the merge; the user can choose full replacement only
through the existing explicit backup-replacement flow.

Removal has confirmation, Undo and workspace recovery. Retention is bounded:
40 capsules/project, 40,000 raw-note characters, 10,000/section, 12 evidence items,
450 KB/record and 500 KB/import file. Total browser storage can be reached sooner.
Notes files are at most 160 KB. Keep downloaded backups; clearing site data also
removes saved capsules and drafts. Unsaved editor text is not in a backup.

## Design and acceptance

The shared register entry `capsules` explains sequence, first-use guidance,
immutable history, evidence labels, privacy opt-in, text limits, controls,
validation, focus and responsive layout. The three-step sequence and productivity
benefit are design intentions, not measured human outcomes.

`tests/capsules.test.js` checks data boundaries, extraction, provenance, honesty,
freshness, imports, merge compatibility, failed writes and Undo.
`e2e/capsules.spec.js` checks real first-use, capture, saved drafts/reload,
continuation, reported evidence, exact sharing, file imports/exports, errors,
recovery, keyboard focus, 200% mobile reflow and scoped axe results.
Observed final results are recorded in REPORT.md after verification.
