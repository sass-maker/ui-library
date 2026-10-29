import { createHash } from "node:crypto";
import { access, cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createAgentSurfaceManifest } from "../../src/lib/agent-surfaces/manifest.mjs";
import { createAgentSurfaceHandler } from "../../src/lib/agent-surfaces/handler.mjs";
import { ORIGIN, PRODUCTS, mountedPath, releasePath } from "./products.mjs";

export const factoryDir = fileURLToPath(new URL("../../", import.meta.url));
export const outputDir = join(factoryDir, "dist/daddyrad");

export async function filesIn(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesIn(path));
    else if (entry.isFile()) result.push(path);
    else throw new Error(`Unexpected non-file in static output: ${path}`);
  }
  return result;
}

function publicPaths(files) {
  const paths = new Set(files.map((file) => `/${file}`));
  for (const file of files) {
    if (file === "index.html") paths.add("/");
    else if (file.endsWith("/index.html")) {
      paths.add(`/${file.slice(0, -10)}`);
      paths.add(`/${file.slice(0, -11)}`);
    } else if (file.endsWith(".html")) paths.add(`/${file.slice(0, -5)}`);
  }
  return paths;
}

export function productRebaser(product, files) {
  const paths = publicPaths(files);
  const emitted = (path) => paths.has(path) || (path.endsWith(".md") && (paths.has(path.slice(0, -3) + "/") || paths.has(path.slice(0, -3))));
  return function rebase(value) {
    if (typeof value !== "string") return value;
    if (value.startsWith(product.nativeReleaseOrigin)) {
      const url = new URL(value);
      if (url.origin !== product.nativeReleaseOrigin || releasePath(url.pathname) || !emitted(url.pathname)) return value;
      return product.canonicalOrigin + product.mount + (value === product.nativeReleaseOrigin ? "" : url.pathname + url.search + url.hash);
    }
    if (!value.startsWith("/") || value.startsWith("//")) return value;
    const url = new URL(value, product.nativeReleaseOrigin);
    if (releasePath(url.pathname)) return product.nativeReleaseOrigin + value;
    return emitted(url.pathname) ? mountedPath(product, value) : value;
  };
}

function mapJson(value, rebase) {
  if (typeof value === "string") return rebase(value);
  if (Array.isArray(value)) return value.map((item) => mapJson(item, rebase));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mapJson(item, rebase)]));
  return value;
}

export function rebaseDocument(text, product, files, format) {
  const rebase = productRebaser(product, files);
  const script = format === ".js" || format === ".mjs";
  const rebaseLiteral = (value) => script && (value === product.nativeReleaseOrigin || (value.startsWith("/") && releasePath(new URL(value, product.nativeReleaseOrigin).pathname))) ? value : rebase(value);
  if (format === ".json" || format === "json") {
    const value = mapJson(JSON.parse(text), rebase);
    // OpenAPI paths are relative to its server, which is the product section.
    // Catalog paths are absolute public paths and are rebased above instead.
    return JSON.stringify(value, null, 2) + "\n";
  }
  const scripts = [];
  if (format === ".html") text = text.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_match, attributes, body) => {
    const open = rebaseDocument(`<script${attributes}>`, product, files, ".html");
    const content = /\btype=["']application\/ld\+json["']/i.test(attributes)
      ? JSON.stringify(mapJson(JSON.parse(body), rebase)).replace(/</g, "\\u003c")
      : rebaseDocument(body, product, files, ".js");
    scripts.push(open + content + "</script>");
    return `\u0000DADDY_SCRIPT_${scripts.length - 1}\u0000`;
  });
  const escapedOrigin = product.nativeReleaseOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let result = text.replace(/"(?:\\.|[^"\\])*"/g, (literal) => {
    if (!literal.includes("\\/")) return literal;
    try {
      const value = JSON.parse(literal);
      const rewritten = rebaseLiteral(value);
      return rewritten === value ? literal : JSON.stringify(rewritten);
    } catch { return literal; }
  });
  result = result.replace(new RegExp(`${escapedOrigin}(?:/[^\\s<>\\"'\\x60)\\]\\\\]*)?`, "g"), (value) => rebaseLiteral(value));
  // Only emitted public URLs qualify. Strings such as api + "/v1/feedback"
  // belong to a different service and must not acquire a marketing prefix.
  if (format === ".html" || format === ".svg") result = result.replace(/\b(href|src|poster|action|formaction|art-src|font-base|privacy-url)="([^"]*)"/gi, (_match, name, value) => `${name}="${rebase(value)}"`);
  result = result.replace(/(["'`])(\/(?!\/)[^\s"'`<>]*)\1/g, (_match, quote, value) => quote + (value === "/" ? value : rebaseLiteral(value)) + quote);
  result = result.replace(/\b(srcset)="([^"]*)"/g, (_match, name, value) => `${name}="${value.split(",").map((candidate) => candidate.trim().replace(/^(\S+)/, (url) => rebase(url))).join(", ")}"`);
  result = result.replace(/url\(\s*(["']?)(\/[^\s)'"<>]+)\1\s*\)/g, (_match, quote, value) => `url(${quote}${rebase(value)}${quote})`);
  if (format === ".md" || format === ".txt") result = result.replace(/(\]\()(\/[^\s)]+)(\))/g, (_match, before, value, after) => before + rebase(value) + after);
  return result.replace(/\u0000DADDY_SCRIPT_(\d+)\u0000/g, (_match, index) => scripts[Number(index)]);
}

export function suiteNavigation(current) {
  return `<nav class="daddy-suite" aria-label="DaddyRad apps"><a class="daddy-suite-home" href="/">DaddyRad</a><div>${PRODUCTS.map((product) => `<a href="${product.mount}/"${product.productId === current ? ' aria-current="page"' : ""}>${product.name.replace("Daddy", "")}</a>`).join("")}</div></nav>`;
}

const navigationStyle = `.daddy-suite{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px max(20px,calc((100% - 1160px)/2));border-bottom:1px solid #263a2d;background:#07100a;color:#c4e6d2;font:500 13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.daddy-suite a{display:inline-flex;align-items:center;min-height:44px;padding:0 10px;color:inherit;text-decoration:none;border-radius:5px}.daddy-suite-home{font-weight:750;letter-spacing:-.02em}.daddy-suite>div{display:flex;gap:4px;flex-wrap:wrap}.daddy-suite a:hover,.daddy-suite a[aria-current]{background:#14291c;color:#8ce0b8}.daddy-suite a:focus-visible{outline:2px solid #8ce0b8;outline-offset:2px}@media(max-width:480px){.daddy-suite{padding:8px 10px;gap:0}.daddy-suite>div{gap:0}.daddy-suite a{padding:0 8px;font-size:12px}}`;
const productHeaderStyle = `@media(width<64rem){[data-daddy-product-header] .md\\:flex{display:none}[data-daddy-product-header] .md\\:hidden{display:block}[data-daddy-product-header] .md\\:ml-0{margin-left:auto}}`;

function enhanceHtml(html, current) {
  return html.replace(/<\/head>/i, `<style>${navigationStyle}${productHeaderStyle}</style></head>`)
    .replace(/<header\b/i, "<header data-daddy-product-header")
    .replace(/(<body\b[^>]*>)/i, `$1${suiteNavigation(current)}`);
}

async function put(output, path, body) {
  const file = join(output, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, body);
}

function rootMarkdown(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  if (!body) throw new Error("Root document has no body");
  return body.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_match, href, label) => `[${label.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}](${new URL(href, ORIGIN).href})`)
    .replace(/<h([1-6])\b[^>]*>/gi, (_match, level) => "\n\n" + "#".repeat(Math.min(Number(level) + 1, 6)) + " ")
    .replace(/<\/(?:h[1-6]|p|section|div|nav|dt|dd|footer)>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#(?:39|x27);/g, "'")
    .split("\n").map((line) => line.replace(/[ \t]+/g, " ").trim()).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function compose({ output = outputDir, inputs = join(factoryDir, "dist"), root = join(factoryDir, "sites/daddyrad/public") } = {}) {
  await mkdir(output, { recursive: true });
  if ((await readdir(output)).length) throw new Error("DaddyRad output must be empty before composition. Rebuild into a fresh output directory.");
  await cp(root, output, { recursive: true });
  const routes = [];
  for (const product of PRODUCTS) {
    const input = join(inputs, product.productId);
    await access(join(input, "api/md/_catalog"));
    const sourceFiles = await filesIn(input);
    const names = sourceFiles.map((file) => relative(input, file));
    for (const source of sourceFiles) {
      const name = relative(input, source);
      if (name === "_headers" || name === "_redirects" || name === "robots.txt") continue;
      const format = extname(source);
      const textFile = [".html", ".md", ".txt", ".json", ".xml", ".css", ".js", ".mjs", ".svg"].includes(format) || name.startsWith("api/");
      if (!textFile) {
        const target = join(output, product.mount, name);
        await mkdir(dirname(target), { recursive: true });
        await cp(source, target);
        continue;
      }
      let body = rebaseDocument(await readFile(source, "utf8"), product, names, name.startsWith("api/") ? "json" : format);
      if (format === ".html") body = enhanceHtml(body, product.productId);
      await put(output, product.mount.slice(1) + "/" + name, body);
    }
    await put(output, `${product.mount}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
    const registry = JSON.parse(await readFile(join(output, product.mount, "api/md/_catalog"), "utf8"));
    routes.push(...registry);
  }
  const updatedAt = new Date().toISOString().slice(0, 10);
  const rootRoutes = [
    { path: "/", title: "DaddyRad", description: "Four native Mac utilities for storage, performance, browsing and coding-agent context.", assetPath: "/index.md", aliases: ["/index.md"], lastModified: updatedAt },
    { path: "/privacy", title: "DaddyRad website privacy", description: "Website analytics, newsletter and app-specific privacy policies.", assetPath: "/privacy.md", aliases: ["/privacy.md"], lastModified: updatedAt },
  ].map((route) => ({ ...route, url: ORIGIN + route.path, md: ORIGIN + route.assetPath }));
  routes.unshift(...rootRoutes);
  const home = `# DaddyRad\n\nCanonical: ${ORIGIN}/\nLast updated: ${updatedAt}\n\n${rootMarkdown(await readFile(join(output, "index.html"), "utf8"))}\n`;
  await put(output, "index.md", home);
  const privacyHtml = await readFile(join(output, "privacy.html"), "utf8");
  await put(output, "privacy.md", `# DaddyRad website privacy\n\nCanonical: ${ORIGIN}/privacy\nLast updated: ${updatedAt}\n\n${rootMarkdown(privacyHtml)}\n`);
  for (const name of ["index.html", "privacy.html"]) {
    const path = name === "index.html" ? "/index.md" : "/privacy.md";
    let html = await readFile(join(output, name), "utf8");
    html = html.replace(/<\/head>/i, `<meta name="ai-summary" content="${name === "index.html" ? rootRoutes[0].description : rootRoutes[1].description}"><link rel="alternate" type="text/markdown" href="${ORIGIN}${path}"></head>`);
    await put(output, name, html);
  }
  const identity = { name: "DaddyRad", url: ORIGIN, summary: rootRoutes[0].description, contact: `${ORIGIN}/privacy`, openapi: `${ORIGIN}/openapi.json`, updatedAt, trainingAllowed: true, notes: ["## Product sections", "", ...PRODUCTS.map(({ name, mount }) => `- [${name}](${ORIGIN}${mount}/)`), "", "## Product boundaries", "", "- Public marketing and documentation only. No app-data access or native control API.", "- Native downloads and update feeds remain on each product's release service.", "- Product privacy, support and release details belong to their dedicated sections." ] };
  const manifest = createAgentSurfaceManifest({ ...identity, pages: {} });
  const handler = createAgentSurfaceHandler({ manifest, listMarkdownRoutes: () => routes, loadMarkdown: async (_path, _request, route) => route ? readFile(join(output, route.assetPath), "utf8") : null });
  await put(output, "api/md/_identity", JSON.stringify(identity, null, 2));
  await put(output, "api/md/_catalog", JSON.stringify(routes, null, 2));
  const catalog = { name: "DaddyRad", version: "1", url: ORIGIN, llms: `${ORIGIN}/llms.txt`, llmsFull: `${ORIGIN}/llms-full.txt`, sitemap: `${ORIGIN}/sitemap.xml`, openapi: `${ORIGIN}/openapi.json`, markdown: { suffix: ".md", negotiation: true }, auth: { public: true }, surfaces: routes.map((route) => ({ id: route.path === "/" ? "home" : route.path.replace(/^\/|\/$/g, "").replaceAll("/", "-"), url: route.path, md: route.assetPath, kind: route.path.includes("/blog/") ? "article" : "static" })), products: PRODUCTS.map(({ productId, name, mount, nativeReleaseOrigin }) => ({ id: productId, name, url: ORIGIN + mount + "/", download: nativeReleaseOrigin + "/download" })) };
  await put(output, "api/ai", JSON.stringify(catalog, null, 2));
  for (const name of ["llms.txt", "llms-full.txt", "ai.txt"]) await put(output, name, await (await handler(new Request(`${ORIGIN}/${name}`))).text());
  await put(output, "sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${ORIGIN}${route.path}</loc><lastmod>${route.lastModified}</lastmod></url>`).join("")}</urlset>\n`);
  await put(output, "robots.txt", `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
  await put(output, "openapi.json", JSON.stringify({ openapi: "3.1.0", info: { title: "DaddyRad public documents", version: "1.0.0", description: "Read-only public site discovery. Native app actions, downloads and update feeds are independent services." }, servers: [{ url: ORIGIN }], paths: Object.fromEntries(["/api/ai", "/llms.txt", "/sitemap.xml", "/openapi.json"].map((path) => [path, { get: { responses: { "200": { description: "Public document" } } } }])) }, null, 2));
  const security = {};
  for (const file of (await filesIn(output)).filter((file) => file.endsWith(".html"))) {
    const html = await readFile(file, "utf8");
    const hashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter((match) => !/\bsrc\s*=/.test(match[1])).map((match) => `'sha256-${createHash("sha256").update(match[2]).digest("base64")}'`);
    security["/" + relative(output, file)] = [...new Set(hashes)];
  }
  await put(output, "_security.json", JSON.stringify(security));
  return { output, routes };
}
