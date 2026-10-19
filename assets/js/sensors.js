import { createViewer } from "./viewer.js";
import { initConcepts } from "./concepts.js";
import { initGuide } from "./guide.js";

/* p = position as fractions of the car's half-length (x, front = +), height (y), half-width (z).
   n = outward normal for hiding when facing away; null = interior, always shown. */
const SENSORS = [
  { name: "Acoustic Sensor", answer: "Control", p: [0.99, 0.22, 0], n: [1, 0, 0],
    text: `ACTIVE BODY CONTROL(™) uses Acoustic and Ultrasound sensors mounted on the front of the vehicle that emit continuous high-frequency sound pulses (ultrasound) angled downward at the road surface ahead, then based on the data received, the microprocessor adjusts the AIRMATIC AIR Suspension to make you feel like you're driving on a "cloud".` },
  { name: "Infrared Sensor", answer: "Control", p: [-0.15, 0.88, 0.88], n: [0, 0.2, 1],
    text: `a sunload sensor(a specific type of Infra-red Sensor) mounted on top of the windows continuously measure the intensity of infra-red radiation from the sun entering through the glass, An Analogue-to-Digital Converter (ADC) translates this voltage into a digital value that the computer can process which it then uses to actively tint the windows and block the heat before it even gets in.` },
  { name: "Light Sensor", answer: "Control", p: [0.89, 0.48, 0.70], n: [1, 0, 0.4],
    text: `ADAPTIVE HIGHBEAM ASSIST(™) uses one sophisticated light sensor that measures the lux(lumens per square meters) of the surrounding area, It continuously scans the road ahead, capturing frames of light data, It analyzes the data against its programmed parameters to differentiate between a streetlamp, a reflection, and an actual vehicle. and when it Identifies that the cluster of light is a car, it calculates exactly where that car is within its field of view. it then uses an actuator to turn off specific LED diodes inside the headlight assembly. This casts a dark "shadow" perfectly over the oncoming car, while keeping the high beam fully turned on everywhere else around it. Insane.` },
  { name: "Motion Sensor", answer: "Monitor", p: [0.2, 0.93, 0], n: null,
    text: `the Mercedes S 580 Maybach uses an Ultrasonic Motion Sensor embedded in the ceiling that is used in the car alarm system: When the car is locked, the ultrasonic transmitter fills the cabin with high-frequency sound waves (inaudible to humans) the receiver then picks up the continuous echo pattern, and the ADC converts it to digital data. The microprocessor establishes a baseline "standing wave" pattern for the empty car. If an intruder smashes a window and reaches inside, their moving arm disrupts the sound waves, changing the frequency of the returning echo. it then  sends an immediate signal to the alarm siren (to make noise), the headlights/indicators (to flash), and the engine immobilizer (to prevent the car from starting).` },
  { name: "Temperature Sensor", answer: "Monitor", p: [0.28, 0.66, 0], n: null,
    text: `A thermistor(Temperature sensor) continuously monitors the ambient temperature of the air inside the cabin, As the temperature changes, the voltage passing through the thermistor changes. This is an analog signal. The Analogue-to-Digital Converter (ADC) translates this varying voltage into a digital numerical value. which is then shown to the driver on the infotainment display` },
  { name: "humidity Sensor", answer: "Control", p: [0.96, 0.21, 0.64], n: [1, 0, 0.3],
    text: `A humidity sensor mounted on the front bumper continuously measures the water vapor concentration in the outside air. As external moisture levels rise, the sensor generates a varying analog voltage. An Analogue-to-Digital Converter (ADC) translates this voltage into a digital humidity percentage. The vehicle's microprocessor continuously reads this digital data and compares it against a pre-set threshold (e.g., 95% relative humidity, indicating conditions for dense fog). Once the incoming data exceeds this threshold, the microprocessor sends a signal to the headlight actuators, automatically turning on the front fog lights to improve driver visibility, though this model may not have them.` },
  { name: "Pressure Sensor", answer: "Monitor", p: [0.63, 0.25, 1.0], n: [0, 0, 1],
    text: `A pressure sensor (typically a piezoelectric sensor) is mounted inside each tire, it continuously measures the physical air pressure inside each tire, As the tire pressure increases or decreases, the sensor produces a varying analog electrical signal (voltage) that corresponds to the physical pressure. an ADC is used to convert it into digital data, which is then shown to the driver on the dashboard, This car though has a feature that compares the value to preset baseline values(e.g 32PSI), if the value deviates from the baseline, it outputs a warning on the dashboard.` },
  { name: "Magnetic Field Sensor", answer: "Control", p: [-0.59, 0.25, 1.0], n: [0, 0, 1],
    text: `Unlike the name suggests this magnetic sensor doesn't measure "magnets" directly—it uses a magnetic field to measure the speed of the rotating wheel.  Think of the ABS magnetic sensor like a high-speed digital counter for your tire. A metal ring with teeth is attached to your wheel hub, spinning right next to a magnetic sensor. As the wheel turns, every passing tooth interrupts the magnetic field and creates a quick analog electrical pulse. An Analogue-to-Digital Converter (ADC) instantly turns these continuous pulses into digital data, letting the car's microprocessor calculate exactly how fast the tire is spinning based on the pulse frequency. If you slam the brakes and the microprocessor sees the digital pulses from one wheel suddenly drop to zero, it knows that tire is locked up and skidding. It immediately triggers the hydraulic actuators to rapidly pump the brake fluid to that specific wheel, unlocking the tire so you can stop safely without losing steering control.` }
];
const TOTAL = SENSORS.length;
const q = new URLSearchParams(location.search);
const FRONT = q.has("flip") ? -1 : 1;

const $ = id => document.getElementById(id);
const canvas = $("view"), spotsEl = $("spots"), win = $("win");
const answers = Array(TOTAL).fill(null);
let openIdx = -1, pts = [], nrm = [], THREE;

const pad = n => String(n).padStart(2, "0");

/* ---------- hotspots ---------- */
const spots = SENSORS.map((s, i) => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "spot";
  b.setAttribute("aria-label", `${i + 1}. ${s.name}`);
  b.innerHTML = `<span class="num">${i + 1}</span><span class="tip"></span>`;
  b.querySelector(".tip").textContent = s.name;
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
  refresh();
});

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
  const s = SENSORS[i];
  $("winFile").textContent = `SENSOR_${pad(i + 1)}.SYS`;
  $("winKicker").textContent = `Sensor ${i + 1} of ${TOTAL}`;
  $("winName").textContent = s.name;
  $("winText").textContent = s.text;
  $("winText").scrollTop = 0;
  win.hidden = false;
  frameView();
  refresh();
}
function closeSensor() { openIdx = -1; win.hidden = true; frameView(); refresh(); }

function pick(choice) {
  if (openIdx < 0 || answers[openIdx]) return;
  const s = SENSORS[openIdx];
  answers[openIdx] = { picked: choice, correct: choice === s.answer };
  refresh();
  if (answers.every(Boolean)) setTimeout(showResults, 1100);
}

function refresh() {
  const done = answers.filter(Boolean).length;
  const right = answers.filter(a => a && a.correct).length;
  $("doneText").textContent = `${done}/${TOTAL} completed`;
  $("scoreText").textContent = `${right} correct`;
  $("statusMsg").textContent = `${done}/${TOTAL} completed`;
  guide.quizProgress(done);
  segs.forEach((el, i) => { el.className = answers[i] ? (answers[i].correct ? "ok" : "bad") : ""; });
  spots.forEach((el, i) => {
    const a = answers[i];
    el.classList.toggle("active", i === openIdx);
    el.classList.toggle("ok", !!a && a.correct);
    el.classList.toggle("bad", !!a && !a.correct);
  });

  if (openIdx < 0) return;
  const s = SENSORS[openIdx], a = answers[openIdx], qEl = $("winQ");
  win.querySelectorAll("[data-pick]").forEach(btn => {
    const v = btn.dataset.pick;
    btn.className = "btn";
    btn.disabled = false;
    if (!a) { btn.textContent = v; return; }
    btn.classList.add("locked");
    if (v === a.picked) {
      btn.classList.add(a.correct ? "correct" : "wrong");
      btn.innerHTML = `<span class="mark">${a.correct ? "✓" : "✗"}</span>${a.correct ? "Correct" : "Incorrect"}`;
    } else if (!a.correct) {
      btn.classList.add("reveal");
      btn.innerHTML = `<span class="mark">✓</span>${v} is correct`;
    } else {
      btn.classList.add("dim");
      btn.textContent = v;
    }
  });
  if (!a) { qEl.className = "q"; qEl.textContent = "Is this a monitoring system or a control system?"; }
  else {
    qEl.className = "q " + (a.correct ? "ok" : "bad");
    qEl.textContent = `${a.correct ? "Correct" : "Incorrect"}: this is a ${s.answer.toLowerCase()} system. ${done}/${TOTAL} completed.`;
  }
}

function showResults() {
  const right = answers.filter(a => a.correct).length;
  $("doneScore").textContent = `You classified ${right} of ${TOTAL} sensors correctly.`;
  const list = $("doneList");
  list.innerHTML = "";
  SENSORS.forEach((s, i) => {
    const a = answers[i], row = document.createElement("div");
    row.innerHTML = `<span>${i + 1}</span><span></span><span class="${a.correct ? "r-ok" : "r-bad"}"></span>`;
    row.children[1].textContent = s.name;
    row.children[2].textContent = `${s.answer} ${a.correct ? "✓" : "✗"}`;
    list.appendChild(row);
  });
  $("doneBack").hidden = false;
  $("restart").focus();
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
refresh();
