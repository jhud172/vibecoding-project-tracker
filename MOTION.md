# Relay: the open journal

The 20 October 2026 visual extension follows the user's request for substantially richer animation, immersive depth and an original Blender asset. It preserves the context-first workflow and all existing saved workspace data. Detailed rationale is published in the design guide and DESIGN_RATIONALE.md.

## What moves and why

| Surface | Behaviour and purpose |
|---|---|
| Original 3D journal | A hinged hardcover and four staggered page turns connect the board overview to the Focus desk chapter. The book is authored in Blender, exported with real animation channels, and played by seeking that exported clip. |
| Journal perspective | A small bounded pointer response reveals depth. Pointer exit returns to rest; there is no endless floating or camera movement. |
| Board / Focus desk | A perspective page transition gives a spatial cue when work mode changes. Repeated navigation skips the previous transition. Unsupported browsers navigate directly. |
| Task cards | Brief bounded entrances distinguish newly mounted work; hover lift and a passing highlight indicate that a card can be opened. Stage menus remain the keyboard alternative. |
| Metrics and deliverables | Hover lift and stacked-paper edges group related information and indicate actionability without shifting the surrounding layout. |
| Buttons | Short lift and press responses acknowledge pointer input; focus rings remain independently visible for keyboard use. |
| Dialogs | A short page-opening entrance establishes the top layer; a softened backdrop separates the current task from the board. Native dialog focus and Escape handling remain in place. |
| Hero typography and depth | A framed chapter layout, faint grid/orbit lines and contact shadow establish hierarchy. Decorative text/art does not carry task status or replace semantic content. |

## Source and runtime

Editable original: `assets/source/relay-journal.blend`. Rebuild script: `assets/source/create_journal.py`. See assets/source/README.md for provenance and reproduction. No stock models or image textures are used.

The self-contained GLB is 727,188 bytes. A small transparent WebP rendered in Blender provides the fallback. Three.js and its scene are dynamically loaded after the first paint/local initialization when the journal is near the viewport. The renderer remains a separate, approximately 162 KB gzip JavaScript chunk rather than part of the primary application bundle; the build appropriately reports it as a large optional chunk. Compatible static meshes are batched by parent/material while animated hinges remain separate. Pixel ratio is capped at 1.25. Geometry, materials, environment and the renderer are disposed when the scene is removed.

Rendering runs during movement and stops after settling, when the document is hidden or when the journal leaves the viewport. Pausing snaps future pose changes without interpolated 3D motion. This avoids perpetual idle GPU work. It is not a claim of a fixed frame rate on every computer; performance depends on the browser, graphics support and device.

## Access and fallback

The journal is decorative and hidden from assistive technology. Its chapter action and pause control are ordinary labelled buttons; the same board and Focus desk controls remain elsewhere. OS and saved in-app reduced-motion preferences skip the renderer and animated model, disable CSS choreography and retain direct navigation. Save-data and forced-colour preferences also use the poster. A failed model load retains the image, working navigation and an explicit retry control. Enlarged text and narrow screens stack the hero rather than forcing horizontal scrolling.

`tests/journal.test.js` checks the actual GLB format, bounded size, self-contained buffers and changing cover rotation keyframes. `e2e/motion.spec.js` exercises real WebGL rendering and changed rendered pixels, chapter navigation, pausing, idle frame scheduling, OS/in-app reduced motion, failed model loading and mobile accessibility. These checks supplement the existing workspace regression suite. Full human assistive-technology evaluation remains part of the wider roadmap.

At 150% text and above, the artwork gets a bounded area followed by a naturally sized caption/control block. The pause button moves above it, and decorative orbits/shadow are removed. This prevents enlarged labels from overlapping the book or each other.
