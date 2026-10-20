/* ==========================================================================
   main.js — the plain model viewer (index.html)
   ========================================================================== */
import { createViewer } from "./viewer.js";
import { mountLang, t, onLangChange } from "./lang.js";

mountLang();
onLangChange(() => { document.title = t().modelTitle; });
document.title = t().modelTitle;

createViewer({ canvas: document.getElementById("view") });
