// Worker vocal : espeak-ng (fr-fr → IPA) + Kokoro-82M (ONNX q8, WASM) → PCM 24 kHz.
// Il ne fait AUCUNE requête réseau : dans une webview VS Code, un worker ne passe pas par le service
// worker qui sert les ressources de l'extension. Le thread principal lui transmet tous les octets.
import { env } from "@huggingface/transformers";
import { KokoroTTS } from "kokoro-js";
import ESpeakNg from "espeak-ng";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const HF_VOICES = `https://huggingface.co/${MODEL_ID}/resolve/main/voices/`;
const VOICE = "ff_siwis";

export type Assets = {
  ortMjs: string;            // glue JS d'onnxruntime-web (module ES)
  ortWasm: ArrayBuffer;      // binaire WebAssembly d'onnxruntime-web
  espeakWasm: ArrayBuffer;   // espeak-ng (données linguistiques embarquées)
  files: Record<string, ArrayBuffer>; // config.json, tokenizer.json, tokenizer_config.json, onnx/model_quantized.onnx, voices/ff_siwis.bin
};
type In = { type: "load"; assets: Assets } | { type: "speak"; id: number; text: string; speed: number } | { type: "stop" };
type Out =
  | { type: "status"; state: "loading" | "ready" | "error"; progress?: number; detail?: string }
  | { type: "chunk"; id: number; seq: number; audio: Float32Array; sampleRate: number }
  | { type: "done"; id: number }
  | { type: "error"; id?: number; message: string };

const post = (m: Out, transfer?: Transferable[]) => (self as unknown as Worker).postMessage(m, transfer ?? []);

let tts: KokoroTTS | null = null;
let espeakModule: WebAssembly.Module | null = null;
let vocab: Set<string> | null = null;
let current = 0; // id de la lecture en cours ; toute autre lecture est abandonnée

function fileFor(key: string, files: Record<string, ArrayBuffer>): ArrayBuffer | undefined {
  const k = key.replace(/\\/g, "/");
  for (const name of Object.keys(files)) if (k.endsWith("/" + name) || k === name) return files[name];
  return undefined;
}

async function load(a: Assets) {
  post({ type: "status", state: "loading", progress: 0, detail: "initialisation du moteur vocal…" });

  // --- transformers.js : tout vient du cache mémoire, jamais du réseau.
  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  env.localModelPath = "harry-local://models/";
  env.useBrowserCache = false;
  env.useFSCache = false;
  env.useCustomCache = true;
  env.customCache = {
    match: async (key: string | Request) => {
      const buf = fileFor(typeof key === "string" ? key : key.url, a.files);
      return buf ? new Response(buf) : undefined;
    },
    put: async () => {},
  };
  const onnx = (env.backends as { onnx: { wasm: Record<string, unknown> } }).onnx;
  onnx.wasm.wasmBinary = a.ortWasm;
  onnx.wasm.wasmPaths = { mjs: URL.createObjectURL(new Blob([a.ortMjs], { type: "text/javascript" })) };
  onnx.wasm.proxy = false;
  // 1 thread : les workers pthread seraient créés depuis import.meta.url, qui n'est pas exploitable ici.
  onnx.wasm.numThreads = 1;

  // --- voix Kokoro : kokoro-js les télécharge sur Hugging Face → servies depuis la mémoire.
  const origFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith(HF_VOICES)) {
      const buf = a.files["voices/" + url.slice(HF_VOICES.length)];
      return Promise.resolve(buf ? new Response(buf) : new Response(null, { status: 404 }));
    }
    return origFetch(input, init);
  }) as typeof fetch;

  post({ type: "status", state: "loading", progress: 50, detail: "chargement du modèle vocal…" });
  tts = await KokoroTTS.from_pretrained(MODEL_ID, { dtype: "q8", device: "wasm" });
  vocab = new Set(Object.keys((JSON.parse(new TextDecoder().decode(a.files["tokenizer.json"])) as { model: { vocab: Record<string, number> } }).model.vocab));
  espeakModule = await WebAssembly.compile(a.espeakWasm);
  post({ type: "status", state: "loading", progress: 90, detail: "chauffe de la voix…" });
  await synth("Bonjour.", 1); // compile les kernels WASM une bonne fois
  post({ type: "status", state: "ready" });
}

/** Texte français → IPA (espeak-ng), ponctuation réinjectée pour la prosodie. */
async function phonemize(text: string): Promise<string> {
  const mod = espeakModule!;
  const m = (await ESpeakNg({
    arguments: ["--phonout", "out.txt", "-q", "-b", "1", "--ipa", "-v", "fr-fr", text],
    locateFile: (p: string) => p,
    instantiateWasm: (imports: WebAssembly.Imports, cb: (i: WebAssembly.Instance, m?: WebAssembly.Module) => void) => {
      void WebAssembly.instantiate(mod, imports).then((inst) => cb(inst, mod));
      return {};
    },
    print() {}, printErr() {},
  })) as { FS: { readFile(p: string, o: { encoding: "utf8" }): string } };
  const raw = m.FS.readFile("out.txt", { encoding: "utf8" });
  const lines = raw.replace(/\([a-z-]+\)/g, "").replace(/-/g, "").split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const parts = text.split(/([;:,.!?…]+)/);
  const clauses = parts.filter((_, i) => i % 2 === 0).map((c) => c.trim()).filter(Boolean);
  let ipa: string;
  if (clauses.length === lines.length) {
    let li = 0; ipa = "";
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) { if (parts[i].trim()) ipa += lines[li++] ?? ""; }
      else ipa += parts[i][0] + " ";
    }
  } else ipa = lines.join(" ");
  return [...ipa].filter((c) => vocab!.has(c)).join("").replace(/\s+/g, " ").trim();
}

async function synth(sentence: string, speed: number): Promise<Float32Array | null> {
  const ipa = await phonemize(sentence);
  if (!ipa) return null;
  const { input_ids } = tts!.tokenizer(ipa, { truncation: true });
  const audio = await tts!.generate_from_ids(input_ids, { voice: VOICE as never, speed });
  return audio.audio as Float32Array;
}

function sentences(text: string): string[] {
  return text.replace(/\s+/g, " ").split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter((s) => /[\p{L}\p{N}]/u.test(s));
}

async function speak(id: number, text: string, speed: number) {
  current = id;
  let seq = 0;
  for (const s of sentences(text)) {
    if (current !== id) return;
    const pcm = await synth(s, speed);
    if (current !== id) return;
    if (pcm) post({ type: "chunk", id, seq: seq++, audio: pcm, sampleRate: 24000 }, [pcm.buffer]);
  }
  if (current === id) post({ type: "done", id });
}

self.onmessage = async (e: MessageEvent<In>) => {
  const m = e.data;
  try {
    if (m.type === "load") await load(m.assets);
    else if (m.type === "speak") await speak(m.id, m.text, m.speed);
    else if (m.type === "stop") current = 0;
  } catch (err) {
    const message = String((err as Error)?.stack ?? (err as Error)?.message ?? err).slice(0, 400);
    if (m.type === "load") post({ type: "status", state: "error", detail: message });
    post({ type: "error", id: (m as { id?: number }).id, message });
  }
};
