// Télécharge les fichiers du modèle Kokoro (ONNX q8) + la voix française dans models/ (git-ignoré).
// Lancé une fois avant `npm run package` : le .vsix embarque le modèle → lecture vocale hors-ligne.
import { mkdir, writeFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";

const REPO = "onnx-community/Kokoro-82M-v1.0-ONNX";
const BASE = `https://huggingface.co/${REPO}/resolve/main`;
const FILES = [
  "config.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "onnx/model_quantized.onnx", // q8, ~92 Mo
  "voices/ff_siwis.bin",       // voix française
  "voices/af_heart.bin",       // voix anglaise de secours (démo)
];
const root = join(dirname(new URL(import.meta.url).pathname), "..", "models", REPO);

for (const f of FILES) {
  const dest = join(root, f);
  try { const s = await stat(dest); if (s.size > 0) { console.log("ok   ", f, s.size); continue; } } catch {}
  await mkdir(dirname(dest), { recursive: true });
  process.stdout.write(`fetch ${f} … `);
  const r = await fetch(`${BASE}/${f}`);
  if (!r.ok) throw new Error(`${f}: HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(dest, buf);
  console.log(buf.length, "octets");
}
console.log("modèle prêt dans", root);
