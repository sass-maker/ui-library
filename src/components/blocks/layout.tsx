import * as React from "react";
import { cn } from "@/lib/utils";

/** Page-width container with fluid gutters. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("container-page", className)} {...props} />;
}

type SectionProps = React.ComponentProps<"section"> & {
  /** Visual surface behind the section. */
  surface?: "default" | "muted" | "inverse" | "brand" | "grid";
  /** Draw a hairline above the section. */
  rule?: boolean;
  size?: "default" | "compact";
};

export function Section({ surface = "default", rule, size = "default", className, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        size === "default" ? "section" : "pb-14 pt-0 md:pb-20",
        surface === "muted" && "bg-surface [--section-bg:var(--surface)]",
        surface === "inverse" && "bg-primary text-primary-foreground [--section-bg:var(--primary)] [--muted-foreground:color-mix(in_oklch,var(--primary-foreground)_68%,transparent)] [--border:color-mix(in_oklch,var(--primary-foreground)_14%,transparent)]",
        surface === "brand" && "bg-brand text-brand-foreground [--muted-foreground:color-mix(in_oklch,var(--brand-foreground)_72%,transparent)]",
        surface === "grid" && "grid-paper",
        rule && "border-t border-hairline",
        className,
      )}
      {...props}
    />
  );
}

type SectionHeaderProps = {
  eyebrow?: React.ReactNode;
  /** Optional index shown before the eyebrow, e.g. "01". */
  index?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "start" | "center" | "split";
  size?: "md" | "lg";
  className?: string;
  children?: React.ReactNode;
};

/**
 * Eyebrow, display title and lede. "split" puts the lede in a second column on
 * wide screens, which reads well for editorial pages.
 */
export function SectionHeader({ eyebrow, index, title, lede, align = "start", size = "md", className, children }: SectionHeaderProps) {
  const heading = (
    <h2
      className={cn(
        "font-display text-foreground",
        size === "lg" ? "text-[clamp(2.5rem,1.6rem+3.6vw,4.75rem)]" : "text-[clamp(2rem,1.45rem+2.2vw,3.5rem)]",
      )}
    >
      {title}
    </h2>
  );
  const eyebrowNode = (eyebrow || index) && (
    <p className="eyebrow mb-5 flex items-center gap-3">
      {index && <span className="text-brand">{index}</span>}
      {index && eyebrow && <span aria-hidden className="h-px w-6 bg-border" />}
      {eyebrow}
    </p>
  );

  if (align === "split") {
    return (
      <div className={cn("grid gap-6 md:grid-cols-12 md:gap-10", className)}>
        <div className="md:col-span-7">
          {eyebrowNode}
          {heading}
        </div>
        {(lede || children) && (
          <div className="flex flex-col justify-end gap-6 md:col-span-5">
            {lede && <p className="lede">{lede}</p>}
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex max-w-3xl flex-col", align === "center" && "mx-auto items-center text-center", className)}>
      {eyebrowNode}
      {heading}
      {lede && <p className={cn("lede mt-6", align === "center" && "mx-auto")}>{lede}</p>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}

/** Inline row of short facts separated by hairlines. */
export function FactRow({ items, className }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-5">
          {i > 0 && <span aria-hidden className="hidden h-3.5 w-px bg-border sm:block" />}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
