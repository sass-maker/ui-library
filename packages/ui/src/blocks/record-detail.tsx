"use client";

import * as React from "react";
import { ArrowUpRightIcon, XIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../components/sheet";

/** Matches a media query; false during server render and first paint. */
export function useMediaQuery(query: string) {
  const [match, setMatch] = React.useState(false);
  React.useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export type KeyValueItem = { label: string; value: React.ReactNode; hint?: string };

/** Two-column label/value list. Missing values show a quiet dash. */
export function KeyValueList({ items, className }: { items: KeyValueItem[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 text-sm", className)}>
      {items.map((it) => (
        <div key={it.label} className="col-span-2 grid grid-cols-subgrid items-baseline border-b border-hairline py-2 last:border-0">
          <dt className="min-w-0 truncate text-muted-foreground" title={it.hint}>
            {it.label}
          </dt>
          <dd className="text-right tabular-nums text-foreground">
            {it.value == null || it.value === "" ? <span className="text-muted-foreground/60">—</span> : it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export type ProvenanceInfo = {
  /** Who published the data, e.g. "Nomads.com". */
  source: string;
  /** The record's page at the source. */
  url?: string;
  /** ISO date or datetime the record was collected. */
  collectedAt?: string;
  /** Snapshot, revision or dataset id. */
  revision?: string;
  /** One line on how the data was gathered or its limits. */
  note?: string;
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", ...(dateOnly ? { timeZone: "UTC" } : {}) });
}

/** Where a record came from and when. Always shown; data without it is not trustworthy. */
export function Provenance({ info, className }: { info: ProvenanceInfo; className?: string }) {
  let host: string | undefined;
  try {
    host = info.url ? new URL(info.url).host : undefined;
  } catch {
    host = undefined;
  }
  return (
    <section aria-label="Provenance" className={cn("rounded-lg bg-surface p-4 text-sm", className)}>
      <h3 className="ui-case text-xs font-medium text-muted-foreground">source</h3>
      <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5">
        <dt className="text-muted-foreground">from</dt>
        <dd className="min-w-0">
          {info.url ? (
            <a href={info.url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 underline-offset-4 hover:underline">
              <span className="truncate">{host ?? info.source}</span>
              <ArrowUpRightIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            </a>
          ) : (
            info.source
          )}
        </dd>
        {info.collectedAt && (
          <>
            <dt className="text-muted-foreground">collected</dt>
            <dd>
              <time dateTime={info.collectedAt}>{formatWhen(info.collectedAt)}</time>
            </dd>
          </>
        )}
        {info.revision && (
          <>
            <dt className="text-muted-foreground">snapshot</dt>
            <dd className="truncate font-mono text-xs leading-5">{info.revision}</dd>
          </>
        )}
      </dl>
      {info.note && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{info.note}</p>}
    </section>
  );
}

/**
 * Record detail: a side panel beside the list on desktop, a bottom sheet on
 * phones. Place it as the last child of a `RecordLayout` (or any flex row);
 * when closed it renders nothing on desktop.
 */
export function RecordDetail({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  actions,
  desktopQuery = "(min-width: 1024px)",
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  desktopQuery?: string;
  className?: string;
}) {
  const desktop = useMediaQuery(desktopQuery);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => {
    if (open && desktop) headingRef.current?.focus({ preventScroll: true });
  }, [open, desktop, title]);

  const body = (
    <div className="flex flex-col gap-6 px-5 pb-8">
      {children}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );

  if (desktop) {
    if (!open) return null;
    return (
      <aside
        aria-label="Record detail"
        className={cn("sticky top-4 flex max-h-[calc(100dvh-6rem)] w-[22rem] shrink-0 flex-col overflow-y-auto rounded-lg border border-border bg-card", className)}
        onKeyDown={(e) => e.key === "Escape" && onOpenChange(false)}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-card px-5 pb-4 pt-5">
          <div className="min-w-0">
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl normal-case outline-none">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" className="-mr-2 -mt-1 shrink-0 text-muted-foreground" onClick={() => onOpenChange(false)} aria-label="Close detail">
            <XIcon />
          </Button>
        </div>
        {body}
      </aside>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={cn("max-h-[88dvh] gap-0 overflow-y-auto rounded-t-2xl", className)}>
        <div className="sticky top-0 z-10 bg-background px-5 pb-4 pt-6 pr-12">
          <SheetTitle className="font-display text-2xl normal-case">{title}</SheetTitle>
          {subtitle ? <SheetDescription className="mt-1">{subtitle}</SheetDescription> : <SheetDescription className="sr-only">Record detail</SheetDescription>}
        </div>
        {body}
      </SheetContent>
    </Sheet>
  );
}

/** List + detail row: the list takes the remaining width, the detail panel sits beside it on desktop. */
export function RecordLayout({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex min-w-0 items-start gap-6", className)}>{children}</div>;
}
