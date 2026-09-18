// S'exécute dans l'extension host. Vérifie : activation, webview, watcher progress.json, pont Claude Code.
const vscode = require("vscode"); const path = require("path"); const fs = require("fs"); const assert = require("assert");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = []; const log = (...a) => { const l = "[harry-test] " + a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" "); console.log(l); out.push(l); };
const tabs = () => vscode.window.tabGroups.all.flatMap((g) => g.tabs.map((t) => t.label));

exports.run = async () => {
  const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath; log("workspace", ws);
  const dir = path.join(ws, ".formation"); const progress = path.join(dir, "progress.json");
  const backup = fs.existsSync(progress) ? fs.readFileSync(progress, "utf8") : null;
  try {
    const ext = vscode.extensions.getExtension("harington.harry-ai-tutor"); assert(ext, "extension Harry absente");
    const api = await ext.activate(); log("activée · api", Object.keys(api ?? {}));
    const claude = vscode.extensions.getExtension("anthropic.claude-code"); log("claude-code", claude ? claude.packageJSON.version : "absente", "active", claude?.isActive);
    log("bridge", api.bridgeKind(), "| claudeInstalled", api.claudeInstalled());
    // 1. vue latérale
    await vscode.commands.executeCommand("harryTutor.view.focus"); await sleep(2000);
    log("webview résolue", api.viewResolved()); assert(api.viewResolved(), "webview non résolue");
    // 2. watcher progress.json
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(progress, JSON.stringify({ version: 1, prenom: "Test", profil: "po", os: "linux", etape: "10.1", faits: { "00": "2026-09-17T09:00:00Z" }, sautes: [], notes: [] }));
    await sleep(1500);
    const st = api.getState(); log("state", { etape: st.progress?.etape, module: st.current?.module.num, step: st.current?.stepIndex, files: st.files.map((f) => f.rel), modules: st.modules.length, docs: Object.keys(st.docs).length });
    assert.strictEqual(st.current?.module.num, "10", "module courant ≠ 10");
    // 3. session tuteur détectée ?
    log("session tuteur", api.findTutorSession() ?? "aucune");
    // 4. Démarrer → l'extension Claude doit ouvrir un onglet / la barre latérale
    if (!api.claudeInstalled()) { log("sans extension Claude Code : Démarrer / Suivant afficheraient la notification « Installer / Continuer avec le terminal » — non déclenchés ici (attente utilisateur)"); return; }
    const before = tabs();
    try { await vscode.commands.executeCommand("harryTutor.start"); log("start ok"); } catch (e) { log("start ERREUR", e.message); }
    await sleep(5000);
    log("tabs avant", before, "après", tabs());
    // 5. Suivant
    try { await vscode.commands.executeCommand("harryTutor.next"); log("next ok"); } catch (e) { log("next → " + e.message); }
    await sleep(1500);
    const lg = path.join(dir, "harry.log"); log("harry.log ↓\n" + (fs.existsSync(lg) ? fs.readFileSync(lg, "utf8") : "(absent)"));
  } finally {
    if (backup !== null) fs.writeFileSync(progress, backup); else { try { fs.rmSync(progress); } catch {} }
    fs.writeFileSync(path.join(dir, "test-report.txt"), out.join("\n"));
  }
};
