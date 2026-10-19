/* ==========================================================================
   guide.js — the three-step guide.

   The page asks three things of a visitor, in this order: read the two
   explainer panels, find out that the car can be dragged, then classify the
   eight sensors. None of it is locked — the guide only ever points at the
   step you are on, and ticks it off once you have done it.

   The "drag me" hint is not a step cue: the canvas gives no sign that it can
   be spun, so a finger swipes over the car until the first touch of it.
   ========================================================================== */

const $ = id => document.getElementById(id);

const NEEDED = ["control", "monitor"];      /* the two panels step 1 asks for */

const NOW = {
  read: "Open 01 and 02 below.",
  drag: "Drag anywhere on the car to spin it.",
  quiz: "Click a numbered sensor on the car."
};

export function initGuide({ viewer, canvas, total }) {
  const stepsEl = $("steps");
  if (!stepsEl) return { topicOpened() {}, quizProgress() {} };

  const steps = [...stepsEl.querySelectorAll(".step")];
  const topicBtns = [...document.querySelectorAll("[data-topic]")];
  const hint = $("dragHint");
  const read = new Set();
  let dragged = false, done = 0;

  const isDone = key =>
    key === "read" ? NEEDED.every(t => read.has(t)) :
    key === "drag" ? dragged :
                     done >= total;

  function render() {
    const current = steps.find(el => !isDone(el.dataset.step));

    steps.forEach(el => {
      const ok = isDone(el.dataset.step), now = el === current;
      el.classList.toggle("done", ok);
      el.classList.toggle("now", now);
      el.querySelector(".s-mark").textContent = ok ? "✓" : "";
      el.querySelector(".s-stat").textContent = ok ? "Done." : now ? "Do this next." : "";
      if (now) el.setAttribute("aria-current", "step");
      else el.removeAttribute("aria-current");
    });

    $("quizCount").textContent = done ? ` — ${done}/${total} done` : "";
    const line = $("guideNow");
    line.textContent = current ? NOW[current.dataset.step] : "All three done. Nice.";
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

  /* Touching the car is the whole point of the hint, so the first touch of it
     retires the hint for good, whether or not it turns into a drag. */
  function dismissHint() {
    if (!hint || hint.hidden || hint.classList.contains("gone")) return;
    hint.classList.add("gone");
    setTimeout(() => { hint.hidden = true; }, 400);
  }

  /* A drag is a press that travels. A click on a hotspot and a wheel zoom
     both leave the camera where it was, so neither counts for step 2. */
  const view = canvas || $("view");
  let from = null;
  view.addEventListener("pointerdown", e => {
    from = { x: e.clientX, y: e.clientY };
    dismissHint();
  });
  addEventListener("pointerup",     () => { from = null; });
  addEventListener("pointercancel", () => { from = null; });
  addEventListener("pointermove", e => {
    if (!from || dragged) return;
    if (Math.hypot(e.clientX - from.x, e.clientY - from.y) < 28) return;
    dragged = true; from = null;
    render();
  });

  /* the same two panels, reachable from the loading screen */
  document.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", () => {
    const t = document.querySelector(`[data-topic="${b.dataset.open}"]`);
    if (t) t.click();
  }));

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
