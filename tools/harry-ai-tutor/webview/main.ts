// UI du panneau Harry AI Tutor : carte animée, étape courante, fichiers, pont vers Claude Code.
import { marked } from "marked";
import type { HostMessage, ModuleRow, Profil, StepSegment, TutorState, WebviewMessage } from "../src/types";
import { parseDurees } from "../src/parse";
import { confetti } from "./confetti";

declare const acquireVsCodeApi: () => { postMessage(m: unknown): void };
declare global { interface Window { __HARRY__: { dist: string; models: string; media: string }; __harry?: unknown } }

const vscode = typeof acquireVsCodeApi === "function" ? acquireVsCodeApi() : { postMessage: (m: unknown) => console.log("[post]", m) };
const boot = window.__HARRY__;
const post = (m: WebviewMessage) => vscode.postMessage(m);
marked.use({ gfm: true, breaks: false });
const md = (s: string) => marked.parse(s ?? "") as string;
const esc = (s: string) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

const MASCOT = `<svg class="mascot" viewBox="0 0 64 64" aria-hidden="true">
  <line x1="32" y1="11" x2="32" y2="5" stroke="#7B9FC7" stroke-width="2.5" stroke-linecap="round"/><circle class="bulb" cx="32" cy="4.5" r="3.2" fill="#C187A1"/>
  <circle cx="32" cy="35" r="24" fill="#354866"/>
  <rect x="13" y="21" width="38" height="25" rx="12.5" fill="#455B7B"/>
  <g class="eyes"><circle cx="24" cy="32" r="5" fill="#fff"/><circle cx="40" cy="32" r="5" fill="#fff"/><circle cx="25" cy="32.5" r="2.3" fill="#354866"/><circle cx="41" cy="32.5" r="2.3" fill="#354866"/></g>
  <rect class="mouth" x="26" y="41" width="12" height="3" rx="1.5" fill="#C187A1"/>
  <circle cx="8" cy="36" r="3" fill="#7B9FC7"/><circle cx="56" cy="36" r="3" fill="#7B9FC7"/>
</svg>`;

let state: TutorState | null = null;
let prevDone = -1;
let pendingGoto: string | null = null;
let view: "parcours" | "bilan" = "parcours";
let bridge: "claude" | "terminal" = "claude";
let claudeExt = true;
let claudeCardDismissed = false;
let toastTimer: ReturnType<typeof setTimeout> | undefined;
let interacted = false;
const doneSegs = new Set<string>();
const app = document.getElementById("app") as HTMLElement;


// ---------- rendu ----------
function pathModules(s: TutorState): ModuleRow[] {
  const prof = s.progress?.profil as Profil | undefined;
  return s.modules.filter((m) => !prof || m.path[prof] !== "out");
}
type NodeStatus = "done" | "current" | "skipped" | "optional" | "todo";
function nodeStatus(s: TutorState, m: ModuleRow): NodeStatus {
  const prof = s.progress?.profil as Profil | undefined;
  if (s.progress?.faits?.[m.num]) return "done";
  if (m.num === s.current?.module.num) return "current";
  if (s.progress?.sautes?.includes(m.num)) return "skipped";
  if (prof && m.path[prof] === "optional") return "optional";
  return "todo";
}
const countDone = (s: TutorState) => pathModules(s).filter((m) => s.progress?.faits?.[m.num]).length;


function renderHeader(s: TutorState): string {
  const p = s.progress;
  const chip = p?.prenom ? `<span class="chip">${esc(p.prenom)} · ${esc(p.profil ?? "?")}${p.os ? " · " + esc(p.os) : ""}</span>` : "";
  return `<header class="hd">${MASCOT}
    <div class="brand"><div class="t">Harry <span>AI Tutor</span></div><div class="sub">Prise en main de Claude</div></div>
    <div class="hd-actions">
      <button class="icon" data-act="fiche" title="Ouvrir la fiche de formation">📖</button>
      ${s.hasProgress ? `<button class="icon" data-act="reset" title="Réinitialiser la progression">↺</button>` : ""}
    </div>
    ${chip ? `<div class="trainee">${chip}<span class="prog">${countDone(s)} / ${pathModules(s).length} modules</span></div>` : ""}
  </header>`;
}

function renderMap(s: TutorState): string {
  const mods = pathModules(s); const n = mods.length;
  const GAP = 46;
  const H = 30 + Math.max(0, n - 1) * GAP + 30;
  const pos = (i: number) => ({ x: i % 2 === 0 ? 72 : 168, y: 30 + i * GAP });
  let segs = "", nodes = "";
  for (let i = 0; i < n; i++) {
    const { x, y } = pos(i); const st = nodeStatus(s, mods[i]);
    if (i < n - 1) {
      const b = pos(i + 1); const stNext = nodeStatus(s, mods[i + 1]);
      const reached = st === "done" && (stNext === "done" || stNext === "current");
      segs += `<path class="seg${reached ? " done" : ""}" data-seg="${mods[i].num}-${mods[i + 1].num}" d="M${x} ${y} C ${x} ${y + 26}, ${b.x} ${b.y - 26}, ${b.x} ${b.y}"/>`;
    }
    const right = i % 2 === 0;
    const inner = st === "done" ? `<path class="check" d="M-6 0 l4 4 l8 -8"/>` : st === "skipped" ? `<text class="num">↺</text>` : `<text class="num">${+mods[i].num}</text>`;
    nodes += `<g class="node ${st}" data-num="${mods[i].num}" transform="translate(${x} ${y})" tabindex="0" role="button" aria-label="Module ${mods[i].num} : ${esc(mods[i].title)}">
      ${st === "current" ? `<circle class="pulse" r="16"/>` : ""}<circle class="dot" r="15"/>${inner}
      <text class="lbl" x="${right ? 24 : -24}" y="4" text-anchor="${right ? "start" : "end"}">${esc(mods[i].title)}</text></g>`;
  }
  const goto = pendingGoto ? `<div class="goto">Aller au module ${+pendingGoto} ? <button class="btn small primary" data-act="goto-yes">Oui, /formation ${+pendingGoto}</button><button class="btn small ghost" data-act="goto-no">Non</button></div>` : "";
  return `<section class="card map"><svg viewBox="0 0 240 ${H}" width="100%" height="${H}" role="list">${segs}${nodes}</svg>${goto}</section>`;
}

function renderSegment(seg: StepSegment, prof: string | undefined): string {
  if (seg.kind === "text") return `<div class="seg text">${md(seg.md)}</div>`;
  const mine = seg.kind !== "exercice" || !prof || seg.profils.includes("tous") || seg.profils.includes(prof);
  const label = seg.kind === "exercice" ? "Exercice" + (seg.profils.includes("tous") ? "" : " (" + seg.profils.join(" / ") + ")")
    : seg.kind === "verification" ? "Ce que Harry vérifie au Suivant" : seg.kind === "blocage" ? "Si ça bloque" : "Réparation";
  if (!mine) return `<details class="seg other"><summary>${esc(label)}</summary>${md(seg.md)}</details>`;
  return `<div class="seg ${seg.kind}${seg.kind === "exercice" ? " mine" : ""}"><div class="seglabel">${esc(label)}</div>${md(seg.md)}</div>`;
}

function renderStep(s: TutorState): string {
  const { module: m, stepIndex } = s.current!;
  const step = m.steps[stepIndex]; const prof = s.progress?.profil;
  const files = s.files.map((f) => `<button class="chip file" data-act="open" data-rel="${esc(f.rel)}" title="Ouvrir ${esc(f.rel)}">📄 ${esc(f.label)}</button>`).join("");
  return `<section class="card step enter">
    <div class="kicker"><span>Module ${m.num}${step ? ` · pas ${step.k}/${step.m}` : ""}</span><a href="#" data-act="fiche" class="fiche">${esc(m.fiche || "§" + +m.num)} de la fiche ↗</a></div>
    <h2>${esc(step?.title ?? m.title)}</h2>
    <div class="mtitle">${esc(m.title)}${m.duree ? " · " + esc(m.duree) : ""}</div>
    <details class="concept"${stepIndex === 0 ? " open" : ""}><summary>Concept</summary>${md(m.concept)}</details>
    <div class="segs">${step ? step.segments.map((sg) => renderSegment(sg, prof)).join("") : md(m.concept)}</div>
    ${files ? `<div class="files">${files}</div>` : ""}
    ${m.retenir ? `<div class="retenir"><b>À retenir</b>${md(m.retenir)}</div>` : ""}
  </section>`;
}

const renderWelcome = () => `<section class="card welcome enter">
  <h2>Bonjour ! Je suis Harry.</h2>
  <p>Je t'accompagne dans la formation « Prise en main de Claude ».
  ${bridge === "claude"
    ? `Je prépare <code>/formation</code> dans le panneau Claude Code : tu valides avec <b>Entrée</b>, tu lui donnes ton prénom et ton profil, puis tu reviens ici.`
    : `Je lance Claude Code dans un terminal et je tape <code>/formation</code> pour toi. Réponds-lui ton prénom et ton profil, puis reviens ici.`}
  La carte et les étapes apparaissent au fur et à mesure.</p>
  <button class="btn primary big" data-act="start">Démarrer la formation</button>
  <p class="hint">Claude Code déjà ouvert ? Tape simplement <code>/formation</code> dedans : je suis la progression dans <code>.formation/progress.json</code>.</p>
</section>`;

const renderClaudeMissing = () => `<section class="card warn enter">
  <h2>Claude Code n'est pas installé</h2>
  <ol class="steps">
    <li>Clique <b>Installer Claude Code</b> ci-dessous (ou : Extensions <kbd>Ctrl+Shift+X</kbd>, cherche « Claude Code », éditeur Anthropic, <b>Install</b>).</li>
    <li>Ouvre Claude Code (icône dans la barre) et <b>connecte-toi</b> : compte Pro, Max, Team ou Enterprise.</li>
    <li>Reviens ici : cette carte disparaît toute seule.</li>
  </ol>
  <div class="step-actions">
    <button class="btn primary" data-act="install-claude">Installer Claude Code</button>
    <button class="btn ghost" data-act="show-claude">Voir dans le Marketplace</button>
  </div>
  <div class="step-actions"><button class="btn ghost" data-act="dismiss-claude">Continuer avec le terminal intégré</button></div>
</section>`;

const renderFooter = () => view === "bilan"
  ? `<footer class="ft"><button class="btn primary big" data-act="parcours">◀ Retour au parcours</button></footer>`
  : `<footer class="ft"><button class="btn primary big" data-act="next">Suivant ▶</button><button class="btn ghost" data-act="bilan">Bilan</button></footer>`;

// ---------- bilan ----------
const fmtMin = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")}` : `${min} min`);
const sayMin = (min: number) => { const h = Math.floor(min / 60), m = min % 60; return [h ? `${h} heure${h > 1 ? "s" : ""}` : "", m ? `${m} minute${m > 1 ? "s" : ""}` : ""].filter(Boolean).join(" ") || "0 minute"; };
const fmtTime = (iso: string) => { const d = new Date(iso); return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); };

function bilanData(s: TutorState) {
  const prof = (s.progress?.profil ?? "dev") as Profil;
  const faits = s.progress?.faits ?? {}; const sautes = s.progress?.sautes ?? [];
  const mods = pathModules(s);
  const required = mods.filter((m) => m.path[prof] === "in");
  const done = mods.filter((m) => faits[m.num]);
  const skipped = mods.filter((m) => !faits[m.num] && sautes.includes(m.num));
  const remaining = mods.filter((m) => !faits[m.num] && !sautes.includes(m.num));
  const dur = (m: ModuleRow) => parseDurees(m.duree)[prof];
  const sum = (arr: ModuleRow[]) => arr.reduce((a, m) => a + dur(m), 0);
  const remReq = remaining.filter((m) => m.path[prof] === "in"), remOpt = remaining.filter((m) => m.path[prof] === "optional");
  const pct = Math.round((100 * done.filter((m) => m.path[prof] === "in").length) / Math.max(1, required.length));
  const dates = Object.values(faits).map((d) => Date.parse(d)).filter((n) => !isNaN(n));
  const elapsed = dates.length ? Math.max(0, Math.round((Math.max(Date.now(), ...dates) - Math.min(...dates)) / 60000)) : null;
  return { prof, faits, mods, required, done, skipped, remaining, remReq, remOpt, dur, sum, pct, elapsed };
}

function renderBilan(s: TutorState): string {
  const b = bilanData(s);
  const li = (m: ModuleRow, extra: string) => `<li><span class="n">${+m.num}</span><span class="t">${esc(m.title)}</span><span class="d">${extra}</span></li>`;
  const C = 2 * Math.PI * 34;
  const retenirs = b.done.map((m) => s.docs?.[m.num]?.retenir).filter(Boolean).map((r) => `<li>${md(r as string)}</li>`).join("");
  return `<section class="card bilan enter">
    <div class="kicker"><span>Bilan</span><span>${esc(s.progress?.prenom ?? "")} · ${esc(b.prof)}</span></div>
    <div class="ring-row">
      <div class="ring"><svg viewBox="0 0 80 80"><circle class="bg" cx="40" cy="40" r="34"/><circle class="fg" cx="40" cy="40" r="34" style="stroke-dasharray:${C};stroke-dashoffset:${C * (1 - b.pct / 100)}"/></svg><div class="pct"><b>${b.pct}%</b></div></div>
      <div class="stats">
        <div><b>${b.done.length} / ${b.required.length}</b><span>modules du parcours</span></div>
        <div><b>${b.elapsed !== null ? fmtMin(b.elapsed) : "—"}</b><span>depuis le premier module</span></div>
        <div><b>${fmtMin(b.sum(b.remReq))}</b><span>restant (estimé)${b.remOpt.length ? ` + ${fmtMin(b.sum(b.remOpt))} d'optionnel` : ""}</span></div>
      </div>
    </div>
    ${s.current ? `<p class="now">En cours : <b>module ${+s.current.module.num} · pas ${s.current.stepIndex + 1}</b> — ${esc(s.current.module.title)}</p>` : ""}
    <h3>✅ Faits <span>${b.done.length}</span></h3>
    <ul class="mods">${b.done.map((m) => li(m, fmtTime(b.faits[m.num]))).join("") || `<li class="empty">aucun pour l'instant</li>`}</ul>
    ${b.skipped.length ? `<h3>↺ Sautés <span>${b.skipped.length}</span></h3><ul class="mods">${b.skipped.map((m) => li(m, `<button class="btn small ghost" data-act="goto-direct" data-num="${m.num}">y aller</button>`)).join("")}</ul>` : ""}
    <h3>⏭ Restants <span>${b.remaining.length}</span></h3>
    <ul class="mods">${b.remaining.map((m) => li(m, `${b.dur(m)} min${m.path[b.prof] === "optional" ? " · opt." : ""}`)).join("") || `<li class="empty">parcours terminé 🎉</li>`}</ul>
    ${retenirs ? `<details class="retenirs-box"${b.done.length <= 5 ? " open" : ""}><summary>💡 À retenir <span>${b.done.length} module${b.done.length > 1 ? "s" : ""} fait${b.done.length > 1 ? "s" : ""}</span></summary><ul class="retenirs">${retenirs}</ul></details>` : ""}
    ${s.progress?.notes?.length ? `<h3>📝 Notes</h3><ul class="notes">${s.progress.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : ""}
    <div class="step-actions"><button class="btn primary" data-act="bilan-harry">Demander le bilan à Harry</button><button class="btn ghost" data-act="reset" title="Efface la progression, repart à l'accueil">↺ Réinitialiser</button></div>
    <p class="hint">Harry (dans le terminal) ajoute les 3 choses à retenir de <b>ton</b> parcours et propose les modules sautés.</p>
  </section>`;
}


function render() {
  if (!state) return;
  const s = state;
  if (!s.hasProgress) view = "parcours";
  app.innerHTML = [
    renderHeader(s),
    s.error ? `<div class="card err">${esc(s.error)}</div>` : "",
    !claudeExt && !claudeCardDismissed ? renderClaudeMissing() : "",
    !s.hasProgress && !s.error ? renderWelcome() : "",
    view === "bilan" ? renderBilan(s) : "",
    view === "parcours" && s.modules.length ? renderMap(s) : "",
    view === "parcours" ? (s.current ? renderStep(s) : s.hasProgress ? `<div class="card"><p>Tape <code>/formation</code> dans le terminal Claude pour reprendre là où tu en étais.</p></div>` : "") : "",
    s.hasProgress ? renderFooter() : "",
    `<canvas id="confetti"></canvas>`,
  ].join("");
  animateSegments();
}

function animateSegments() {
  for (const el of app.querySelectorAll<SVGPathElement>("path.seg.done")) {
    const len = el.getTotalLength(); const key = el.dataset.seg ?? "";
    el.style.strokeDasharray = String(len);
    if (doneSegs.has(key)) { el.style.strokeDashoffset = "0"; continue; }
    doneSegs.add(key);
    el.style.transition = "none"; el.style.strokeDashoffset = String(len);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transition = ""; el.style.strokeDashoffset = "0"; }));
  }
}


function toast(kind: "ok" | "warn", text: string) {
  let el = document.getElementById("toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.className = `toast ${kind} on`; el.textContent = text;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el?.classList.remove("on"), kind === "ok" ? 7000 : 10000);
}

// ---------- événements ----------
app.addEventListener("click", (ev) => {
  const t = (ev.target as HTMLElement).closest<HTMLElement>("[data-act], g.node");
  if (!t) return;
  interacted = true;
  if (t.matches("g.node")) { pendingGoto = t.dataset.num ?? null; render(); return; }
  const act = t.dataset.act; ev.preventDefault();
  switch (act) {
    case "start": post({ type: "cmd", cmd: "start" }); break;
    case "next": post({ type: "cmd", cmd: "next" }); break;
    case "bilan": view = "bilan"; render(); break;
    case "parcours": view = "parcours"; render(); break;
    case "bilan-harry": post({ type: "cmd", cmd: "bilan" }); break;
    case "reset": post({ type: "cmd", cmd: "reset" }); break;
    case "install-claude": post({ type: "installClaude" }); break;
    case "show-claude": post({ type: "showClaude" }); break;
    case "dismiss-claude": claudeCardDismissed = true; render(); break;
    case "goto-direct": if (t.dataset.num) { post({ type: "cmd", cmd: "goto", arg: t.dataset.num }); view = "parcours"; render(); } break;
    case "goto-yes": if (pendingGoto) post({ type: "cmd", cmd: "goto", arg: pendingGoto }); pendingGoto = null; render(); break;
    case "goto-no": pendingGoto = null; render(); break;
    case "open": if (t.dataset.rel) post({ type: "open", rel: t.dataset.rel }); break;
    case "fiche": if (state) post({ type: "openExternal", url: state.ficheUrl }); break;
  }
});

function onState(s: TutorState) {
  const first = state === null;
  if (!s.hasProgress) { doneSegs.clear(); pendingGoto = null; view = "parcours"; }
  state = s;
  const done = Object.keys(s.progress?.faits ?? {}).length;
  render();
  if (!first && done > prevDone && prevDone >= 0) { const c = document.getElementById("confetti") as HTMLCanvasElement | null; if (c) confetti(c); }
  prevDone = done;
}

window.addEventListener("message", (ev: MessageEvent<HostMessage>) => {
  const m = ev.data;
  if (m.type === "state") onState(m.state);
  else if (m.type === "config") { bridge = m.bridge; claudeExt = m.claudeExt; if (claudeExt) claudeCardDismissed = false; render(); }
  else if (m.type === "toast") toast(m.kind, m.text);
});

window.__harry = { toast, inject: onState, state: () => state, setView: (v: "parcours" | "bilan") => { view = v; render(); }, config: (c: { bridge: "claude" | "terminal"; claudeExt: boolean }) => { bridge = c.bridge; claudeExt = c.claudeExt; if (claudeExt) claudeCardDismissed = false; render(); } };
post({ type: "ready" });
