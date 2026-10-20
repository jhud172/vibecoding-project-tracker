# Relay justification audit

Reviewed 20 October 2026 against the implemented necessary-feature release.
The earlier request to avoid optional product expansion remains in force. This
work completes explanations and makes the existing guide inspectable; it does
not reintroduce the deferred 75-item feature programme.

## Audit result

The previous guide was incomplete as a full justification record. Its main
principles and component-family reasons were present, but it lacked a consistent
need/choice/reason/basis/access/trade-off/evidence register and a checkable source
inventory. Several statements also lagged behind the Blender extension.

The completed register is published at
[Why this design?](https://relay-jhud172.vercel.app/design.html#register), generated
into DESIGN_RATIONALE.md and maintained in `src/designInventory.js`.

| Audited scope | Result |
|---|---|
| Implemented decision families | 30 structured explanations |
| Named function/class UI components in current `src/*.jsx` | 33 mapped to reasons |
| Referenced Lucide symbols, including those in retained legacy source | 41 mapped, with specific uses explained |
| Shipped `public/` image/model assets | All 3 mapped: vector identity, original animated GLB, Blender-rendered WebP |
| Public HTML pages | All 3 mapped: workspace, design guide, presentation |
| CSS decoration and motion | Hero grid/orbits/shadow, paper edges, Focus ring, radii/borders/depth, pointer/press/entrance/chapter behaviour explained |
| Numerical choices | Typography/spacing families, motion timings, text presets, thresholds, reading/storage/retention limits identified as chosen compromises |
| Optional cloud UI | Account/sync/comments/permissions reasons included with real-account acceptance limits |

Repeated control instances inherit the explanation of their component and
semantic role. The register does not invent a separate psychological effect for
every CSS declaration or claim a numerical value is scientifically optimal.

## Gaps corrected

- Replaced the stale claim that the Focus ring was the only ornament. The guide
  now accounts for the original journal, cover/page geometry, seven material
  roles, foil/emblem, ribbon, printed decoration, poster and other CSS artwork.
- Corrected the blanket 44px target claim to distinguish the shared 44px aim
  from compact exceptions such as the 32px journal pause control.
- Corrected the enlarged-layout threshold from “above 150%” to “150% and above”.
- Qualified the text-size claim: normal task metadata and decorative microtype
  are different roles. Increased the interactive 3D retry text from .7rem to
  .75rem for consistency with the regular small-label scale.
- Corrected the older design-system statement denying all automatic decoration:
  bounded card entrances are automatic when allowed; perpetual loops are absent.
- Added explicit reasons and trade-offs for drafts, quotas/snapshots, conflict
  choices, preference opt-ins, raw recovery, version comparison, speech privacy,
  waiting/failure states, cloud roles/comments and presentation navigation.
- Added per-entry narration because whole-guide speech is capped at 12,000
  characters. Search, result/empty states and native disclosures make the longer
  reference navigable. Inventory links clear filtering and focus the opened
  explanation.
- The new enlarged-text check exposed long definition-list text overflowing on
  Linux. A wider Verdana fallback reproduced it locally. Extended the existing
  word-wrapping rule to definition labels/descriptions and disclosure summaries;
  the focused guide checks pass locally with default and wider fonts at 200%.
  Text wraps rather than being clipped or reduced in size.

## Evidence and limits

`npm run docs:check` reports 30 explanations, 33 declared components, 41 referenced
Lucide symbols, 3 public assets and 3 pages. It checks required explanation
fields, implementation paths, source links, individual narration length,
missing/stale component/icon/asset/page entries. The generator runs the same
check and produces the repository rationale from the live guide's shared data.
CI already rejects a generated-document mismatch.

This is a static inventory guard using the repository's current named
function/class and import conventions. It does not infer purpose from code,
judge whether a reason is convincing, catch every possible future anonymous or
dynamically loaded component, or certify every runtime/visual state. New inline
elements, CSS changes, anonymous components or external assets still require
manual rationale review within their parent component's scope.

Local Windows verification passed:

- Design generation/source coverage, ESLint and whitespace checks.
- The design/presentation navigation and axe workflow.
- A register workflow covering text/icon search, no-results/clear, keyboard
  disclosure, complete individual narration through a deterministic local-voice
  fixture, filtered inventory-link navigation/focus, and 390px reflow at 200%
  text with axe checks in the tested states.
- The existing model-failure/poster/retry and redesigned-mobile-hero workflows.
- Manual browser inspection of the rendered register, a filtered Blender entry
  and its complete need/choice/reason/basis/access/trade-off/evidence content.

These checks verify specific behaviour and documentation coverage. They do not
prove a psychological benefit, reduced cognitive load, improved productivity,
audible output quality, successful human handoffs or complete WCAG conformance.
Real user studies, NVDA/VoiceOver evaluation and James's rehearsal remain
unperformed unless separately recorded. Cloud email/device acceptance remains
open and is not hidden by a rationale entry.

## Sources

The live guide and generated rationale link each entry to the relevant primary
W3C/WAI or MDN guidance, or Nielsen Norman Group's original usability heuristics.
Animation, reflow, focus order, consistent identification, input-error and status
message guidance were read for this audit. The Vercel interface checklist was
also reviewed as engineering guidance. A guideline supports a principle; the
specific styling, durations, materials and presets remain design judgments.

## Maintenance

For a changed component or asset, update its register entry before publication.
Add missing inventory mappings, name the actual need/reason and access trade-offs,
and cite only guidance that supports the principle. Record observed checks with
their scope. Run `npm run docs:design`, `npm run lint` and relevant rendered
verification. Do not replace an untested expectation with a fabricated result.
