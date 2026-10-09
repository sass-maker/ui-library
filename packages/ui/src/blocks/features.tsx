import * as React from "react";
import { cn } from "../lib/utils";

export type Feature = {
  title: React.ReactNode;
  body: React.ReactNode;
  icon?: React.ReactNode;
  /** Short label above the title, e.g. "01" or "Sources". */
  kicker?: string;
  meta?: React.ReactNode;
};

/**
 * Feature grid. "ruled" is an editorial hairline grid without boxes; "cards"
 * gives each item a raised surface; "plain" is a quiet list.
 */
export function FeatureGrid({
  items,
  columns = 3,
  variant = "ruled",
  className,
}: {
  items: Feature[];
  columns?: 2 | 3 | 4;
  variant?: "ruled" | "cards" | "plain";
  className?: string;
}) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];

  if (variant === "ruled") {
    // Hairline grid: the 1px gaps show the border color between cells.
    return (
      <ul className={cn("grid gap-px border-y border-border bg-border", cols, className)}>
        {items.map((f, i) => (
          <li
            key={i}
            className={cn(
              "flex flex-col gap-3 bg-[var(--section-bg,var(--background))] py-8 sm:px-7",
              columns === 2 && "sm:[&:nth-child(2n+1)]:pl-0",
              columns === 3 && "sm:[&:nth-child(2n+1)]:pl-0 lg:[&:nth-child(2n+1)]:pl-7 lg:[&:nth-child(3n+1)]:pl-0",
              columns === 4 && "sm:[&:nth-child(2n+1)]:pl-0 lg:[&:nth-child(2n+1)]:pl-7 lg:[&:nth-child(4n+1)]:pl-0",
            )}
          >
            {f.kicker && <span className="eyebrow text-brand">{f.kicker}</span>}
            {f.icon && <span className="text-brand [&_svg]:size-5">{f.icon}</span>}
            <h3 className="text-lg font-semibold tracking-[-0.015em] text-foreground">{f.title}</h3>
            <p className="text-[0.9375rem] leading-relaxed text-muted-foreground text-pretty">{f.body}</p>
            {f.meta && <div className="mt-auto pt-2 font-mono text-xs text-muted-foreground">{f.meta}</div>}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn("grid gap-4", cols, className)}>
      {items.map((f, i) => (
        <li
          key={i}
          className={cn(
            "flex flex-col gap-3",
            variant === "cards" &&
              "rounded-xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md",
          )}
        >
          {f.icon && (
            <span className="mb-2 inline-flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand [&_svg]:size-5">
              {f.icon}
            </span>
          )}
          {f.kicker && <span className="eyebrow">{f.kicker}</span>}
          <h3 className="text-lg font-semibold tracking-[-0.015em]">{f.title}</h3>
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground text-pretty">{f.body}</p>
          {f.meta && <div className="mt-auto pt-2 font-mono text-xs text-muted-foreground">{f.meta}</div>}
        </li>
      ))}
    </ul>
  );
}

/** Text beside media, alternating sides down the page. */
export function FeatureSpread({
  items,
  className,
}: {
  items: { kicker?: string; title: React.ReactNode; body: React.ReactNode; media: React.ReactNode; footer?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-20 md:gap-28", className)}>
      {items.map((it, i) => (
        <div key={i} className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
          <div className={cn("min-w-0 md:col-span-5", i % 2 === 1 && "md:order-2 md:col-start-8")}>
            {it.kicker && <p className="eyebrow mb-4 text-brand">{it.kicker}</p>}
            <h3 className="font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)]">{it.title}</h3>
            <div className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty">{it.body}</div>
            {it.footer && <div className="mt-6">{it.footer}</div>}
          </div>
          <div className={cn("min-w-0 md:col-span-7", i % 2 === 1 ? "md:order-1 md:col-start-1" : "md:col-start-6")}>{it.media}</div>
        </div>
      ))}
    </div>
  );
}

/** Numbered process. "rail" draws a connecting rule; stacks on phones. */
export function Steps({
  items,
  className,
}: {
  items: { title: React.ReactNode; body: React.ReactNode; detail?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <ol className={cn("grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]", className)}>
      {items.map((s, i) => (
        <li key={i} className="flex flex-col gap-3 bg-background p-6 md:p-7">
          <span className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="text-base font-semibold tracking-[-0.01em]">{s.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{s.body}</p>
          {s.detail && <div className="mt-auto pt-3">{s.detail}</div>}
        </li>
      ))}
    </ol>
  );
}

/** Big numbers with short labels. */
export function Stats({
  items,
  className,
}: {
  items: { value: React.ReactNode; label: React.ReactNode; note?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-10 border-t border-border pt-10 lg:grid-cols-4", className)}>
      {items.map((s, i) => (
        <div key={i} className="flex flex-col gap-2">
          <dt className="order-2 text-sm font-medium text-foreground">{s.label}</dt>
          <dd className="font-display order-1 text-[clamp(2.5rem,2rem+2vw,3.75rem)] tabular-nums">{s.value}</dd>
          {s.note && <dd className="order-3 text-sm text-muted-foreground">{s.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

/** "Who it is for / not for" honesty block. */
export function FitCompare({ fit, notFit, className }: { fit: React.ReactNode; notFit: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      <div className="rounded-xl border border-border bg-card p-7">
        <p className="eyebrow mb-4 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-success" /> A good fit
        </p>
        <div className="text-base leading-relaxed text-foreground text-pretty">{fit}</div>
      </div>
      <div className="rounded-xl border border-dashed border-border p-7">
        <p className="eyebrow mb-4 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-muted-foreground/50" /> Not a fit
        </p>
        <div className="text-base leading-relaxed text-muted-foreground text-pretty">{notFit}</div>
      </div>
    </div>
  );
}
