/* ==========================================================================
   concepts.js — the three explainer panels: control systems, monitoring
   systems, and feedback. Each opens over a blurred page.
   ========================================================================== */

const $ = id => document.getElementById(id);

/* ------------------------------------------------------------------ diagram */
/* One renderer for every diagram, so the three read as the same language:
   boxes left to right, a marching line for the signal, and a return line
   underneath only where a feedback loop actually exists.                   */
function chain(nodes, opt = {}) {
  const NW = 170, NH = 88, GAP = 46, P = 16;
  const drop = opt.feedback || opt.noFeedback ? 74 : 26;
  const W = P * 2 + nodes.length * NW + (nodes.length - 1) * GAP;
  const H = P + NH + drop;
  const xOf = i => P + i * (NW + GAP);
  const midY = P + NH / 2;

  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${opt.alt || "process diagram"}">
    <defs>
      <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
      </marker>
    </defs>`;

  nodes.forEach((n, i) => {
    const x = xOf(i);
    s += `<rect class="d-box ${n.kind || ""}" x="${x}" y="${P}" width="${NW}" height="${NH}" rx="3"/>`;
    s += `<text class="d-title" x="${x + NW / 2}" y="${P + 28}" text-anchor="middle">${n.title}</text>`;
    (n.sub || []).forEach((line, k) => {
      s += `<text class="d-sub" x="${x + NW / 2}" y="${P + 50 + k * 15}" text-anchor="middle">${line}</text>`;
    });
    if (i < nodes.length - 1) {
      s += `<line class="d-flow" x1="${x + NW + 5}" y1="${midY}" x2="${xOf(i + 1) - 7}" y2="${midY}"
             style="color:var(--signal)" marker-end="url(#ah)"/>`;
    }
  });

  /* the return path that makes a system a control system */
  if (opt.feedback) {
    const y = P + NH + 44;
    const from = xOf(nodes.length - 1) + NW / 2, to = xOf(0) + NW / 2;
    s += `<path id="fbPath" class="d-fb" style="color:var(--signal)" marker-end="url(#ah)"
           d="M ${from} ${P + NH} V ${y} H ${to} V ${P + NH + 7}"/>`;
    s += `<rect x="${(from + to) / 2 - 104}" y="${y - 11}" width="208" height="22" fill="var(--face)"/>`;
    s += `<text id="fbLabel" class="d-fb-label" x="${(from + to) / 2}" y="${y + 4}" text-anchor="middle">${opt.feedback}</text>`;
  }

  /* monitoring systems stop at a person — there is deliberately no return path */
  if (opt.noFeedback) {
    const y = P + NH + 44;
    const from = xOf(nodes.length - 1) + NW / 2, to = xOf(0) + NW / 2;
    s += `<path class="d-none" d="M ${from} ${P + NH} V ${y} H ${to} V ${P + NH + 7}"/>`;
    s += `<rect x="${(from + to) / 2 - 150}" y="${y - 11}" width="300" height="22" fill="var(--face)"/>`;
    s += `<text class="d-none-label" x="${(from + to) / 2}" y="${y + 4}" text-anchor="middle">${opt.noFeedback}</text>`;
  }
  return `<div class="diagram">${s}</svg></div>`;
}

/* ------------------------------------------------------------------ content */
const TOPICS = {
  control: {
    file: "CONTROL.DOC",
    title: "Control systems",
    body: () => `
      <p class="kicker">Definition</p>
      <div class="defn"><b>CONTROL SYSTEM</b>A type of system where sensors feed data to a microprocessor, which compares it against present target values and uses actuators to change the physical conditions.</div>
      <h3>THE PROCESS</h3>
      ${chain([
        { title: "Sensor", sub: ["measures the physical", "condition continuously"] },
        { title: "ADC", sub: ["converts the analogue", "signal to digital"] },
        { title: "Microprocessor", sub: ["compares the reading", "with the target value"], kind: "proc" },
        { title: "DAC", sub: ["converts the decision", "back to analogue"] },
        { title: "Actuator", sub: ["changes the physical", "condition"], kind: "act" }
      ], { feedback: "the change is measured again", alt: "control system process" })}
      <p>The actuator is what makes it a control system. Because the actuator changes
         the very thing the sensor is measuring, the next reading is a consequence of
         the last action, so the loop closes and the system corrects itself without a person.</p>
    `
  },

  monitor: {
    file: "MONITOR.DOC",
    title: "Monitoring systems",
    body: () => `
      <p class="kicker">Definition</p>
      <div class="defn"><b>MONITOR SYSTEM</b>A type of system where sensors collect data and log it or trigger an alarm without changing the physical environment.</div>
      <h3>THE PROCESS</h3>
      ${chain([
        { title: "Sensor", sub: ["measures the physical", "condition continuously"] },
        { title: "ADC", sub: ["converts the analogue", "signal to digital"] },
        { title: "Microprocessor", sub: ["records the reading, or", "checks it against a limit"], kind: "proc" },
        { title: "Display / alarm", sub: ["shows the value or", "raises a warning"], kind: "out" },
        { title: "Person", sub: ["decides whether", "to do anything"], kind: "out" }
      ], { noFeedback: "no actuator, so no feedback loop", alt: "monitoring system process" })}
      <p>Everything up to the microprocessor is identical to a control system. The
         difference is the end of the chain: there is no actuator, so nothing the
         system does changes the condition being measured. It reports, and a person
         decides.</p>
      <div class="note">A display, a lamp and a buzzer are <strong>output devices</strong>,
        not actuators. They pass information to a person; they do not change the process.</div>
    `
  },

  feedback: {
    file: "FEEDBACK.DOC",
    title: "Feedback",
    body: () => `
      <p class="kicker">Feedback &middot; feedback loops</p>
      <p>Before saying why feedback matters, it has to be clear what feedback actually is.</p>
      <div class="defn"><b>FEEDBACK LOOP</b>A feedback loop is when a control system uses its output to influence its next input.</div>
      <p>That is the whole idea. The system acts, the action changes the physical
         conditions, and the sensor then measures those changed conditions. So the
         result of one action becomes the input to the next decision.</p>
      <h3>WHY IT MATTERS</h3>
      <ul>
        <li>It lets a system <strong>adjust itself automatically</strong> to stay within
            set conditions, with nobody watching it.</li>
        <li>It lets the system <strong>check whether it is actually working as
            expected</strong>, rather than assuming that its last action worked.</li>
      </ul>
      <h3>AN EXAMPLE FROM THIS CAR</h3>
      <p>The anti-lock braking system is sensor 8. The magnetic field sensor counts how
         fast the wheel is turning. If the microprocessor sees the wheel suddenly stop
         while the car is still moving, it knows the tyre has locked and is skidding,
         so it releases the brake pressure at that wheel. The wheel starts turning
         again &mdash; and the same sensor measures that straight away. That new reading
         decides what the system does next, many times a second.</p>
      ${chain([
        { title: "Wheel speed sensor", sub: ["counts the teeth", "passing the sensor"] },
        { title: "Microprocessor", sub: ["compares wheel speed", "with the car's speed"], kind: "proc" },
        { title: "Brake valve", sub: ["releases or reapplies", "the brake pressure"], kind: "act" },
        { title: "Wheel", sub: ["speeds up again", "or slows down"] }
      ], { feedback: "the new wheel speed is measured", alt: "braking feedback loop" })}
      <h3>TRY BREAKING THE LOOP</h3>
      <p>The driver is braking as hard as they can. Watch what the feedback loop does
         with that, and then disconnect it.</p>
      <div class="sim" id="sim">
        <div class="sim-row">
          <span class="sim-label">Wheel speed</span>
          <span class="sim-meter"><span class="sim-fill" id="simWheel" style="width:100%"></span></span>
          <span class="sim-val" id="simWheelV">100%</span>
        </div>
        <div class="sim-row">
          <span class="sim-label">Brake pressure</span>
          <span class="sim-meter"><span class="sim-fill brake" id="simBrake" style="width:0%"></span></span>
          <span class="sim-val" id="simBrakeV">0%</span>
        </div>
        <p class="sim-state ok" id="simState">Gripping &mdash; the wheel is still turning</p>
        <div class="sim-controls">
          <button type="button" class="btn" id="simToggle">Disconnect the sensor</button>
          <button type="button" class="btn" id="simReset">Reset</button>
        </div>
      </div>
      <div class="note warn" id="simNote">With the sensor disconnected the microprocessor
        gets no new readings, so it never finds out the wheel has locked and never
        releases the brake. That is what feedback is protecting against.</div>
    `,
    mount: mountSim
  }
};

/* --------------------------------------------------- the interactive demo */
let simRAF = 0;

function mountSim() {
  const wheelEl = $("simWheel"), brakeEl = $("simBrake");
  const wheelV = $("simWheelV"), brakeV = $("simBrakeV");
  const stateEl = $("simState"), toggle = $("simToggle"), reset = $("simReset");
  const note = $("simNote");
  const fbPath = document.getElementById("fbPath");
  const fbLabel = document.getElementById("fbLabel");

  let wheel = 100, brake = 0, feedback = true, t = 0;
  note.style.display = "none";

  function setLoop(on) {
    feedback = on;
    toggle.textContent = on ? "Disconnect the sensor" : "Reconnect the sensor";
    note.style.display = on ? "none" : "";
    if (fbPath) {
      fbPath.setAttribute("class", on ? "d-fb" : "d-none");
      fbPath.removeAttribute("marker-end");
      if (on) fbPath.setAttribute("marker-end", "url(#ah)");
    }
    if (fbLabel) {
      fbLabel.textContent = on ? "the new wheel speed is measured" : "loop broken — no new readings";
      fbLabel.setAttribute("class", on ? "d-fb-label" : "d-none-label");
    }
  }

  function step() {
    t++;
    if (feedback) {
      /* release pressure when the wheel starts to lock, reapply when it recovers */
      if (wheel < 80) brake -= 7;
      else if (wheel < 92) brake -= 1.5;
      else brake += 5;
    } else {
      brake += 3;                     /* nothing tells it to let go */
    }
    brake = Math.max(0, Math.min(100, brake));

    const settled = Math.max(0, 100 - brake * 1.05);
    wheel += (settled - wheel) * 0.14;
    wheel = Math.max(0, Math.min(100, wheel));

    wheelEl.style.width = wheel.toFixed(1) + "%";
    brakeEl.style.width = brake.toFixed(1) + "%";
    wheelV.textContent = Math.round(wheel) + "%";
    brakeV.textContent = Math.round(brake) + "%";

    const locked = wheel < 12;
    if (!wheelEl.isConnected) { stopSim(); return; }   /* panel was replaced */

    stateEl.className = "sim-state " + (locked ? "bad" : "ok");
    stateEl.innerHTML = locked
      ? "Locked &mdash; the tyre is skidding and you cannot steer"
      : "Gripping &mdash; the wheel is still turning";

    simRAF = requestAnimationFrame(step);
  }

  toggle.onclick = () => setLoop(!feedback);
  reset.onclick = () => { wheel = 100; brake = 0; setLoop(true); };
  setLoop(true);
  cancelAnimationFrame(simRAF);
  simRAF = requestAnimationFrame(step);
}

function stopSim() { cancelAnimationFrame(simRAF); simRAF = 0; }

/* ------------------------------------------------------------------ dialog */
export function initConcepts(viewer) {
  const back = $("infoBack"), body = $("infoBody"), fileEl = $("infoFile");
  const buttons = [...document.querySelectorAll("[data-topic]")];
  let openKey = null, lastFocus = null;

  function open(key) {
    const topic = TOPICS[key];
    if (!topic) return;
    /* switching straight from one topic to another never passes through
       close(), so stop the previous panel's animation here as well */
    stopSim();
    openKey = key;
    lastFocus = document.activeElement;
    fileEl.textContent = topic.file;
    body.innerHTML = `<h2>${topic.title}</h2>` + topic.body();
    body.scrollTop = 0;
    back.hidden = false;
    buttons.forEach(b => b.setAttribute("aria-expanded", String(b.dataset.topic === key)));
    if (topic.mount) topic.mount();
    if (viewer && viewer.setPaused) viewer.setPaused(true);   /* don't re-blur a live canvas */
    $("infoClose").focus();
  }

  function close() {
    if (!openKey) return;
    openKey = null;
    stopSim();
    back.hidden = true;
    body.innerHTML = "";
    buttons.forEach(b => b.setAttribute("aria-expanded", "false"));
    if (viewer && viewer.setPaused) viewer.setPaused(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  buttons.forEach(b => b.addEventListener("click", () => {
    openKey === b.dataset.topic ? close() : open(b.dataset.topic);
  }));
  $("infoClose").addEventListener("click", close);

  /* ?topic=feedback opens a panel straight away, so a topic can be linked to */
  const wanted = new URLSearchParams(location.search).get("topic");
  if (wanted && TOPICS[wanted]) open(wanted);

  back.addEventListener("mousedown", e => { if (e.target === back) close(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && openKey) { e.stopImmediatePropagation(); close(); } }, true);

  return { close, isOpen: () => !!openKey };
}
