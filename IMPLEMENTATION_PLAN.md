# Relay complete improvement programme

Owner: James Hudson. Goal created 20 October 2026. Baseline: a227405.

James explicitly requested implementation and finalisation of the entire 75-item
roadmap. This authorises the extensions previously identified as requiring a PRD
scope decision, including additional task metadata and future connected services.
Preserve existing Task/Anchor fields and migrate user data rather than resetting
it. Paid services, security-sensitive grants and credentials still require the
applicable user action; never publish credentials or pretend a disconnected
service works. No additional human teammates are to be invented.

## Delivery order

1. Recoverable atomic workspace storage, tab-conflict protection, drafts,
   persistent undo/redo, trash, snapshots, safe imports and backup visibility.
2. Extract state/UI boundaries; structured briefings, context comparisons,
   previews, templates, export controls and session wrap-up.
3. Onboarding, persistent/shareable views, filtering/sorting, inline edits,
   search highlighting and progressive accessibility settings.
4. Extend metadata for priorities, ordering, subtasks, dependencies, blockers,
   multiple projects, timelines, attachments and GitHub references.
5. Failure-path/browser automation, CI, accessibility validation, performance,
   error recovery, privacy/history controls and dependency maintenance.
6. Installable offline delivery, language support and connected accounts/sync,
   collaboration and optional AI assistance with explicit service configuration.
7. Complete demo/guide/pitch documentation and record independent human testing,
   assistive-technology evaluation and James's actual rehearsal when performed.

## Completion rule

An item is complete only when its actual behaviour is present and its relevant
verification is recorded in ROADMAP.md. Built controls with no working backend
are not completed integrations. Prepared test scripts are not completed user
studies. Every visual/interaction change needs an entry in the shared design
rationale. Finalisation includes production verification and migration checks.

## Validation and rollout

- Exercise legacy migration, invalid/corrupt data, quota failure, atomic writes,
  tab conflicts and recovery with deterministic storage/controller tests.
- Keep Task/Anchor compatibility and old backup imports; version new envelopes.
- Automate real browser workflows and axe checks, with documented manual limits.
- Measure realistic large data and rendered layouts before performance claims.
- Test keyboard, resizing, light/dark/alternate palettes and speech controls.
- Publish only tested increments; keep existing production data recoverable.
- Use James/complete-roadmap for this programme. Record dependencies and next
  actions durably so work continues across context/turn boundaries.
