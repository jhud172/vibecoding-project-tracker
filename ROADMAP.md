# Relay improvement ledger

Baseline a227405. All 75 requested improvements remain in scope. Status is evidence-based; planned is not complete. See IMPLEMENTATION_PLAN.md for dependency order.

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
| 09 | Reliability | Persist recoverable workspace snapshots | Implemented with bounded persistent history; unit/reload tests pass. Restore-version UI final check pending. |
| 10 | Reliability | Multiple undo and redo steps | Verified: persistent stacks, reload, redo and invalidation after a new mutation. |
| 11 | Reliability | Recover deleted tasks | Verified: delete, reload and restore original task. |
| 12 | Reliability | Snapshot before imports and demo resets | Implemented in atomic transactions; import/undo browser check passes. Demo-reset final check pending. |
| 13 | Reliability | Prevent partially saved workspace operations | Verified: one-key transaction and injected failed save retain prior complete state. |
| 14 | Reliability | Display storage usage | Implemented in Recovery, explicitly an approximate browser-storage estimate. |
| 15 | Reliability | Display last backup and contextual reminders | Partial: last download request recorded and storage-budget notices; contextual reminder flow remains. |
| 16 | Reliability | Optional access-preference export/import | Implemented opt-in bundle preferences; validated roundtrip unit test passes; UI preference restoration check remains. |
| 17 | Reliability | Inspect individual import conflicts | Verified: invalid file rejected, changed-task preview, explicit conflict choice, merge and Undo. |
| 18 | Reliability | Recover/export corrupt stored data | Verified protection against rewriting damaged data; raw download and confirmed empty recovery implemented. |
| 19 | Handoffs | Structured briefing editor | Verified: section edits preserve introductory prose and unknown headings; unit/browser checks. |
| 20 | Handoffs | Live Markdown preview | Verified supported subset renders without executing HTML or unsafe links; browser check. |
| 21 | Handoffs | Compare context versions | Implemented line-presence comparison with explicit limitations; pure comparison test passes; final UI history check pending. |
| 22 | Handoffs | Restore individual context passages | Implemented append-to-draft paragraph controls; final UI history check pending. |
| 23 | Handoffs | Use accurate presence-check wording | Verified labels state text thresholds/populated sections and disclaim quality judgment. |
| 24 | Handoffs | Research/access/deployment/pitch templates | Implemented additive templates; rendered in task editor. |
| 25 | Handoffs | Custom reusable briefing templates | Verified: save template, save task, reload and recover template; validator tests pass. |
| 26 | Handoffs | Concise/detailed briefing export | Implemented preview/copy; concise ownership/action/check and legacy prose tested. Final clipboard checks for both modes remain. |
| 27 | Handoffs | Handoff preview with owner/next action/verification | Verified preview includes edited next action; missing sections stated explicitly. |
| 28 | Handoffs | Session wrap-up flow | Implemented draft-based progress/action/check/risk editor; final end-to-end check remains. |
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
| 42 | Accessibility | OS forced-colour evaluation | Planned |
| 43 | Accessibility | User text-spacing resilience | Planned |
| 44 | Accessibility | Specific validation errors and invalid-field focus | Planned |
| 45 | Accessibility | Focus after delete/filter/import actions | Planned |
| 46 | Accessibility | Rendered interaction-state contrast evaluation | Planned |
| 47 | Accessibility | Highlight current spoken passage | Planned |
| 48 | Accessibility | Read individual briefing sections | Implemented section-specific Read aloud controls using existing tested narration lifecycle; audible device check remains. |
| 49 | Accessibility | Prefer local device voices with explicit online choice | Planned |
| 50 | Accessibility | Cross-browser speech failure/interrupt evaluation | Planned |
| 51 | Accessibility | Compact keyboard reference | Planned |
| 52 | Accessibility | Detailed device/browser/test evidence record | Planned |
| 53 | Engineering | Split workspace state and UI components | Partial: storage, drafts, briefing tools, transfer, recovery and cloud panels extracted; remaining App decomposition planned. |
| 54 | Engineering | Static checking and linting | Verified ESLint 10 recommended rules and Hooks rules; CI configured. |
| 55 | Performance | Measure realistic large boards/history | Planned |
| 56 | Performance | Measure loading/responsiveness/layout stability | Planned |
| 57 | Performance | Measured loading of secondary features | Partial: cloud panel/SDK split into a separate 62 KB gzip chunk; startup cloud-request absence verified. Broader performance work remains. |
| 58 | Reliability | Recoverable application error screen | Implemented root/optional-cloud boundaries with raw recovery download and reload; induced render-failure check remains. |
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

User-authorised motion/3D extension: original Blender journal, cover plus four page hinges, on-demand Three.js scene, functional focus-chapter navigation, tactile hover/press, dialog and page transitions. Editable .blend and generation script are included. Reduced-motion and fallback checks are part of e2e/motion.spec.js. This extension does not replace the unfinished original roadmap items.

Storage/recovery and handoff increments pass 46 unit tests and 18 browser tests. Lint and production build pass. The remaining roadmap is still active; this ledger deliberately distinguishes implementation, observed checks and unfinished acceptance gates.
