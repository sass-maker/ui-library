/** Layout adapted from magicuidesign/magicui, MIT. See THIRD_PARTY_NOTICES.md.
 * Fleet: safe React text, semantic tokens, responsive labels, optional highlighting.
 */
import type { ReactNode } from "react";
import { FileCode2 } from "lucide-react";
import { cn } from "../lib/utils";

export type CodeComparisonProps = {
  beforeCode: string; afterCode: string; language?: string; filename?: string; className?: string;
  /** Optional trusted React renderer, including server-rendered highlighting. */
  renderCode?: (code: string, side: "before" | "after") => ReactNode;
};
export function CodeComparison({ beforeCode, afterCode, language = "text", filename = "example.tsx", className, renderCode }: CodeComparisonProps) {
  return <div className={cn("grid w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card md:grid-cols-2", className)}>
    {([{ side: "before", code: beforeCode }, { side: "after", code: afterCode }] as const).map(({ side, code }) =>
      <section key={side} className="min-w-0 first:border-b first:border-border md:first:border-r md:first:border-b-0">
        <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3 text-xs">
          <FileCode2 aria-hidden className="size-4 text-muted-foreground" /><span className="min-w-0 truncate font-mono">{filename}</span><span className="ml-auto text-muted-foreground">{side}</span>
        </div>
        <div tabIndex={0} role="region" aria-label={`${side} code: ${filename}`} className="max-h-[32rem] overflow-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">{renderCode ? renderCode(code, side) : <pre className="m-0 p-5 font-mono text-xs leading-7"><code data-language={language}>{code}</code></pre>}</div>
      </section>)}
  </div>;
}
