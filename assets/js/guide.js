/* ==========================================================================
   guide.js — the three-step guide.

   The page asks three things of a visitor, in this order: read the two
   explainer panels, find out that the car can be dragged, then classify the
   eight sensors. None of it is locked — the guide only ever points at the
   step you are on, and ticks it off once you have done it.

   The "drag me" hint is not a step: the canvas gives no sign that it can be
   spun, so a finger swipes over the car until the first touch of it.
   ========================================================================== */

import { t, onLangChange } from "./lang.js";

const $ = id => document.getElementById(id);

const NEEDED = ["control", "monitor"];      /* the two panels step 1 asks for */

const NOW = { read: "nowRead", quiz: "nowQuiz" };

export function initGuide({ viewer, canvas, total }) {
  const stepsEl = $("steps");
  if (!stepsEl) return { topicOpened() {}, quizProgress() {} };

  const steps = [...stepsEl.querySelectorAll(".step")];
  const topicBtns = [...document.querySelectorAll("[data-topic]")];
  const hint = $("dragHint");
  const read = new Set();
  let done = 0;

  const isDone = key =>
    key === "read" ? NEEDED.every(t => read.has(t)) : done >= total;

  function render() {
    const L = t();
    const current = steps.find(el => !isDone(el.dataset.step));

    steps.forEach(el => {
      const ok = isDone(el.dataset.step), now = el === current;
      el.classList.toggle("done", ok);
      el.classList.toggle("now", now);
      el.querySelector(".s-mark").textContent = ok ? "✓" : "";
      el.querySelector(".s-stat").textContent = ok ? L.stepDone : now ? L.stepNext : "";
      if (now) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    });

    $("quizCount").textContent = done ? L.quizCount(done, total) : "";
    const line = $("guideNow");
    line.textContent = current ? L[NOW[current.dataset.step]] : L.nowDone;
    line.classList.toggle("done", !current);

    /* ring whatever the current step is about */
    const step = current && current.dataset.step;
    topicBtns.forEach(b => b.classList.toggle("cue",
      step === "read" && NEEDED.includes(b.dataset.topic) && !read.has(b.dataset.topic)));
    $("progress").classList.toggle("cue", step === "quiz");
    colRect = null;                       /* its height changes as steps tick */
  }

  /* The hint waits for the model: until then the loading panel covers it. */
  if (hint) {
    const show = () => { hint.hidden = false; };
    if (viewer && viewer.ready) viewer.ready.then(show, show); else show();
  }

  /* The first touch of the car is the hint's whole job done, so it retires
     then, whether or not that touch turns into a drag. */
  function dismissHint() {
    if (!hint || hint.hidden || hint.classList.contains("gone")) return;
    hint.classList.add("gone");
    setTimeout(() => { hint.hidden = true; }, 400);
  }

  (canvas || $("view")).addEventListener("pointerdown", dismissHint);

  /* Put the hint on the car. Its own size is measured once rather than every
     frame, because this runs inside the render loop, and it is kept clear of
     the left-hand column so it cannot sit under the panels. */
  let hintX = -1, hintY = -1, hintW = 0, hintH = 0, colRect = null;
  addEventListener("resize", () => { hintW = hintH = 0; hintX = hintY = -1; colRect = null; });

  /* The panels sit above the hint, so keep it out of their box: beside the
     column on a desktop, below it on a phone. Measured only when the column
     can have changed, never per frame. */
  function column() {
    if (!colRect) {
      const el = $("topleft");
      colRect = el ? el.getBoundingClientRect() : { right: 0, bottom: 0 };
    }
    return colRect;
  }
  onLangChange(() => { colRect = null; hintW = 0; hintX = hintY = -1; render(); });
  render();

  return {
    topicOpened(key) { if (!read.has(key)) { read.add(key); render(); } },
    quizProgress(n)  { if (n !== done)    { done = n;      render(); } },
    track(x, y, viewW, viewH) {
      if (!hint || hint.hidden) return;
      if (!hintW) { hintW = hint.offsetWidth || 120; hintH = hint.offsetHeight || 80; }
      const halfW = hintW / 2 + 30, halfH = hintH / 2;        /* 30 = the swipe */
      const col = column();
      const wide = viewW > 760;
      const px = Math.round(Math.min(
        Math.max(x, (wide ? col.right + 10 : 0) + halfW + 10), viewW - 10 - halfW));
      const py = Math.round(Math.min(
        Math.max(y, (wide ? 0 : col.bottom + 10) + halfH + 10), viewH - halfH - 56));
      if (px === hintX && py === hintY) return;
      hintX = px; hintY = py;
      hint.style.left = px + "px";
      hint.style.top  = py + "px";
    }
  };
}
