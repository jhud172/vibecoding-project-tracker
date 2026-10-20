# Relay improvement ledger

Baseline a227405. Historical ledger of 75 suggestions. James has narrowed the
release to necessary work; [FINALISATION.md](FINALISATION.md) defines the current
scope. Status is evidence-based; deferred or planned is not complete.

| ID | Area | Improvement | Status / evidence |
|---|---|---|---|
| 01 | Competition | Test with real users | Planned; requires actual human participation |
| 02 | Accessibility | Evaluate complete workflows with NVDA and VoiceOver | Planned; requires actual human participation |
| 03 | Reliability | Prevent conflicting edits across browser tabs | Verified in Chromium: stale task draft rejected; latest saved task preserved. Web Locks plus revision checks; older-browser lock fallback documented. |
| 04 | Reliability | Recover unfinished task drafts | Verified: autosave, reload, explicit recovery and save. Per-editor keys prevent draft overwrites. |
| 05 | Engineering | Automate browser regression workflows | Verified: 13 production-build Chromium/axe workflows pass; e2e/workspace.spec.js. |
| 06 | Engineering | Run tests/build in GitHub CI | Verified on Linux/Node 24: install, lint, unit tests, generated-doc check, production build and all 13 browser checks pass. [Run](https://github.com/jhud172/vibecoding-project-tracker/actions/runs/39418101856). |
| 07 | Competition | Create a clearly labelled before/after demo workspace | Planned |
| 08 | Human evaluation | Complete an actual timed rehearsal | Planned; requires actual human participation |
| 09 | Reliability | Persist recoverable workspace snapshots | Verified: bounded persistent history; browser reload, Restore version and undoing that restoration pass in e2e/finalisation.spec.js. |
| 10 | Reliability | Multiple undo and redo steps | Verified: persistent stacks, reload, redo and invalidation after a new mutation. |
| 11 | Reliability | Recover deleted tasks | Verified: delete, reload and restore original task. |
| 12 | Reliability | Snapshot before imports and demo resets | Verified: import/undo and confirmed demo reset preserve the prior task/link state across reload and Undo. |
| 13 | Reliability | Prevent partially saved workspace operations | Verified: one-key transaction and injected failed save retain prior complete state. |
| 14 | Reliability | Display storage usage | Implemented in Recovery, explicitly an approximate browser-storage estimate. |
| 15 | Reliability | Display last backup and contextual reminders | Partial: last download request recorded and storage-budget notices; contextual reminder flow remains. |
| 16 | Reliability | Optional access-preference export/import | Verified: download opt-in, import opt-in, theme/palette/text persistence after reload, and failed preference save retaining current settings with an explicit warning. |
| 17 | Reliability | Inspect individual import conflicts | Verified: invalid file rejected, changed-task preview, explicit conflict choice, merge and Undo. |
| 18 | Reliability | Recover/export corrupt stored data | Verified protection against rewriting damaged data; raw download and confirmed empty recovery implemented. |
| 19 | Handoffs | Structured briefing editor | Verified: section edits preserve introductory prose and unknown headings; unit/browser checks. |
| 20 | Handoffs | Live Markdown preview | Verified supported subset renders without executing HTML or unsafe links; browser check. |
| 21 | Handoffs | Compare context versions | Verified: browser history after reload identifies removed/added lines against the current draft. Line-presence limitations remain explicit. |
| 22 | Handoffs | Restore individual context passages | Verified: selected passage appends to the draft, preserves unrelated context, and changes saved data only on Save. |
| 23 | Handoffs | Use accurate presence-check wording | Verified labels state text thresholds/populated sections and disclaim quality judgment. |
| 24 | Handoffs | Research/access/deployment/pitch templates | Verified: all seven built-in templates append exactly without replacing existing context, save and survive reload. |
| 25 | Handoffs | Custom reusable briefing templates | Verified: save template, save task, reload and recover template; validator tests pass. |
| 26 | Handoffs | Concise/detailed briefing export | Verified: both visible previews match their exact copied text through the browser Clipboard API fixture; clipboard denial has a manual-copy workflow. |
| 27 | Handoffs | Handoff preview with owner/next action/verification | Verified preview includes edited next action; missing sections stated explicitly. |
| 28 | Handoffs | Session wrap-up flow | Verified: progress/action/check/risk edits preserve free text and selected recovered passages, save and survive reload with task identity unchanged. |
| 29 | Usability | Optional three-step introduction | Planned |
| 30 | Usability | Explicit empty/sample workspace choice | Verified first-use sample choice manually; empty data remains empty in unit tests. |
| 31 | Usability | Remember preferred view and layout | Planned |
| 32 | Usability | Shareable view/filter URLs without task context | Planned |
| 33 | Usability | Due/creation/title/handoff sorting | Planned |
| 34 | Usability | Saved filter presets | Planned |
| 35 | Usability | Distinct empty/no-results guidance | Planned |
| 36 | Usability | Inline title/deadline editing | Planned |
| 37 | Usability | Consistent external-link announcements | Planned |
| 38 | Usability | Search-result highlighting by field | Planned |
| 39 | Accessibility | Progressive settings groups | Planned |
| 40 | Human evaluation | Validate design intentions with users | Planned; requires actual human participation |
| 41 | Accessibility | 400% browser zoom and narrow reflow | Planned |
| 42 | Accessibility | OS forced-colour evaluation | Partial: Chromium forced-colour emulation plus text spacing at 320px passes the create-task/axe check. Actual OS evaluation is unperformed. |
| 43 | Accessibility | User text-spacing resilience | Verified scoped workflow: 1.5 line height, .12em letters, .16em words and 2em paragraph spacing at 320px; tested task editor/page have no horizontal overflow. Other human/device checks unperformed. |
| 44 | Accessibility | Specific validation errors and invalid-field focus | Verified for task-title and unsafe deliverable-URL failures: associated error text, aria-invalid and affected-field focus; data validators cover remaining task fields. |
| 45 | Accessibility | Focus after delete/filter/import actions | Partial: deleted trigger falls back to workspace focus, clearing filters focuses search, native dialog return remains; broader import permutations unperformed. |
| 46 | Accessibility | Rendered interaction-state contrast evaluation | Planned |
| 47 | Accessibility | Highlight current spoken passage | Planned |
| 48 | Accessibility | Read individual briefing sections | Implemented section-specific Read aloud controls using existing tested narration lifecycle; audible device check remains. |
| 49 | Accessibility | Prefer local device voices with explicit online choice | Verified policy/unit/browser fixture: automatic uses local only, absence shows guidance, online/browser-default requires a choice. Windows local engine emitted Reading during manual verification; audible quality unclaimed. |
| 50 | Accessibility | Cross-browser speech failure/interrupt evaluation | Planned |
| 51 | Accessibility | Compact keyboard reference | Planned |
| 52 | Accessibility | Detailed device/browser/test evidence record | Planned |
| 53 | Engineering | Split workspace state and UI components | Partial: storage, drafts, briefing tools, transfer, recovery and cloud panels extracted; remaining App decomposition planned. |
| 54 | Engineering | Static checking and linting | Verified ESLint 10 recommended rules and Hooks rules; CI configured. |
| 55 | Performance | Measure realistic large boards/history | Planned |
| 56 | Performance | Measure loading/responsiveness/layout stability | Planned |
| 57 | Performance | Measured loading of secondary features | Partial: cloud panel/SDK split into a separate 62 KB gzip chunk; startup cloud-request absence verified. Broader performance work remains. |
| 58 | Reliability | Recoverable application error screen | Verified: injected render dependency failure reaches the real boundary, downloads original saved strings and reloads into preserved tasks. Optional cloud uses the same boundary class. |
| 59 | Reliability | Deliberate storage/clipboard/import/speech failures | Storage, clipboard, invalid imports and stale/corrupt data pass browser checks; speech engine failures pass unit checks. Wider browser coverage remains. |
| 60 | Privacy | Optional likely-secret detection before sharing | Planned |
| 61 | Privacy | Selective briefing export | Planned |
| 62 | Privacy | History retention controls | Planned |
| 63 | Engineering | Review and address dependency findings | Audit reviewed: runtime dependencies have no reported findings; seven Tailwind 3 build-chain findings remain and require tooling migration. |
| 64 | Project management | Priorities and manual ordering | Planned |
| 65 | Project management | Subtasks and dependencies | Planned |
| 66 | Project management | Blocked tasks and explanations | Planned |
| 67 | Project management | Multiple projects/workspaces | Planned |
| 68 | Project management | Calendar and timeline views | Planned |
| 69 | Project management | Attachments/screenshots/evidence | Planned |
| 70 | Integrations | GitHub issue/commit/PR references | Planned |
| 71 | Offline | Installable app with reliable offline launch/update | Planned |
| 72 | Connected services | Accounts and cross-device synchronisation | Partial: dedicated Free project, auth UI and explicit cloud version upload/preview/load implemented. Real email and cross-device acceptance remain; see CLOUD.md. |
| 73 | Connected services | Collaboration/comments/permissions/conflict resolution | Partial: schema, owner/editor/viewer policies, comments/sharing UI and stale-save guards implemented. Database isolation/role checks pass with rolled-back fixtures; real-account UI checks remain. |
| 74 | Connected services | Optional previewed AI briefing assistance with data/cost controls | Planned |
| 75 | Internationalisation | Additional interface languages and narration choices | Planned |

## Current work

James has since narrowed the release to necessary features and final checks.
[FINALISATION.md](FINALISATION.md) supersedes the original all-75 build commitment.
Planned suggestions above remain a historical record and are not all required for
this release. Removed scope is not counted as implemented.

User-authorised motion/3D extension: original Blender journal, cover plus four page hinges, on-demand Three.js scene, functional focus-chapter navigation, tactile hover/press, dialog and page transitions. Editable .blend and generation script are included. Reduced-motion and fallback checks are part of e2e/motion.spec.js. This extension does not replace the unfinished original roadmap items.

Release checks and scope decisions are recorded in FINALISATION.md and REPORT.md.
This ledger distinguishes verified behaviours, scoped checks, historical
suggestions and unfinished external/human acceptance gates.
