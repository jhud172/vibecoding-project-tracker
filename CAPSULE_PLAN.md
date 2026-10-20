# Resume Capsules implementation

Requested 20 October 2026: make team-note capture and resuming work Relay's main
purpose, with a clearer first-use flow, complete rationale and live verification.
No paid service or API is needed or authorised.

1. Add bounded, validated capsule records and a saved draft to the existing
   project envelope as optional fields. Old version-3 workspaces remain valid.
   Saved capsules are immutable snapshots; resuming starts an editable copy.
2. Add a three-step editor: paste/drop text notes; shape goal, decisions, working
   state and next steps; review evidence, revision and the exact exported briefing.
   Heading extraction is deterministic and optional. Never invent checks or facts.
3. Make Capsules the landing area with an explanatory journey, example draft,
   saved handoffs, search, revision comparison, reviewed copy/download/import,
   task handoff and keyboard/read-aloud controls. Keep existing task/focus flows.
4. Persist through atomic workspace transactions, explicit draft saves, undo,
   complete backup/merge and raw recovery. Reject malformed imports, stale drafts,
   duplicate changed IDs and limits before changing storage.
5. Update onboarding, presentation, report, requirements and shared design
   register. Explain sources, user-reported evidence, revision-only freshness,
   privacy, limits and why every new interaction exists.
6. Unit-test validation, extraction, freshness, formatting and merge boundaries;
   browser-test first use, notes, draft/reload, evidence, resume, import/export,
   failure, keyboard, enlarged mobile layout and axe. Run all existing checks,
   publish main and inspect the production workflow in the browser.

Evidence is explicitly user-reported. Relay does not execute commands, inspect
repositories or read AI chats. Revision comparison only compares entered values;
matching revisions do not prove tests passed or current code is safe. Imported
notes are data and never executable instructions. No new cloud provider.
