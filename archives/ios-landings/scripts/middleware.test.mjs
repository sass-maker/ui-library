import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../functions/_middleware.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { onRequest } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

function request(path, options = {}) {
  return new Request(`https://browserdaddy.example${path}`, options);
}

function contextFor(req, next, assets) {
  return { request: req, next: async () => next, env: assets ? { ASSETS: { fetch: assets } } : {} };
}

test("the production Daddy aliases redirect, preserving path and query", async () => {
  const canonical = { browserdaddy: "browser.daddyrad.com", performancedaddy: "performance.daddyrad.com", contextdaddy: "context.daddyrad.com" };
  for (const id of ["browserdaddy", "performancedaddy", "contextdaddy"]) {
    for (const method of ["GET", "HEAD"]) {
      const response = await onRequest(contextFor(new Request(`https://${id}-landing.pages.dev/privacy/?from=share`, { method }), new Response("unused")));
      assert.equal(response.status, 301);
      assert.equal(response.headers.get("location"), `https://${canonical[id]}/privacy/?from=share`);
      assert.equal(await response.text(), "");
    }
    const proxied = await onRequest(contextFor(new Request(`https://${id}-landing.pages.dev/`, { headers: { "x-daddy-proxy": "1" } }), new Response("page")));
    assert.equal(proxied.status, 200);
    assert.equal(proxied.headers.get("location"), null);
    for (const host of [`hash.${id}-landing.pages.dev`, `${id}.significanthobbies.com`, "kith.pages.dev"]) {
      const response = await onRequest(contextFor(new Request(`https://${host}/`), new Response("page", { headers: { "content-type": "text/html" } })));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("location"), null);
    }
  }
});

test("generated OpenAPI JSON passes through unchanged and has no fabricated limits", async () => {
  const next = new Response('{"openapi":"3.1.0","info":{"title":"BrowserDaddy"}}', {
    headers: { "content-type": "application/json", etag: '"generated"' },
  });
  const response = await onRequest(contextFor(request("/openapi.json"), next));
  assert.equal(await response.text(), '{"openapi":"3.1.0","info":{"title":"BrowserDaddy"}}');
  assert.equal(response.headers.get("etag"), '"generated"');
  assert.equal(response.headers.get("ratelimit-limit"), null);
});

test("Markdown negotiation maps root, trailing-slash pages, and articles to index.md", async () => {
  const seen = [];
  const assets = async (req) => {
    seen.push(new URL(req.url).pathname);
    return new Response("# page", { status: 200, headers: { "content-type": "text/markdown" } });
  };
  for (const path of ["/privacy/", "/blog/"]) {
    const response = await onRequest(contextFor(request(path, { headers: { accept: "text/markdown" } }), new Response("html"), assets));
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "# page");
  }
  assert.deepEqual(seen, ["/privacy/index.md", "/blog/index.md"]);
});

test("HEAD responses have no body, including negotiated Markdown and 404s", async () => {
  const assets = async () => new Response("# page", { status: 200 });
  const markdown = await onRequest(contextFor(request("/privacy/", { method: "HEAD", headers: { accept: "text/markdown" } }), new Response("html"), assets));
  assert.equal(markdown.status, 200);
  assert.equal(await markdown.text(), "");

  const missing = await onRequest(contextFor(request("/missing", { method: "HEAD" }), new Response("", { status: 404 })));
  assert.equal(missing.status, 404);
  assert.equal(await missing.text(), "");
});

test("unknown API errors do not claim a rate limit", async () => {
  const response = await onRequest(contextFor(request("/api/nope"), new Response("should not run")));
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("ratelimit-limit"), null);
  assert.match(await response.text(), /Unknown API path/);
});

test("a canonical asset redirect does not turn a valid HTML route into a 404", async () => {
  let checks = 0;
  const assets = async () => {
    checks += 1;
    if (checks === 1) return new Response(null, { status: 308, headers: { location: "/privacy/" } });
    return new Response("html", { status: 200, headers: { "content-type": "text/html" } });
  };
  const response = await onRequest(contextFor(request("/privacy"), new Response("html", { status: 200, headers: { "content-type": "text/html" } }), assets));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "html");
  assert.equal(checks, 2);
});
