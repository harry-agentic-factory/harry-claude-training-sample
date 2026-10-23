#!/usr/bin/env node
// Génère .formation/suivi.html : page autonome de suivi du parcours.
// Lit .formation/progress.json + la skill formation-guide (parcours.md, modules/*.md). Aucune dépendance.
// Usage : node tools/suivi/build.mjs [sortie.html]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const skill = path.join(root, ".claude/skills/formation-guide");
const progressPath = path.join(root, ".formation/progress.json");
const out = process.argv[2] ?? path.join(root, ".formation/suivi.html");

const read = (p) => fs.readFileSync(p, "utf8");
const mark = (c) => (c.includes("✅") ? "in" : c.includes("○") ? "optional" : "out");

/** Lignes du tableau de parcours.md → { num, title, path:{dev,po,techlead}, minutes:{dev,po,techlead} }. */
function parseParcours(md) {
  const rows = [];
  for (const line of md.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.trim().split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 6 || !/^\d{2}$/.test(cells[0])) continue;
    const nums = (cells[5].match(/\d+/g) ?? []).map(Number);
    const tl = cells[5].match(/techlead\s*(\d+)/i);
    const dev = nums[0] ?? 0;
    rows.push({
      num: cells[0],
      title: cells[1],
      path: { dev: mark(cells[2]), po: mark(cells[3]), techlead: mark(cells[4]) },
      minutes: { dev, po: nums[1] ?? dev, techlead: tl ? Number(tl[1]) : dev },
    });
  }
  return rows;
}

/** Un fichier de module → { fiche, concept, steps:[{k,m,title,md}], retenir, question }. */
function parseModule(md) {
  const lines = md.split(/\r?\n/);
  const meta = lines[1] ?? "";
  const grab = (re) => meta.match(re)?.[1]?.trim() ?? "";
  const doc = { fiche: grab(/Fiche\s*:\s*([^·]+)/), duree: grab(/Durée\s*:\s*(.+)$/), concept: "", steps: [], retenir: "", question: "" };
  const secs = [];
  let cur = null;
  for (const line of lines.slice(2)) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) { cur = { heading: h[1].trim(), body: [] }; secs.push(cur); }
    else if (cur) cur.body.push(line);
  }
  for (const s of secs) {
    const body = s.body.filter((l) => !l.trim().startsWith("<!--")).join("\n").trim();
    if (/^Concept/.test(s.heading)) doc.concept = body;
    else if (/^À retenir/.test(s.heading)) doc.retenir = body;
    else if (/^Question de contrôle/.test(s.heading)) doc.question = body;
    else {
      const p = s.heading.match(/^Pas\s+(\d+)\/(\d+)\s+[—-]\s+(.+)$/);
      if (p) doc.steps.push({ k: Number(p[1]), m: Number(p[2]), title: p[3].trim(), md: body });
    }
  }
  return doc;
}

const rows = parseParcours(read(path.join(skill, "parcours.md")));
const files = fs.readdirSync(path.join(skill, "modules")).filter((f) => /^\d{2}-.*\.md$/.test(f));
const modules = rows.map((r) => {
  const f = files.find((x) => x.startsWith(r.num + "-"));
  return { ...r, ...(f ? parseModule(read(path.join(skill, "modules", f))) : {}) };
});

let progress = null;
try { progress = JSON.parse(read(progressPath)); } catch { /* pas encore de progression : page d'aperçu */ }

const data = {
  demo: !progress,
  prenom: progress?.prenom ?? "Aperçu",
  profil: progress?.profil ?? "dev",
  etape: progress?.etape ?? "00.1",
  faits: progress?.faits ?? {},
  sautes: progress?.sautes ?? [],
  notes: progress?.notes ?? [],
  modules,
};

const html = read(path.join(here, "template.html")).replace("__DATA__", JSON.stringify(data).replace(/</g, "\\u003c"));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`Page de suivi générée : ${path.relative(root, out)}`);
