// Build : extension (Node, CommonJS) + webview (navigateur, ESM).
import { build, context } from "esbuild";
import { mkdir } from "node:fs/promises";

const watch = process.argv.includes("--watch");

// Les modules Node référencés (et gardés derrière des `if (isNode)`) par les builds navigateur
// sont remplacés par des modules vides.
const nodeShims = {
  name: "node-shims",
  setup(b) {
    const mods = ["fs", "fs/promises", "path", "url", "module", "os", "crypto", "worker_threads", "child_process", "stream", "util", "node:fs", "node:path", "node:url"];
    b.onResolve({ filter: new RegExp(`^(${mods.map((m) => m.replace("/", "\\/")).join("|")})$`) }, (a) => ({ path: a.path, namespace: "shim" }));
    b.onLoad({ filter: /.*/, namespace: "shim" }, () => ({ contents: "export default {}; export const readFile = undefined;", loader: "js" }));
  },
};

const extension = {
  entryPoints: ["src/extension.ts"],
  bundle: true, platform: "node", format: "cjs", target: "node20",
  outfile: "dist/extension.js", external: ["vscode"], sourcemap: true, logLevel: "info",
};
const webview = {
  entryPoints: ["webview/main.ts"],
  bundle: true, platform: "browser", format: "esm", target: "es2022",
  outdir: "dist", entryNames: "[name]", sourcemap: true, logLevel: "info",
  conditions: ["browser", "import", "default"], mainFields: ["browser", "module", "main"],
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [nodeShims],
};

async function copyAssets() {
  await mkdir("dist", { recursive: true }); // plus d'assets à copier (la voix a été retirée)
}

if (watch) {
  const [c1, c2] = await Promise.all([context(extension), context(webview)]);
  await copyAssets();
  await Promise.all([c1.watch(), c2.watch()]);
  console.log("watching…");
} else {
  await Promise.all([build(extension), build(webview)]);
  await copyAssets();
  console.log("build ok");
}
