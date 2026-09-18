import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import { FICHE_URL, type FileRef, type ModuleDoc, type Progress, type TutorState } from "./types";
import { extractFileRefs, parseEtape, parseModule, parseParcours } from "./parse";

const SKILL_DIR = path.join(".claude", "skills", "formation-guide");
const PROGRESS = path.join(".formation", "progress.json");

/** Lit et surveille progress.json + les fichiers de la skill ; publie un TutorState. */
export class ProgressStore implements vscode.Disposable {
  private readonly emitter = new vscode.EventEmitter<TutorState>();
  readonly onDidChange = this.emitter.event;
  private readonly disposables: vscode.Disposable[] = [this.emitter];
  private timer: NodeJS.Timeout | undefined;
  state: TutorState;

  constructor(readonly root: string) {
    for (const pattern of [".formation/progress.json", ".formation", ".claude/skills/formation-guide/**/*.md"]) {
      const w = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(vscode.Uri.file(root), pattern));
      w.onDidChange(() => this.schedule()); w.onDidCreate(() => this.schedule()); w.onDidDelete(() => this.schedule());
      this.disposables.push(w);
    }
    this.state = this.compute();
  }

  private schedule() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.refresh(), 150);
  }

  refresh() { this.state = this.compute(); this.emitter.fire(this.state); }

  private read(rel: string): string | null {
    try { return fs.readFileSync(path.join(this.root, rel), "utf8"); } catch { return null; }
  }

  compute(): TutorState {
    const state: TutorState = { ficheUrl: FICHE_URL, hasProgress: false, progress: null, modules: [], current: null, files: [], docs: {} };
    const parcours = this.read(path.join(SKILL_DIR, "parcours.md"));
    if (!parcours) { state.error = "Skill formation-guide introuvable (ouvre le repo harry-claude-training-sample)."; return state; }
    state.modules = parseParcours(parcours);
    for (const row of state.modules) { const d = this.loadModule(row.num); if (d) state.docs[row.num] = { title: d.title, retenir: d.retenir, fiche: d.fiche }; }

    const raw = this.read(PROGRESS);
    if (raw) {
      try { state.progress = JSON.parse(raw) as Progress; state.hasProgress = true; }
      catch { state.error = "progress.json illisible (JSON invalide)."; }
    }
    const et = parseEtape(state.progress?.etape);
    if (et) {
      const mod = this.loadModule(et.num);
      if (mod) {
        let idx = mod.steps.findIndex((s) => s.k === et.k);
        if (idx < 0) idx = 0;
        state.current = { module: mod, stepIndex: idx };
        state.files = this.resolveFiles(mod, idx);
      }
    }
    return state;
  }

  private loadModule(num: string): ModuleDoc | null {
    const dir = path.join(this.root, SKILL_DIR, "modules");
    let files: string[] = [];
    try { files = fs.readdirSync(dir); } catch { return null; }
    const f = files.find((n) => n.startsWith(num + "-") && n.endsWith(".md"));
    if (!f) return null;
    const md = this.read(path.join(SKILL_DIR, "modules", f));
    return md ? parseModule(md) : null;
  }

  private resolveFiles(mod: ModuleDoc, stepIndex: number): FileRef[] {
    const step = mod.steps[stepIndex];
    const md = [step?.segments.map((s) => s.md).join("\n") ?? "", stepIndex === 0 ? mod.concept : ""].join("\n");
    const out: FileRef[] = [];
    for (const rel of extractFileRefs(md)) {
      for (const cand of [rel, path.join("frontend", rel), path.join("backend", rel)]) {
        if (fs.existsSync(path.join(this.root, cand)) && fs.statSync(path.join(this.root, cand)).isFile()) {
          if (!out.some((f) => f.rel === cand)) out.push({ rel: cand, label: rel });
          break;
        }
      }
    }
    return out;
  }

  dispose() { clearTimeout(this.timer); for (const d of this.disposables) d.dispose(); }
}
