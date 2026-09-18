import { createServer } from "node:http"; import { readFile, stat } from "node:fs/promises"; import { join, extname, normalize } from "node:path"; import { fileURLToPath } from "node:url";
const root = join(fileURLToPath(import.meta.url), "..", ".."); const port = +(process.argv[2] ?? 8765);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".wasm": "application/wasm", ".onnx": "application/octet-stream", ".bin": "application/octet-stream", ".ttf": "font/ttf", ".svg": "image/svg+xml", ".png": "image/png", ".map": "application/json" };
createServer(async (req, res) => {
  const p = join(root, normalize(decodeURIComponent((req.url ?? "/").split("?")[0])));
  try { const s = await stat(p); if (!s.isFile()) throw 0; const b = await readFile(p);
    res.writeHead(200, { "Content-Type": mime[extname(p)] ?? "application/octet-stream", "Content-Length": b.length, "Cache-Control": "no-store", "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp" }); res.end(b); }
  catch { res.writeHead(404); res.end("404 " + p); }
}).listen(port, () => console.log("harness on http://localhost:" + port + "/test/harness.html"));
