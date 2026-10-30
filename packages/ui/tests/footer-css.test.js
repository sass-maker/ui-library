import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { transform } from "lightningcss";
import { scopeFooterCss } from "../scripts/scope-footer-css.mjs";

function outerSelectors(css) {
  const selectors = [];
  let depth = 0;
  transform({
    filename: "footer.css",
    code: Buffer.from(css),
    visitor: {
      Rule(rule) { if (rule.type === "style") depth++; },
      RuleExit(rule) { if (rule.type === "style") depth--; },
      Selector(selector) { if (depth === 1) selectors.push(selector); },
    },
  });
  expect(depth).toBe(0);
  return selectors;
}

function isBounded(selector) {
  return JSON.stringify(selector).includes('"name":"data-fleet-footer"') ||
    selector.length === 1 && selector[0].type === "type" && selector[0].name === "studio-footer";
}

describe("standalone footer CSS isolation", () => {
  it("bounds every selector in the actual compiled bundle, including theme defaults", () => {
    const css = readFileSync(new URL("../footer.css", import.meta.url), "utf8");
    const selectors = outerSelectors(css);
    expect(selectors.length).toBeGreaterThan(100);
    const unbounded = selectors.filter(selector => !isBounded(selector));
    expect(unbounded.length, JSON.stringify(unbounded.slice(0, 3))).toBe(0);
    expect(css).not.toContain("@font-face");
  });

  it("preserves media, nested hover, pseudo-elements and themed ancestors", () => {
    const css = scopeFooterCss(`:root,:host{--spacing:.25rem}
      [data-theme=ink]{--background:#000}
      @media(width>=40rem){.px-5{padding-inline:calc(var(--spacing)*5)}}
      .hover\\:opacity-100{&:hover{opacity:1}}
      .backdrop\\:bg-black::backdrop{background:#000}`);
    expect(outerSelectors(css).every(isBounded)).toBe(true);
    expect(css).toContain("@media");
    expect(css).toContain("&:hover");
    expect(css).toMatch(/:where\([^{}]+\)::?backdrop/);
    expect(css).toContain("[data-theme=ink] :where(footer[data-fleet-footer])");
    expect(scopeFooterCss(css)).toBe(css);
  });

  it("inherits host font roles while supplying standalone fallbacks", () => {
    const css = scopeFooterCss(":root{--font-sans:serif;--font-display:serif;--spacing:.25rem}.font-display{font-family:var(--font-display)}");
    expect(css).not.toContain("--font-sans:serif");
    expect(css).not.toContain("--font-display:serif");
    expect(css).toContain("font-family:var(--font-display,ui-sans-serif,system-ui,sans-serif)");
    expect(css).toContain("--spacing:.25rem");
  });
});
