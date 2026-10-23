#!/usr/bin/env node
// Génère .formation/suivi.html : page autonome de suivi du parcours (cf. lib.mjs).
// Usage : node tools/suivi/build.mjs [sortie.html]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildHtml } from "./lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = process.argv[2] ?? path.join(root, ".formation/suivi.html");

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buildHtml(root));
console.log(`Page de suivi générée : ${path.relative(root, out)}`);
