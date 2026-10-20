# Competition release scope

Subsequent authorised extension: Resume Capsules are now the main purpose.
CAPSULE_PLAN.md records the new build; CAPSULES.md explains operation and limits.
The earlier necessary-feature release below remains historical evidence, with
its existing functionality preserved. Unrelated optional suggestions stay deferred.

James narrowed the programme on 20 October 2026: finish necessary features and
checks, and skip unnecessary additions. This supersedes the commitment to build
all 75 suggestions in IMPLEMENTATION_PLAN.md. ROADMAP.md remains the historical
ledger; a deferred suggestion is not a missing release feature or a completion claim.

## Required release work

- Preserve the original PRD task/anchor flows, saved work and import compatibility.
- Finish browser acceptance of existing recovery, templates, context history,
  concise/detailed copying, wrap-up and accessibility preference backup features.
- Correct defects in persistence, keyboard/focus handling, validation, readable
  layouts and speech controls that prevent people using the current product.
- Retain the original Blender journal and accessible motion controls; verify the
  current UI with reduced motion, narrow layouts, alternate display settings and
  automated accessibility checks.
- Run lint, unit/browser regression checks and production build, then publish and
  verify the final GitHub/Vercel release. Keep design rationale and demo/report
  claims consistent with actual behaviour.
- Identify optional cloud controls as a preview until actual email delivery and
  real-account/device acceptance are recorded. Local PRD flows must work without
  an account. Do not enable paid services.
- Provide a concise human demo/screen-reader checklist. Prepared instructions are
  not evidence of real user testing, screen-reader evaluation or a rehearsed pitch.

## Removed from the current build commitment

AI assistance, additional interface languages, calendar/timeline views,
subtasks/dependencies, priorities/manual ordering, attachment storage, multiple
project management UI, GitHub integration, installable offline app, saved filter
presets/shareable URLs, expanded onboarding, and further visual feature additions.
Existing useful controls stay; no new service or framework migration is required
merely to implement an optional suggestion. Development dependency findings remain
documented separately from runtime exposure.

## Release rule

Close only requirements supported by recorded checks. Record genuine limitations
without presenting them as complete. An engineering release does not certify
accessibility or substitute for James's own rehearsal.

## Acceptance evidence

- `e2e/workspace.spec.js`: 13 core migration, storage, draft, conflict, clipboard,
  import, accessibility and guide/presentation workflows.
- `e2e/motion.spec.js`: 5 real-renderer, navigation, pause, fallback, reduced-motion
  and mobile workflows, including the original animated Blender asset.
- `e2e/finalisation.spec.js`: 12 recovery, preference, handoff/history/template,
  validation/focus, voice-policy, narrow text-spacing/forced-colour and PRD flows.
- `tests/*.test.js`: 48 unit cases, including exact raw-data preservation without
  account tokens, voice-selection privacy, model validation and recovery failures.
- Shared design rationale is regenerated from `src/designRationale.js`. CI checks
  generated output, lint, units, production build and the browser suite.
- Current deployment/check status belongs to the release commit's GitHub checks;
  REPORT.md records the local checks and their limits.

## James's final presentation checks

1. In the actual presentation browser, download a backup and check the four real
   deliverable destinations. Run the task → copy → paste demonstration using
   non-private sample context.
2. Test the room's audio only if demonstrating narration; keep the manual-copy
   fallback ready. Automated tests do not prove the projector or speaker setup.
3. Rehearse PITCH.md once with a timer and record the real duration. User studies
   and NVDA/VoiceOver evaluation remain unperformed unless actually undertaken.

These personal checks are separate from completing the software release.
