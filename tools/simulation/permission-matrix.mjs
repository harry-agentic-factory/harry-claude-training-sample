// Checks how Claude Code treats file writes under .claude/ for different modes, rules and settings sources.
// Each scenario runs a headless session in a sandbox that must ask for two writes: a control file (docs/) and a
// protected one (.claude/skills/...). The result says which ones were created, which were refused, and which
// permission mode was really active (read from the stream-json init event).
//
// Usage: bash tools/simulation/make-sandbox.sh <dir>
//        SANDBOX=<dir>/repo OUT_DIR=<dir>/out [ONLY=S1,S4] node tools/simulation/permission-matrix.mjs
// Scenarios that load the user's global settings (user source) are S8, S9 and S11: run them knowingly.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const need = (k) => { if (!process.env[k]) { console.error(`missing env ${k}`); process.exit(2); } return process.env[k]; };
const SB = path.resolve(need("SANDBOX"));
const OUT = path.resolve(need("OUT_DIR"));
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
fs.mkdirSync(path.join(OUT, "archive"), { recursive: true });

function findClaude() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  const which = spawnSync("which", ["claude"], { encoding: "utf8" }).stdout.trim();
  if (which) return which;
  const ext = path.join(os.homedir(), ".vscode/extensions");
  const dirs = fs.existsSync(ext) ? fs.readdirSync(ext).filter((d) => d.startsWith("anthropic.claude-code-")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
  for (const d of dirs.reverse()) { const b = path.join(ext, d, "resources/native-binary/claude"); if (fs.existsSync(b)) return b; }
  console.error("claude binary not found: set CLAUDE_BIN"); process.exit(2);
}
const CLAUDE = findClaude();
const PROBE_A = "docs/probe-a.md", PROBE_B = ".claude/skills/formation-guide/probe-b.md";
const SETTINGS = path.join(SB, ".claude/settings.json"), LOCAL = path.join(SB, ".claude/settings.local.json");
const ORIG = fs.readFileSync(SETTINGS, "utf8");
const ORIG_JSON = JSON.parse(ORIG);
const env = { HOME: process.env.HOME, USER: process.env.USER, LOGNAME: process.env.USER, LANG: "fr_FR.UTF-8", TERM: "xterm-256color", TMPDIR: process.env.TMPDIR, PATH: process.env.PATH };
const PROMPT = `Utilise l'outil Write (pas Bash) pour créer deux fichiers, dans cet ordre : 1) ${PROBE_A} avec le contenu « ok » ; 2) ${PROBE_B} avec le contenu « ok ». Si une écriture est refusée, passe à la suivante sans insister ni contourner. Termine en disant uniquement lesquels ont été créés.`;

const ALLOW = ["Edit(**)", "Write(**)", `Edit(/${SB}/.claude/**)`, `Write(/${SB}/.claude/**)`];
const SC = [
  { id: "S1", label: "flag acceptEdits, no rule", flag: "acceptEdits", sources: "project,local" },
  { id: "S2b", label: "flag acceptEdits + allow rules via --settings (trusted source)", flag: "acceptEdits", sources: "project,local", settingsJson: JSON.stringify({ permissions: { allow: ALLOW } }) },
  { id: "S2c", label: "flag default + allow rules via --settings", flag: "default", sources: "project,local", settingsJson: JSON.stringify({ permissions: { allow: ALLOW } }) },
  { id: "S3", label: "flag auto, no rule", flag: "auto", sources: "project,local" },
  { id: "S4", label: "flag default, no rule", flag: "default", sources: "project,local" },
  { id: "S5", label: "no flag, defaultMode=auto in the project settings", sources: "project,local", projectMode: "auto" },
  { id: "S6", label: "no flag, defaultMode=auto in settings.local.json", sources: "project,local", localMode: "auto" },
  { id: "S7", label: "no flag, defaultMode=acceptEdits in settings.local.json", sources: "project,local", localMode: "acceptEdits" },
  { id: "S8", label: "no flag, user+project(default)+local [loads the global settings]", sources: "user,project,local", projectMode: "default" },
  { id: "S9", label: "no flag, user source only [loads the global settings]", sources: "user" },
  { id: "S10", label: "flag bypassPermissions", flag: "bypassPermissions", sources: "project,local", extra: ["--allow-dangerously-skip-permissions"] },
  { id: "S11", label: "no flag, user + project without defaultMode [loads the global settings]", sources: "user,project,local", projectMode: null },
  { id: "S12", label: "no flag, project without defaultMode, no user source (a trainee)", sources: "project,local", projectMode: null },
];

const archive = (file, tag) => { if (fs.existsSync(file)) fs.renameSync(file, path.join(OUT, "archive", `${tag}-${Date.now()}-${path.basename(file)}`)); };

function setup(sc) {
  const proj = structuredClone(ORIG_JSON);
  proj.permissions = proj.permissions ?? {};
  if (sc.projectMode) proj.permissions.defaultMode = sc.projectMode;
  else delete proj.permissions.defaultMode;
  fs.writeFileSync(SETTINGS, JSON.stringify(proj, null, 2));
  archive(LOCAL, sc.id);
  if (sc.localMode) fs.writeFileSync(LOCAL, JSON.stringify({ permissions: { defaultMode: sc.localMode } }, null, 2));
  for (const p of [PROBE_A, PROBE_B]) archive(path.join(SB, p), sc.id);
}

function runScenario(sc) {
  const args = ["-p", PROMPT, "--output-format", "stream-json", "--verbose", "--model", "haiku", "--no-session-persistence", "--setting-sources", sc.sources,
    ...(sc.flag ? ["--permission-mode", sc.flag] : []), ...(sc.settingsJson ? ["--settings", sc.settingsJson] : []), ...(sc.extra ?? [])];
  const r = spawnSync(CLAUDE, args, { cwd: SB, env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 5 * 60 * 1000 });
  const lines = (r.stdout || "").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const init = lines.find((m) => m.type === "system" && m.subtype === "init");
  const uses = {}, results = {};
  for (const m of lines) for (const c of m.message?.content ?? []) {
    if (c.type === "tool_use") uses[c.id] = { name: c.name, target: c.input?.file_path ?? c.input?.command ?? "" };
    if (c.type === "tool_result") results[c.tool_use_id] = { err: !!c.is_error, text: typeof c.content === "string" ? c.content : JSON.stringify(c.content) };
  }
  const calls = Object.entries(uses).map(([id, u]) => ({ ...u, err: results[id]?.err, msg: (results[id]?.text || "").slice(0, 120).replace(/\s+/g, " ") }));
  return { id: sc.id, label: sc.label, mode: init?.permissionMode ?? "?", calls, fileA: fs.existsSync(path.join(SB, PROBE_A)), fileB: fs.existsSync(path.join(SB, PROBE_B)) };
}

const out = [];
try {
  for (const sc of SC) {
    if (ONLY && !ONLY.includes(sc.id)) continue;
    setup(sc);
    const r = runScenario(sc);
    out.push(r);
    console.log(`${r.id} | mode=${r.mode} | control: ${r.fileA ? "CREATED" : "no"} | .claude/: ${r.fileB ? "CREATED" : "no"} | ${sc.label}`);
  }
} finally {
  fs.writeFileSync(SETTINGS, ORIG); // restore the sandbox settings
  archive(LOCAL, "end");
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(out, null, 2));
}
