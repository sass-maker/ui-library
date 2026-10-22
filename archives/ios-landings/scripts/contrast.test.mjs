import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { actionColors, contrast } from "../src/lib/contrast.mjs";
test("normal and hover actions retain readable text on light and dark accents", () => {
  for (const tokens of [
    { accent: "#c46a4a", accentDark: "#9a3f2a", inkOnAccent: "#fff6ea" },
    { accent: "#b9e83f", accentDark: "#18262e", inkOnAccent: "#18262e" },
    { accent: "#2dd4bf", accentDark: "#0f766e", inkOnAccent: "#05070d" },
    { accent: "#8d70ad", accentDark: "#684c85", inkOnAccent: "#ffffff" }
  ]) {
    const colors = actionColors(tokens);
    assert.ok(contrast(colors.foreground, colors.background) >= 4.5);
    assert.ok(contrast(colors.hoverForeground, colors.hoverBackground) >= 4.5);
  }
});

test("all page types inherit shared chrome without overriding action contrast", async () => {
  const global = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
  const landing = await readFile(new URL("../src/styles/landing.css", import.meta.url), "utf8");
  assert.match(global, /\.site-header\s*\{\s*position: relative;/);
  assert.match(global, /\.legal-copy a:not\(\.button\)/);
  assert.doesNotMatch(global, /\.legal-copy a\s*\{/);
  assert.doesNotMatch(landing, /\.site-header|\.wordmark|^\.button\s*\{/m);
  for (const path of ["../src/pages/blog/index.astro", "../src/pages/blog/[slug]/index.astro"]) {
    assert.doesNotMatch(await readFile(new URL(path, import.meta.url), "utf8"), /styles\/(?:editorial|landing)\.css/);
  }
});
