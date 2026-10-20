import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** Demand-rendered, disposable scene. No perpetual background animation loop. */
export async function mountJournal(host, getState, onReady, onFailure) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    onFailure();
    return { update() {}, dispose() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.dataset.journalCanvas = "true";
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 50);
  camera.position.set(3.4, 5.7, 6.6);
  camera.lookAt(0, 0.15, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.7;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff3d4, 0x395b47, 1.2));
  const key = new THREE.DirectionalLight(0xfff0d5, 2);
  key.position.set(-3, 6, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd8ecd9, 1);
  fill.position.set(4, 2, -3);
  scene.add(fill);
  const group = new THREE.Group();
  scene.add(group);
  let disposed = false,
    frame = 0,
    last = 0,
    mixer,
    clip,
    model;
  let current = { open: 0.01, x: 0, y: 0 };
  const render = (now) => {
    frame = 0;
    if (disposed) return;
    const target = getState();
    if (!target.visible || document.hidden) {
      last = 0;
      return;
    }
    const dt = last ? Math.min((now - last) / 1000, 0.15) : 1 / 60;
    last = now;
    const ease = target.paused ? 1 : 1 - Math.exp(-dt * 7);
    current.open += (target.open - current.open) * ease;
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    if (mixer && clip)
      mixer.setTime(
        Math.min(clip.duration - 0.0001, current.open * clip.duration),
      );
    group.rotation.set(current.y * 0.08, -0.18 + current.x * 0.14, -0.06);
    if (model) model.position.x = current.open * 0.8;
    renderer.render(scene, camera);
    const unsettled =
      Math.abs(current.open - target.open) +
        Math.abs(current.x - target.x) +
        Math.abs(current.y - target.y) >
      0.0007;
    if (unsettled && !target.paused) frame = requestAnimationFrame(render);
    else host.dataset.settled = "true";
  };
  const update = () => {
    if (!disposed && !frame) {
      host.dataset.settled = "false";
      last = 0;
      frame = requestAnimationFrame(render);
    }
  };
  const resize = new ResizeObserver(() => {
    if (disposed) return;
    const { width, height } = host.getBoundingClientRect();
    if (width && height) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      update();
    }
  });
  resize.observe(host);
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else update();
  };
  document.addEventListener("visibilitychange", visibility);
  const lost = (event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
    onFailure();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  const disposeModel = (root) =>
    root?.traverse((o) => {
      o.geometry?.dispose();
      for (const material of Array.isArray(o.material)
        ? o.material
        : o.material
          ? [o.material]
          : [])
        material.dispose();
    });
  const dispose = () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resize.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    renderer.domElement.removeEventListener("webglcontextlost", lost);
    mixer?.stopAllAction();
    if (model) mixer?.uncacheRoot(model);
    disposeModel(model);
    environment.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
  try {
    const gltf = await new GLTFLoader().loadAsync("/models/relay-journal.glb");
    if (disposed) {
      disposeModel(gltf.scene);
      return { update, dispose };
    }
    model = gltf.scene;
    // Batch untextured meshes by material and parent, preserving all animated hinges.
    const batches = new Map();
    model.traverse((object) => {
      if (!object.isMesh || Array.isArray(object.material)) return;
      const key = `${object.parent.uuid}:${object.material.uuid}`;
      if (!batches.has(key)) batches.set(key, []);
      batches.get(key).push(object);
    });
    for (const objects of batches.values()) {
      if (objects.length < 2) continue;
      const geometries = objects.map((object) => {
        object.updateMatrix();
        let geometry = object.geometry.clone();
        if (geometry.index) {
          const original = geometry;
          geometry = original.toNonIndexed();
          original.dispose();
        }
        for (const name of Object.keys(geometry.attributes))
          if (!["position", "normal"].includes(name))
            geometry.deleteAttribute(name);
        return geometry.applyMatrix4(object.matrix);
      });
      const merged = mergeGeometries(geometries);
      if (merged) {
        const mesh = new THREE.Mesh(merged, objects[0].material);
        objects[0].parent.add(mesh);
        for (const object of objects) {
          object.removeFromParent();
          object.geometry.dispose();
        }
      }
      for (const geometry of geometries) geometry.dispose();
    }
    group.add(model);
    clip = gltf.animations[0];
    if (!clip) throw new Error("Journal animation is missing");
    mixer = new THREE.AnimationMixer(model);
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    current.open = getState().open;
    host.dataset.clip = clip.name;
    update();
    onReady();
  } catch {
    dispose();
    onFailure();
  }
  return { update, dispose };
}
