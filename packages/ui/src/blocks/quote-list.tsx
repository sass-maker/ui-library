"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Skeleton } from "../components/skeleton";

/**
 * Quote list: verbatim quotes or claims, each with who said it, where and
 * when. Quiet rows on one card; the quote leads, the facts sit under it.
 *
 * Speaker attribution is explicit. A speaker shows by name only when
 * `verified` is true and a name is given; otherwise the row says
 * "unverified speaker" and the name is never rendered, even if present.
 *
 * With `onOpen`, each row's quote is a real button (Enter or Space opens it,
 * ArrowUp and ArrowDown move between rows) that also covers the row for
 * pointer clicks. The speaker, source and timestamp links sit beside the
 * button, never inside it, so each stays its own link and tab stop.
 */

export type QuoteSpeaker = {
  /** Shown only when `verified` is true. */
  name?: string | null;
  verified: boolean;
  /** Link for a verified speaker, e.g. their people page. */
  href?: string;
};

export type QuoteItem = {
  id: string;
  /** The verbatim words. Rendered as written, never paraphrased. */
  quote: string;
  speaker?: QuoteSpeaker;
  /** Show, episode, article or document, e.g. "Acquired". */
  source?: { label: string; href?: string };
  /** ISO date or datetime the words were said or published. */
  date?: string | null;
  /** Seconds into the recording; `href` deep-links to that moment. */
  timestamp?: { seconds: number; href?: string | null } | null;
  /** Kind of quote or claim, e.g. "prediction". */
  type?: string | null;
};

const external = (href: string) => /^https?:\/\//.test(href);

function Link({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      {...(external(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn("relative z-10 underline-offset-4 hover:underline", className)}
    >
      {children}
    </a>
  );
}

/** 854 → "14:14", 3723 → "1:02:03". */
export function formatTimestamp(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

/** A datetime without a zone ("2026-01-01T00:30") reads as UTC, as on the server. */
const NO_ZONE = /T\d\d:\d\d(:\d\d(\.\d+)?)?$/;

function formatDay(iso: string) {
  const d = new Date(NO_ZONE.test(iso) ? `${iso}Z` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  // Fixed locale and UTC: server and browser render the same text.
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** A speaker's name when verified; otherwise "unverified speaker", never the name. */
export function QuoteSpeakerLabel({ speaker }: { speaker?: QuoteSpeaker }) {
  const name = speaker?.verified && speaker.name ? speaker.name : null;
  if (!name) return <span className="italic">unverified speaker</span>;
  return speaker?.href ? (
    <Link href={speaker.href} className="text-foreground">
      {name}
    </Link>
  ) : (
    <span className="text-foreground">{name}</span>
  );
}

/** Timestamp, as a deep link when one is given. */
export function QuoteTimestamp({ timestamp }: { timestamp: QuoteItem["timestamp"] }) {
  const t = formatTimestamp(timestamp?.seconds);
  if (!t) return null;
  return timestamp?.href ? (
    <Link href={timestamp.href} className="font-mono tabular-nums">
      <span className="sr-only">at </span>
      {t}
    </Link>
  ) : (
    <span className="font-mono tabular-nums">{t}</span>
  );
}

function Meta({ item }: { item: QuoteItem }) {
  const parts: React.ReactNode[] = [<QuoteSpeakerLabel key="speaker" speaker={item.speaker} />];
  if (item.source)
    parts.push(item.source.href ? <Link key="source" href={item.source.href}>{item.source.label}</Link> : <span key="source">{item.source.label}</span>);
  if (item.date)
    parts.push(
      <time key="date" dateTime={item.date}>
        {formatDay(item.date)}
      </time>,
    );
  if (formatTimestamp(item.timestamp?.seconds)) parts.push(<QuoteTimestamp key="t" timestamp={item.timestamp} />);
  if (item.type)
    parts.push(
      <span key="type" className="ui-case">
        {item.type}
      </span>,
    );
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden>·</span>}
          {p}
        </React.Fragment>
      ))}
    </p>
  );
}

/** One quote as a row: the words first, then speaker, source, date, time and type. */
export function QuoteRow({
  item,
  selected,
  onOpen,
  onArrow,
}: {
  item: QuoteItem;
  selected?: boolean;
  onOpen?: () => void;
  /** Move focus to the previous (-1) or next (1) row. */
  onArrow?: (dir: -1 | 1) => void;
}) {
  const meta = <Meta item={item} />;
  const quoteClass = "block max-w-[75ch] text-[0.9375rem] leading-relaxed text-pretty text-foreground";
  return (
    <li
      data-selected={selected || undefined}
      className={cn(
        "border-b border-hairline px-4 py-3 last:border-b-0 data-[selected]:bg-brand-soft/50",
        onOpen && "relative transition-colors hover:bg-accent/60 has-[[data-quote-row]:focus-visible]:bg-accent has-[[data-quote-row]:focus-visible]:shadow-[inset_2px_0_0_var(--ring)]",
      )}
    >
      {onOpen ? (
        <button
          type="button"
          data-quote-row
          aria-current={selected || undefined}
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") onArrow?.(1);
            else if (e.key === "ArrowUp") onArrow?.(-1);
            else return;
            e.preventDefault();
          }}
          // The ::after layer makes the whole row clickable; the meta links sit above it.
          className={cn(quoteClass, "cursor-pointer text-left outline-none after:absolute after:inset-0 after:content-['']")}
        >
          {item.quote}
        </button>
      ) : (
        <p className={quoteClass}>{item.quote}</p>
      )}
      {meta}
    </li>
  );
}

export function QuoteList({
  items,
  label = "Quotes",
  status = "ready",
  selectedId,
  onOpen,
  empty,
  error,
  onRetry,
  className,
}: {
  items: QuoteItem[];
  /** Accessible name for the list. */
  label?: string;
  status?: "ready" | "loading" | "error";
  /** Highlights the row whose detail is open. */
  selectedId?: string | null;
  onOpen?: (item: QuoteItem) => void;
  empty?: React.ReactNode;
  error?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  const listRef = React.useRef<HTMLUListElement>(null);
  const move = (from: number, dir: -1 | 1) => {
    const rows = listRef.current?.querySelectorAll<HTMLElement>("[data-quote-row]");
    rows?.[Math.max(0, Math.min(rows.length - 1, from + dir))]?.focus();
  };

  if (status === "loading")
    return (
      <div className={cn("flex flex-col gap-4 rounded-lg border border-border bg-card p-4", className)} aria-busy aria-label={label}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  if (status === "error")
    return (
      <div className={cn("rounded-lg border border-border bg-card px-4 py-16 text-center text-sm", className)}>
        {error ?? "These quotes could not load."}{" "}
        {onRetry && (
          <button type="button" className="underline underline-offset-4" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  if (!items.length)
    return (
      <div className={cn("rounded-lg border border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground", className)}>
        {empty ?? "No quotes match."}
      </div>
    );
  return (
    <ul ref={listRef} aria-label={label} className={cn("rounded-lg border border-border bg-card", className)}>
      {items.map((item, i) => (
        <QuoteRow
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          onOpen={onOpen ? () => onOpen(item) : undefined}
          onArrow={(dir) => move(i, dir)}
        />
      ))}
    </ul>
  );
}
