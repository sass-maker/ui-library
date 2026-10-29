import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.mjs";

function fixture(extra = {}) {
  const files = {
    "/_security.json": { "/index.html": [], "/404.html": [], "/storage/privacy/index.html": [] },
    "/api/md/_identity": { name: "DaddyRad", url: "https://daddyrad.com", summary: "Four Mac utilities" },
    "/api/md/_catalog": [{ path: "/storage/privacy/", title: "Storage privacy", assetPath: "/storage/privacy/index.md", aliases: ["/storage/privacy/index.md"] }],
    "/storage/privacy/index.md": "# Storage privacy\n\nCanonical: https://daddyrad.com/storage/privacy/\n",
    "/storage/privacy/": "<h1>Storage privacy</h1>",
    "/": "<h1>DaddyRad</h1>",
    "/404.html": "<h1>Return home</h1>",
    ...extra,
  };
  return { ASSETS: { async fetch(request) {
    const path = new URL(request.url).pathname;
    const value = files[path];
    if (value instanceof Response) return value.clone();
    if (value === undefined) return new Response(null, { status: 404 });
    const type = typeof value === "object" ? "application/json" : path.endsWith(".md") ? "text/markdown" : "text/html";
    return new Response(request.method === "HEAD" ? null : typeof value === "object" ? JSON.stringify(value) : value, { headers: { "Content-Type": type } });
  } } };
}

test("apex serves assets with bounded script origins and no inline script wildcard", async () => {
  const response = await worker.fetch(new Request("https://daddyrad.com/"), fixture());
  assert.equal(response.status, 200);
  const policy = response.headers.get("Content-Security-Policy");
  const directives = Object.fromEntries(policy.split(";").filter((value) => value.trim()).map((value) => { const [key, ...rest] = value.trim().split(/\s+/); return [key, rest]; }));
  assert.ok(!directives["script-src"].includes("'unsafe-inline'"));
  assert.ok(directives["script-src"].includes("https://scripts.clarity.ms"));
  assert.deepEqual(directives["font-src"], ["'self'", "https://sassmaker.com"]);
  assert.deepEqual(directives["default-src"], ["'none'"]);
  for (const name of ["base-uri", "frame-ancestors"]) assert.deepEqual(directives[name], ["'none'"]);
  assert.deepEqual(directives["form-action"], ["https://claude.ai", "https://chatgpt.com", "https://www.perplexity.ai", "https://grok.com"]);
  assert.match(response.headers.get("Vary"), /Accept/);
});

test("www redirects to apex preserving a section path and query", async () => {
  const response = await worker.fetch(new Request("https://www.daddyrad.com/storage/privacy/?x=1"), fixture());
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("Location"), "https://daddyrad.com/storage/privacy/?x=1");
});

test("unknown hosts and write methods are rejected", async () => {
  assert.equal((await worker.fetch(new Request("https://daddyrad.workers.dev/"), fixture())).status, 404);
  const response = await worker.fetch(new Request("https://daddyrad.com/", { method: "POST" }), fixture());
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "GET, HEAD, OPTIONS");
});

test("mounted Markdown negotiation and direct alternates preserve canonical URLs", async () => {
  const env = fixture();
  for (const path of ["/storage/privacy/", "/storage/privacy/index.md", "/storage/privacy.md", "/api/md/storage/privacy"]) {
    const response = await worker.fetch(new Request("https://daddyrad.com" + path, { headers: { Accept: "text/markdown" } }), env);
    assert.equal(response.status, 200, path);
    assert.match(response.headers.get("Content-Type"), /text\/markdown/);
    assert.match(await response.text(), /Canonical: https:\/\/daddyrad.com\/storage\/privacy\//);
  }
  const html = await worker.fetch(new Request("https://daddyrad.com/storage/privacy/"), env);
  assert.match(html.headers.get("Content-Type"), /text\/html/);
  const head = await worker.fetch(new Request("https://daddyrad.com/storage/privacy/", { method: "HEAD", headers: { Accept: "text/markdown" } }), env);
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
});

test("missing HTML and Markdown remain genuine 404s with empty HEAD bodies", async () => {
  for (const accept of ["text/html", "text/markdown"]) {
    for (const method of ["GET", "HEAD"]) {
      const response = await worker.fetch(new Request("https://daddyrad.com/storage/missing", { method, headers: { Accept: accept } }), fixture());
      assert.equal(response.status, 404);
      assert.match(response.headers.get("Content-Type"), accept === "text/html" ? /text\/html/ : /text\/markdown/);
      const body = await response.text();
      if (method === "HEAD") assert.equal(body, "");
      else assert.ok(body.includes(accept === "text/html" ? "Return home" : "/storage/"));
    }
  }
});

test("missing guide and unrelated guide redirects do not recurse", async () => {
  for (const replacement of [undefined, Response.redirect("https://example.com/404"), Response.redirect("https://daddyrad.com/"), Response.redirect("https://daddyrad.com/404?redirect=1")]) {
    const response = await worker.fetch(new Request("https://daddyrad.com/missing"), fixture({ "/404.html": replacement }));
    assert.equal(response.status, 404);
  }
});

test("guide follows only the Assets canonical guide path", async () => {
  const env = fixture({ "/404.html": Response.redirect("https://daddyrad.com/404", 307), "/404": "<h1>Return home</h1>" });
  const response = await worker.fetch(new Request("https://daddyrad.com/missing"), env);
  assert.equal(response.status, 404);
  assert.equal(response.headers.has("Location"), false);
  assert.match(await response.text(), /Return home/);
});

test("unknown API routes return JSON while public discovery allows OPTIONS", async () => {
  for (const path of ["/api/missing", "/storage/api/missing"]) {
    const response = await worker.fetch(new Request("https://daddyrad.com" + path), fixture());
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error.code, "not_found");
  }
  const response = await worker.fetch(new Request("https://daddyrad.com/storage/privacy/", { method: "OPTIONS", headers: { Accept: "text/markdown" } }), fixture());
  assert.equal(response.status, 204);
  assert.match(response.headers.get("Access-Control-Allow-Methods"), /HEAD/);
});

test("an empty journal keeps its explicit noindex Markdown status page without registering unknown content", async () => {
  const env = fixture({ "/storage/blog/index.md": "# StorageDaddy journal\n\nNo published notes yet.\n" });
  const response = await worker.fetch(new Request("https://daddyrad.com/storage/blog/index.md"), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, follow");
  assert.match(await response.text(), /No published notes yet/);
  assert.equal((await worker.fetch(new Request("https://daddyrad.com/storage/blog/missing.md"), env)).status, 404);
});

test("missing or malformed page script hashes fail closed without stale metadata", async () => {
  for (const manifest of [undefined, { "/index.html": ["'unsafe-inline'"] }, []]) {
    const response = await worker.fetch(new Request("https://daddyrad.com/"), fixture({ "/_security.json": manifest }));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }
});
