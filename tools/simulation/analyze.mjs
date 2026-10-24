// Evaluates a simulated session: global metrics, per-module metrics, exit criteria, turns to re-read.
// Usage: node tools/simulation/analyze.mjs <run output dir>
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
const L = fs.readFileSync(path.join(dir, "transcript.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l)).filter((e) => e.tutor !== undefined);
const strip = (t) => (t || "").replace(/```[\s\S]*?```/g, "");
const words = (t) => strip(t).split(/\s+/).filter(Boolean).length;
const mod = (e) => (e.etape ? String(e.etape).split(".")[0].padStart(2, "0") : "--");
const valid = L.filter((e) => e.student && e.student.clarte > 0);
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

const clarte = avg(valid.map((e) => e.student.clarte));
const tooLong = L.filter((e) => e.student && /trop long/.test(e.student.longueur)).length;
const wmax = Math.max(...L.map((e) => words(e.tutor)));
const over = L.filter((e) => words(e.tutor) > 220);
const modules = [...new Set(L.map(mod))].filter((m) => m !== "--");
const last = L.at(-1);

console.log(`# Session ${path.basename(dir)}`);
console.log(`tours: ${L.length} · dernière étape: ${last?.etape} · coût: ${L.at(-1)?.cost_cumul ?? "?"} $`);
console.log(`clarté moyenne: ${clarte.toFixed(2)} · « trop long »: ${tooLong} · mots max (hors code): ${wmax} · messages > 220 mots: ${over.length}`);
console.log(`modules traversés: ${modules.join(" ")}\n`);

console.log("## Par module");
for (const m of modules) {
  const E = L.filter((e) => mod(e) === m), V = E.filter((e) => e.student && e.student.clarte > 0);
  console.log(`${m}: ${E.length} tours · clarté ${avg(V.map((e) => e.student.clarte)).toFixed(2)} · mots moy ${Math.round(avg(E.map((e) => words(e.tutor))))} · trop long ${E.filter((e) => e.student && /trop long/.test(e.student.longueur)).length}`);
}

console.log("\n## Critères de sortie");
const finished = /bilan|FIN/i.test(JSON.stringify(last?.student ?? "")) || modules.includes("17");
console.log(`- parcours complet (module 17 atteint): ${finished ? "OUI" : "NON"}`);
console.log(`- clarté ≥ 4,3: ${clarte >= 4.3 ? "OUI" : "NON"} (${clarte.toFixed(2)})`);
console.log(`- aucun message > 220 mots: ${over.length === 0 ? "OUI" : "NON (" + over.map((e) => "T" + e.turn).join(",") + ")"}`);

console.log("\n## Tours à relire (clarté ≤ 3, « trop long », ou confusion sur un terme)");
for (const e of L) {
  const s = e.student;
  if (!s) continue;
  if (s.clarte <= 3 || /trop long/.test(s.longueur) || words(e.tutor) > 220)
    console.log(`T${e.turn} [${e.etape}] ${words(e.tutor)} mots · clarté ${s.clarte} · ${s.longueur} · ${JSON.stringify((s.confusion || "").slice(0, 220))}`);
}

console.log("\n## Confusions (toutes)");
for (const e of L) if (e.student?.confusion) console.log(`T${e.turn} [${e.etape}] ${JSON.stringify(e.student.confusion.slice(0, 200))}`);
