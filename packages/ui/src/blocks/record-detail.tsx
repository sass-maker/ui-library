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

/**
 * Two-column label/value list. Missing values show a quiet dash.
 *
 * The label column fits the longest label, between 6rem and 45% of the
 * width, so long values never squeeze labels away; labels and values wrap.
 * `align="start"` left-aligns values (prose, links); the default right-aligns
 * them (numbers).
 */
export function KeyValueList({
  items,
  className,
  align = "end",
}: {
  items: KeyValueItem[];
  className?: string;
  align?: "start" | "end";
}) {
  return (
    <dl className={cn("grid grid-cols-[fit-content(45%)_minmax(0,1fr)] gap-x-4 text-sm", className)}>
      {items.map((it) => (
        <div key={it.label} className="col-span-2 grid grid-cols-subgrid items-baseline border-b border-hairline py-2 last:border-0">
          <dt className="min-w-[min(6rem,100%)] break-words text-muted-foreground" title={it.hint}>
            {it.label}
          </dt>
          <dd className={cn("min-w-0 tabular-nums text-pretty text-foreground [overflow-wrap:anywhere]", align === "end" ? "text-right" : "text-left")}>
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
  /** ISO date or datetime the record was collected (saved snapshots). */
  collectedAt?: string;
  /** How the data reached this app, e.g. "public API" or "Nomad Atlas snapshot". */
  via?: string;
  /** The endpoint or proxy behind `via`; shown as its host. */
  viaUrl?: string;
  /** ISO datetime this view read the data (live fetches). */
  readAt?: string;
  /** Snapshot, revision or dataset id. */
  revision?: string;
  /** One line on how the data was gathered or its limits. */
  note?: string;
};

function hostOf(url: string | undefined) {
  if (!url) return undefined;
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

// Fixed locale and UTC so server and browser render the same text (no
// hydration mismatch); times say "UTC" so they are never misread as local.
function formatWhen(iso: string, withTime = false) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  if (!withTime || /^\d{4}-\d{2}-\d{2}$/.test(iso)) return day;
  return `${day}, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC`;
}

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 underline-offset-4 hover:underline">
      <span className="truncate">{children}</span>
      <ArrowUpRightIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
    </a>
  );
}

/**
 * Where a record came from and when. Always shown; data without it is not
 * trustworthy. Rows: from (source), via (API or proxy), collected (snapshot
 * date), read (live fetch time), snapshot (revision); each only when given.
 */
export function Provenance({ info, className }: { info: ProvenanceInfo; className?: string }) {
  const viaHost = hostOf(info.viaUrl);
  return (
    <section aria-label="Provenance" className={cn("rounded-lg bg-surface p-4 text-sm", className)}>
      <h3 className="ui-case text-xs font-medium text-muted-foreground">source</h3>
      <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5">
        <dt className="text-muted-foreground">from</dt>
        <dd className="min-w-0">{info.url ? <SourceLink href={info.url}>{hostOf(info.url) ?? info.source}</SourceLink> : info.source}</dd>
        {(info.via || viaHost) && (
          <>
            <dt className="text-muted-foreground">via</dt>
            <dd className="min-w-0 break-words">
              {info.via}
              {info.via && viaHost && <span aria-hidden> · </span>}
              {viaHost && (
                <span className="font-mono text-xs" title={info.viaUrl}>
                  {viaHost}
                </span>
              )}
            </dd>
          </>
        )}
        {info.collectedAt && (
          <>
            <dt className="text-muted-foreground">collected</dt>
            <dd>
              <time dateTime={info.collectedAt}>{formatWhen(info.collectedAt)}</time>
            </dd>
          </>
        )}
        {info.readAt && (
          <>
            <dt className="text-muted-foreground">read</dt>
            <dd>
              <time dateTime={info.readAt}>{formatWhen(info.readAt, true)}</time>
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
