// Generates the shared design tokens from the web theme (the single source):
//   packages/ui/src/styles/theme.css  ->  packages/tokens/tokens.json
//                                        ->  swift/Sources/SaaSMakerUI/Tokens.generated.swift
// Run: pnpm tokens:build. Never edit the outputs by hand.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const css = readFileSync(`${root}packages/ui/src/styles/theme.css`, "utf8");

const COLORS = [
  "background", "foreground", "surface", "card", "primary", "primary-foreground", "secondary", "muted",
  "muted-foreground", "accent", "border", "hairline", "input", "brand", "brand-foreground", "brand-soft",
  "accent-ink", "tone-ink", "destructive", "success", "warning",
];

/** Declarations of the first block whose selector matches exactly. */
function block(selector) {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`missing ${selector}`);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("\n}", start));
  const out = {};
  for (const m of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

// ── Color conversion to sRGB ──────────────────────────────────────────────
const clamp = (v) => Math.min(1, Math.max(0, v));
const gamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
function oklch(l, c, h) {
  const a = c * Math.cos((h * Math.PI) / 180), b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ].map((v) => clamp(gamma(v)));
}
const num = (s) => (s.endsWith("%") ? parseFloat(s) / 100 : parseFloat(s));

/** Resolve a CSS value to [r, g, b, a] (0–1), following var() through `vars`. */
function color(value, vars, depth = 0) {
  if (depth > 8 || value == null) return null;
  let m;
  if ((m = value.match(/^var\(--([\w-]+)\)$/))) return color(vars[m[1]], vars, depth + 1);
  if ((m = value.match(/^oklch\(([\d.%]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\)$/)))
    return [...oklch(num(m[1]), +m[2], +m[3]), m[4] ? num(m[4]) : 1];
  if ((m = value.match(/^#([0-9a-f]{6})$/i))) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255).concat(1);
  if ((m = value.match(/^rgb\((\d+)\s+(\d+)\s+(\d+)(?:\s*\/\s*([\d.%]+))?\)$/))) return [m[1], m[2], m[3]].map((v) => v / 255).concat(m[4] ? num(m[4]) : 1);
  if ((m = value.match(/^color-mix\(in \w+,\s*(.+?)\s+([\d.]+)%,\s*transparent\)$/))) {
    const c = color(m[1], vars, depth + 1);
    return c && [c[0], c[1], c[2], c[3] * (+m[2] / 100)];
  }
  return null; // other mixes are web-only refinements
}

const base = block(":root");
const presets = {
  base,
  "base-dark": { ...base, ...block('[data-mode="dark"]') },
  paper: { ...base, ...block('[data-theme="paper"]') },
  ink: { ...base, ...block('[data-theme="ink"]') },
  hearth: { ...base, ...block('[data-theme="hearth"]') },
  signal: { ...base, ...block('[data-theme="signal"]') },
  gallery: { ...base, ...block('[data-theme="gallery"]') },
  "editorial-dark": { ...base, ...block('[data-theme="gallery"]'), ...block('[data-surface="editorial-dark"]') },
};

const tokens = {};
for (const [name, vars] of Object.entries(presets)) {
  vars["accent-ink"] ??= "var(--brand)";
  vars["tone-ink"] ??= "var(--foreground)";
  const colors = {};
  for (const role of COLORS) {
    const c = color(vars[role], vars);
    if (!c) throw new Error(`${name}: cannot resolve --${role} = ${vars[role]}`);
    colors[role] = c.map((v) => Math.round(v * 1000) / 1000);
  }
  const font = (v, d = 0) => (d < 6 && v?.startsWith("var(") ? font(vars[v.slice(6, -1)], d + 1) : v ?? "");
  // First family of a stack, as Apple names it ("Figtree Variable" -> "Figtree").
  const family = (v) => font(v).split(",")[0].replace(/["']/g, "").replace(/ Variable$/, "").replace(/^Newsreader (Display|Text)$/, "Newsreader").trim();
  const serif = (v) => /Newsreader|Fraunces|Instrument Serif|Georgia/.test(font(v));
  const rem = (v) => Math.round(parseFloat(v) * 16 * 10) / 10;
  tokens[name] = {
    colors,
    surfaceBackdrops: Object.fromEntries(["gradient", "glow", "grid"].map((kind) => [kind, vars[`surface-backdrop-${kind}`]])),
    radius: rem(vars.radius),
    displayWeight: parseFloat(vars["display-weight"]),
    displayTracking: parseFloat(vars["display-tracking"]),
    displayLeading: parseFloat(vars["display-leading"]),
    accentItalic: vars["accent-style"] === "italic",
    displaySerif: serif(vars["font-display"]),
    accentSerif: serif(vars["font-accent"]),
    textSerif: serif(vars["font-text"]),
    displayFont: family(vars["font-display"]),
    accentFont: family(vars["font-accent"]),
    textFont: family(vars["font-text"]),
    sansFont: family(vars["font-sans"]),
    monoFont: family(vars["font-mono"]),
    displayLowercase: vars["display-case"] === "lowercase",
    uiLowercase: vars["ui-case"] === "lowercase",
    dark: name === "ink" || name === "base-dark" || name === "editorial-dark",
  };
}

writeFileSync(`${root}packages/tokens/tokens.json`, JSON.stringify(tokens, null, 2) + "\n");

const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const swiftColor = ([r, g, b, a]) => `Color(.sRGB, red: ${r}, green: ${g}, blue: ${b}, opacity: ${a})`;
const swift = `// Generated by packages/tokens/build.mjs from the web theme. Do not edit.
import SwiftUI

extension SMPalette {
${Object.entries(tokens)
  .map(([name, t]) => `    public static let ${camel(name)} = SMPalette(
${COLORS.map((r) => `        ${camel(r)}: ${swiftColor(t.colors[r])},`).join("\n")}
        radius: ${t.radius},
        displayWeight: ${t.displayWeight},
        displayTracking: ${t.displayTracking},
        accentItalic: ${t.accentItalic},
        displaySerif: ${t.displaySerif},
        accentSerif: ${t.accentSerif},
        textSerif: ${t.textSerif},
        displayFont: "${t.displayFont}",
        accentFont: "${t.accentFont}",
        textFont: "${t.textFont}",
        sansFont: "${t.sansFont}",
        monoFont: "${t.monoFont}",
        displayLowercase: ${t.displayLowercase},
        uiLowercase: ${t.uiLowercase},
        isDark: ${t.dark}
    )`)
  .join("\n\n")}
}
`;
writeFileSync(`${root}swift/Sources/SaaSMakerUI/Tokens.generated.swift`, swift);
console.log(`tokens: ${Object.keys(tokens).length} presets × ${COLORS.length} colors`);
