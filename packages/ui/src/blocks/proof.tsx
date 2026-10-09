import * as React from "react";
import { cn } from "../lib/utils";

type Tone = "neutral" | "success" | "danger" | "warning" | "brand";

const toneClass: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/12 text-success",
  danger: "bg-destructive/12 text-destructive",
  warning: "bg-warning/18 text-[color-mix(in_oklch,var(--warning)_70%,var(--foreground))]",
  brand: "bg-brand-soft text-brand",
};

export function StatusPill({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[0.6875rem] font-medium", toneClass[tone], className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export type LedgerRow = { label: string; value: React.ReactNode; status?: { tone: Tone; label: string } };

/**
 * A receipt: labelled rows of evidence in a ruled card. Fits verification
 * records, sourced claims, orders, profiles and specs.
 */
export function Ledger({
  title,
  meta,
  rows,
  footer,
  variant = "card",
  className,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  rows: LedgerRow[];
  footer?: React.ReactNode;
  variant?: "card" | "paper";
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg",
        variant === "paper" && "rounded-sm shadow-md [background:linear-gradient(var(--card),var(--card))_padding-box]",
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-3">
        <span className="eyebrow text-foreground">{title}</span>
        {meta && <span className="font-mono text-[0.6875rem] text-muted-foreground">{meta}</span>}
      </figcaption>
      <dl className="divide-y divide-hairline">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[7.5rem_1fr] gap-4 px-5 py-3.5 sm:grid-cols-[9.5rem_1fr]">
            <dt className="pt-px font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground">{r.label}</dt>
            <dd className="flex min-w-0 flex-wrap items-center justify-between gap-2 text-sm text-foreground">
              <span className="min-w-0 text-pretty">{r.value}</span>
              {r.status && <StatusPill tone={r.status.tone}>{r.status.label}</StatusPill>}
            </dd>
          </div>
        ))}
      </dl>
      {footer && <div className="border-t border-hairline bg-surface px-5 py-3 text-xs text-muted-foreground">{footer}</div>}
    </figure>
  );
}

/** Terminal-style command block. Content wraps instead of clipping. */
/** A terminal or code sample. play: lines print one after another when it scrolls into view. */
export function CodeBlock({ code, label, play, className }: { code: string; label?: string; play?: boolean; className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-xl border border-border bg-[oklch(0.16_0.008_265)] text-[oklch(0.92_0.005_265)] shadow-lg", className)}>
      {label && (
        <figcaption className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5 font-mono text-[0.6875rem] text-white/50">
          <span aria-hidden className="size-1.5 rounded-full bg-[oklch(0.75_0.15_150)]" />
          {label}
        </figcaption>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[0.75rem] leading-[1.7] whitespace-pre-wrap [overflow-wrap:break-word] sm:p-5 sm:text-[0.8125rem]">
        {play ? (
          <code className="motion-type">
            {code.split("\n").map((line, i) => (
              <span key={i} className="block min-h-[1.7em]">
                {line}
              </span>
            ))}
          </code>
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </figure>
  );
}

/** A maker note or attributed quote, never an invented testimonial. */
export function Quote({
  quote,
  name,
  role,
  avatar,
  align = "start",
  className,
}: {
  quote: React.ReactNode;
  name: string;
  role?: string;
  avatar?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <figure className={cn("flex max-w-4xl flex-col gap-8", align === "center" && "mx-auto items-center text-center", className)}>
      <blockquote className="font-display text-[clamp(1.75rem,1.2rem+2.2vw,3rem)] leading-[1.12]">
        <span aria-hidden className="text-brand">“</span>
        {quote}
        <span aria-hidden className="text-brand">”</span>
      </blockquote>
      <figcaption className="flex items-center gap-3 text-sm">
        {avatar && <img src={avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />}
        <span>
          <span className="block font-medium text-foreground">{name}</span>
          {role && <span className="block text-muted-foreground">{role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export type DiffLine = { kind: "add" | "del" | "ctx"; text: string; note?: React.ReactNode };

/**
 * A code change with an inline annotation, for developer tools that need to
 * point at the exact line a verdict is about.
 */
export function DiffBlock({ file, lines, className }: { file: string; lines: DiffLine[]; className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-xl border border-border bg-card font-mono text-[0.75rem] shadow-lg sm:text-[0.8125rem]", className)}>
      <figcaption className="flex items-center justify-between gap-3 border-b border-hairline bg-surface px-4 py-2.5 text-[0.6875rem] text-muted-foreground">
        <span className="truncate">{file}</span>
        <span className="shrink-0">
          <span className="text-success">+{lines.filter((l) => l.kind === "add").length}</span>{" "}
          <span className="text-destructive">−{lines.filter((l) => l.kind === "del").length}</span>
        </span>
      </figcaption>
      <ol className="py-2">
        {lines.map((l, i) => (
          <li key={i}>
            <div
              className={cn(
                "grid grid-cols-[2.25rem_1rem_1fr] items-baseline pr-4 leading-[1.75]",
                l.kind === "add" && "bg-success/10",
                l.kind === "del" && "bg-destructive/10",
              )}
            >
              <span className="select-none pr-2 text-right text-muted-foreground/60">{i + 1}</span>
              <span className={cn("select-none", l.kind === "add" ? "text-success" : l.kind === "del" ? "text-destructive" : "text-muted-foreground/40")}>
                {l.kind === "add" ? "+" : l.kind === "del" ? "−" : " "}
              </span>
              <code className="whitespace-pre-wrap [overflow-wrap:break-word]">{l.text}</code>
            </div>
            {l.note && (
              <div className="mx-3 my-2 rounded-lg border border-border bg-background px-3.5 py-2.5 font-sans text-[0.8125rem] leading-relaxed text-foreground shadow-sm">
                {l.note}
              </div>
            )}
          </li>
        ))}
      </ol>
    </figure>
  );
}
