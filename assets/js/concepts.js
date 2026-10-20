/* ==========================================================================
   concepts.js — the three explainer panels: control systems, monitoring
   systems, and feedback. Each opens over a blurred page.

   All wording lives in lang.js; this file only lays it out. The diagrams are
   mirrored in Arabic, so the signal still runs the way the language reads.
   ========================================================================== */

import { concepts as L, t, getLang, onLangChange } from "./lang.js";

const $ = id => document.getElementById(id);
const rtl = () => getLang() === "ar";

/* ------------------------------------------------------------------ diagram */
/* One renderer for every diagram, so the three read as the same language:
   boxes along the reading direction, a marching line for the signal, and a
   return line underneath only where a feedback loop actually exists.       */
function chain(nodes, opt = {}) {
  const NW = 170, NH = 88, GAP = 46, P = 16;
  const drop = opt.feedback || opt.noFeedback ? 74 : 26;
  const W = P * 2 + nodes.length * NW + (nodes.length - 1) * GAP;
  const H = P + NH + drop;
  const flip = rtl();
  const xOf = i => P + (flip ? nodes.length - 1 - i : i) * (NW + GAP);
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
      /* drawn from this box towards the next one, so the arrowhead turns
         round on its own when the layout is mirrored */
      const from = flip ? x - 5 : x + NW + 5;
      const to   = flip ? xOf(i + 1) + NW + 7 : xOf(i + 1) - 7;
      s += `<line class="d-flow" x1="${from}" y1="${midY}" x2="${to}" y2="${midY}"
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

/* nodes arrive as [title, sub1, sub2]; kinds are positional and fixed */
const boxes = (rows, kinds = {}) =>
  rows.map(([title, ...sub], i) => ({ title, sub, kind: kinds[i] || "" }));

/* ------------------------------------------------------------------ content */
const TOPICS = {
  control: () => {
    const c = L().control;
    return {
      file: c.file, title: c.title,
      body: `
      <p class="kicker">${L().defnWord}</p>
      <div class="defn"><b>${c.label}</b>${c.defn}</div>
      <h3>${L().process}</h3>
      ${chain(boxes(c.nodes, { 2: "proc", 4: "act" }), { feedback: c.loop, alt: c.alt })}
      <p>${c.prose}</p>`
    };
  },

  monitor: () => {
    const c = L().monitor;
    return {
      file: c.file, title: c.title,
      body: `
      <p class="kicker">${L().defnWord}</p>
      <div class="defn"><b>${c.label}</b>${c.defn}</div>
      <h3>${L().process}</h3>
      ${chain(boxes(c.nodes, { 2: "proc", 3: "out", 4: "out" }), { noFeedback: c.loop, alt: c.alt })}
      <p>${c.prose}</p>
      <div class="note">${c.note}</div>`
    };
  },

  feedback: () => {
    const c = L().feedback;
    return {
      file: c.file, title: c.title, mount: mountSim,
      body: `
      <p class="kicker">${c.kicker}</p>
      <p>${c.intro}</p>
      <div class="defn"><b>${c.label}</b>${c.defn}</div>
      <p>${c.after}</p>
      <h3>${c.whyHead}</h3>
      <ul>${c.why.map(li => `<li>${li}</li>`).join("")}</ul>
      <h3>${c.exHead}</h3>
      <p>${c.example}</p>
      ${chain(boxes(c.nodes, { 1: "proc", 2: "act" }), { feedback: c.loop, alt: c.alt })}
      <h3>${c.tryHead}</h3>
      <p>${c.tryIntro}</p>
      <div class="sim" id="sim">
        <div class="sim-row">
          <span class="sim-label">${c.wheelLabel}</span>
          <span class="sim-meter"><span class="sim-fill" id="simWheel" style="width:100%"></span></span>
          <span class="sim-val" id="simWheelV">100%</span>
        </div>
        <div class="sim-row">
          <span class="sim-label">${c.brakeLabel}</span>
          <span class="sim-meter"><span class="sim-fill brake" id="simBrake" style="width:0%"></span></span>
          <span class="sim-val" id="simBrakeV">0%</span>
        </div>
        <p class="sim-state ok" id="simState">${c.gripping}</p>
        <div class="sim-controls">
          <button type="button" class="btn" id="simToggle">${c.disconnect}</button>
          <button type="button" class="btn" id="simReset">${c.reset}</button>
        </div>
      </div>
      <div class="note warn" id="simNote">${c.warn}</div>`
    };
  }
};

/* --------------------------------------------------- the interactive demo */
let simRAF = 0;

function mountSim() {
  const c = L().feedback;
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
    toggle.textContent = on ? c.disconnect : c.reconnect;
    note.style.display = on ? "none" : "";
    if (fbPath) {
      fbPath.setAttribute("class", on ? "d-fb" : "d-none");
      fbPath.removeAttribute("marker-end");
      if (on) fbPath.setAttribute("marker-end", "url(#ah)");
    }
    if (fbLabel) {
      fbLabel.textContent = on ? c.loop : c.broken;
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
    stateEl.innerHTML = locked ? c.locked : c.gripping;

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
export function initConcepts(viewer, opts = {}) {
  const back = $("infoBack"), body = $("infoBody"), fileEl = $("infoFile");
  const buttons = [...document.querySelectorAll("[data-topic]")];
  let openKey = null, lastFocus = null;

  function draw(key) {
    const topic = TOPICS[key]();
    fileEl.textContent = topic.file;
    body.innerHTML = `<h2>${topic.title}</h2>` + topic.body;
    body.scrollTop = 0;
    if (topic.mount) topic.mount();
  }

  function open(key) {
    if (!TOPICS[key]) return;
    /* switching straight from one topic to another never passes through
       close(), so stop the previous panel's animation here as well */
    stopSim();
    openKey = key;
    lastFocus = document.activeElement;
    if (opts.onOpen) opts.onOpen(key);          /* the guide ticks step 1 off */
    draw(key);
    back.hidden = false;
    buttons.forEach(b => b.setAttribute("aria-expanded", String(b.dataset.topic === key)));
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

  /* a panel that is open when the language changes is redrawn in place */
  onLangChange(() => { if (openKey) { stopSim(); draw(openKey); } });

  /* ?topic=feedback opens a panel straight away, so a topic can be linked to */
  const wanted = new URLSearchParams(location.search).get("topic");
  if (wanted && TOPICS[wanted]) open(wanted);

  back.addEventListener("mousedown", e => { if (e.target === back) close(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && openKey) { e.stopImmediatePropagation(); close(); } }, true);

  return { close, isOpen: () => !!openKey };
}
