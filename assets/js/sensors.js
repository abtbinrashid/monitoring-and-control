import { createViewer } from "./viewer.js";
import { initConcepts } from "./concepts.js";
import { initGuide } from "./guide.js";
import { t, sensorText, onLangChange, initLang, applyStatic, wireLangButton } from "./lang.js";

/* p = position as fractions of the car's half-length (x, front = +), height (y), half-width (z).
   n = outward normal for hiding when facing away; null = interior, always shown. */
const SENSORS = [
  { answer: "Control", p: [0.99, 0.22, 0],    n: [1, 0, 0] },
  { answer: "Control", p: [-0.15, 0.88, 0.88], n: [0, 0.2, 1] },
  { answer: "Control", p: [0.89, 0.48, 0.70], n: [1, 0, 0.4] },
  { answer: "Control", p: [0.2, 0.93, 0],     n: null },
  { answer: "Monitor", p: [0.28, 0.66, 0],    n: null },
  { answer: "Control", p: [0.96, 0.21, 0.64], n: [1, 0, 0.3] },
  { answer: "Monitor", p: [0.63, 0.25, 1.0],  n: [0, 0, 1] },
  { answer: "Control", p: [-0.59, 0.25, 1.0], n: [0, 0, 1] }
];
const TOTAL = SENSORS.length;
const q = new URLSearchParams(location.search);
const FRONT = q.has("flip") ? -1 : 1;

const $ = id => document.getElementById(id);
const canvas = $("view"), spotsEl = $("spots"), win = $("win");
const answers = Array(TOTAL).fill(null);
let openIdx = -1, pts = [], nrm = [], THREE;

const pad = n => String(n).padStart(2, "0");
initLang();
applyStatic();
wireLangButton();

/* ---------- hotspots ---------- */
const spots = SENSORS.map((s, i) => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "spot";
  b.innerHTML = `<span class="num">${i + 1}</span><span class="tip"></span>`;
  b.addEventListener("click", () => openSensor(i));
  spotsEl.appendChild(b);
  return b;
});
const segs = SENSORS.map(() => $("segs").appendChild(document.createElement("span")));

const viewer = createViewer({ canvas, autoRotate: false, onFrame: placeSpots });
THREE = viewer.THREE;
const guide = initGuide({ viewer, canvas, total: TOTAL });
initConcepts(viewer, { onOpen: key => guide.topicOpened(key) });
const tmp = new THREE.Vector3(), toCam = new THREE.Vector3();
const centre = new THREE.Vector3(0, 0.72, 0);   /* what the camera orbits */

viewer.ready.then(({ size }) => {
  pts = SENSORS.map(s => new THREE.Vector3(FRONT * s.p[0] * size.x / 2, s.p[1] * size.y, s.p[2] * size.z / 2));
  nrm = SENSORS.map(s => s.n && new THREE.Vector3(FRONT * s.n[0], s.n[1], s.n[2]).normalize());
  spotsEl.hidden = false;
  nameSpots();

/* every piece of visible text is redrawn in place, so switching language
   never costs anyone their progress */
onLangChange(() => {
  applyStatic();
  nameSpots();
  if (openIdx >= 0) openSensor(openIdx);
  refresh();
  if (!$("doneBack").hidden) showResults(false);
});

refresh();
});

function nameSpots() {
  spots.forEach((el, i) => {
    const name = sensorText(i).name;
    el.setAttribute("aria-label", `${i + 1}. ${name}`);
    el.querySelector(".tip").textContent = name;
  });
}

function frameView() {
  const w = canvas.clientWidth, h = canvas.clientHeight, cam = viewer.camera;
  const side = !win.hidden && w > 760 ? (win.offsetWidth + 16) / 2 : 0;
  if (side) cam.setViewOffset(w, h, side, 0, w, h); else cam.clearViewOffset();
  invalidateSpots();
}
addEventListener("resize", frameView);

/* The hotspots are DOM elements tracking 3D points, so they are repositioned
   every frame. Three things keep that cheap:
     - the canvas size comes from the viewer's ResizeObserver, so this never
       reads clientWidth and never forces a synchronous layout
     - the whole pass is skipped when the camera has not moved
     - a style is only written when its value actually changed             */
const lastCam = { p: null, q: null, w: 0, h: 0 };

function invalidateSpots() { lastCam.p = null; }

function placeSpots() {
  if (!pts.length) return;
  const cam = viewer.camera;
  const { w, h } = viewer.size;

  if (lastCam.p &&
      lastCam.w === w && lastCam.h === h &&
      cam.position.equals(lastCam.p) && cam.quaternion.equals(lastCam.q)) return;

  if (!lastCam.p) { lastCam.p = new THREE.Vector3(); lastCam.q = new THREE.Quaternion(); }
  lastCam.p.copy(cam.position);
  lastCam.q.copy(cam.quaternion);
  lastCam.w = w; lastCam.h = h;

  /* the "drag me" hint belongs on the car, not in the middle of the window:
     opening a sensor offsets the view and the car slides left */
  tmp.copy(centre).project(cam);
  guide.track((tmp.x + 1) / 2 * w, (1 - tmp.y) / 2 * h + 8, w, h);

  for (let i = 0; i < pts.length; i++) {
    const el = spots[i], p = pts[i];
    tmp.copy(p).project(cam);

    const behind = tmp.z > 1;
    if (behind !== el._behind) {
      el._behind = behind;
      el.style.visibility = behind ? "hidden" : "";
    }
    if (behind) continue;

    const x = Math.round((tmp.x + 1) / 2 * w);
    const y = Math.round((1 - tmp.y) / 2 * h);
    if (x !== el._x || y !== el._y) {
      el._x = x; el._y = y;
      el.style.transform = `translate(${x}px, ${y}px)`;
    }

    const away = nrm[i] ? toCam.copy(cam.position).sub(p).dot(nrm[i]) < 0 : false;
    if (el._away !== away) { el._away = away; el.classList.toggle("away", away); }
  }
}

/* ---------- window ---------- */
function openSensor(i) {
  openIdx = i;
  const s = sensorText(i);
  $("winFile").textContent = `SENSOR_${pad(i + 1)}.SYS`;
  $("winKicker").textContent = t().sensorOf(i + 1, TOTAL);
  $("winName").textContent = s.name;
  $("winText").textContent = s.text;
  $("winText").scrollTop = 0;
  win.hidden = false;
  frameView();
  nameSpots();

/* every piece of visible text is redrawn in place, so switching language
   never costs anyone their progress */
onLangChange(() => {
  applyStatic();
  nameSpots();
  if (openIdx >= 0) openSensor(openIdx);
  refresh();
  if (!$("doneBack").hidden) showResults(false);
});

refresh();
}
function closeSensor() { openIdx = -1; win.hidden = true; frameView(); nameSpots();

/* every piece of visible text is redrawn in place, so switching language
   never costs anyone their progress */
onLangChange(() => {
  applyStatic();
  nameSpots();
  if (openIdx >= 0) openSensor(openIdx);
  refresh();
  if (!$("doneBack").hidden) showResults(false);
});

refresh(); }

function pick(choice) {
  if (openIdx < 0 || answers[openIdx]) return;
  const s = SENSORS[openIdx];
  answers[openIdx] = { picked: choice, correct: choice === s.answer };
  nameSpots();

/* every piece of visible text is redrawn in place, so switching language
   never costs anyone their progress */
onLangChange(() => {
  applyStatic();
  nameSpots();
  if (openIdx >= 0) openSensor(openIdx);
  refresh();
  if (!$("doneBack").hidden) showResults(false);
});

refresh();
  if (answers.every(Boolean)) setTimeout(showResults, 1100);
}

function refresh() {
  const done = answers.filter(Boolean).length;
  const right = answers.filter(a => a && a.correct).length;
  $("doneText").textContent = t().completed(done, TOTAL);
  $("scoreText").textContent = t().correctCount(right);
  $("statusMsg").textContent = t().completed(done, TOTAL);
  guide.quizProgress(done);
  segs.forEach((el, i) => { el.className = answers[i] ? (answers[i].correct ? "ok" : "bad") : ""; });
  spots.forEach((el, i) => {
    const a = answers[i];
    el.classList.toggle("active", i === openIdx);
    el.classList.toggle("ok", !!a && a.correct);
    el.classList.toggle("bad", !!a && !a.correct);
  });

  if (openIdx < 0) return;
  const s = SENSORS[openIdx], a = answers[openIdx], qEl = $("winQ"), L = t();
  const word = v => (v === "Monitor" ? L.monitor : L.control);
  win.querySelectorAll("[data-pick]").forEach(btn => {
    const v = btn.dataset.pick;
    btn.className = "btn";
    btn.disabled = false;
    if (!a) { btn.textContent = word(v); return; }
    btn.classList.add("locked");
    if (v === a.picked) {
      btn.classList.add(a.correct ? "correct" : "wrong");
      btn.innerHTML = `<span class="mark">${a.correct ? "✓" : "✗"}</span>${a.correct ? L.correct : L.incorrect}`;
    } else if (!a.correct) {
      btn.classList.add("reveal");
      btn.innerHTML = `<span class="mark">✓</span>${L.isCorrect(word(v))}`;
    } else {
      btn.classList.add("dim");
      btn.textContent = word(v);
    }
  });
  if (!a) { qEl.className = "q"; qEl.textContent = L.question; }
  else {
    qEl.className = "q " + (a.correct ? "ok" : "bad");
    qEl.textContent = L.verdict(a.correct,
      s.answer === "Monitor" ? L.kindMonitor : L.kindControl, done, TOTAL);
  }
}

function showResults(focus = true) {
  const right = answers.filter(a => a.correct).length, L = t();
  $("doneTitle").textContent = L.completed(TOTAL, TOTAL);
  $("doneScore").textContent = L.score(right, TOTAL);
  const list = $("doneList");
  list.innerHTML = "";
  SENSORS.forEach((s, i) => {
    const a = answers[i], row = document.createElement("div");
    row.innerHTML = `<span>${i + 1}</span><span></span><span class="${a.correct ? "r-ok" : "r-bad"}"></span>`;
    row.children[1].textContent = sensorText(i).name;
    row.children[2].textContent =
      `${s.answer === "Monitor" ? L.monitor : L.control} ${a.correct ? "✓" : "✗"}`;
    list.appendChild(row);
  });
  $("doneBack").hidden = false;
  if (focus) $("restart").focus();
}

win.querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", () => pick(b.dataset.pick)));
$("winClose").addEventListener("click", closeSensor);
$("restart").addEventListener("click", () => {
  answers.fill(null);
  $("doneBack").hidden = true;
  closeSensor();
});
addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!$("doneBack").hidden) return;
  closeSensor();
});
nameSpots();

/* every piece of visible text is redrawn in place, so switching language
   never costs anyone their progress */
onLangChange(() => {
  applyStatic();
  nameSpots();
  if (openIdx >= 0) openSensor(openIdx);
  refresh();
  if (!$("doneBack").hidden) showResults(false);
});

refresh();
