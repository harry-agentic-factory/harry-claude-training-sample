// Simulates a trainee following /formation: a real tutor session (headless Claude Code, in a sandbox repo)
// against a simulated student (a second headless call, no tools, that answers in character and rates each message).
//
// Usage:
//   bash tools/simulation/make-sandbox.sh <dir> [--feature]
//   SANDBOX=<dir>/repo OUT_DIR=<dir>/out [START_MODULE=6] [MAX_TURNS=40] node tools/simulation/run-simulation.mjs
//   node tools/simulation/analyze.mjs <dir>/out
//
// Env: SANDBOX (required), OUT_DIR (required), START_MODULE, MAX_TURNS (default 40), TUTOR_MODEL (default sonnet),
//      STUDENT_MODEL (default haiku), CLAUDE_BIN (default: `claude` in PATH, else the VS Code extension binary).
// There is deliberately no cost cap, only a turn limit: see README.md for what a run costs.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const need = (k) => { if (!process.env[k]) { console.error(`missing env ${k}`); process.exit(2); } return process.env[k]; };
const SANDBOX = path.resolve(need("SANDBOX"));
const OUT = path.resolve(need("OUT_DIR"));
const START_MODULE = process.env.START_MODULE || "";
const MAX_TURNS = Number(process.env.MAX_TURNS || 40);
const TUTOR_MODEL = process.env.TUTOR_MODEL || "sonnet";
const STUDENT_MODEL = process.env.STUDENT_MODEL || "haiku";

function findClaude() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  const which = spawnSync("which", ["claude"], { encoding: "utf8" }).stdout.trim();
  if (which) return which;
  const ext = path.join(os.homedir(), ".vscode/extensions");
  if (fs.existsSync(ext)) {
    const dirs = fs.readdirSync(ext).filter((d) => d.startsWith("anthropic.claude-code-")).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    for (const d of dirs.reverse()) {
      const bin = path.join(ext, d, "resources/native-binary/claude");
      if (fs.existsSync(bin)) return bin;
    }
  }
  console.error("claude binary not found: set CLAUDE_BIN"); process.exit(2);
}
const CLAUDE = findClaude();

fs.mkdirSync(path.join(OUT, "shims"), { recursive: true });
fs.mkdirSync(path.join(OUT, "probe"), { recursive: true });
// Fake open/xdg-open/code/start: log the call instead of opening anything on the user's machine.
for (const c of ["open", "xdg-open", "code", "start"]) {
  const f = path.join(OUT, "shims", c);
  fs.writeFileSync(f, `#!/bin/sh\necho "${c} $*" >> "${path.join(OUT, "opened.log")}"\nexit 0\n`, { mode: 0o755 });
}

// Clean environment: no Claude session or VS Code variable is inherited, so the tutor sees a plain terminal.
const env = {
  HOME: process.env.HOME, USER: process.env.USER, LOGNAME: process.env.USER, SHELL: "/bin/zsh",
  LANG: "fr_FR.UTF-8", TERM: "xterm-256color", TMPDIR: process.env.TMPDIR,
  PATH: `${path.join(OUT, "shims")}:${process.env.PATH}`,
};

const PERSONA = `Tu joues Alex, développeur backend (3 ans d'expérience), curieux mais pressé. Tu suis pour la première fois une formation à Claude Code guidée par un tuteur, dans un terminal (PAS dans VS Code). Tu ne connais ni les hooks, ni les skills, ni MCP, ni les modes de permission. Tu écris en français, court, naturel, parfois une petite faute.

Règles de jeu :
1. Tu reçois le dernier message du tuteur. Réponds comme un vrai étudiant.
2. Quand le tuteur te donne un prompt à taper dans la conversation, tape-le tel quel (copie exacte). Quand il demande une commande shell, tape-la ou demande-lui de la lancer. Quand il demande une action impossible ici (raccourci clavier comme Shift+Tab, /status, /model, /context, ouvrir un fichier dans l'éditeur, regarder un navigateur), réponds en une phrase ce que tu as "vu" de plausible.
3. Pour valider une étape, tape exactement : /formation suivant (seulement après avoir fait l'exercice).
4. Sois un vrai étudiant : environ une fois tous les 4 tours, pose une question de compréhension si un terme n'est pas défini ; une fois, réponds de façon incomplète à une question de contrôle ; une fois, dis que tu ne sais pas bien quoi taper.
5. Quand le tuteur propose le bilan ou dit que le parcours est fini, tape /formation bilan. Après le bilan, réponds avec le message FIN.
6. Si le tuteur te demande ton prénom et ton profil : Alex, dev. Si on te pose une question sur Docker : non, pas installé.
7. Ne dis jamais que tu es une simulation.
8. Si le tuteur te demande de faire un pari ou une prédiction avant l'exercice, tu y réponds dans le message où tu valides l'étape (avec /formation suivant). Si on te demande d'ouvrir ou de retrouver quelque chose toi-même, dis ce que tu as trouvé. Une fois dans la session, quand tu bloques, tape /formation indice.

Tu notes aussi ton expérience. Sortie STRICTE : un seul objet JSON, rien d'autre :
{"message":"<ce que tu tapes>","clarte":<1 à 5 pour le dernier message du tuteur>,"confusion":"<ce qui t'a perturbé, vide si rien>","reformulation":"<comment tu l'aurais écrit plus simplement, vide si inutile>","longueur":"<trop long|ok|trop court>"}`;

function run(args, cwd, input) {
  const r = spawnSync(CLAUDE, args, { cwd, env, input, encoding: "utf8", maxBuffer: 128 * 1024 * 1024, timeout: 20 * 60 * 1000 });
  let j = null;
  try { j = JSON.parse(r.stdout); if (Array.isArray(j)) j = j.filter((x) => x.type === "result").pop(); } catch { /* non-JSON output */ }
  return { j, stdout: r.stdout, stderr: r.stderr };
}

// --setting-sources project: only the repo's own settings, not the developer's global instructions or skills.
// acceptEdits + Bash allowed: a headless session cannot answer a permission prompt.
function tutorTurn(msg, sid) {
  const args = ["-p", msg, "--output-format", "json", "--setting-sources", "project", "--model", TUTOR_MODEL,
    "--permission-mode", "acceptEdits", "--allowedTools", "Bash"];
  if (sid) args.push("--resume", sid);
  return run(args, SANDBOX);
}

function studentTurn(history) {
  const recent = history.slice(-8).map((h) => `--- TUTEUR ---\n${h.tutor}\n--- TOI (Alex) ---\n${h.student?.message ?? ""}`).join("\n\n");
  const prompt = `${PERSONA}\n\nHistorique récent de la conversation :\n${recent || "(début)"}\n\nDernier message du tuteur :\n${history.at(-1).tutor}\n\nRéponds maintenant par le JSON.`;
  const args = ["-p", "--output-format", "json", "--setting-sources", "project", "--model", STUDENT_MODEL, "--tools", "", "--no-session-persistence"];
  const r = run(args, path.join(OUT, "probe"), prompt);
  const text = r.j?.result ?? r.stdout ?? "";
  let obj = null;
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a >= 0 && b > a) { try { obj = JSON.parse(text.slice(a, b + 1)); } catch { /* fallback below */ } }
  if (!obj) obj = { message: text.trim().slice(0, 400) || "/formation suivant", clarte: 0, confusion: "(student output was not JSON)", reformulation: "", longueur: "" };
  return { obj, cost: r.j?.total_cost_usd ?? 0 };
}

const history = [];
let sid = null, cost = 0, msg = "/formation", seenModule = false;
const log = (o) => fs.appendFileSync(path.join(OUT, "transcript.jsonl"), JSON.stringify(o) + "\n");
const startMod = START_MODULE.padStart(2, "0");

for (let turn = 1; turn <= MAX_TURNS; turn++) {
  const t = tutorTurn(msg, sid);
  if (!t.j) { log({ turn, error: "tutor output was not JSON", stdout: (t.stdout || "").slice(0, 2000), stderr: (t.stderr || "").slice(0, 2000) }); break; }
  sid = t.j.session_id ?? sid;
  cost += t.j.total_cost_usd ?? 0;
  let etape = null;
  try { etape = JSON.parse(fs.readFileSync(path.join(SANDBOX, ".formation/progress.json"), "utf8")).etape; } catch { /* not created yet */ }
  const entry = { turn, sent: msg, tutor: t.j.result ?? "", tutor_cost: t.j.total_cost_usd, tutor_turns: t.j.num_turns, tutor_ms: t.j.duration_ms, etape, is_error: t.j.is_error };
  history.push(entry);

  // Targeted run: after the welcome exchange, jump to the module under test and stop once it is finished.
  if (START_MODULE && turn === 2) { log({ ...entry, jump: START_MODULE }); msg = `/formation ${Number(START_MODULE)}`; continue; }
  const modNow = etape ? String(etape).split(".")[0].padStart(2, "0") : null;
  if (START_MODULE && modNow === startMod) seenModule = true;
  if (START_MODULE && turn > 8 && !seenModule) { log({ ...entry, stop: "module never reached" }); break; }
  if (START_MODULE && seenModule && modNow && modNow !== startMod) { log({ ...entry, stop: "module finished" }); break; }

  const s = studentTurn(history);
  cost += s.cost;
  entry.student = s.obj;
  log({ ...entry, cost_cumul: Number(cost.toFixed(3)) });
  console.log(`turn ${turn} · step ${etape} · cumulative cost ${cost.toFixed(2)} $ · student: ${String(s.obj.message).slice(0, 80)}`);
  if (/^\s*FIN\s*$/i.test(String(s.obj.message))) break;
  msg = String(s.obj.message);
}
fs.writeFileSync(path.join(OUT, "summary.json"), JSON.stringify({ turns: history.length, cost: Number(cost.toFixed(3)), session: sid, final_step: history.at(-1)?.etape }, null, 2));
console.log("done:", OUT);
