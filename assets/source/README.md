# Original Relay journal

Created specifically for this project with Blender 4.5.9 LTS and the original procedural modelling script `create_journal.py`. No stock models, image textures, animations or external artwork are included. The existing Relay linked-square emblem is modelled as foil rails. Blender's bundled Bfont is converted to geometry for the cover and page lettering.

- `relay-journal.blend`: editable native scene, materials, cover/page hinge keyframes, poster camera and lighting.
- `create_journal.py`: reproducible construction, GLB export and transparent WebP poster render.
- `../../public/models/relay-journal.glb`: self-contained 727,188-byte glTF 2.0 model, 49 authored meshes, one `OpenJournal` animation with five rotation channels (cover and four page hinges).
- `../../public/models/relay-journal-poster.webp`: lightweight real Blender render for reduced motion, failed WebGL/model loads, forced colours and save-data preferences.

Rebuild from the repository root with a local Blender installation:

```sh
blender --background --factory-startup --python assets/source/create_journal.py
```

This deliberately regenerates the named Relay model, poster and native source scene. Blender and its downloaded archive are development tools outside the repository. The original download was checked against Blender's published SHA256. Native source files are excluded from Vercel uploads; only the runtime model and poster are shipped in the site.

At runtime, Three.js loads the GLB on demand, batches compatible static meshes without merging animated hinges, and seeks the original exported clip using damped interaction progress. There is no continuous idle animation. Cover/page movement therefore remains editable in Blender. The web layer supplies lighting, camera response, resource management and the functional chapter navigation.

References: [Blender 4.5 LTS](https://www.blender.org/releases/4-5/), [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [AnimationMixer](https://threejs.org/docs/pages/AnimationMixer.html).
