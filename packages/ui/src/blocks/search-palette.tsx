"use client";

import * as React from "react";
import { CornerDownLeftIcon, SearchIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/command";
import { Kbd } from "../components/kbd";

/** Only http(s) and same-site paths: a result href from an API never runs as `javascript:`. */
export function safeHref(href: string): string | null {
  try {
    const url = new URL(href, location.href);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

export type SearchResult = {
  id: string;
  title: string;
  /** Secondary line, e.g. "Portugal · Europe". */
  subtitle?: string;
  /** Right-aligned hint, e.g. a score or date. */
  meta?: string;
  /** Navigate here on select unless `onSelect` handles it. */
  href?: string;
  /** Shown but not selectable, e.g. a record whose page is not ready. */
  disabled?: boolean;
};

export type SearchSource = {
  id: string;
  /** Group heading, e.g. "places". */
  label: string;
  /** Sync or async. Return the best few; the palette shows them in order. */
  search: (query: string) => SearchResult[] | Promise<SearchResult[]>;
  /**
   * Externally controlled loading, e.g. a collection still downloading its
   * index. The group shows a quiet "loading…" line and is not searched until
   * it clears.
   */
  loading?: boolean;
  /** Quiet status line for the group, e.g. "indexing 12,000 records". Replaces "loading…". */
  status?: string;
  /** Group is listed but not searched, e.g. unavailable offline. Pair with `status` to say why. */
  disabled?: boolean;
};

type SourceState = { source: SearchSource; items: SearchResult[]; pending: boolean; failed: boolean };

const OPEN_EVENT = "sm:search-open";

/** Opens the palette from anywhere (a server-rendered button, a menu). */
export function openSearchPalette() {
  dispatchEvent(new Event(OPEN_EVENT));
}

/**
 * Header button that opens the palette. Works without hydration: the
 * palette listens for clicks on `[data-search-trigger]`.
 */
export function SearchTrigger({ label = "Search", className }: { label?: string; className?: string }) {
  return (
    <button
      type="button"
      data-search-trigger=""
      aria-label={label}
      aria-keyshortcuts="Meta+K Control+K"
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:w-64",
        className,
      )}
    >
      <SearchIcon className="size-4 shrink-0" aria-hidden />
      <span className="hidden flex-1 truncate text-left sm:inline">{label}</span>
      <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
    </button>
  );
}

/**
 * ⌘K / Ctrl+K search across collections. Each source searches on its own
 * (client index or API); results group by source. Selecting a result calls
 * `onSelect`, or follows its `href`.
 */
export function SearchPalette({
  sources,
  onSelect,
  placeholder = "Search…",
  emptyHint = "Type to search.",
  open: openProp,
  onOpenChange,
  hotkey = "k",
}: {
  sources: SearchSource[];
  onSelect?: (result: SearchResult, sourceId: string) => void;
  placeholder?: string;
  emptyHint?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Letter used with ⌘/Ctrl; null disables the shortcut. */
  hotkey?: string | null;
}) {
  const [innerOpen, setInnerOpen] = React.useState(false);
  const open = openProp ?? innerOpen;
  const setOpen = React.useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (openProp === undefined) setInnerOpen(v);
    },
    [onOpenChange, openProp],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (hotkey && e.key.toLowerCase() === hotkey && (e.metaKey || e.ctrlKey) && !e.altKey) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("[data-search-trigger]")) setOpen(true);
    };
    const onEvent = () => setOpen(true);
    addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    addEventListener(OPEN_EVENT, onEvent);
    return () => {
      removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      removeEventListener(OPEN_EVENT, onEvent);
    };
  }, [hotkey, open, setOpen]);

  const [query, setQuery] = React.useState("");
  const [states, setStates] = React.useState<Record<string, SourceState>>({});
  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setStates({});
      return;
    }
    let live = true;
    const searchable = sources.filter((s) => !s.disabled && !s.loading);
    // Slow sources show as pending; fast ones appear as soon as they settle.
    setStates((prev) =>
      Object.fromEntries(searchable.map((source) => [source.id, { source, items: prev[source.id]?.items ?? [], pending: true, failed: false }])),
    );
    const t = setTimeout(() => {
      for (const source of searchable) {
        Promise.resolve()
          .then(() => source.search(q))
          .then(
            (items) => ({ items, failed: false }),
            () => ({ items: [] as SearchResult[], failed: true }),
          )
          .then(({ items, failed }) => {
            if (live) setStates((prev) => ({ ...prev, [source.id]: { source, items, pending: false, failed } }));
          });
      }
    }, 90);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [query, sources]);

  const groups = (query.trim() ? sources : [])
    .map((source) => {
      const state = states[source.id];
      const note = source.disabled
        ? source.status
        : source.loading
          ? (source.status ?? "loading…")
          : state?.pending
            ? (source.status ?? "searching…")
            : state?.failed
              ? "couldn’t search this collection"
              : source.status;
      return { source, items: source.disabled || source.loading ? [] : (state?.items ?? []), note, busy: !!source.loading || !!state?.pending };
    })
    .filter((g) => g.items.length || g.note);
  const anyBusy = groups.some((g) => g.busy);
  const hasItems = groups.some((g) => g.items.length);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const choose = (r: SearchResult, sourceId: string) => {
    setOpen(false);
    if (onSelect) onSelect(r, sourceId);
    else if (r.href) {
      const url = safeHref(r.href);
      if (url) location.assign(url);
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description={placeholder}
      showCloseButton={false}
      commandProps={{ shouldFilter: false, loop: true, label: "Search" }}
    >
      <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
      <CommandList>
        {!query.trim() && <p className="px-4 py-8 text-center text-sm text-muted-foreground">{emptyHint}</p>}
        {query.trim() && !anyBusy && !hasItems && <CommandEmpty>No results for “{query.trim()}”.</CommandEmpty>}
        {groups.map(({ source, items, note, busy }) => (
          <CommandGroup
            key={source.id}
            aria-busy={busy || undefined}
            heading={
              <span className="flex items-center justify-between gap-3">
                <span>{source.label}</span>
                {note && <span className="font-normal normal-case tracking-normal opacity-80">{note}</span>}
              </span>
            }
          >
            {items.map((r) => (
              <CommandItem
                key={r.id}
                value={`${source.id}:${r.id}`}
                disabled={r.disabled}
                onSelect={() => choose(r, source.id)}
                className="gap-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-foreground">{r.title}</span>
                  {r.subtitle && <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span>}
                </span>
                {r.meta && <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{r.meta}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <div className="hidden items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground sm:flex">
        <span className="inline-flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> move
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>
            <CornerDownLeftIcon />
          </Kbd>
          open
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>esc</Kbd> close
        </span>
      </div>
    </CommandDialog>
  );
}
