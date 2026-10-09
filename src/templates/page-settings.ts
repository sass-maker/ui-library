/** Document-level settings every content file carries under "page". */
export type PageSettings = {
  title: string;
  description?: string;
  theme?: "base" | "paper" | "ink" | "hearth" | "signal" | "gallery";
  mode?: "light" | "dark";
  /** Brand overrides, e.g. { "--brand": "oklch(...)" }. */
  tokens?: Record<string, string>;
  icon?: string;
};
