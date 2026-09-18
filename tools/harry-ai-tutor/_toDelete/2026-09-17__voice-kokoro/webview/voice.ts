// Client du worker vocal : charge les ressources (via la page, donc via le service worker de la webview),
// crée le worker depuis un blob, gère la file audio et le statut ; repli sur la voix système.
import type { Assets } from "./voice.worker";

export type VoiceState = { state: "idle" | "loading" | "ready" | "speaking" | "error" | "fallback"; progress?: number; detail?: string };

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const MODEL_FILES = ["config.json", "tokenizer.json", "tokenizer_config.json", "onnx/model_quantized.onnx", "voices/ff_siwis.bin"];

export class HarryVoice {
  private worker: Worker | null = null;
  private ctx: AudioContext | null = null;
  private id = 0;
  private nextAt = 0;
  private pending = 0;           // chunks reçus non encore terminés
  private generating = false;    // le worker n'a pas encore envoyé "done"
  private loaded: Promise<void> | null = null;
  private resolveLoad: (() => void) | null = null;
  state: VoiceState = { state: "idle" };
  speed = 1;
  readonly stats = { chunks: 0, samples: 0 };

  constructor(private readonly base: { dist: string; models: string }, private readonly onState: (s: VoiceState) => void) {}

  private set(s: VoiceState) { this.state = s; this.onState(s); }

  /** Charge le modèle dans le worker (une fois). */
  load(): Promise<void> {
    if (this.loaded) return this.loaded;
    this.loaded = new Promise<void>((resolve) => { this.resolveLoad = resolve; });
    void this.boot().catch((e) => {
      this.set({ state: "fallback", detail: "voix locale indisponible : " + String((e as Error)?.message ?? e).slice(0, 160) });
      this.resolveLoad?.();
    });
    return this.loaded;
  }

  private async boot() {
    this.set({ state: "loading", progress: 0, detail: "lecture des ressources…" });
    const dist = this.base.dist.replace(/\/$/, ""), models = this.base.models.replace(/\/$/, "") + "/" + MODEL_ID + "/";
    const text = async (u: string) => { const r = await fetch(u); if (!r.ok) throw new Error(`${u} → HTTP ${r.status}`); return r.text(); };
    const bin = async (u: string, onProgress?: (got: number, total: number) => void) => {
      const r = await fetch(u); if (!r.ok) throw new Error(`${u} → HTTP ${r.status}`);
      const total = +(r.headers.get("content-length") ?? 0);
      if (!r.body || !total || !onProgress) return r.arrayBuffer();
      const reader = r.body.getReader(); const chunks: Uint8Array[] = []; let got = 0;
      for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); got += value.length; onProgress(got, total); }
      const out = new Uint8Array(got); let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; }
      return out.buffer;
    };
    const [code, ortMjs, ortWasm, espeakWasm, ...model] = await Promise.all([
      text(dist + "/voice.worker.js"),
      text(dist + "/ort/ort-wasm-simd-threaded.jsep.mjs"),
      bin(dist + "/ort/ort-wasm-simd-threaded.jsep.wasm"),
      bin(dist + "/espeak-ng.wasm"),
      ...MODEL_FILES.map((f) => bin(models + f, f.endsWith(".onnx") ? (got, total) => this.set({ state: "loading", progress: Math.round((100 * got) / total), detail: `modèle vocal ${Math.round((100 * got) / total)} %` }) : undefined)),
    ]);
    const files: Record<string, ArrayBuffer> = {}; MODEL_FILES.forEach((f, i) => { files[f] = model[i]; });
    // Les glues Emscripten (onnxruntime, espeak) et transformers.js font `new URL(…, import.meta.url)` :
    // dans un worker créé depuis un blob, import.meta.url est un blob: (pas une base valide) → TypeError.
    // On le remplace par une URL fixe et inoffensive : rien n'est jamais chargé depuis cette adresse.
    const FAKE = "https://harry.invalid/dist/";
    const patch = (src: string, name: string) => src.split("import.meta.url").join(JSON.stringify(FAKE + name));
    const assets: Assets = { ortMjs: patch(ortMjs, "ort/ort.mjs"), ortWasm, espeakWasm, files };

    // Worker depuis un blob : un script d'une autre origine (ressources de l'extension) est refusé.
    const w = new Worker(URL.createObjectURL(new Blob([patch(code, "voice.worker.js")], { type: "text/javascript" })), { type: "module" });
    this.worker = w;
    w.onerror = (e) => { this.set({ state: "fallback", detail: `erreur worker : ${e.message || "inconnue"}${e.lineno ? ` (l.${e.lineno})` : ""}` }); this.resolveLoad?.(); };
    w.onmessage = (e: MessageEvent) => this.onMessage(e.data);
    this.set({ state: "loading", progress: 0, detail: "démarrage du moteur…" });
    w.postMessage({ type: "load", assets }, [ortWasm, espeakWasm, ...model]);
  }

  private onMessage(m: { type: string; [k: string]: unknown }) {
    switch (m.type) {
      case "status": {
        const st = m.state as "loading" | "ready" | "error";
        if (st === "error") { this.set({ state: "fallback", detail: String(m.detail ?? "").slice(0, 200) }); this.resolveLoad?.(); }
        else if (st === "ready") { this.set({ state: "ready" }); this.resolveLoad?.(); }
        else this.set({ state: "loading", progress: m.progress as number, detail: m.detail as string });
        break;
      }
      case "chunk": {
        if (m.id !== this.id) return;
        if (this.state.detail) this.set({ state: "speaking" });
        this.play(m.audio as Float32Array, m.sampleRate as number);
        break;
      }
      case "done": if (m.id === this.id) { this.generating = false; this.maybeIdle(); } break;
      case "error": if (m.id === this.id) { this.generating = false; this.maybeIdle(); this.set({ state: this.state.state === "fallback" ? "fallback" : "ready", detail: String(m.message).slice(0, 160) }); } break;
    }
  }

  private audio(): AudioContext { return (this.ctx ??= new AudioContext()); }

  private play(pcm: Float32Array, rate: number) {
    const ctx = this.audio();
    const buf = ctx.createBuffer(1, pcm.length, rate);
    buf.getChannelData(0).set(pcm);
    this.stats.chunks++; this.stats.samples += pcm.length;
    const src = ctx.createBufferSource();
    src.buffer = buf; src.connect(ctx.destination);
    const at = Math.max(this.nextAt, ctx.currentTime + 0.03);
    src.start(at);
    this.nextAt = at + buf.duration + 0.15;
    this.pending++;
    src.onended = () => { this.pending--; this.maybeIdle(); };
  }

  private maybeIdle() { if (!this.generating && this.pending === 0 && this.state.state === "speaking") this.set({ state: "ready" }); }

  /** Lit un texte (interrompt la lecture en cours). */
  async speak(text: string): Promise<void> {
    if (!text.trim()) return;
    await this.load();
    this.stop();
    if (this.state.state === "fallback" || !this.worker) { this.fallback(text); return; }
    await this.audio().resume();
    this.id++;
    this.generating = true;
    this.nextAt = 0;
    this.set({ state: "speaking", detail: "je prépare ma voix…" });
    this.worker.postMessage({ type: "speak", id: this.id, text, speed: this.speed });
  }

  stop() {
    this.id++;
    this.worker?.postMessage({ type: "stop" });
    this.generating = false; this.pending = 0;
    if (this.ctx) { void this.ctx.close(); this.ctx = null; }
    try { speechSynthesis.cancel(); } catch { /* pas de synthèse système */ }
    if (this.state.state === "speaking") this.set({ state: "ready" });
  }

  /** Repli : synthèse vocale du système (voix fr-FR si disponible). */
  private fallback(text: string) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "fr-FR"; u.rate = this.speed;
      const v = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("fr"));
      if (v) u.voice = v;
      const back = this.state.detail;
      const done = () => { clearTimeout(guard); this.set({ state: "fallback", detail: back }); };
      u.onend = done; u.onerror = done;
      // Sous Linux, speechSynthesis peut n'avoir aucune voix et ne jamais rappeler : on ne reste pas bloqué.
      const guard = setTimeout(done, Math.min(90000, 400 * text.length / this.speed));
      this.set({ state: "speaking", detail: "voix système" });
      speechSynthesis.speak(u);
    } catch { this.set({ state: "fallback", detail: "aucune voix disponible" }); }
  }
}
