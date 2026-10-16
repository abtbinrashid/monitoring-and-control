/* ==========================================================================
   main.js — studio viewer for a glTF car model.

   Drop a model at  assets/models/car.glb   (or a Sketchfab glTF folder at
   assets/models/car/scene.gltf) and it is loaded, centred, scaled to real
   size and lit automatically.  See README.md.
   ========================================================================== */

import * as THREE from "three";
import { OrbitControls }  from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader }     from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader }    from "three/addons/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

/* where to look for a model, in order of preference */
const SOURCES = [
  "assets/models/car.glb",
  "assets/models/car/scene.gltf"     /* an unpacked Sketchfab folder */
];

const TARGET_LENGTH = 5.3;          /* metres — model is scaled to this      */
const MODEL_YAW     = 0;            /* turn the car: 0, 90, 180 or 270        */

const canvas    = document.getElementById("view");
const status    = document.getElementById("loading");
const loadFill  = document.getElementById("loadFill");
const loadPct   = document.getElementById("loadPct");
const loadLabel = document.getElementById("loadLabel");

/* Uncompressed size of car.glb. Needed because the server sends the file
   gzipped: Content-Length is then the COMPRESSED size while xhr.loaded counts
   DECOMPRESSED bytes, so loaded/total runs way past 100%. Update this if the
   model is replaced - it is only used to show progress, never to load.      */
const EXPECTED_BYTES = 17416816;

/* The bar is animated frame by frame rather than being set straight from the
   download figure. Two reasons: a cached load would otherwise snap from 0 to
   100 with nothing to see, and the number and the bar can never disagree
   because both are painted from the same value.                             */
let targetPct = 0;      /* where the download actually is  */
let shownPct  = 0;      /* where the bar is drawn          */
let modelReady = false;
let finished   = false;

function finishLoading() {
  if (finished) return;
  finished = true;
  shownPct = 100;
  paintProgress();
  loadLabel.textContent = "Ready";
  status.classList.add("done");
  setTimeout(() => status.remove(), 480);
}

function paintProgress() {
  loadFill.style.width = shownPct.toFixed(2) + "%";
  loadPct.textContent  = Math.floor(shownPct) + "%";
}

function animateProgress() {
  const gap = targetPct - shownPct;
  if (gap > 0) {
    shownPct += Math.max(gap * 0.055, 0.14);   /* ease in, but always climb */
  } else if (!modelReady && shownPct < 99) {
    shownPct += 0.012;                          /* creep so it never stalls  */
  }
  if (shownPct > 100) shownPct = 100;
  paintProgress();

  if (modelReady && shownPct >= 99.995) { finishLoading(); return; }
  if (finished) return;
  requestAnimationFrame(animateProgress);
}
requestAnimationFrame(animateProgress);

/* ------------------------------------------------------------- renderer */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;   /* used by the cutaway */

/* ---------------------------------------------------------------- scene */
const scene = new THREE.Scene();

function gradientTexture(stops) {
  const c = document.createElement("canvas");
  c.width = 8; c.height = 512;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  stops.forEach(s => g.addColorStop(s[0], s[1]));
  ctx.fillStyle = g; ctx.fillRect(0, 0, 8, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
scene.background = gradientTexture([
  [0.00, "#f3f4f6"], [0.45, "#e2e5ea"], [0.72, "#cbd0d8"], [1.00, "#b2b8c2"]
]);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

/* --------------------------------------------------------------- camera */
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 400);
camera.position.set(7.2, 2.5, 6.6);

const CAMS = {
  hero:   [7.2, 2.5, 6.6],  side:   [0.02, 1.15, 11.5], front: [10.6, 1.7, 0.02],
  rear:   [-10.8, 1.8, 0.02], top:  [0.02, 12, 0.5],    rear34: [-6.8, 2.4, 6.4],
  front34:[7.8, 2.0, 5.0],  low:    [5.6, 0.9, 5.8]
};
const camq = new URLSearchParams(location.search).get("cam");
if (camq && CAMS[camq]) camera.position.set(...CAMS[camq]);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.72, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 3.4;
controls.maxDistance = 24;
controls.minPolarAngle = 0.10;
controls.maxPolarAngle = Math.PI / 2 - 0.03;
controls.autoRotate = !camq;
controls.autoRotateSpeed = 0.42;
controls.addEventListener("start", () => { controls.autoRotate = false; });

/* --------------------------------------------------------------- lights */
scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa3ad, 0.5));

const key = new THREE.DirectionalLight(0xffffff, 2.3);
key.position.set(5.0, 11.0, 4.2);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.0006;
key.shadow.normalBias = 0.02;
Object.assign(key.shadow.camera,
  { left: -7.5, right: 7.5, top: 6.5, bottom: -6.5, near: 1, far: 32 });
key.shadow.camera.updateProjectionMatrix();
scene.add(key);

const fill = new THREE.DirectionalLight(0xdce6f2, 0.65);
fill.position.set(-7, 4.5, -5.5);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xffffff, 1.0);
rim.position.set(-4, 2.2, 7);
scene.add(rim);

/* ---------------------------------------------------------------- floor */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.ShadowMaterial({ opacity: 0.28 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

function radialTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 124);
  g.addColorStop(0, "rgba(0,0,0,0.5)");
  g.addColorStop(0.45, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
const contact = new THREE.Mesh(
  new THREE.PlaneGeometry(6.6, 3.6),
  new THREE.MeshBasicMaterial({ map: radialTexture(), transparent: true, depthWrite: false })
);
contact.rotation.x = -Math.PI / 2;
contact.position.y = 0.003;
scene.add(contact);

/* -------------------------------------------------------------- cutaway */
/* A clipping plane slices the near side of the car away so the cabin and
   anything mounted inside it can be seen and clicked. Works with any model,
   because it cuts geometry rather than guessing which part is "interior".  */
const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.6);
let clipOn = false;

const cutToggle = document.getElementById("cutToggle");
const cutSlider = document.getElementById("cutSlider");

function applyClipping(model) {
  model.traverse(o => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach(m => {
      if (!m) return;
      m.clippingPlanes = clipOn ? [clipPlane] : null;
      m.clipShadows = true;
      m.side = clipOn ? THREE.DoubleSide : THREE.FrontSide;
      m.needsUpdate = true;
    });
  });
}

cutToggle.addEventListener("change", () => {
  clipOn = cutToggle.checked;
  cutSlider.disabled = !clipOn;
  document.getElementById("cutRow").classList.toggle("on", clipOn);
  if (window.__car) applyClipping(window.__car);
});
cutSlider.addEventListener("input", () => {
  clipPlane.constant = Number(cutSlider.value);
});

/* ------------------------------------------------------------ the model */
const draco = new DRACOLoader().setDecoderPath("vendor/jsm/libs/draco/gltf/");
const loader = new GLTFLoader()
  .setDRACOLoader(draco)
  .setMeshoptDecoder(MeshoptDecoder);

/* ?model=<path> loads a specific file, used when comparing compression */
const modelq = new URLSearchParams(location.search).get("model");
if (modelq) SOURCES.unshift(modelq);

/* Progress for the early fetch started in index.html. Byte counts there are
   already decompressed, so no Content-Length guessing is needed.            */
window.__onModelProgress = (loaded, total) => {
  targetPct = Math.min(96, (loaded / (total || EXPECTED_BYTES)) * 96);
  loadLabel.textContent = targetPct >= 95.5 ? "Preparing model" : "Loading model";
};

/* Use the head-start download if index.html managed to begin one. */
async function loadEarly() {
  if (!window.__modelFetch) return false;
  try {
    const buf = await window.__modelFetch;
    await new Promise((resolve, reject) =>
      loader.parse(buf, "", gltf => { place(gltf.scene); resolve(); }, reject));
    return true;
  } catch (err) {
    console.warn("early model fetch failed, falling back", err);
    lastError = err;
    return false;
  }
}

let lastError = null;
let attempt = 0;

/* A 9.6 MB download can be cut off on a weak connection, so one retry is
   worth it before telling the user something is wrong. */
function startLoading() {
  loadEarly().then(ok => {
    if (ok) return;
    tryLoad(0);
  });
}

function tryLoad(i) {
  if (i >= SOURCES.length) { showHelp(); return; }
  loader.load(
    SOURCES[i],
    gltf => place(gltf.scene),
    xhr => {
      /* trust Content-Length only when it is consistent with what has been
         read; otherwise the response is gzipped and it is the compressed size */
      const total = (xhr.total && xhr.loaded <= xhr.total) ? xhr.total : EXPECTED_BYTES;
      /* downloading covers 0-96%; the rest is decoding and uploading to the GPU */
      targetPct = Math.min(96, (xhr.loaded / total) * 96);
      loadLabel.textContent = targetPct >= 95.5 ? "Preparing model" : "Loading model";
    },
    err => { lastError = err; tryLoad(i + 1); }
  );
}

function place(model) {
  /* normalise: centre on the origin, sit on the ground, scale to real size */
  let box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.z);
  if (longest > 0) model.scale.multiplyScalar(TARGET_LENGTH / longest);

  box = new THREE.Box3().setFromObject(model);
  const c = box.getCenter(new THREE.Vector3());
  model.position.x -= c.x;
  model.position.z -= c.z;
  model.position.y -= box.min.y;

  /* point the car along +X whichever way it was authored */
  box = new THREE.Box3().setFromObject(model);
  const s2 = box.getSize(new THREE.Vector3());
  let yaw = s2.z > s2.x ? 90 : 0;
  yaw += Number(new URLSearchParams(location.search).get("yaw") || MODEL_YAW);
  model.rotation.y = yaw * Math.PI / 180;

  model.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach(m => {
      if (!m) return;
      m.envMapIntensity = 1.25;
      /* glass in many exported models is flagged transparent but renders
         back-to-front badly; keeping depthWrite on looks better here */
      if (m.transparent && m.opacity > 0.65) m.depthWrite = true;
      if (m.map) m.map.anisotropy = 8;
    });
  });

  scene.add(model);

  const b = new THREE.Box3().setFromObject(model);
  const sz = b.getSize(new THREE.Vector3());
  contact.scale.set(sz.x / 6.6 * 1.16, 1, sz.z / 3.6 * 1.5);

  /* frame the car: pull the camera back just far enough to hold the whole
     bounding sphere, and scale the zoom limits to the model               */
  const sphere = b.getBoundingSphere(new THREE.Sphere());
  const fit = sphere.radius / Math.sin((camera.fov * Math.PI / 180) / 2);

  controls.target.set(0, sz.y * 0.44, 0);
  controls.minDistance = sphere.radius * 0.62;
  controls.maxDistance = fit * 3.2;

  if (!camq) {
    const dir = new THREE.Vector3(1.02, 0.36, 0.95).normalize();
    camera.position.copy(controls.target).addScaledVector(dir, fit * 0.86);
  } else {
    camera.position.multiplyScalar(fit * 0.86 / camera.position.length());
  }
  camera.near = sphere.radius / 100;
  camera.far  = sphere.radius * 100;
  camera.updateProjectionMatrix();
  controls.update();

  /* shadow frustum sized to the car rather than a fixed guess */
  const r = Math.max(sz.x, sz.z) * 0.78;
  Object.assign(key.shadow.camera,
    { left: -r, right: r, top: r, bottom: -r, near: 0.5, far: r * 6 });
  key.shadow.camera.updateProjectionMatrix();
  modelReady = true;
  targetPct = 100;
  /* requestAnimationFrame is throttled in background tabs, so never let the
     overlay outlive the model by more than a moment */
  setTimeout(finishLoading, 1600);
  window.__car = model;
  document.getElementById("cutRow").hidden = false;
  /* default the cut to just inboard of the near door */
  cutSlider.min = (-sz.z / 2).toFixed(2);
  cutSlider.max = (sz.z / 2).toFixed(2);
  cutSlider.value = (sz.z * 0.12).toFixed(2);
  clipPlane.constant = Number(cutSlider.value);

  /* ?cut=0.25 opens the cutaway straight away, handy for linking a view */
  const cutq = new URLSearchParams(location.search).get("cut");
  if (cutq !== null) {
    cutToggle.checked = true;
    if (cutq !== "") cutSlider.value = cutq;
    cutToggle.dispatchEvent(new Event("change"));
    cutSlider.dispatchEvent(new Event("input"));
  }
  applyClipping(model);
}

function showHelp() {
  if (attempt < 1 && lastError) {
    attempt++;
    loadLabel.textContent = "Connection dropped, retrying";
    targetPct = 0; shownPct = 0; lastError = null;
    tryLoad(0);
    return;
  }
  status.classList.remove("done");
  const dropped = lastError && !/404|not found/i.test(String(lastError && lastError.message));
  status.innerHTML =
    '<div class="load-help">' +
    (dropped
      ? "<strong>Could not download the model</strong>" +
        "<p>The connection dropped partway through the 9.6&nbsp;MB download. " +
        "This usually means a slow or unstable network rather than a problem " +
        "with the page.</p>" +
        '<button id="retryBtn" type="button">Try again</button>'
      : "<strong>No model found</strong>" +
        "<p>Save a car model as <code>assets/models/car.glb</code>, or an " +
        "unpacked Sketchfab glTF folder as <code>assets/models/car/scene.gltf</code>, " +
        "then reload. See <code>README.md</code> for where to get one.</p>") +
    "</div>";
  const btn = document.getElementById("retryBtn");
  if (btn) btn.onclick = () => location.reload();
}

startLoading();

/* ----------------------------------------------------------------- loop */
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
(function tick() {
  resize();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
})();
