/* ==========================================================================
   viewer.js — shared studio viewer: renderer, lighting, camera, model
   loading and the loading bar. Used by every page on the site.
   ========================================================================== */

import * as THREE from "three";
import { OrbitControls }  from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader }     from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader }    from "three/addons/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

const SOURCES = ["assets/models/car.glb", "assets/models/car/scene.gltf"];
const TARGET_LENGTH = 5.3;         /* metres, the model is scaled to this */

export const CAMS = {
  hero:    [7.2, 2.5, 6.6],   side:  [0.02, 1.15, 11.5], front: [10.6, 1.7, 0.02],
  rear:    [-10.8, 1.8, 0.02], top:  [0.02, 12, 0.5],     rear34: [-6.8, 2.4, 6.4],
  front34: [7.8, 2.0, 5.0],   low:   [5.6, 0.9, 5.8],
  /* used by the lighting demo: low and behind, looking down the beam */
  beam:    [-9.5, 2.6, 5.2],  beamtop: [-1.5, 14, 6.0]
};

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

export function createViewer(opts = {}) {
  const night   = !!opts.night;
  const canvas  = opts.canvas || document.getElementById("view");
  const onFrame = opts.onFrame || null;

  /* ------------------------------------------------------------ renderer */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = night ? 1.15 : 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;

  /* --------------------------------------------------------------- scene */
  const scene = new THREE.Scene();
  scene.background = night
    ? gradientTexture([[0, "#070b12"], [0.55, "#0a1018"], [1, "#11161d"]])
    : gradientTexture([[0, "#f3f4f6"], [0.45, "#e2e5ea"], [0.72, "#cbd0d8"], [1, "#b2b8c2"]]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const ENV_INTENSITY = night ? 0.16 : 1.25;

  /* -------------------------------------------------------------- camera */
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 500);
  camera.position.set(...(night ? CAMS.beam : CAMS.hero));
  const camq = new URLSearchParams(location.search).get("cam");
  if (camq && CAMS[camq]) camera.position.set(...CAMS[camq]);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0.72, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.enablePan = false;
  controls.minDistance = 3.4;
  controls.maxDistance = night ? 45 : 24;
  controls.minPolarAngle = 0.10;
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.autoRotate = opts.autoRotate !== false && !camq && !night;
  controls.autoRotateSpeed = 0.42;
  controls.addEventListener("start", () => { controls.autoRotate = false; });

  /* -------------------------------------------------------------- lights */
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa3ad, night ? 0.10 : 0.5));

  const key = new THREE.DirectionalLight(0xffffff, night ? 0.35 : 2.3);
  key.position.set(5.0, 11.0, 4.2);
  key.castShadow = !night;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera,
    { left: -7.5, right: 7.5, top: 6.5, bottom: -6.5, near: 1, far: 32 });
  key.shadow.camera.updateProjectionMatrix();
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xdce6f2, night ? 0.18 : 0.65);
  fill.position.set(-7, 4.5, -5.5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(night ? 0x9ec2ff : 0xffffff, night ? 0.9 : 1.0);
  rim.position.set(-4, 2.2, 7);
  scene.add(rim);

  /* --------------------------------------------------------------- floor */
  let floor = null, contact = null;
  if (!night) {
    floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80),
      new THREE.ShadowMaterial({ opacity: 0.28 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 124);
    g.addColorStop(0, "rgba(0,0,0,0.5)");
    g.addColorStop(0.45, "rgba(0,0,0,0.22)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    contact = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 3.6),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false
      }));
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = 0.003;
    scene.add(contact);
  }

  /* ------------------------------------------------------- loading state */
  const status    = document.getElementById("loading");
  const loadFill  = document.getElementById("loadFill");
  const loadPct   = document.getElementById("loadPct");
  const loadLabel = document.getElementById("loadLabel");

  let targetPct = 0, shownPct = 0, modelReady = false, finished = false;
  let lastError = null, attempt = 0;

  function paintProgress() {
    if (!loadFill) return;
    loadFill.style.width = shownPct.toFixed(2) + "%";
    loadPct.textContent  = Math.floor(shownPct) + "%";
  }
  function finishLoading() {
    if (finished || !status) return;
    finished = true;
    shownPct = 100; paintProgress();
    if (loadLabel) loadLabel.textContent = "Ready";
    status.classList.add("done");
    setTimeout(() => status.remove(), 480);
  }
  function animateProgress() {
    const gap = targetPct - shownPct;
    if (gap > 0) shownPct += Math.max(gap * 0.055, 0.14);
    else if (!modelReady && shownPct < 99) shownPct += 0.012;
    if (shownPct > 100) shownPct = 100;
    paintProgress();
    if (modelReady && shownPct >= 99.995) { finishLoading(); return; }
    if (finished) return;
    requestAnimationFrame(animateProgress);
  }
  if (status) requestAnimationFrame(animateProgress);

  window.__onModelProgress = (loaded, total) => {
    targetPct = Math.min(96, (loaded / (total || window.__modelBytes)) * 96);
    if (loadLabel) {
      loadLabel.textContent = targetPct >= 95.5 ? "Preparing model" : "Loading model";
    }
  };

  /* --------------------------------------------------------- the model */
  const draco = new DRACOLoader().setDecoderPath("vendor/jsm/libs/draco/gltf/");
  const loader = new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);

  const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.6);
  let clipOn = false, carModel = null, carSize = new THREE.Vector3();

  function applyClipping() {
    if (!carModel) return;
    carModel.traverse(o => {
      if (!o.isMesh) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
        if (!m) return;
        m.clippingPlanes = clipOn ? [clipPlane] : null;
        m.clipShadows = true;
        m.side = clipOn ? THREE.DoubleSide : THREE.FrontSide;
        m.needsUpdate = true;
      });
    });
  }

  const ready = new Promise(resolve => {
    function place(model) {
      let box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const longest = Math.max(size.x, size.z);
      if (longest > 0) model.scale.multiplyScalar(TARGET_LENGTH / longest);

      box = new THREE.Box3().setFromObject(model);
      const c = box.getCenter(new THREE.Vector3());
      model.position.x -= c.x;
      model.position.z -= c.z;
      model.position.y -= box.min.y;

      box = new THREE.Box3().setFromObject(model);
      const s2 = box.getSize(new THREE.Vector3());
      let yaw = s2.z > s2.x ? 90 : 0;
      yaw += Number(new URLSearchParams(location.search).get("yaw") || 0);
      model.rotation.y = yaw * Math.PI / 180;

      model.traverse(o => {
        if (!o.isMesh) return;
        o.castShadow = o.receiveShadow = true;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
          if (!m) return;
          m.envMapIntensity = ENV_INTENSITY;
          if (m.transparent && m.opacity > 0.65) m.depthWrite = true;
          if (m.map) m.map.anisotropy = 8;
        });
      });

      scene.add(model);
      carModel = model;
      carSize.copy(new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3()));
      controls.target.set(0, carSize.y * 0.44, 0);
      if (contact) contact.scale.set(carSize.x / 6.6 * 1.18, 1, carSize.z / 3.6 * 1.45);

      /* static scene: draw the shadow map once more, then stop re-drawing it */
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.needsUpdate = true;

      modelReady = true; targetPct = 100;
      setTimeout(finishLoading, 1600);
      window.__car = model;
      setupCutaway();
      resolve({ model, size: carSize });
    }

    async function loadEarly() {
      if (!window.__modelFetch) return false;
      try {
        const buf = await window.__modelFetch;
        await new Promise((res, rej) =>
          loader.parse(buf, "", g => { place(g.scene); res(); }, rej));
        return true;
      } catch (err) {
        console.warn("early model fetch failed, falling back", err);
        lastError = err;
        return false;
      }
    }

    function tryLoad(i) {
      if (i >= SOURCES.length) { showHelp(); return; }
      loader.load(SOURCES[i], g => place(g.scene), null,
        err => { lastError = err; tryLoad(i + 1); });
    }

    function showHelp() {
      if (!status) return;
      if (attempt < 1 && lastError) {
        attempt++;
        if (loadLabel) loadLabel.textContent = "Connection dropped, retrying";
        targetPct = 0; shownPct = 0; lastError = null;
        tryLoad(0);
        return;
      }
      status.classList.remove("done");
      const dropped = lastError &&
        !/404|not found/i.test(String(lastError && lastError.message));
      status.innerHTML = '<div class="load-help">' +
        (dropped
          ? "<strong>Could not download the model</strong><p>The connection " +
            "dropped partway through the 2.9&nbsp;MB download. This usually means " +
            "a slow or unstable network rather than a problem with the page.</p>" +
            '<button id="retryBtn" type="button">Try again</button>'
          : "<strong>No model found</strong><p>Save a car model as " +
            "<code>assets/models/car.glb</code>, then reload. See " +
            "<code>README.md</code>.</p>") + "</div>";
      const b = document.getElementById("retryBtn");
      if (b) b.onclick = () => location.reload();
    }

    loadEarly().then(ok => { if (!ok) tryLoad(0); });
  });

  /* ------------------------------------------------------------- cutaway */
  function setupCutaway() {
    const row = document.getElementById("cutRow");
    const toggle = document.getElementById("cutToggle");
    const slider = document.getElementById("cutSlider");
    if (!row || !toggle || !slider) return;
    row.hidden = false;
    slider.min = (-carSize.z / 2).toFixed(2);
    slider.max = (carSize.z / 2).toFixed(2);
    slider.value = (carSize.z * 0.12).toFixed(2);
    clipPlane.constant = Number(slider.value);

    toggle.addEventListener("change", () => {
      clipOn = toggle.checked;
      slider.disabled = !clipOn;
      row.classList.toggle("on", clipOn);
      applyClipping();
      renderer.shadowMap.needsUpdate = true;
    });
    slider.addEventListener("input", () => {
      clipPlane.constant = Number(slider.value);
      if (clipOn) renderer.shadowMap.needsUpdate = true;
    });

    const cutq = new URLSearchParams(location.search).get("cut");
    if (cutq !== null) {
      toggle.checked = true;
      if (cutq !== "") slider.value = cutq;
      toggle.dispatchEvent(new Event("change"));
      slider.dispatchEvent(new Event("input"));
    }
    applyClipping();
  }

  /* ---------------------------------------------------------------- loop */

  /* Canvas size is tracked by a ResizeObserver rather than read every frame.
     Reading clientWidth each frame forces a synchronous layout, and anything
     drawing DOM overlays in onFrame (the sensor hotspots) writes styles just
     before it, so the two together caused a layout recalculation per frame. */
  let cssW = canvas.clientWidth || 1, cssH = canvas.clientHeight || 1, sizeDirty = true;
  const ro = new ResizeObserver(entries => {
    const r = entries[0].contentRect;
    if (r.width && r.height) { cssW = r.width; cssH = r.height; sizeDirty = true; }
  });
  ro.observe(canvas);

  function applySize() {
    if (!sizeDirty) return;
    sizeDirty = false;
    renderer.setPixelRatio(dpr);
    renderer.setSize(cssW, cssH, false);
    camera.aspect = cssW / cssH;
    camera.updateProjectionMatrix();
  }

  /* Adaptive resolution. A 293k-triangle PBR model at devicePixelRatio 2 is
     four times the pixels of DPR 1, which is enough to miss the 16.7 ms frame
     budget on integrated graphics and halve the refresh rate. If frames run
     long we step the pixel ratio down, and back up again if there is headroom. */
  const DPR_STEPS = [2, 1.75, 1.5, 1.25, 1];
  let dprIdx = DPR_STEPS.findIndex(v => v <= Math.min(window.devicePixelRatio, 2));
  if (dprIdx < 0) dprIdx = DPR_STEPS.length - 1;
  let dpr = DPR_STEPS[dprIdx];
  const worstAllowed = dprIdx;          /* never go below the device's own DPR tier */
  let acc = 0, accFrames = 0, settle = 0;

  function adaptQuality(frameMs) {
    if (settle > 0) { settle--; return; }
    acc += frameMs; accFrames++;
    if (accFrames < 45) return;
    const avg = acc / accFrames;
    acc = 0; accFrames = 0;
    if (avg > 21 && dprIdx < DPR_STEPS.length - 1) {
      dprIdx++; dpr = DPR_STEPS[dprIdx]; sizeDirty = true; settle = 45;
    } else if (avg < 11 && dprIdx > worstAllowed) {
      dprIdx--; dpr = DPR_STEPS[dprIdx]; sizeDirty = true; settle = 90;
    }
  }

  const clock = new THREE.Clock();
  let prev = performance.now();
  let paused = false;

  (function tick() {
    requestAnimationFrame(tick);
    const now = performance.now();
    const frameMs = now - prev;
    prev = now;

    if (paused) { clock.getDelta(); return; }   /* a panel covers the canvas */

    applySize();
    const dt = Math.min(clock.getDelta(), 0.05);
    controls.update();
    if (onFrame) onFrame(dt, clock.elapsedTime);
    renderer.render(scene, camera);
    adaptQuality(frameMs);
  })();

  /* The scene is static, so the shadow map only needs drawing once. Leaving
     it on auto doubled the draw calls and triangles every single frame. */
  function refreshShadows() {
    renderer.shadowMap.needsUpdate = true;
  }

  return {
    renderer, scene, camera, controls, ready, THREE, refreshShadows,
    setPaused(v) { paused = !!v; },
    get size() { return { w: cssW, h: cssH }; }
  };
}
