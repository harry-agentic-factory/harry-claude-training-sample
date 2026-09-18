// Construit un TutorState réaliste (PO, étape 10.1) à partir des vrais fichiers du repo, pour le harness.
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseParcours, parseModule, extractFileRefs } from "./out/parse.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..", "..");
const skill = join(root, ".claude", "skills", "formation-guide");
const modules = parseParcours(readFileSync(join(skill, "parcours.md"), "utf8"));
const mk = (num) => { const f = readdirSync(join(skill, "modules")).find((n) => n.startsWith(num + "-")); return parseModule(readFileSync(join(skill, "modules", f), "utf8")); };
const m10 = mk("10"), m00 = mk("00");
const docs = Object.fromEntries(modules.map((r) => { const d = mk(r.num); return [r.num, { title: d.title, retenir: d.retenir, fiche: d.fiche }]; }));
const refs = extractFileRefs(m10.steps[0].segments.map((s) => s.md).join("\n") + "\n" + m10.concept).filter((r) => existsSync(join(root, r))).map((r) => ({ rel: r, label: r }));
const state = (etape, faits, sautes, current) => ({
  ficheUrl: "https://training.harington.fr/formation/fiche_prise_en_main_claude.html", hasProgress: true,
  progress: { version: 1, prenom: "Sam", profil: "po", os: "windows", etape, faits, sautes, notes: [] },
  modules, current, files: refs, docs,
});
const faits = Object.fromEntries(["00", "01", "02", "03", "04", "05"].map((n) => [n, "2026-09-17T09:00:00Z"]));
writeFileSync(join(here, "out", "state-10.json"), JSON.stringify(state("10.1", faits, ["06"], { module: m10, stepIndex: 0 })));
writeFileSync(join(here, "out", "state-10b.json"), JSON.stringify(state("10.2", { ...faits, "07": "x", "08": "x", "09": "x" }, ["06"], { module: m10, stepIndex: 1 })));
writeFileSync(join(here, "out", "state-00.json"), JSON.stringify(state("00.2", {}, [], { module: m00, stepIndex: 1 })));
writeFileSync(join(here, "out", "state-empty.json"), JSON.stringify({ ficheUrl: "", hasProgress: false, progress: null, modules, current: null, files: [], docs }));
const sb = state("10.2", { ...faits, "07": "2026-09-17T10:05:00Z", "08": "2026-09-17T10:12:00Z", "09": "2026-09-17T10:25:00Z" }, ["06"], { module: m10, stepIndex: 1 }); sb.progress.notes = ["ports remappés : back 18000 / front 18080", "github MCP non connecté (non bloquant)"]; writeFileSync(join(here, "out", "state-10b.json"), JSON.stringify(sb));
console.log("modules:", modules.length, "| m10 steps:", m10.steps.length, m10.steps.map((s) => s.k + "/" + s.m + " " + s.segments.map((g) => g.kind + (g.kind === "exercice" ? "[" + g.profils + "]" : "")).join(",")).join(" | "));
console.log("m00 pas 2 title:", m00.steps[1]?.title, "| fiche:", m00.fiche, "| files m10:", refs.map((r) => r.rel));
