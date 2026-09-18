// Parseurs purs (sans dépendance vscode) des fichiers de la skill formation-guide.
import type { ModuleDoc, ModuleRow, PathMark, Profil, StepSegment } from "./types";

export function parseParcours(md: string): ModuleRow[] {
  const rows: ModuleRow[] = [];
  const mark = (c: string): PathMark => (c.includes("✅") ? "in" : c.includes("○") ? "optional" : "out");
  for (const line of md.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line.trim().split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 6 || !/^\d{2}$/.test(cells[0])) continue;
    rows.push({ num: cells[0], title: cells[1], path: { dev: mark(cells[2]), po: mark(cells[3]), techlead: mark(cells[4]) }, duree: cells[5] });
  }
  return rows;
}

export function parseModule(md: string): ModuleDoc {
  const lines = md.split(/\r?\n/);
  const doc: ModuleDoc = { num: "", title: "", fiche: "", profils: "", duree: "", concept: "", steps: [], retenir: "", question: "" };
  const h1 = lines[0]?.match(/^#\s+Module\s+(\d{2})\s+[—-]\s+(.+)$/);
  if (h1) { doc.num = h1[1]; doc.title = h1[2].trim(); }
  const meta = lines[1] ?? "";
  const grab = (re: RegExp) => meta.match(re)?.[1]?.trim() ?? "";
  doc.fiche = grab(/Fiche\s*:\s*([^·]+)/);
  doc.profils = grab(/Profils\s*:\s*([^·]+)/);
  doc.duree = grab(/Durée\s*:\s*(.+)$/);

  type Sec = { heading: string; body: string[] };
  const secs: Sec[] = [];
  let cur: Sec | null = null;
  for (const line of lines.slice(2)) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) { cur = { heading: h[1].trim(), body: [] }; secs.push(cur); }
    else if (cur) cur.body.push(line);
  }
  for (const s of secs) {
    const body = s.body.join("\n").trim();
    if (/^Concept/.test(s.heading)) doc.concept = body;
    else if (/^À retenir/.test(s.heading)) doc.retenir = body;
    else if (/^Question de contrôle/.test(s.heading)) doc.question = body;
    else {
      const p = s.heading.match(/^Pas\s+(\d+)\/(\d+)\s+[—-]\s+(.+)$/);
      if (p) doc.steps.push({ k: +p[1], m: +p[2], title: p[3].trim(), segments: parseSegments(body) });
    }
  }
  return doc;
}

function parseSegments(body: string): StepSegment[] {
  const segs: StepSegment[] = [];
  let cur: StepSegment = { kind: "text", profils: ["tous"], md: "" };
  const push = () => { if (cur.md.trim()) segs.push({ ...cur, md: cur.md.trim() }); };
  for (const line of body.split("\n")) {
    const mk = line.match(/^\*\*(Exercice|Vérification|Si ça bloque|Réparation)(?:\s*\(([^)]*)\)?)?\*\*\s*:\s*(.*)$/);
    if (!mk) { cur.md += "\n" + line; continue; }
    push();
    const kind = mk[1] === "Exercice" ? "exercice" : mk[1] === "Vérification" ? "verification" : mk[1] === "Si ça bloque" ? "blocage" : "reparation";
    const profils = mk[2] ? (mk[2].match(/dev|po|techlead|tous/g) ?? ["tous"]) : ["tous"];
    cur = { kind, profils, md: mk[3] };
  }
  push();
  return segs;
}

/** Chemins de fichiers cités entre backticks dans un markdown (candidats, non vérifiés). */
export function extractFileRefs(md: string): string[] {
  const out = new Set<string>();
  const re = /`([^`\n]+)`/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    const t = m[1].trim();
    if (/[\s<>$|*?"']/.test(t) || /^https?:/.test(t)) continue;
    if (!/\.(md|json|jsx?|tsx?|py|ya?ml|sh|conf|txt|toml|ini|html|css)$/i.test(t)) continue;
    out.add(t.replace(/^\.\//, ""));
  }
  return [...out];
}

/** "45 / 25", "10 / 10 (techlead 20)" → minutes par profil. */
export function parseDurees(d: string): Record<Profil, number> {
  const nums = d.match(/\d+/g)?.map(Number) ?? [];
  const tl = d.match(/techlead\s*(\d+)/i);
  const dev = nums[0] ?? 0;
  return { dev, po: nums[1] ?? dev, techlead: tl ? +tl[1] : dev };
}

/** Étape courante : "10.2" → { num: "10", k: 2 } */
export function parseEtape(etape: string | undefined): { num: string; k: number } | null {
  const m = etape?.match(/^(\d{1,2})(?:\.(\d+))?$/);
  if (!m) return null;
  return { num: m[1].padStart(2, "0"), k: m[2] ? +m[2] : 1 };
}

/** Pour l'exercice du profil : segments "exercice" dont les profils incluent le profil ou "tous". */
export function isForProfil(seg: StepSegment, profil: string | undefined): boolean {
  if (seg.kind !== "exercice") return true;
  if (!profil) return true;
  return seg.profils.includes("tous") || seg.profils.includes(profil);
}
