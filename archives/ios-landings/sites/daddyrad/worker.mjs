import { createStaticAssetHandler, advertiseMarkdown } from "../../src/lib/agent-surfaces/adapters/static-assets.mjs";
import { wantsMarkdown } from "../../src/lib/agent-surfaces/http.mjs";
import { ORIGIN, PRODUCTS, productForPath } from "./products.mjs";

const APEX = new URL(ORIGIN).hostname;
const markdown = createStaticAssetHandler({
  origin: ORIGIN,
  // Empty journals are intentionally noindex and absent from discovery, but
  // their explicit generated Markdown status page remains a public document.
  preserveMarkdownPaths: PRODUCTS.map(({ mount }) => `${mount}/blog/index.md`),
});
const securityManifests = new WeakMap();

async function scriptHashes(assets, pathname) {
  let data = securityManifests.get(assets);
  if (!data) {
    const response = await assets.fetch(new Request(`${ORIGIN}/_security.json`));
    if (!response.ok) throw new Error("Security manifest unavailable");
    data = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid security manifest");
    securityManifests.set(assets, data);
  }
  const path = pathname.replace(/\/$/, "");
  const hashes = data[pathname] ?? data[`${path}/index.html`] ?? data[`${path}.html`];
  if (!Array.isArray(hashes) || hashes.some((hash) => !/^'sha256-[A-Za-z0-9+/]{43}='$/.test(hash))) throw new Error("Page security metadata unavailable");
  return hashes;
}

async function secure(response, assets, pathname, method) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (headers.get("content-type")?.includes("text/markdown")) headers.set("X-Robots-Tag", "noindex, follow");
  let hashes = [];
  if (headers.get("content-type")?.includes("text/html") && ![301, 307, 308].includes(response.status)) {
    try { hashes = await scriptHashes(assets, pathname); }
    catch { return new Response(method === "HEAD" ? null : "Site temporarily unavailable", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }); }
  }
  headers.set("Content-Security-Policy", `default-src 'none'; img-src 'self' data: https://sassmaker.com https://*.clarity.ms https://c.bing.com; font-src 'self' https://sassmaker.com; style-src 'self' 'unsafe-inline'; script-src 'self' https://sassmaker.com https://health.sassmaker.com https://ingest.sassmaker.com https://www.clarity.ms https://scripts.clarity.ms https://c.bing.com ${hashes.join(" ")}; connect-src 'self' https://sassmaker.com https://api.sassmaker.com https://ingest.sassmaker.com https://*.clarity.ms https://c.bing.com; base-uri 'none'; form-action https://claude.ai https://chatgpt.com https://www.perplexity.ai https://grok.com; frame-ancestors 'none'`);
  const result = new Response(method === "HEAD" ? null : response.body, { status: response.status, statusText: response.statusText, headers });
  return headers.get("content-type")?.includes("text/html") ? advertiseMarkdown(result, ORIGIN) : result;
}

function markdown404(request) {
  const path = new URL(request.url).pathname;
  const product = productForPath(path);
  const home = product ? `${product.mount}/` : "/";
  return new Response(request.method === "HEAD" ? null : `# Page not found\n\nThis address has no public page.\n\n- [${product?.name ?? "DaddyRad"}](${ORIGIN}${home})\n- [All apps](${ORIGIN}/)\n- [Public page index](${ORIGIN}/llms.txt)\n`, { status: 404, headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "no-store", "CDN-Cache-Control": "no-store", "Cloudflare-CDN-Cache-Control": "no-store", "Vary": "Accept", "X-Robots-Tag": "noindex, follow" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD, OPTIONS" } });
    if (url.hostname === `www.${APEX}`) return Response.redirect(ORIGIN + url.pathname + url.search, 301);
    if (url.hostname !== APEX) return new Response("Not found", { status: 404 });
    const agent = await markdown(request, env.ASSETS);
    if (agent) return secure(agent, env.ASSETS, url.pathname, request.method);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS", "Access-Control-Allow-Headers": "Accept" } });
    const apiPrefix = productForPath(url.pathname)?.mount ?? "";
    if (url.pathname.startsWith(`${apiPrefix}/api/`) && ![`${apiPrefix}/api/ai`, `${apiPrefix}/api/md/_catalog`, `${apiPrefix}/api/md/_identity`].includes(url.pathname)) {
      return new Response(request.method === "HEAD" ? null : JSON.stringify({ error: { code: "not_found", message: "Unknown public API path" } }), { status: 404, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
    }
    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      if (wantsMarkdown(request)) return secure(markdown404(request), env.ASSETS, url.pathname, request.method);
      let page = await env.ASSETS.fetch(new Request(`${ORIGIN}/404.html`));
      if ([301, 302, 307, 308].includes(page.status) && page.headers.has("Location")) {
        const canonical = new URL(page.headers.get("Location"), ORIGIN);
        if (canonical.origin === ORIGIN && ["/404", "/404/"].includes(canonical.pathname) && !canonical.search) page = await env.ASSETS.fetch(new Request(canonical));
      }
      if (page.ok) return secure(new Response(request.method === "HEAD" ? null : page.body, { status: 404, headers: page.headers }), env.ASSETS, "/404.html", request.method);
    }
    if (url.pathname === "/api/ai" || PRODUCTS.some(({ mount }) => url.pathname === `${mount}/api/ai`)) {
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "application/json; charset=utf-8");
      headers.set("Access-Control-Allow-Origin", "*");
      return secure(new Response(response.body, { status: response.status, headers }), env.ASSETS, url.pathname, request.method);
    }
    return secure(response, env.ASSETS, url.pathname, request.method);
  },
};
