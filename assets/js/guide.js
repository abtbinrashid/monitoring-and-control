/* ==========================================================================
   guide.js — the three-step guide.

   The page asks three things of a visitor, in this order: read the two
   explainer panels, find out that the car can be dragged, then classify the
   eight sensors. None of it is locked — the guide only ever points at the
   step you are on, and ticks it off once you have done it.

   The "drag me" hint is not a step cue: the canvas gives no sign that it can
   be spun, so it stays on screen for the whole session and only dims once.
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
    if (hint) hint.classList.toggle("seen", dragged);
  }

  /* The hint waits for the model: until then the loading panel covers it. */
  if (hint) {
    const show = () => { hint.hidden = false; };
    if (viewer && viewer.ready) viewer.ready.then(show, show); else show();
  }

  /* A drag is a press that travels. A click on a hotspot and a wheel zoom
     both leave the camera where it was, so neither counts. */
  const view = canvas || $("view");
  let from = null;
  view.addEventListener("pointerdown", e => { from = { x: e.clientX, y: e.clientY }; });
  addEventListener("pointerup",     () => { from = null; });
  addEventListener("pointercancel", () => { from = null; });
  addEventListener("pointermove", e => {
    if (!from || dragged) return;
    if (Math.hypot(e.clientX - from.x, e.clientY - from.y) < 28) return;
    dragged = true; from = null;
    render();
  });

  render();

  /* Put the pill under the car. Its own width is measured once rather than
     every frame, because this runs inside the render loop, and it is kept
     clear of the left-hand column so it cannot slide under the panels. */
  let hintX = -1, hintW = 0;
  addEventListener("resize", () => { hintW = 0; hintX = -1; });
  return {
    topicOpened(key) { if (!read.has(key)) { read.add(key); render(); } },
    quizProgress(n)  { if (n !== done)    { done = n;      render(); } },
    trackX(x, viewW) {
      if (!hint || hint.hidden) return;
      if (!hintW) hintW = hint.offsetWidth || 120;
      const half = hintW / 2;
      const left = (viewW > 760 ? 380 : 12) + half;           /* past the panels */
      const px = Math.round(Math.min(Math.max(x, left), viewW - 12 - half));
      if (px === hintX) return;
      hintX = px;
      hint.style.left = px + "px";
    }
  };
}
