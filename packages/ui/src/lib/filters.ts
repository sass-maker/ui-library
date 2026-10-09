/**
 * Filter state for data views: facets (multi-select), numeric ranges, date
 * ranges and a free-text query. Plain data, no React, so a server adapter can
 * read the same query string the browser writes.
 *
 * URL format (one param per filter, readable and stable):
 *   ?q=lisbon&region=Europe&region=Asia&cost=500..2000&added=2026-01-01..
 */

export type FacetFilterDef<T> = {
  kind: "facet";
  id: string;
  label: string;
  /** One or more values per row; null/undefined rows never match. */
  value: (row: T) => string | string[] | null | undefined;
};

export type RangeFilterDef<T> = {
  kind: "range";
  id: string;
  label: string;
  value: (row: T) => number | null | undefined;
  /** Formats bounds in chips and inputs, e.g. (n) => `$${n}`. */
  format?: (n: number) => string;
  step?: number;
};

export type DateFilterDef<T> = {
  kind: "date";
  id: string;
  label: string;
  /** ISO date or datetime string, or a Date. */
  value: (row: T) => string | Date | null | undefined;
};

export type FilterDef<T> = FacetFilterDef<T> | RangeFilterDef<T> | DateFilterDef<T>;

export type RangeValue = { min?: number; max?: number };
export type DateRangeValue = { from?: string; to?: string };

export type FilterState = {
  q?: string;
  facets: Record<string, string[]>;
  ranges: Record<string, RangeValue>;
  dates: Record<string, DateRangeValue>;
};

export const emptyFilters = (): FilterState => ({ facets: {}, ranges: {}, dates: {} });

const num = (s: string) => (s === "" ? undefined : Number.isFinite(Number(s)) ? Number(s) : undefined);
const isoDate = (s: string) => (/^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : undefined);

/** Reads filter state from a query string, URLSearchParams or URL. Unknown params are ignored. */
export function readFilters<T>(defs: FilterDef<T>[], input: string | URLSearchParams | URL, queryParam = "q"): FilterState {
  const params = input instanceof URL ? input.searchParams : typeof input === "string" ? new URLSearchParams(input) : input;
  const state = emptyFilters();
  const q = params.get(queryParam)?.trim();
  if (q) state.q = q;
  for (const def of defs) {
    if (def.kind === "facet") {
      const values = params.getAll(def.id).filter(Boolean);
      if (values.length) state.facets[def.id] = [...new Set(values)];
      continue;
    }
    const raw = params.get(def.id);
    if (!raw) continue;
    const [a = "", b = ""] = raw.split("..");
    if (def.kind === "range") {
      const r = { min: num(a), max: num(b) };
      if (r.min !== undefined || r.max !== undefined) state.ranges[def.id] = r;
    } else {
      const d = { from: isoDate(a), to: isoDate(b) };
      if (d.from || d.to) state.dates[def.id] = d;
    }
  }
  return state;
}

/**
 * Writes filter state into a copy of `base` (other params are kept, filter
 * params are replaced). Returns URLSearchParams; use `.toString()`.
 */
export function writeFilters<T>(defs: FilterDef<T>[], state: FilterState, base?: string | URLSearchParams, queryParam = "q"): URLSearchParams {
  const params = new URLSearchParams(base);
  params.delete(queryParam);
  for (const def of defs) params.delete(def.id);
  if (state.q) params.set(queryParam, state.q);
  for (const def of defs) {
    if (def.kind === "facet") {
      for (const v of state.facets[def.id] ?? []) params.append(def.id, v);
    } else if (def.kind === "range") {
      const r = state.ranges[def.id];
      if (r && (r.min !== undefined || r.max !== undefined)) params.set(def.id, `${r.min ?? ""}..${r.max ?? ""}`);
    } else {
      const d = state.dates[def.id];
      if (d && (d.from || d.to)) params.set(def.id, `${d.from ?? ""}..${d.to ?? ""}`);
    }
  }
  return params;
}

/** Accent- and case-insensitive text key. */
export function normalizeText(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

const asList = (v: string | string[] | null | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const dayOf = (v: string | Date) => (v instanceof Date ? v.toISOString() : v).slice(0, 10);

/** True when the row passes one filter. */
function passes<T>(row: T, def: FilterDef<T>, state: FilterState): boolean {
  if (def.kind === "facet") {
    const want = state.facets[def.id];
    if (!want?.length) return true;
    return asList(def.value(row)).some((v) => want.includes(v));
  }
  if (def.kind === "range") {
    const r = state.ranges[def.id];
    if (!r || (r.min === undefined && r.max === undefined)) return true;
    const v = def.value(row);
    if (v == null || Number.isNaN(v)) return false;
    return (r.min === undefined || v >= r.min) && (r.max === undefined || v <= r.max);
  }
  const d = state.dates[def.id];
  if (!d || (!d.from && !d.to)) return true;
  const v = def.value(row);
  if (v == null) return false;
  const day = dayOf(v);
  return (!d.from || day >= d.from) && (!d.to || day <= d.to);
}

/**
 * Applies every filter plus the text query. `search` returns the text a row
 * is matched against (defaults to no text matching). `except` skips one
 * filter, which is how facet counts stay useful while that facet is active.
 */
export function filterRows<T>(
  rows: T[],
  defs: FilterDef<T>[],
  state: FilterState,
  opts: { search?: (row: T) => string; except?: string } = {},
): T[] {
  const active = defs.filter((d) => d.id !== opts.except);
  const terms = state.q && opts.search ? normalizeText(state.q).split(/\s+/).filter(Boolean) : [];
  return rows.filter((row) => {
    if (terms.length) {
      const hay = normalizeText(opts.search!(row));
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return active.every((def) => passes(row, def, state));
  });
}

export type FacetOption = { value: string; count: number };

/**
 * Value counts for one facet, computed over rows that pass every other
 * filter. Sorted by count, then name. Selected values with zero matches are
 * kept so they can still be cleared.
 */
export function facetCounts<T>(
  rows: T[],
  defs: FilterDef<T>[],
  state: FilterState,
  facetId: string,
  opts: { search?: (row: T) => string } = {},
): FacetOption[] {
  const def = defs.find((d) => d.id === facetId);
  if (!def || def.kind !== "facet") return [];
  const counts = new Map<string, number>();
  for (const row of filterRows(rows, defs, state, { ...opts, except: facetId })) {
    for (const v of asList(def.value(row))) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  for (const v of state.facets[facetId] ?? []) if (!counts.has(v)) counts.set(v, 0);
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Min and max of a numeric field across rows (ignores missing values). */
export function rangeBounds<T>(rows: T[], value: (row: T) => number | null | undefined): { min: number; max: number } | null {
  let min = Infinity;
  let max = -Infinity;
  for (const row of rows) {
    const v = value(row);
    if (v == null || Number.isNaN(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return min <= max ? { min, max } : null;
}

export type ActiveFilter = { id: string; label: string; value: string; clear: (s: FilterState) => FilterState };

/** One entry per chip: each facet value, each range, each date range, and the query. */
export function activeFilters<T>(defs: FilterDef<T>[], state: FilterState, queryLabel = "search"): ActiveFilter[] {
  const out: ActiveFilter[] = [];
  if (state.q) out.push({ id: "q", label: queryLabel, value: `“${state.q}”`, clear: (s) => ({ ...s, q: undefined }) });
  for (const def of defs) {
    if (def.kind === "facet") {
      for (const v of state.facets[def.id] ?? []) {
        out.push({
          id: `${def.id}:${v}`,
          label: def.label,
          value: v,
          clear: (s) => ({ ...s, facets: { ...s.facets, [def.id]: (s.facets[def.id] ?? []).filter((x) => x !== v) } }),
        });
      }
    } else if (def.kind === "range") {
      const r = state.ranges[def.id];
      if (!r || (r.min === undefined && r.max === undefined)) continue;
      const f = def.format ?? ((n: number) => n.toLocaleString());
      const value = r.min !== undefined && r.max !== undefined ? `${f(r.min)}–${f(r.max)}` : r.min !== undefined ? `≥ ${f(r.min)}` : `≤ ${f(r.max!)}`;
      out.push({ id: def.id, label: def.label, value, clear: (s) => ({ ...s, ranges: omit(s.ranges, def.id) }) });
    } else {
      const d = state.dates[def.id];
      if (!d || (!d.from && !d.to)) continue;
      const value = d.from && d.to ? `${d.from} → ${d.to}` : d.from ? `from ${d.from}` : `until ${d.to}`;
      out.push({ id: def.id, label: def.label, value, clear: (s) => ({ ...s, dates: omit(s.dates, def.id) }) });
    }
  }
  return out;
}

function omit<V>(rec: Record<string, V>, key: string): Record<string, V> {
  const { [key]: _drop, ...rest } = rec;
  return rest;
}
