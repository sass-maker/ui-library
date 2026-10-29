import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { compose, productRebaser, rebaseDocument, suiteNavigation } from "./compose.mjs";
import { PRODUCTS, productForPath } from "./products.mjs";
import { directoryAssets } from "./static-assets.mjs";
import worker from "./worker.mjs";

const product = PRODUCTS[1];
const files = ["index.html", "index.md", "privacy/index.html", "privacy/index.md", "release/index.html", "images/icon.png", "_astro/font.woff2", "_astro/screen.webp", "api/ai"];

test("mounted marketing URLs retain release origins and leave other services alone", () => {
  const rebase = productRebaser(product, files);
  for (const [input, expected] of [
    ["/", "/performance/"],
    ["/#how-it-works", "/performance/#how-it-works"],
    ["/privacy/?x=1#details", "/performance/privacy/?x=1#details"],
    ["https://performance.daddyrad.com", "https://daddyrad.com/performance"],
    ["https://performance.daddyrad.com/privacy/", "https://daddyrad.com/performance/privacy/"],
    ["https://performance.daddyrad.com/download?from=landing", "https://performance.daddyrad.com/download?from=landing"],
    ["https://performance.daddyrad.com/updates/appcast.xml", "https://performance.daddyrad.com/updates/appcast.xml"],
    ["https://performance.daddyrad.com/api/native-status", "https://performance.daddyrad.com/api/native-status"],
    ["/download", "https://performance.daddyrad.com/download"],
    ["/v1/feedback", "/v1/feedback"],
    ["//cdn.example/image.png", "//cdn.example/image.png"],
    ["https://performance.daddyrad.com.example/", "https://performance.daddyrad.com.example/"],
    ["#privacy", "#privacy"],
    ["/performance/privacy/", "/performance/privacy/"],
  ]) assert.equal(rebase(input), expected, input);
});

test("HTML, CSS and Markdown rebase only known document and asset URLs", () => {
  const input = `<a href="/">Home</a><a href="/privacy/">Privacy</a><img src="/images/icon.png" srcset="/_astro/screen.webp 600w, /images/icon.png 1200w"><style>@font-face{src:url('/_astro/font.woff2')}</style><script>if(href==="/release/") track(); fetch(api + "/v1/feedback"); parts.join("/");</script><link rel="canonical" href="https://performance.daddyrad.com/">`;
  const html = rebaseDocument(input, product, files, ".html");
  for (const value of ['href="/performance/"', 'href="/performance/privacy/"', 'src="/performance/images/icon.png"', 'srcset="/performance/_astro/screen.webp 600w, /performance/images/icon.png 1200w"', "url('/performance/_astro/font.woff2')", 'href==="/performance/release/"', 'api + "/v1/feedback"', 'parts.join("/")', 'href="https://daddyrad.com/performance/"']) assert.ok(html.includes(value), value);
  assert.equal(rebaseDocument("[Privacy](/privacy/)\nCanonical: https://performance.daddyrad.com/privacy/\n[Download](https://performance.daddyrad.com/download)", product, files, ".md"), "[Privacy](/performance/privacy/)\nCanonical: https://daddyrad.com/performance/privacy/\n[Download](https://performance.daddyrad.com/download)");
});

test("JSON registries gain exactly one mount while OpenAPI operation keys stay relative", () => {
  const json = JSON.parse(rebaseDocument(JSON.stringify({ url: "/", assetPath: "/index.md", aliases: ["/index.md"], paths: { "/api/ai": {} }, servers: [{ url: product.nativeReleaseOrigin }] }), product, files, "json"));
  assert.equal(json.url, "/performance/");
  assert.equal(json.assetPath, "/performance/index.md");
  assert.deepEqual(json.aliases, ["/performance/index.md"]);
  assert.ok(json.paths["/api/ai"]);
  assert.equal(json.servers[0].url, "https://daddyrad.com/performance");
});

test("JSON-LD and escaped URL literals rebase public pages without changing native APIs", () => {
  const input = '<script type="application/ld+json">{"url":"https:\\/\\/performance.daddyrad.com\\/privacy\\/","image":"/images/icon.png","native":"https://performance.daddyrad.com/api/native-status"}</script><script>const page="https:\\/\\/performance.daddyrad.com\\/privacy\\/";</script>';
  const output = rebaseDocument(input, product, files, ".html");
  assert.match(output, /"url":"https:\/\/daddyrad.com\/performance\/privacy\/"/);
  assert.match(output, /"image":"\/performance\/images\/icon.png"/);
  assert.match(output, /"native":"https:\/\/performance.daddyrad.com\/api\/native-status"/);
  assert.match(output, /const page="https:\/\/daddyrad.com\/performance\/privacy\/"/);
  const predicate = "url.origin === 'https://performance.daddyrad.com' && url.pathname === '/download'";
  assert.equal(rebaseDocument(predicate, product, files, ".js"), predicate);
  assert.equal(rebaseDocument(`<a href="/download">Download</a><script>${predicate}</script>`, product, files, ".html"), `<a href="https://performance.daddyrad.com/download">Download</a><script>${predicate}</script>`);
});

test("all pages can reach DaddyRad and every other product without a mobile menu script", () => {
  const html = suiteNavigation("performancedaddy");
  assert.match(html, /href="\/">DaddyRad/);
  for (const { mount } of PRODUCTS) assert.ok(html.includes(`href="${mount}/"`));
  assert.match(html, /href="\/performance\/" aria-current="page"/);
  assert.equal(productForPath("/performance/blog/background-apps/")?.productId, "performancedaddy");
  assert.equal(productForPath("/performances/"), undefined);
});

test("composition writes one resolvable static tree and an aggregate Worker Markdown registry", async () => {
  const fixture = await mkdtemp(join(tmpdir(), "daddyrad-compose-"));
  try {
    const inputs = join(fixture, "inputs");
    for (const product of PRODUCTS) {
      const input = join(inputs, product.productId);
      await mkdir(join(input, "api/md"), { recursive: true });
      await writeFile(join(input, "index.html"), `<html><head><link rel="canonical" href="${product.nativeReleaseOrigin}/"><script type="application/ld+json">{"url":"${product.nativeReleaseOrigin}/"}</script></head><body><h1>${product.name}</h1><a href="/">Overview</a><a href="${product.nativeReleaseOrigin}/download">Download for Mac</a><script>window.example=true;</script></body></html>`);
      await writeFile(join(input, "index.md"), `# ${product.name}\n\nCanonical: ${product.nativeReleaseOrigin}/\n`);
      await writeFile(join(input, "api/md/_catalog"), JSON.stringify([{ path: "/", title: product.name, description: product.name, assetPath: "/index.md", aliases: ["/index.md"], url: product.nativeReleaseOrigin + "/", md: product.nativeReleaseOrigin + "/index.md", lastModified: "2026-10-29" }]));
    }
    const output = join(fixture, "output");
    const result = await compose({ inputs, output });
    assert.equal(result.routes.length, 6);
    const env = { ASSETS: directoryAssets(output) };
    const catalog = JSON.parse(await readFile(join(output, "api/md/_catalog"), "utf8"));
    assert.equal(new Set(catalog.map(({ path }) => path)).size, 6);
    for (const product of PRODUCTS) {
      const html = await worker.fetch(new Request(`https://daddyrad.com${product.mount}/`), env);
      assert.equal(html.status, 200);
      const body = await html.text();
      assert.ok(body.includes(`href="https://daddyrad.com${product.mount}/"`));
      assert.ok(body.includes(`href="${product.nativeReleaseOrigin}/download"`));
      assert.match(html.headers.get("Content-Security-Policy"), /'sha256-/);
      const markdown = await worker.fetch(new Request(`https://daddyrad.com${product.mount}/`, { headers: { Accept: "text/markdown" } }), env);
      assert.equal(markdown.status, 200);
      assert.ok((await markdown.text()).includes(`Canonical: https://daddyrad.com${product.mount}/`));
    }
    const discovery = await readFile(join(output, "llms.txt"), "utf8");
    for (const product of PRODUCTS) assert.ok(discovery.includes(`https://daddyrad.com${product.mount}/`));
    await assert.rejects(compose({ inputs, output }), /output must be empty/);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});
