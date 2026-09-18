// Lance un VS Code réel (téléchargé dans .vscode-test/) avec le repo de formation en workspace,
// l'extension Harry en mode développement, l'extension Claude Code du poste (symlink) et exécute suite.js
// DANS l'extension host (API vscode complète). Usage : node test/vscode/runTest.mjs [--visible]
import { runTests } from "@vscode/test-electron";
import { mkdirSync, symlinkSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import os from "node:os";

const here = resolve("test/vscode");
const extensionDevelopmentPath = resolve(".");
const extensionTestsPath = join(here, "suite.js");
const workspace = resolve("../..");
const tmp = join(os.tmpdir(), "harry-vscode-test");
const extDir = join(tmp, "extensions"), userDir = join(tmp, "user-data");
rmSync(userDir, { recursive: true, force: true });
mkdirSync(extDir, { recursive: true }); mkdirSync(userDir, { recursive: true });
// Extension Claude Code installée sur le poste → symlink (sans l'ancien Harry installé, pour éviter le doublon).
const userExt = join(os.homedir(), ".vscode", "extensions");
const claude = readdirSync(userExt).filter((d) => d.startsWith("anthropic.claude-code-")).sort().pop();
const withClaude = !process.env.HARRY_TEST_NO_CLAUDE;
for (const d of readdirSync(extDir)) if (d.startsWith("anthropic.claude-code-")) rmSync(join(extDir, d), { recursive: true, force: true });
if (withClaude && claude && !existsSync(join(extDir, claude))) symlinkSync(join(userExt, claude), join(extDir, claude), "dir");
console.log("claude ext:", withClaude ? claude ?? "absente" : "désactivée pour ce test", "| workspace:", workspace);

await runTests({
  extensionDevelopmentPath, extensionTestsPath, version: "stable",
  launchArgs: [workspace, "--extensions-dir", extDir, "--user-data-dir", userDir, "--disable-workspace-trust", "--skip-welcome", "--skip-release-notes", "--disable-gpu"],
  extensionTestsEnv: { HARRY_TEST: "1" },
});
