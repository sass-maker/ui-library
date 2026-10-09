import * as React from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * FAQ on native details/summary: zero JavaScript, keyboard and screen-reader
 * friendly, and every answer is in the HTML for search and AI readers.
 */
export function Faq({
  items,
  title,
  lede,
  className,
}: {
  items: { q: string; a: React.ReactNode }[];
  title?: React.ReactNode;
  lede?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-10 md:grid-cols-12", className)}>
      {(title || lede) && (
        <div className="md:col-span-4">
          {title && <h2 className="font-display text-[clamp(2rem,1.45rem+2.2vw,3rem)]">{title}</h2>}
          {lede && <p className="mt-5 text-base leading-relaxed text-muted-foreground">{lede}</p>}
        </div>
      )}
      <div className={cn("border-t border-border", title || lede ? "md:col-span-8" : "md:col-span-12")}>
        {items.map((it) => (
          <details key={it.q} className="group border-b border-border [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-base font-medium text-foreground transition-colors hover:text-brand md:text-[1.0625rem]">
              {it.q}
              <PlusIcon aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45" />
            </summary>
            <div className="max-w-2xl pb-6 pr-10 text-[0.9375rem] leading-relaxed text-muted-foreground text-pretty">{it.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

/** Closing call to action. "panel" is a contained brand-tinted card. */
export function Cta({
  eyebrow,
  title,
  lede,
  actions,
  note,
  media,
  variant = "panel",
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  note?: React.ReactNode;
  media?: React.ReactNode;
  variant?: "panel" | "plain" | "inverse";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden",
        variant === "panel" && "rounded-2xl border border-border bg-surface px-6 py-14 sm:px-12 md:py-20",
        variant === "inverse" &&
          "rounded-2xl bg-primary px-6 py-14 text-primary-foreground sm:px-12 md:py-20 [--muted-foreground:color-mix(in_oklch,var(--primary-foreground)_66%,transparent)] [--foreground:var(--primary-foreground)]",
        className,
      )}
    >
      {variant !== "plain" && (
        <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-[28rem] rounded-full bg-brand opacity-[0.14] blur-[90px]" />
      )}
      <div className={cn("grid items-center gap-10", media && "lg:grid-cols-2")}>
        <div className={cn(!media && "mx-auto max-w-3xl text-center")}>
          {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
          <h2 className="font-display text-[clamp(2.25rem,1.5rem+3vw,4rem)]">{title}</h2>
          {lede && <p className={cn("lede mt-6", !media && "mx-auto")}>{lede}</p>}
          {actions && <div className={cn("mt-9 flex flex-wrap gap-3", !media && "justify-center")}>{actions}</div>}
          {note && <p className="mt-5 text-[0.8125rem] text-muted-foreground">{note}</p>}
        </div>
        {media}
      </div>
    </div>
  );
}

/**
 * Full-bleed color-block section. Tones come from the theme so a product can
 * repaint the whole rhythm with four tokens.
 */
export function Band({
  tone = 1,
  className,
  children,
}: {
  tone?: 1 | 2 | 3 | 4 | "ink" | "brand";
  className?: string;
  children: React.ReactNode;
}) {
  const bg =
    tone === "ink"
      ? "bg-tone-ink text-[oklch(0.97_0.01_80)] [--foreground:oklch(0.97_0.01_80)] [--muted-foreground:oklch(0.97_0.01_80/0.68)] [--border:oklch(1_0_0/0.14)] [--section-bg:var(--tone-ink)] [--accent-ink:var(--brand)]"
      : tone === "brand"
        ? "bg-brand text-brand-foreground [--foreground:var(--brand-foreground)] [--muted-foreground:color-mix(in_oklch,var(--brand-foreground)_70%,transparent)] [--section-bg:var(--brand)]"
        : {
            1: "bg-tone-1 [--section-bg:var(--tone-1)]",
            2: "bg-tone-2 [--section-bg:var(--tone-2)]",
            3: "bg-tone-3 [--section-bg:var(--tone-3)]",
            4: "bg-tone-4 [--section-bg:var(--tone-4)]",
          }[tone];
  return (
    <section
      className={cn(
        "section [--border:color-mix(in_oklch,var(--foreground)_14%,transparent)] [--muted-foreground:color-mix(in_oklch,var(--foreground)_66%,transparent)]",
        bg,
        className,
      )}
    >
      {children}
    </section>
  );
}
