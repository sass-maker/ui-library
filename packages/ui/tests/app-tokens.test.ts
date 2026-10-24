import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { pageSettings } from "../../templates/src/schema";
import { fontOverrides } from "../../templates/src/fonts";
import { contrast, tokensFromApp } from "../../templates/src/app-tokens";

const app = {
  background: "#111111", foreground: "#f5f5f5", card: "#191919", surface: "#202020",
  muted: "#202020", mutedForeground: "#b0b0b0", border: "#363636",
  brand: "#4a7cf2", brandForeground: "#111111", destructive: "#ff8585", radius: "12px",
  fonts: { sans: "geist", display: "figtree", mono: "geist-mono" },
};
describe("app palette content contract", () => {
  it("accepts a measurable app palette and maps component/font roles", () => {
    const parsed = pageSettings.parse({ title: "Product", fromApp: app });
    expect(tokensFromApp(parsed.fromApp)).toMatchObject({ "--background": app.background,
      "--muted-foreground": app.mutedForeground, "--card-foreground": "var(--foreground)",
      "--font-text": '"Geist Variable", ui-sans-serif, system-ui, sans-serif' });
    expect(parsed.mode).toBeUndefined(); // Base chooses dark; explicit light remains allowed.
    expect(pageSettings.parse({ title: "Product", fromApp: app, mode: "light" }).mode).toBe("light");
  });
  it.each([
    { foreground: "#555555" }, { mutedForeground: "#555555" }, { brand: "#222222" },
    { brandForeground: "#aaaaaa" }, { card: "#aaaaaa" }, { foreground: "var(--text)" },
    { foreground: "rgb(255,,,255,255)" }, { foreground: "oklch(1..2 0 0)" }, { radius: "-1px" }, { surprise: "#fff" },
    { fonts: { sans: "unbundled" } }, { fonts: { surprise: "geist" } },
  ])("rejects invalid or inaccessible app roles: %j", overrides => {
    expect(pageSettings.safeParse({ title: "Product", fromApp: { ...app, ...overrides } }).success).toBe(false);
  });
  it("checks explicit token overrides after the app palette", () => {
    expect(pageSettings.safeParse({ title: "Product", fromApp: app, tokens: { "--foreground": "#222222" } }).success).toBe(false);
    expect(pageSettings.safeParse({ title: "Product", fromApp: app, tokens: { "--brand": "#ffffff" } }).success).toBe(true);
  });
  it("maps app display accents without inheriting a preset's italic face", () => {
    const vars = tokensFromApp(pageSettings.parse({ title: "Product", fromApp: app }).fromApp);
    expect(vars["--accent-style"]).toBe("normal");
    expect(vars["--font-accent"]).toBe(vars["--font-display"]);
  });
  it("keeps the app brand/background minimum at 3:1", () => {
    const copied = { ...app, brand: "#3266e4", brandForeground: "#ffffff" };
    expect(contrast(copied.brand, copied.background)).toBeGreaterThanOrEqual(3);
    expect(contrast(copied.brand, copied.background)).toBeLessThan(4.5);
    expect(pageSettings.safeParse({ title: "Product", fromApp: copied }).success).toBe(true);
  });
  it("uses the WCAG sRGB contrast calculation", () => {
    expect(contrast("#fff", "rgb(0 0 0)")).toBe(21);
    expect(contrast("oklch(1 0 0)", "oklch(0 0 0)")).toBeCloseTo(21, 5);
  });
});

it("every generated dark preset meets the text and brand contrast contract", () => {
  const tokens = JSON.parse(readFileSync(new URL("../../tokens/tokens.json", import.meta.url), "utf8"));
  const css = (channels: number[]) => `rgb(${channels.slice(0, 3).map(v => v * 255).join(" ")})`;
  for (const name of ["base", "paper", "hearth", "signal", "gallery", "ink", "workbench"]) {
    const p = tokens[`${name}-dark`];
    expect(p.dark).toBe(true);
    for (const text of ["foreground", "muted-foreground"])
      for (const bg of ["background", "card"])
        expect(contrast(css(p.colors[text]), css(p.colors[bg])), `${name}: ${text}/${bg}`).toBeGreaterThanOrEqual(4.5);
    expect(contrast(css(p.colors.brand), css(p.colors["brand-foreground"])), name).toBeGreaterThanOrEqual(4.5);
    expect(contrast(css(p.colors.brand), css(p.colors.background)), name).toBeGreaterThanOrEqual(4.5);
  }
});

it("supports the native rounded stack for display and text only", () => {
  const page = pageSettings.parse({ title: "Anchor", fonts: { display: "ui-rounded", text: "ui-rounded" } });
  const stack = 'ui-rounded, "SF Pro Rounded", Nunito, Figtree, system-ui, sans-serif';
  expect(fontOverrides(page.fonts)).toMatchObject({ "--font-display": stack, "--font-sans": stack, "--font-text": stack });
  expect(pageSettings.safeParse({ title: "Anchor", fonts: { accent: "ui-rounded" } }).success).toBe(false);
});


it("accepts the curated pairings for both content pages and application roles", async () => {
  const { fontPairings, fontFaces } = await import("../src/lib/typography");
  for (const pairing of fontPairings) {
    const page = pageSettings.parse({ title: "Kith", fonts: pairing.fonts });
    const vars = fontOverrides(page.fonts);
    expect(vars["--font-sans"]).toBe(fontFaces[pairing.fonts.text]);
    expect(vars["--font-display"]).toBe(fontFaces[pairing.fonts.display]);
    const parsed = pageSettings.parse({ title: "Kith", fromApp: { ...app, fonts: { sans: pairing.fonts.text, display: pairing.fonts.display } } });
    const appVars = tokensFromApp(parsed.fromApp);
    expect(appVars["--font-sans"]).toBe(vars["--font-sans"]);
    expect(appVars["--font-display"]).toBe(vars["--font-display"]);
  }
});
