import type { PageSettings } from "./schema";

const faces = {
  figtree: '"Figtree Variable", ui-sans-serif, system-ui, sans-serif',
  newsreader: '"Newsreader Display", "Iowan Old Style", Georgia, serif',
  "instrument-serif": '"Instrument Serif", Georgia, serif',
  fraunces: '"Fraunces Variable", "Iowan Old Style", Georgia, serif',
  geist: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
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
  }
  if (fonts?.accent) vars["--font-accent"] = faces[fonts.accent];
  if (fonts?.accent || fonts?.display) vars["--accent-weight"] = (fonts.accent ?? fonts.display) === "instrument-serif" ? "400" : "inherit";
  if (fonts?.accentStyle) vars["--accent-style"] = fonts.accentStyle;
  return vars;
}
