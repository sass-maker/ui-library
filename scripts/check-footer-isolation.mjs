import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { renderStudioFooterHtml } from "../packages/ui/footer-html.js";

const ui = new URL("../packages/ui/", import.meta.url);
const theme = readFileSync(new URL("src/styles/theme.css", ui), "utf8").replace(/^@import [^;]+;\n/gm, "");
const footer = renderStudioFooterHtml({ product: "Isolation fixture", url: "https://example.test", summary: "Local CSS contract test.", capture: false, studio: [], groups: [] });
const cases = [
  { id: "base" },
  ...["paper", "ink", "hearth", "signal", "gallery"].map(theme => ({ id: theme, theme })),
  { id: "paper-dark", theme: "paper", mode: "dark" },
  { id: "host-overrides", style: "--brand:red;--radius:0;--ui-case:none;--display-case:uppercase;--display-weight:500;--font-display:monospace;--font-sans:monospace" },
  { id: "host-hsl", collision: "--background:0 0% 100%;--foreground:222 47% 11%;--card:0 0% 100%;--primary:222 47% 11%;--accent:210 40% 96%;--border:214 32% 91%" },
  { id: "host-oklch", collision: "--background:white;--foreground:black;--card:white;--primary:black;--accent:oklch(.95 0 0);--border:oklch(.9 0 0)" },
  { id: "host-oklch-ink", theme: "ink", collision: "--background:white;--foreground:black;--card:white;--primary:black;--accent:oklch(.95 0 0);--border:oklch(.9 0 0)" },
  { id: "host-hsl-dark", mode: "dark", collision: "--background:0 0% 100%;--foreground:222 47% 11%;--card:0 0% 100%;--primary:222 47% 11%;--accent:210 40% 96%;--border:214 32% 91%" },
  { id: "host-terracotta", collision: "--accent:#c46a4a" },
];
const paletteRoles = { background: "bg-background", card: "bg-card", primary: "bg-primary", surface: "bg-surface", accent: "hover:bg-accent" };
const oraclePalette = Object.keys(paletteRoles).map(role => `<div id="palette-${role}" style="background-color:var(--${role})"></div>`).join("");
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (["/footer.css", "/footer.js"].includes(url.pathname)) {
    res.setHeader("Content-Type", url.pathname.endsWith("css") ? "text/css" : "text/javascript");
    res.end(readFileSync(new URL(url.pathname.slice(1), ui)));
    return;
  }
  const entry = cases.find(entry => entry.id === url.searchParams.get("case")) ?? cases[0];
  const attributes = `${entry.theme ? ` data-theme="${entry.theme}"` : ""}${entry.mode ? ` data-mode="${entry.mode}"` : ""} style="${entry.style ?? ""}"`;
  const oracle = url.pathname === "/oracle";
  res.setHeader("Content-Type", "text/html");
  res.end(`<!doctype html><html lang="en"${attributes}><meta name="viewport" content="width=device-width,initial-scale=1"><style>@layer theme,base,components,utilities;@layer utilities{.px-5{padding-inline:32px}}body{margin:0;color:#ededed;font:16px Arial}#host{min-height:120px}${oracle ? theme + "#probe{background:var(--brand);border-radius:var(--radius);color:var(--foreground);font-weight:var(--display-weight);text-transform:var(--ui-case)}" : `html{${entry.collision ?? ""}}`}</style><body><main id="host" class="px-5">Host styles</main>${oracle ? `<div id="probe">Oracle</div>${oraclePalette}` : `<studio-footer>${footer}</studio-footer><script type="module" src="/footer.js"></script>`}</body></html>`);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
let browser;
const results = [];
try {
  browser = await chromium.launch({ headless: true, executablePath: existsSync(chrome) ? chrome : undefined });
  const page = await browser.newPage({ colorScheme: "light" });
  const readProbe = () => page.evaluate(() => {
    const s = getComputedStyle(document.querySelector("#probe"));
    return Object.fromEntries(["backgroundColor", "borderRadius", "color", "fontWeight", "textTransform"].map(key => [key, s[key]]));
  });
  for (const entry of cases) {
    await page.goto(`${origin}/oracle?case=${entry.id}`);
    const expected = await readProbe();
    const expectedPalette = await page.locator('[id^="palette-"]').evaluateAll(elements => Object.fromEntries(elements.map(el => [el.id.slice(8), getComputedStyle(el).backgroundColor])));
    await page.goto(`${origin}/?case=${entry.id}`);
    const before = await page.evaluate(() => ({ padding: getComputedStyle(document.querySelector("#host")).paddingInline, brand: getComputedStyle(document.documentElement).getPropertyValue("--brand"), radius: getComputedStyle(document.documentElement).getPropertyValue("--radius") }));
    await page.evaluate(async paletteRoles => {
      const probe = document.createElement("div");
      probe.id = "probe";
      probe.className = "bg-brand rounded-lg text-foreground font-display ui-case";
      document.querySelector("footer[data-fleet-footer]").append(probe);
      for (const [role, className] of Object.entries(paletteRoles)) {
        const swatch = Object.assign(document.createElement("div"), { id: `palette-${role}`, className, textContent: role });
        document.querySelector("footer[data-fleet-footer]").append(swatch);
      }
      await new Promise((resolve, reject) => {
        const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href: "/footer.css", onload: resolve, onerror: reject });
        document.head.append(link);
      });
    }, paletteRoles);
    const actual = await readProbe();
    assert.deepEqual(actual, expected, `${entry.id}: canonical theme roles must survive standalone delivery`);
    await page.locator("#palette-accent").hover();
    const actualPalette = await page.locator('[id^="palette-"]').evaluateAll(elements => Object.fromEntries(elements.map(el => [el.id.slice(8), getComputedStyle(el).backgroundColor])));
    assert.deepEqual(actualPalette, expectedPalette, `${entry.id}: unrelated host color tokens must not replace the footer palette`);
    const after = await page.evaluate(() => ({ padding: getComputedStyle(document.querySelector("#host")).paddingInline, brand: getComputedStyle(document.documentElement).getPropertyValue("--brand"), radius: getComputedStyle(document.documentElement).getPropertyValue("--radius") }));
    assert.deepEqual(after, before, `${entry.id}: loading footer CSS must not change its host`);
    if (entry.id === "host-overrides") assert.equal(await page.locator("#probe").evaluate(el => getComputedStyle(el).fontFamily), "monospace");
    await page.locator("[data-feedback-open]").click();
    assert.equal(await page.locator("dialog").evaluate(el => el.open), true);
    assert.equal(await page.locator("dialog").evaluate(el => getComputedStyle(el).backgroundColor), expectedPalette.card);
    await page.locator("[data-feedback-point]").click();
    await page.locator("#host").hover();
    const anchor = await page.locator("body > div[aria-hidden=true]").evaluate(el => ({ style: getComputedStyle(el).borderStyle, color: getComputedStyle(el).borderColor }));
    assert.equal(anchor.style, "solid");
    assert.notEqual(anchor.color, "rgba(0, 0, 0, 0)");
    await page.keyboard.press("Escape");
    results.push({ case: entry.id, theme: actual, palette: actualPalette, hostStable: true, dialog: true, anchor: true });
  }
  console.log(JSON.stringify({ status: "passed", cases: results }, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
