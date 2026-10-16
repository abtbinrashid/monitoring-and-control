/* ==========================================================================
   preload.js — begins the model download during HTML parse.

   Loaded as a classic script in <head> so it runs before the module graph.
   Without this the model cannot start downloading until three.js has been
   fetched and parsed, leaving the connection idle during startup.
   ========================================================================== */
(function () {
  window.__modelURL   = "assets/models/car.glb";
  window.__modelBytes = 17416816;

  window.__modelFetch = (async () => {
    const res = await fetch(window.__modelURL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    if (!res.body) return res.arrayBuffer();           /* older browsers */

    const reader = res.body.getReader();
    const chunks = [];
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      if (window.__onModelProgress) {
        window.__onModelProgress(loaded, window.__modelBytes);
      }
    }
    const out = new Uint8Array(loaded);
    let at = 0;
    for (const c of chunks) { out.set(c, at); at += c.length; }
    return out.buffer;
  })();

  window.__modelFetch.catch(() => {});   /* real handling lives in viewer.js */
})();
