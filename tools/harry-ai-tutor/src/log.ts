import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";

let channel: vscode.OutputChannel | undefined;
let file: string | undefined;

/** Journal : canal « Harry AI Tutor » + fichier <repo>/.formation/harry.log (git-ignoré, lisible après coup). */
export function initLog(root: string, ch: vscode.OutputChannel) {
  channel = ch;
  file = path.join(root, ".formation", "harry.log");
}
export function log(msg: string) {
  const line = `${new Date().toISOString()} ${msg}`;
  channel?.appendLine(line);
  if (file) { try { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, line + "\n"); } catch { /* disque en lecture seule */ } }
}
