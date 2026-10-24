import type { ReactNode } from "react";
import { cn } from "../lib/utils";

/** One caption/credit treatment for images, video and interactive illustrations. */
export function MediaFrame({ children, caption, credit, className }: { children: ReactNode; caption: ReactNode; credit?: ReactNode; className?: string }) {
  return <figure className={cn("min-w-0", className)}>
    {children}
    <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-xs leading-relaxed text-muted-foreground">
      <div className="max-w-[65ch]">{caption}</div>{credit && <div className="shrink-0">{credit}</div>}
    </figcaption>
  </figure>;
}
