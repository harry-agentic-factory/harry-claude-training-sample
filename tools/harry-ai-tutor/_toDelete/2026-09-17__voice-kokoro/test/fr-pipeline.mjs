// Pipeline complet hors-ligne : espeak-ng (fr-fr, IPA) → tokenizer Kokoro → modèle q8 → WAV + contrôle vocab/RMS.
import ESpeakNg from "espeak-ng";
import { env } from "@huggingface/transformers";
import { KokoroTTS } from "kokoro-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
env.allowRemoteModels = false; env.localModelPath = join(here, "..", "models");

async function frIpa(text) {
  const m = await ESpeakNg({ arguments: ["--phonout", "out.txt", "-q", "-b", "1", "--ipa", "-v", "fr-fr", text], print(){}, printErr(){} });
  return m.FS.readFile("out.txt", { encoding: "utf8" })
    .replace(/\([a-z-]+\)/g, "")      // marqueurs de changement de langue (en)…(fr)
    .replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
}
const text = process.argv[2] ?? "Bienvenue Sam ! Module zéro, pas un sur trois : ta branche. On ne travaille jamais sur main. Demande-moi de créer ta branche de travail.";
const ipa = await frIpa(text);
console.log("IPA :", ipa);
const vocab = JSON.parse(readFileSync(join(env.localModelPath, "onnx-community/Kokoro-82M-v1.0-ONNX/tokenizer.json"), "utf8")).model.vocab;
const missing = [...new Set([...ipa].filter(c => !(c in vocab)))];
console.log("caractères hors vocab :", JSON.stringify(missing));
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
const { input_ids } = tts.tokenizer(ipa, { truncation: true });
const t1 = Date.now();
const audio = await tts.generate_from_ids(input_ids, { voice: "ff_siwis", speed: 1.0 });
const a = audio.audio; let s = 0; for (let i = 0; i < a.length; i++) s += a[i]*a[i];
console.log("tokens", input_ids.dims[1], "| synthèse", Date.now() - t1, "ms |", (a.length / 24000).toFixed(2), "s | RMS", Math.sqrt(s / a.length).toFixed(4));
await audio.save(join(here, "sample-fr.wav")); console.log("wav → test/sample-fr.wav");
