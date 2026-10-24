import { fontFaces } from "@saas-maker/ui/lib/typography";

/** Solid sRGB colors only: app palettes must be measurable at build time. */
export function rgb(value: string): number[] | null {
  let m: RegExpMatchArray | null;
  const unit = (s: string) => s.endsWith("%") ? parseFloat(s) / 100 : Number(s);
  if ((m = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i))) {
    const hex = m[1].length === 3 ? [...m[1]].map(c => c + c).join("") : m[1];
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  }
  const modernRgb = value.match(/^rgb\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+%?)\s*\)$/);
  const legacyRgb = value.match(/^rgb\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*\)$/);
  if ((m = modernRgb ?? legacyRgb)) {
    if (legacyRgb && new Set(m.slice(1).map(v => v.endsWith("%"))).size > 1) return null;
    const channels = m.slice(1).map(v => v.endsWith("%") ? unit(v) : Number(v) / 255);
    return channels.every(v => v >= 0 && v <= 1) ? channels : null;
  }
  if ((m = value.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.-]+)\s*\)$/))) {
    const l = unit(m[1]), c = Number(m[2]), h = Number(m[3]) * Math.PI / 180;
    if (![l, c, h].every(Number.isFinite) || l < 0 || l > 1 || c < 0) return null;
    const a = c * Math.cos(h), b = c * Math.sin(h);
    const ll = (l + .3963377774 * a + .2158037573 * b) ** 3;
    const mm = (l - .1055613458 * a - .0638541728 * b) ** 3;
    const ss = (l - .0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * ll - 3.3077115913 * mm + .2309699292 * ss,
      -1.2684380046 * ll + 2.6097574011 * mm - .3413193965 * ss,
      -.0041960863 * ll - .7034186147 * mm + 1.707614701 * ss]
      .map(v => Math.max(0, Math.min(1, v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055)));
  }
  return null;
}
export function contrast(a: string, b: string): number {
  const luminance = (value: string) => {
    const channels = rgb(value);
    if (!channels) throw new Error(`Unsupported solid app color: ${value}`);
    return channels.map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
      .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}

export const appFaces = {
  ...fontFaces,
  "geist-mono": '"Geist Mono Variable", ui-monospace, monospace',
  system: 'system-ui, sans-serif',
};
export interface AppTokens {
  background: string; foreground: string; card: string; surface: string;
  muted: string; mutedForeground: string; border: string; brand: string;
  brandForeground: string; destructive: string; radius: string;
  fonts?: { sans?: keyof typeof appFaces; display?: keyof typeof appFaces; mono?: keyof typeof appFaces };
}
/** Derived roles keep every component on the app palette. Explicit tokens win last. */
export function tokensFromApp(app?: AppTokens): Record<string, string> {
  if (!app) return {};
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(app)) {
    if (key !== "fonts") vars[`--${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`] = value as string;
  }
  Object.assign(vars, {
    "--card-foreground": "var(--foreground)", "--popover": "var(--card)", "--popover-foreground": "var(--foreground)",
    "--primary": "var(--foreground)", "--primary-foreground": "var(--background)",
    "--secondary": "var(--surface)", "--secondary-foreground": "var(--foreground)",
    "--accent": "var(--surface)", "--accent-foreground": "var(--foreground)",
    "--hairline": "var(--border)", "--input": "var(--border)", "--ring": "var(--brand)",
    "--brand-ink": "var(--brand)", "--accent-ink": "var(--brand)",
    "--brand-soft": "color-mix(in oklch, var(--brand) 18%, transparent)",
    "--sidebar": "var(--card)", "--sidebar-accent": "var(--surface)",
  });
  for (const [role, face] of Object.entries(app.fonts ?? {})) {
    vars[`--font-${role}`] = face === "system" && role === "mono" ? "ui-monospace, monospace" : appFaces[face];
    if (role === "sans") {
      if (face === "newsreader") vars["--font-sans"] = appFaces[face].replace("Display", "Text");
      vars["--font-text"] = vars["--font-sans"];
      if (["instrument-sans", "manrope", "bricolage-grotesque", "ibm-plex-sans"].includes(face)) vars["--font-features"] = "normal";
    }
    if (role === "display") {
      vars["--font-accent"] = vars["--font-display"];
      vars["--accent-style"] = "normal";
      vars["--display-weight"] = face === "instrument-serif" ? "400" : "600";
    }
  }
  return vars;
}
