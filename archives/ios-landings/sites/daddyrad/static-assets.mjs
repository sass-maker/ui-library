import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const types = { ".html": "text/html; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".json": "application/json; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".mjs": "application/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".jpg": "image/jpeg", ".woff2": "font/woff2" };

// Local preview/test adapter. Production always uses Wrangler's ASSETS binding.
export function directoryAssets(directory) {
  const root = resolve(directory);
  return { async fetch(request) {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url).pathname); }
    catch { return new Response(null, { status: 400 }); }
    const file = resolve(root, "." + pathname);
    if (file !== root && !file.startsWith(root + sep)) return new Response(null, { status: 404 });
    for (const candidate of [file, resolve(file, "index.html"), file + ".html"]) {
      try {
        if (!(await stat(candidate)).isFile()) continue;
        return new Response(request.method === "HEAD" ? null : await readFile(candidate), { headers: { "Content-Type": types[extname(candidate)] ?? (pathname.includes("/api/") ? "application/json; charset=utf-8" : "application/octet-stream") } });
      } catch (error) { if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error; }
    }
    return new Response(null, { status: 404 });
  } };
}
