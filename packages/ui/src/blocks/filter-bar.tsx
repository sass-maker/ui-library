"use client";

import * as React from "react";
import { CalendarIcon, CheckIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { cn } from "../lib/utils";
import {
  activeFilters,
  emptyFilters,
  readFilters,
  writeFilters,
  type DateRangeValue,
  type FacetOption,
  type FilterDef,
  type FilterState,
  type RangeValue,
} from "../lib/filters";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import { Slider } from "../components/slider";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/command";

/* ── URL state ─────────────────────────────────────────────────────────── */

/**
 * Filter state mirrored to the query string with history.replaceState, so a
 * view is shareable and survives reload. Back/forward restore it. Params the
 * filters do not own are kept.
 */
export function useUrlFilters<T>(defs: FilterDef<T>[], opts: { queryParam?: string } = {}) {
  const queryParam = opts.queryParam ?? "q";
  const [state, setState] = React.useState<FilterState>(emptyFilters);
  const defsRef = React.useRef(defs);
  defsRef.current = defs;

  React.useEffect(() => {
    const read = () => setState(readFilters(defsRef.current, location.search, queryParam));
    read();
    addEventListener("popstate", read);
    return () => removeEventListener("popstate", read);
  }, [queryParam]);

  const update = React.useCallback(
    (next: FilterState | ((s: FilterState) => FilterState)) => {
      setState((prev) => {
        const value = typeof next === "function" ? next(prev) : next;
        const qs = writeFilters(defsRef.current, value, location.search, queryParam).toString();
        const url = location.pathname + (qs ? `?${qs}` : "") + location.hash;
        if (url !== location.pathname + location.search + location.hash) history.replaceState(history.state, "", url);
        return value;
      });
    },
    [queryParam],
  );
  return [state, update] as const;
}

/* ── Layout ────────────────────────────────────────────────────────────── */

/** A row of filter controls that wraps on narrow screens. */
export function FilterBar({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label="Filters" className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

const triggerClass = (active: boolean) =>
  cn("h-8 gap-1.5 px-2.5 font-normal text-muted-foreground", active ? "border-solid text-foreground" : "border-dashed");

/** Free-text filter with a leading icon; commits as you type. */
export function FilterSearch({
  value,
  onChange,
  placeholder = "Filter…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => setDraft(value), [value]);
  React.useEffect(() => {
    if (draft === value) return;
    const t = setTimeout(() => onChange(draft), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);
  return (
    <div className={cn("relative w-full sm:w-56", className)}>
      <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 pl-8 text-sm"
      />
    </div>
  );
}

/* ── Facet ─────────────────────────────────────────────────────────────── */

/** Multi-select facet with live counts. Options come from `facetCounts`. */
export function FacetFilter({
  label,
  options,
  selected,
  onChange,
  searchPlaceholder,
}: {
  label: string;
  options: FacetOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  searchPlaceholder?: string;
}) {
  const set = new Set(selected);
  const toggle = (v: string) => onChange(set.has(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  const summary = selected.length === 1 ? selected[0] : selected.length > 1 ? `${selected.length} selected` : null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClass(selected.length > 0)}>
          {!summary && <PlusIcon className="size-3.5" />}
          {label}
          {summary && (
            <>
              <span className="h-3.5 w-px bg-border" aria-hidden />
              <span className="max-w-[9rem] truncate normal-case">{summary}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        {/* The input is always there: it holds focus when the popover opens, so arrow keys,
            Enter and Space work, and it names the listbox for screen readers. */}
        <Command label={label}>
          <CommandInput placeholder={searchPlaceholder ?? `Find ${label}…`} className="h-9" />
          <CommandList className="max-h-72">
            <CommandEmpty>No match.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const on = set.has(o.value);
                return (
                  <CommandItem key={o.value} value={o.value} onSelect={() => toggle(o.value)} aria-checked={on}>
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input",
                        on && "border-primary bg-primary text-primary-foreground",
                      )}
                      aria-hidden
                    >
                      {on && <CheckIcon className="size-3 text-current" />}
                    </span>
                    <span className={cn("truncate", o.count === 0 && !on && "text-muted-foreground")}>{o.value}</span>
                    <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">{o.count.toLocaleString()}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {selected.length > 0 && (
            <div className="border-t border-border p-1">
              <Button variant="ghost" size="sm" className="w-full justify-center text-muted-foreground" onClick={() => onChange([])}>
                clear
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/* ── Range ─────────────────────────────────────────────────────────────── */

/** Numeric range: a two-thumb slider plus exact min/max inputs. Applies on release. */
export function RangeFilter({
  label,
  bounds,
  value,
  onChange,
  format = (n) => n.toLocaleString(),
  step,
}: {
  label: string;
  bounds: { min: number; max: number };
  value: RangeValue | undefined;
  onChange: (v: RangeValue | undefined) => void;
  format?: (n: number) => string;
  step?: number;
}) {
  const s = step ?? niceStep(bounds.max - bounds.min);
  const lo = Math.floor(bounds.min / s) * s;
  const hi = Math.ceil(bounds.max / s) * s;
  const [draft, setDraft] = React.useState<[number, number]>([value?.min ?? lo, value?.max ?? hi]);
  React.useEffect(() => setDraft([value?.min ?? lo, value?.max ?? hi]), [value?.min, value?.max, lo, hi]);
  const commit = ([a, b]: [number, number]) => {
    const next: RangeValue = { min: a > lo ? a : undefined, max: b < hi ? b : undefined };
    onChange(next.min === undefined && next.max === undefined ? undefined : next);
  };
  const active = value?.min !== undefined || value?.max !== undefined;
  const summary = active
    ? value!.min !== undefined && value!.max !== undefined
      ? `${format(value!.min)}–${format(value!.max)}`
      : value!.min !== undefined
        ? `≥ ${format(value!.min)}`
        : `≤ ${format(value!.max!)}`
    : null;
  const id = React.useId();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClass(active)}>
          {!summary && <PlusIcon className="size-3.5" />}
          {label}
          {summary && (
            <>
              <span className="h-3.5 w-px bg-border" aria-hidden />
              <span className="normal-case tabular-nums">{summary}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <p className="ui-case mb-4 text-xs font-medium text-muted-foreground">{label}</p>
        <Slider
          min={lo}
          max={hi}
          step={s}
          value={draft}
          minStepsBetweenThumbs={0}
          onValueChange={(v) => setDraft([v[0]!, v[1]!])}
          onValueCommit={(v) => commit([v[0]!, v[1]!])}
          aria-label={label}
        />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["min", "max"] as const).map((k, i) => (
            <label key={k} htmlFor={`${id}-${k}`} className="flex flex-col gap-1">
              <span className="ui-case text-xs text-muted-foreground">{k}</span>
              <Input
                id={`${id}-${k}`}
                type="number"
                inputMode="decimal"
                step={s}
                value={draft[i]}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) setDraft(i === 0 ? [n, draft[1]] : [draft[0], n]);
                }}
                onBlur={() => commit(draft)}
                onKeyDown={(e) => e.key === "Enter" && commit(draft)}
                className="h-8 font-mono text-sm tabular-nums"
              />
            </label>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">
            {format(bounds.min)} – {format(bounds.max)}
          </span>
          {active && (
            <Button variant="ghost" size="xs" onClick={() => onChange(undefined)}>
              clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function niceStep(span: number) {
  if (span <= 0) return 1;
  const raw = span / 100;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
}

/* ── Date range ────────────────────────────────────────────────────────── */

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Date range with native date inputs (keyboard and screen-reader friendly) and quick presets. */
export function DateRangeFilter({
  label,
  value,
  onChange,
  min,
  max,
  presets = [
    { label: "7 days", days: 7 },
    { label: "30 days", days: 30 },
    { label: "1 year", days: 365 },
  ],
}: {
  label: string;
  value: DateRangeValue | undefined;
  onChange: (v: DateRangeValue | undefined) => void;
  min?: string;
  max?: string;
  presets?: { label: string; days: number }[];
}) {
  const active = !!(value?.from || value?.to);
  const summary = active ? (value!.from && value!.to ? `${value!.from} → ${value!.to}` : value!.from ? `from ${value!.from}` : `until ${value!.to}`) : null;
  const set = (patch: DateRangeValue) => {
    const next = { ...value, ...patch };
    onChange(next.from || next.to ? { from: next.from || undefined, to: next.to || undefined } : undefined);
  };
  const id = React.useId();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClass(active)}>
          <CalendarIcon className="size-3.5" />
          {label}
          {summary && (
            <>
              <span className="h-3.5 w-px bg-border" aria-hidden />
              <span className="normal-case tabular-nums">{summary}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <p className="ui-case mb-3 text-xs font-medium text-muted-foreground">{label}</p>
        <div className="grid grid-cols-2 gap-2">
          {(["from", "to"] as const).map((k) => (
            <label key={k} htmlFor={`${id}-${k}`} className="flex flex-col gap-1">
              <span className="ui-case text-xs text-muted-foreground">{k}</span>
              <Input
                id={`${id}-${k}`}
                type="date"
                min={k === "to" ? value?.from || min : min}
                max={k === "from" ? value?.to || max : max}
                value={value?.[k] ?? ""}
                onChange={(e) => set({ [k]: e.target.value })}
                className="h-8 px-2 text-sm tabular-nums"
              />
            </label>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {presets.map((p) => (
            <Button
              key={p.label}
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={() => {
                const to = max ? new Date(max) : new Date();
                const from = new Date(to.getTime() - p.days * 86_400_000);
                onChange({ from: isoDay(from), to: isoDay(to) });
              }}
            >
              {p.label}
            </Button>
          ))}
          {active && (
            <Button variant="ghost" size="xs" className="ml-auto" onClick={() => onChange(undefined)}>
              clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── Active chips ──────────────────────────────────────────────────────── */

/** Removable chips for every active filter, plus "clear all". Renders nothing when idle. */
export function ActiveFilters<T>({
  defs,
  state,
  onChange,
  queryLabel,
  className,
}: {
  defs: FilterDef<T>[];
  state: FilterState;
  onChange: (s: FilterState) => void;
  queryLabel?: string;
  className?: string;
}) {
  const items = activeFilters(defs, state, queryLabel);
  if (!items.length) return null;
  return (
    <ul aria-label="Active filters" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {items.map((f) => (
        <li key={f.id}>
          <button
            type="button"
            onClick={() => onChange(f.clear(state))}
            aria-label={`Remove ${f.label} ${f.value}`}
            className="group inline-flex h-7 max-w-[16rem] items-center gap-1.5 rounded-full bg-secondary pl-2.5 pr-1.5 text-xs text-secondary-foreground transition-colors hover:bg-accent"
          >
            <span className="ui-case shrink-0 text-muted-foreground">{f.label}</span>
            <span className="truncate tabular-nums">{f.value}</span>
            <XIcon className="size-3 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden />
          </button>
        </li>
      ))}
      {items.length > 1 && (
        <li>
          <Button variant="link" size="xs" className="h-7 text-muted-foreground" onClick={() => onChange(emptyFilters())}>
            clear all
          </Button>
        </li>
      )}
    </ul>
  );
}
