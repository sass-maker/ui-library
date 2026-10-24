/** Self-hosted Latin web families. Font binaries retain their own SIL OFL licenses. */
export const fontFaces = {
  figtree: '"Figtree Variable", ui-sans-serif, system-ui, sans-serif',
  geist: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
  newsreader: '"Newsreader Display", "Iowan Old Style", Georgia, serif',
  fraunces: '"Fraunces Variable", "Iowan Old Style", Georgia, serif',
  "instrument-serif": '"Instrument Serif", Georgia, serif',
  "instrument-sans": '"Instrument Sans Variable", ui-sans-serif, system-ui, sans-serif',
  manrope: '"Manrope Variable", ui-sans-serif, system-ui, sans-serif',
  "bricolage-grotesque": '"Bricolage Grotesque Variable", ui-sans-serif, system-ui, sans-serif',
  "ibm-plex-sans": '"IBM Plex Sans Variable", ui-sans-serif, system-ui, sans-serif',
};

/** Landing and application roles stay together. At most three families per pairing. */
export const fontPairings = [
  { id: "editorial", name: "Editorial", label: "Instrument Sans + Instrument Serif", description: "A crisp interface with an expressive, genuine italic for the story.", fonts: { display: "instrument-sans", text: "instrument-sans", accent: "instrument-serif", accentStyle: "italic" } },
  { id: "calm", name: "Calm product", label: "Manrope + Newsreader", description: "Open geometric controls, with a reading face for the memorable moments.", fonts: { display: "newsreader", text: "manrope", accent: "newsreader", accentStyle: "italic" } },
  { id: "expressive", name: "Expressive", label: "Bricolage Grotesque + Geist", description: "Character in the headline, a quiet rhythm in the everyday interface.", fonts: { display: "bricolage-grotesque", text: "geist", accent: "bricolage-grotesque", accentStyle: "normal" } },
  { id: "technical", name: "Technical", label: "IBM Plex Sans + Geist Mono", description: "A precise, human voice for tools, with mono reserved for identifiers and data.", fonts: { display: "ibm-plex-sans", text: "ibm-plex-sans", accent: "ibm-plex-sans", accentStyle: "normal" } },
] as const;
