import * as React from "react";

/**
 * Minimal inline markup for content files: *phrase* renders as the theme's
 * accent <em>, and a newline renders as a line break. Nothing else.
 */
export function rich(text: string): React.ReactNode {
  return text.split("\n").map((line, li) => (
    <React.Fragment key={li}>
      {li > 0 && <br />}
      {line.split(/\*([^*]+)\*/g).map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))}
    </React.Fragment>
  ));
}
