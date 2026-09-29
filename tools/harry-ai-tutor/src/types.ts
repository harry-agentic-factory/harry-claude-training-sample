// Types partagés entre l'extension (Node) et la webview (navigateur).
export type Profil = "dev" | "po" | "techlead";
export type PathMark = "in" | "optional" | "out";

export interface Progress {
  version?: number;
  prenom?: string;
  profil?: Profil;
  os?: string;
  mode?: "docker" | "natif";
  etape?: string; // "10.2"
  faits?: Record<string, string>;
  sautes?: string[];
  notes?: string[];
}

export interface ModuleRow {
  num: string; // "00".."17"
  title: string;
  path: Record<Profil, PathMark>;
  duree: string;
}

export type SegmentKind = "text" | "exercice" | "verification" | "blocage" | "reparation";
export interface StepSegment { kind: SegmentKind; profils: string[]; md: string; }
export interface StepDoc { k: number; m: number; title: string; segments: StepSegment[]; }
export interface ModuleDoc {
  num: string; title: string; fiche: string; profils: string; duree: string;
  concept: string; steps: StepDoc[]; retenir: string; question: string;
}

export interface FileRef { rel: string; label: string; }
export interface ModuleSummary { title: string; retenir: string; fiche: string; }

export interface TutorState {
  ficheUrl: string;
  hasProgress: boolean;
  progress: Progress | null;
  modules: ModuleRow[];
  current: { module: ModuleDoc; stepIndex: number } | null;
  files: FileRef[];
  docs: Record<string, ModuleSummary>;
  error?: string;
}

// Messages webview → extension
export type WebviewMessage =
  | { type: "ready" }
  | { type: "cmd"; cmd: "start" | "next" | "bilan" | "check" | "goto" | "reset"; arg?: string }
  | { type: "open"; rel: string }
  | { type: "installClaude" }
  | { type: "showClaude" }
  | { type: "openExternal"; url: string }
  | { type: "log"; level: "info" | "warn" | "error"; text: string };

// Messages extension → webview
export type HostMessage =
  | { type: "state"; state: TutorState }
  | { type: "config"; bridge: "claude" | "terminal"; claudeExt: boolean }
  | { type: "toast"; kind: "ok" | "warn"; text: string };

export const FICHE_URL = "https://training.harington.fr/formation/fiche_prise_en_main_claude.html";
