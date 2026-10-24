import { fontFaces } from "@saas-maker/ui/lib/typography";
import type { PageSettings } from "./schema";

const faces = {
  ...fontFaces,
  "ui-rounded": 'ui-rounded, "SF Pro Rounded", Nunito, Figtree, system-ui, sans-serif',
};

/** Inline root variables win over theme defaults; explicit page.tokens win last. */
export function fontOverrides(fonts?: PageSettings["fonts"], theme?: PageSettings["theme"]) {
  const vars: Record<string, string> = {};
  if (fonts?.display) {
    vars["--font-display"] = faces[fonts.display];
    vars["--display-weight"] = fonts.display === "instrument-serif" ? "400" : "600";
  }
  if (fonts?.text && !fonts.display) {
    // Gallery's display aliases its sans role: preserve it when only text changes.
    const display = theme === "paper" ? "newsreader" : theme === "hearth" ? "fraunces" : theme === "signal" ? "instrument-serif" : "figtree";
    vars["--font-display"] = faces[display];
  }
  if (fonts?.text) {
    const text = fonts.text === "newsreader" ? faces.newsreader.replace("Newsreader Display", "Newsreader Text") : faces[fonts.text];
    vars["--font-sans"] = text;
    vars["--font-text"] = text;
    if (["instrument-sans", "manrope", "bricolage-grotesque", "ibm-plex-sans"].includes(fonts.text)) vars["--font-features"] = "normal";
  }
  if (fonts?.accent) vars["--font-accent"] = faces[fonts.accent];
  if (fonts?.accent || fonts?.display) vars["--accent-weight"] = (fonts.accent ?? fonts.display) === "instrument-serif" ? "400" : "inherit";
  const accent = fonts?.accent ?? fonts?.display;
  // These two families ship upright only. Never inherit an italic preset for them.
  if (accent === "manrope" || accent === "bricolage-grotesque") vars["--accent-style"] = "normal";
  else if (fonts?.accentStyle) vars["--accent-style"] = fonts.accentStyle;
  return vars;
}
