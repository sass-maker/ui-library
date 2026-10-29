import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { filesIn, outputDir } from "../sites/daddyrad/compose.mjs";
import { directoryAssets } from "../sites/daddyrad/static-assets.mjs";
import { ORIGIN, PRODUCTS } from "../sites/daddyrad/products.mjs";
import worker from "../sites/daddyrad/worker.mjs";
import { appHealthConfigFor } from "../src/lib/app-health.mjs";
import { spawnSync } from "node:child_process";

const assets = directoryAssets(outputDir);
const env = { ASSETS: assets };
const request = (path, options) => worker.fetch(new Request(ORIGIN + path, options), env);
const routes = JSON.parse(await readFile(join(outputDir, "api/md/_catalog"), "utf8"));
const paths = new Set(routes.map(({ path }) => path));
assert.equal(paths.size, routes.length, "Duplicate public route");
const sitemap = await readFile(join(outputDir, "sitemap.xml"), "utf8");
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort(), routes.map(({ path }) => ORIGIN + path).sort());
for (const route of routes) {
  const html = await request(route.path);
  assert.equal(html.status, 200, route.path);
  assert.match(html.headers.get("content-type"), /text\/html/, route.path);
  const body = await html.text();
  const canonical = [...body.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(canonical, [ORIGIN + route.path], route.path);
  assert.match(body, /type="text\/markdown"/, route.path);
  const markdown = await request(route.path, { headers: { Accept: "text/markdown" } });
  assert.equal(markdown.status, 200, route.path);
  assert.match(markdown.headers.get("content-type"), /text\/markdown/, route.path);
  assert.match(markdown.headers.get("vary"), /Accept/, route.path);
  assert.equal(markdown.headers.get("Cloudflare-CDN-Cache-Control"), "no-store", route.path);
  const markdownBody = await markdown.text();
  assert.ok(markdownBody.includes(`Canonical: ${ORIGIN}${route.path}`), route.path);
  assert.equal(await (await request(route.assetPath)).text(), markdownBody, route.assetPath);
  const head = await request(route.path, { method: "HEAD", headers: { Accept: "text/markdown" } });
  assert.equal(head.status, 200, route.path);
  assert.equal(await head.text(), "");
  const htmlAgain = await request(route.path);
  assert.match(htmlAgain.headers.get("content-type"), /text\/html/, "Markdown must not replace HTML");
  const policy = htmlAgain.headers.get("Content-Security-Policy");
  const scriptPolicy = policy.split(";").find((value) => value.trim().startsWith("script-src "));
  assert.ok(!scriptPolicy.includes("'unsafe-inline'"), route.path);
  for (const match of body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/.test(match[1])) continue;
    const hash = `'sha256-${createHash("sha256").update(match[2]).digest("base64")}'`;
    assert.ok(scriptPolicy.includes(hash), `Blocked inline script on ${route.path}`);
  }
}
let links = 0;
for (const file of (await filesIn(outputDir)).filter((file) => file.endsWith(".html") || file.endsWith(".css"))) {
  const body = await readFile(file, "utf8");
  const relativePath = "/" + relative(outputDir, file);
  const publicPath = relativePath.endsWith("index.html") ? relativePath.slice(0, -10) : relativePath.replace(/\.html$/, "");
  if (extname(file) === ".html" && !/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(body)) {
    const canonical = body.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
    assert.ok(canonical && paths.has(new URL(canonical).pathname), `${relativePath} is indexable but absent from the public registry`);
  }
  const references = extname(file) === ".html" ? [...body.matchAll(/\b(?:href|src|poster|art-src|font-base)="([^"]+)"/g)].map((match) => match[1]) : [];
  const css = body.replace(/url\(\s*(["'])data:[\s\S]*?\1\s*\)/gi, "");
  references.push(...[...css.matchAll(/url\(\s*["']?([^\s)'"<>]+)/g)].map((match) => match[1]));
  if (extname(file) === ".html") for (const [, candidates] of body.matchAll(/\bsrcset="([^"]+)"/g)) references.push(...candidates.split(",").map((candidate) => candidate.trim().split(/\s+/)[0]));
  for (const value of references) {
    if (value.startsWith("#") || /^(?:data|mailto|tel|javascript):/.test(value)) continue;
    const url = new URL(value.replaceAll("&amp;", "&"), ORIGIN + publicPath);
    if (url.origin !== ORIGIN) continue;
    if (url.pathname.endsWith("/fonts/fleet-footer-precise-v1/")) { await access(join(outputDir, url.pathname, "geist.woff2")); continue; }
    const response = await assets.fetch(new Request(url));
    assert.equal(response.status, 200, `${relativePath} links to missing ${url.pathname}`);
    links++;
  }
}
for (const product of PRODUCTS) {
  const home = await (await request(product.mount + "/")).text();
  assert.ok(home.includes(`href="${product.nativeReleaseOrigin}/download"`), `${product.name} lost its download`);
  assert.match(home, /Download for Mac/, `${product.name} lost its visible download label`);
  const rootTracker = 'data-project="app-import-4ccfa7ec3e592eee27d325ed799c8636159f71399d4202f3dd6458fd26550828"';
  assert.ok(!home.includes(rootTracker), `${product.name} inherited the umbrella tracker`);
  if (product.productId === "storagedaddy") {
    assert.equal([...home.matchAll(/src="\/storage\/storage-analytics\.js"/g)].length, 1);
    assert.equal([...home.matchAll(/src="\/storage\/storage-clarity\.js"/g)].length, 1);
    assert.ok(home.includes('data-project="app-3262e567-f7cc-48bc-a528-4e3845185b41"'));
    assert.ok(!home.includes('src="https://health.sassmaker.com/tracker.js"'));
  } else {
    const tracker = appHealthConfigFor(product.productId);
    assert.ok(home.includes(`data-project="${tracker.projectId}"`));
    assert.equal([...home.matchAll(/src="https:\/\/health\.sassmaker\.com\/tracker\.js"/g)].length, 1);
  }
  const question = home.match(/<textarea\b[^>]*id="ask-ai"[^>]*>([\s\S]*?)<\/textarea>/)?.[1];
  assert.ok(question?.includes(`${ORIGIN}${product.mount}`), `${product.name} Ask AI lost its canonical section URL`);
  assert.ok(!question.includes(product.nativeReleaseOrigin), `${product.name} Ask AI still uses its release origin`);
  assert.ok(home.includes('aria-label="DaddyRad apps"'));
  for (const sibling of PRODUCTS) assert.ok(home.includes(`href="${sibling.mount}/"`));
  for (const path of ["index.md", "privacy/index.md", "support/index.md", "terms/index.md", "accessibility/index.md", "release/index.md", "testflight/index.md", "blog/index.md", "blog/rss.xml", "llms.txt", "llms-full.txt", "ai.txt", "robots.txt", "sitemap.xml", "api/ai", "openapi.json"]) {
    assert.equal((await request(`${product.mount}/${path}`)).status, 200, `${product.name}/${path}`);
  }
  assert.equal((await request(`${product.mount}/missing`)).status, 404);
  assert.equal((await request(`${product.mount}/missing`, { headers: { Accept: "text/markdown" } })).status, 404);
  assert.equal((await request(`${product.mount}/blog/missing/`)).status, 404);
}
assert.ok(paths.has("/performance/blog/background-apps/"));
for (const product of PRODUCTS.filter(({ productId }) => productId !== "performancedaddy")) assert.ok(!paths.has(`${product.mount}/blog/background-apps/`));
for (const path of ["/missing", "/api/missing", "/storage/api/missing", "/storage/missing.md"]) {
  for (const method of ["GET", "HEAD"]) {
    const response = await request(path, { method });
    assert.equal(response.status, 404, path);
    if (method === "HEAD") assert.equal(await response.text(), "");
  }
}
assert.equal((await request("/", { method: "POST" })).status, 405);
assert.equal((await request("/storage/", { method: "OPTIONS", headers: { Accept: "text/markdown" } })).status, 204);
const alias = await worker.fetch(new Request("https://www.daddyrad.com/storage/privacy/?x=1"), env);
assert.equal(alias.status, 301);
assert.equal(alias.headers.get("Location"), "https://daddyrad.com/storage/privacy/?x=1");
const telemetry = spawnSync(process.execPath, ["--test", "scripts/storage-analytics.test.mjs", "scripts/storage-clarity.test.mjs"], { stdio: "inherit", env: { ...process.env, STORAGE_ANALYTICS_SOURCE: join(outputDir, "storage/storage-analytics.js"), STORAGE_CLARITY_SOURCE: join(outputDir, "storage/storage-clarity.js") } });
assert.equal(telemetry.status, 0, "Composed Storage measurement behavior changed");
console.log(`Checked DaddyRad: ${routes.length} public HTML/Markdown pages, ${links} local references, four downloads, discovery, CSP, GET/HEAD/OPTIONS and genuine 404s.`);
