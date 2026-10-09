import * as React from "react";
import { DataTable, type DataColumn, type DataSort } from "@saas-maker/ui/components/data-table";
import { ActiveFilters, FacetFilter, FilterBar, FilterSearch, RangeFilter, useUrlFilters } from "@saas-maker/ui/blocks/filter-bar";
import { SearchPalette, type SearchSource } from "@saas-maker/ui/blocks/search-palette";
import { KeyValueList, Provenance, RecordDetail, RecordLayout } from "@saas-maker/ui/blocks/record-detail";
import { ExportMenu } from "@saas-maker/ui/blocks/export-menu";
import { Button } from "@saas-maker/ui/components/button";
import { emptyFilters, facetCounts, filterRows, normalizeText, rangeBounds, type FilterDef } from "@saas-maker/ui/lib/filters";
import type { ExportColumn } from "@saas-maker/ui/lib/export";
import meta from "../data/nomad-places.meta.json";

/**
 * Places collection from the Nomad Atlas snapshot (Nomads.com data). The JSON
 * loads after first paint as its own chunk; filters, sort and the open record
 * live in the URL.
 */

type Place = {
  slug: string;
  name: string;
  country: string;
  region: string;
  url: string;
  overall: number | null;
  costNomad: number | null;
  costLocal: number | null;
  rent: number | null;
  coworking: number | null;
  internet: number | null;
  safety: number | null;
  walkability: number | null;
  english: number | null;
  healthcare: number | null;
  fun: number | null;
  remoteVisa: boolean | null;
  population: number | null;
};

type Snapshot = { columns: (keyof Place)[]; rows: unknown[][] };

const usd = (n: number) => `$${n.toLocaleString()}`;
const score = (n: number | null) => (n == null ? null : n.toFixed(1));
const visaLabel = (v: boolean | null) => (v ? "reported" : "not reported");

const defs: FilterDef<Place>[] = [
  { kind: "facet", id: "region", label: "region", value: (p) => p.region },
  { kind: "facet", id: "country", label: "country", value: (p) => p.country },
  { kind: "range", id: "cost", label: "cost", value: (p) => p.costNomad, format: usd, step: 100 },
  { kind: "range", id: "internet", label: "internet", value: (p) => p.internet, format: (n) => `${n} Mbps`, step: 5 },
  { kind: "range", id: "safety", label: "safety", value: (p) => p.safety, format: (n) => n.toFixed(1), step: 0.5 },
  { kind: "facet", id: "visa", label: "remote visa", value: (p) => visaLabel(p.remoteVisa) },
];
const searchText = (p: Place) => `${p.name} ${p.country} ${p.region}`;

const columns: DataColumn<Place>[] = [
  {
    id: "name",
    header: "place",
    value: (p) => p.name,
    hideable: false,
    minWidth: "11rem",
    cell: (p) => <span className="font-medium text-foreground">{p.name}</span>,
  },
  { id: "country", header: "country", value: (p) => p.country, minWidth: "9rem", className: "text-muted-foreground" },
  { id: "region", header: "region", value: (p) => p.region, hidden: true, className: "text-muted-foreground" },
  { id: "costNomad", header: "cost / mo", value: (p) => p.costNomad, align: "right", sortDescFirst: false, cell: (p) => (p.costNomad == null ? "—" : usd(p.costNomad)) },
  { id: "rent", header: "1br rent", value: (p) => p.rent, align: "right", sortDescFirst: false, hidden: true, cell: (p) => (p.rent == null ? "—" : usd(p.rent)) },
  { id: "coworking", header: "coworking", value: (p) => p.coworking, align: "right", sortDescFirst: false, hidden: true, cell: (p) => (p.coworking == null ? "—" : usd(p.coworking)) },
  { id: "internet", header: "mbps", value: (p) => p.internet, align: "right" },
  { id: "safety", header: "safety", value: (p) => p.safety, align: "right", cell: (p) => score(p.safety) ?? "—" },
  { id: "walkability", header: "walkable", value: (p) => p.walkability, align: "right", cell: (p) => score(p.walkability) ?? "—" },
  { id: "english", header: "english", value: (p) => p.english, align: "right", hidden: true, cell: (p) => score(p.english) ?? "—" },
  { id: "healthcare", header: "healthcare", value: (p) => p.healthcare, align: "right", hidden: true, cell: (p) => score(p.healthcare) ?? "—" },
  { id: "overall", header: "overall", value: (p) => p.overall, align: "right", cell: (p) => <span className="text-foreground">{score(p.overall) ?? "—"}</span> },
  { id: "population", header: "population", value: (p) => p.population, align: "right", hidden: true },
];

const exportColumns: ExportColumn<Place>[] = [
  "slug", "name", "country", "region", "overall", "costNomad", "costLocal", "rent", "coworking", "internet",
  "safety", "walkability", "english", "healthcare", "fun", "remoteVisa", "population", "url",
].map((k) => ({ id: k, value: (p: Place) => p[k as keyof Place] }));

const readParam = (k: string) => new URLSearchParams(location.search).get(k);
function setParam(k: string, v: string | null) {
  const p = new URLSearchParams(location.search);
  if (v) p.set(k, v);
  else p.delete(k);
  const qs = p.toString();
  history.replaceState(history.state, "", location.pathname + (qs ? `?${qs}` : "") + location.hash);
}
const MAX_COMPARE = 3;
const compareRows: { label: string; value: (p: Place) => string | null }[] = [
  { label: "country", value: (p) => p.country },
  { label: "cost for a nomad", value: (p) => (p.costNomad == null ? null : `${usd(p.costNomad)} / mo`) },
  { label: "1br rent, centre", value: (p) => (p.rent == null ? null : `${usd(p.rent)} / mo`) },
  { label: "coworking", value: (p) => (p.coworking == null ? null : `${usd(p.coworking)} / mo`) },
  { label: "internet", value: (p) => (p.internet == null ? null : `${p.internet} Mbps`) },
  { label: "overall", value: (p) => score(p.overall) },
  { label: "safety", value: (p) => score(p.safety) },
  { label: "walkability", value: (p) => score(p.walkability) },
  { label: "english spoken", value: (p) => score(p.english) },
  { label: "healthcare", value: (p) => score(p.healthcare) },
  { label: "remote work visa", value: (p) => visaLabel(p.remoteVisa) },
];

/** Picked places side by side; the first column stays put while the rest scroll. */
function ComparePanel({ places, onRemove, onClose }: { places: Place[]; onRemove: (slug: string) => void; onClose: () => void }) {
  return (
    <section aria-labelledby="compare-title" className="mb-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="compare-title" className="font-display text-xl">
          compare {places.length} places
        </h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onClose}>
          close compare
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">Picked places across {compareRows.length} measures</caption>
          <thead>
            <tr>
              <th scope="col" className="ui-case sticky left-0 z-10 min-w-[9rem] border-b border-border bg-card px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                measure
              </th>
              {places.map((p) => (
                <th key={p.slug} scope="col" className="min-w-[9rem] border-b border-border px-4 py-3 text-right align-bottom font-medium text-foreground">
                  <span className="block">{p.name}</span>
                  <button type="button" onClick={() => onRemove(p.slug)} className="ui-case text-xs font-normal text-muted-foreground underline-offset-4 hover:underline" aria-label={`Remove ${p.name} from compare`}>
                    remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map((r) => (
              <tr key={r.label}>
                <th scope="row" className="sticky left-0 z-10 border-b border-hairline bg-card px-4 py-2.5 text-left font-normal text-muted-foreground">
                  {r.label}
                </th>
                {places.map((p) => (
                  <td key={p.slug} className="border-b border-hairline px-4 py-2.5 text-right tabular-nums text-foreground">
                    {r.value(p) ?? <span className="text-muted-foreground/60">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Picks from the URL: de-duplicated, known places only (once loaded), at most MAX_COMPARE. */
const parsePicks = (s: string | null, known?: Map<string, unknown>) =>
  s ? [...new Set(s.split(",").filter((x) => x && (!known || known.has(x))))].slice(0, MAX_COMPARE) : [];
const parseSort = (s: string | null): DataSort => (s ? [{ id: s.replace(/^-/, ""), desc: s.startsWith("-") }] : [{ id: "overall", desc: true }]);

export default function PlacesWorkbench() {
  const [snapshot, setSnapshot] = React.useState<{ places: Place[] } | null>(null);
  const [failed, setFailed] = React.useState(false);
  const load = React.useCallback(() => {
    setFailed(false);
    import("../data/nomad-places.json")
      .then((m) => {
        const data = m.default as unknown as Snapshot;
        const places = data.rows.map((r) => Object.fromEntries(data.columns.map((c, i) => [c, r[i]])) as Place);
        setSnapshot({ places });
      })
      .catch(() => setFailed(true));
  }, []);
  React.useEffect(load, [load]);

  const places = snapshot?.places ?? EMPTY;
  const [filters, setFilters] = useUrlFilters(defs);
  const [sort, setSort] = React.useState<DataSort>(() => parseSort(null));
  const [openSlug, setOpenSlug] = React.useState<string | null>(null);
  const [picks, setPicksState] = React.useState<string[]>([]);
  const [comparing, setComparing] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  React.useEffect(() => {
    setSort(parseSort(readParam("sort")));
    setOpenSlug(readParam("place"));
    setPicksState(parsePicks(readParam("pick")));
    setComparing(readParam("compare") === "1");
  }, []);
  const setPicks = (next: string[]) => {
    setPicksState(next);
    setNotice(null);
    setParam("pick", next.length ? next.join(",") : null);
    if (next.length < 2) showCompare(false);
  };
  const showCompare = (on: boolean) => {
    setComparing(on);
    setNotice(null);
    setParam("compare", on ? "1" : null);
  };

  const rows = React.useMemo(() => filterRows(places, defs, filters, { search: searchText }), [places, filters]);
  const bounds = React.useMemo(
    () => Object.fromEntries(defs.filter((d) => d.kind === "range").map((d) => [d.id, rangeBounds(places, d.value as (p: Place) => number | null)])),
    [places],
  );
  const bySlug = React.useMemo(() => new Map(places.map((p) => [p.slug, p])), [places]);
  const open = openSlug ? bySlug.get(openSlug) : undefined;
  const picked = picks.map((s) => bySlug.get(s)).filter((p): p is Place => !!p);
  // Once the snapshot loads, drop unknown or repeated picks from the URL so they
  // never use up compare slots.
  React.useEffect(() => {
    if (!snapshot) return;
    const raw = readParam("pick");
    const clean = parsePicks(raw, bySlug);
    setPicksState(clean);
    if ((raw ?? "") !== clean.join(",")) setParam("pick", clean.length ? clean.join(",") : null);
    if (clean.length < 2 && readParam("compare")) {
      setComparing(false);
      setParam("compare", null);
    }
  }, [snapshot, bySlug]);

  const openPlace = (slug: string | null) => {
    setOpenSlug(slug);
    setParam("place", slug);
  };

  const sources = React.useMemo<SearchSource[]>(
    () => [
      {
        id: "places",
        label: "places",
        search: (q) => {
          const t = normalizeText(q);
          return places
            .filter((p) => normalizeText(searchText(p)).includes(t))
            .sort((a, b) => Number(!normalizeText(a.name).startsWith(t)) - Number(!normalizeText(b.name).startsWith(t)) || (b.overall ?? 0) - (a.overall ?? 0))
            .slice(0, 8)
            .map((p) => ({ id: p.slug, title: p.name, subtitle: `${p.country} · ${p.region}`, meta: p.costNomad == null ? undefined : `${usd(p.costNomad)}/mo` }));
        },
      },
      {
        id: "countries",
        label: "countries",
        search: (q) => {
          const t = normalizeText(q);
          const counts = new Map<string, number>();
          for (const p of places) if (normalizeText(p.country).includes(t)) counts.set(p.country, (counts.get(p.country) ?? 0) + 1);
          return [...counts]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([c, n]) => ({ id: c, title: c, subtitle: "filter the table", meta: `${n} ${n === 1 ? "place" : "places"}` }));
        },
      },
    ],
    [places],
  );

  const facet = (id: string) => facetCounts(places, defs, filters, id, { search: searchText });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3">
        <FilterBar>
          <FilterSearch value={filters.q ?? ""} onChange={(q) => setFilters((s) => ({ ...s, q: q || undefined }))} placeholder="Filter places…" />
          {defs.map((d) =>
            d.kind === "facet" ? (
              <FacetFilter
                key={d.id}
                label={d.label}
                options={snapshot ? facet(d.id) : []}
                selected={filters.facets[d.id] ?? []}
                onChange={(v) => setFilters((s) => ({ ...s, facets: { ...s.facets, [d.id]: v } }))}
              />
            ) : d.kind === "range" && bounds[d.id] ? (
              <RangeFilter
                key={d.id}
                label={d.label}
                bounds={bounds[d.id]!}
                value={filters.ranges[d.id]}
                format={d.format}
                step={d.step}
                onChange={(v) => setFilters((s) => ({ ...s, ranges: v ? { ...s.ranges, [d.id]: v } : omit(s.ranges, d.id) }))}
              />
            ) : null,
          )}
        </FilterBar>
        <ActiveFilters defs={defs} state={filters} onChange={setFilters} />
      </div>

      {comparing && picked.length >= 2 && (
        <ComparePanel places={picked} onRemove={(slug) => setPicks(picks.filter((s) => s !== slug))} onClose={() => showCompare(false)} />
      )}

      <RecordLayout>
        <DataTable
          className="flex-1"
          label="Places"
          data={rows}
          columns={columns}
          getRowId={(p) => p.slug}
          status={failed ? "error" : snapshot ? "ready" : "loading"}
          error="The places snapshot did not load."
          onRetry={load}
          onRowClick={(p) => openPlace(p.slug)}
          selectedId={openSlug}
          selection={{
            selected: picks,
            onChange: setPicks,
            max: MAX_COMPARE,
            onLimit: () => setNotice(`Compare up to ${MAX_COMPARE} places. Remove one to add another.`),
            rowLabel: (p) => p.name,
          }}
          sort={sort}
          onSortChange={(s) => {
            setSort(s);
            setParam("sort", s[0] ? `${s[0].desc ? "-" : ""}${s[0].id}` : null);
          }}
          empty={
            <span className="flex flex-col items-center gap-3">
              No places match these filters.
              <Button variant="outline" size="sm" onClick={() => setFilters(emptyFilters())}>
                clear filters
              </Button>
            </span>
          }
          toolbar={(view) => (
            <>
              <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
                {snapshot ? (
                  <>
                    <span className="text-foreground">{view.rows.length.toLocaleString()}</span> of {places.length.toLocaleString()} places
                  </>
                ) : (
                  "loading places…"
                )}
              </p>
              {picks.length > 0 && (
                <span className="flex items-center gap-1">
                  <Button size="sm" variant={comparing ? "secondary" : "default"} disabled={picks.length < 2} onClick={() => showCompare(!comparing)}>
                    {picks.length < 2 ? "pick one more to compare" : comparing ? "hide compare" : `compare ${picks.length}`}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setPicks([])}>
                    clear
                  </Button>
                </span>
              )}
              <p role="status" className="text-sm text-muted-foreground empty:hidden">
                {notice}
              </p>
              {snapshot && (
                <ExportMenu
                  rows={view.rows}
                  columns={exportColumns}
                  filename={`places-${today}`}
                  meta={{ collection: "places", source: meta.source, sourceUrl: meta.sourceUrl, collectedAt: meta.collectedAt, via: meta.via, filters: location.search || null }}
                />
              )}
            </>
          )}
        />

        <RecordDetail
          open={!!open}
          onOpenChange={(v) => !v && openPlace(null)}
          title={open?.name ?? ""}
          subtitle={open ? `${open.country} · ${open.region}` : undefined}
        >
          {open && (
            <>
              <KeyValueList
                items={[
                  { label: "cost for a nomad", value: open.costNomad == null ? null : `${usd(open.costNomad)} / mo` },
                  { label: "cost for a local", value: open.costLocal == null ? null : `${usd(open.costLocal)} / mo` },
                  { label: "1br rent, centre", value: open.rent == null ? null : `${usd(open.rent)} / mo` },
                  { label: "coworking", value: open.coworking == null ? null : `${usd(open.coworking)} / mo` },
                  { label: "internet", value: open.internet == null ? null : `${open.internet} Mbps` },
                  { label: "remote work visa", value: visaLabel(open.remoteVisa) },
                  { label: "population", value: open.population?.toLocaleString() },
                ]}
              />
              <div>
                <h3 className="ui-case mb-1 text-xs font-medium text-muted-foreground">scores out of 5</h3>
                <KeyValueList
                  items={[
                    { label: "overall", value: score(open.overall) },
                    { label: "safety", value: score(open.safety) },
                    { label: "walkability", value: score(open.walkability) },
                    { label: "english spoken", value: score(open.english) },
                    { label: "healthcare", value: score(open.healthcare) },
                    { label: "fun", value: score(open.fun) },
                  ]}
                />
              </div>
              <Provenance
                info={{
                  source: meta.source,
                  url: open.url,
                  via: "Nomad Atlas saved snapshot",
                  viaUrl: meta.viaUrl,
                  collectedAt: meta.collectedAt,
                  revision: "nomad atlas · 517cbeb",
                  note: "Saved snapshot via Nomad Atlas. Costs and scores are the source's estimates, not live data.",
                }}
              />
            </>
          )}
        </RecordDetail>
      </RecordLayout>

      <SearchPalette
        sources={sources}
        placeholder="Search places and countries…"
        emptyHint={`Search ${places.length.toLocaleString()} places by name or country.`}
        onSelect={(r, source) => {
          if (source === "countries") setFilters((s) => ({ ...s, facets: { ...s.facets, country: [r.id] } }));
          else openPlace(r.id);
        }}
      />
    </>
  );
}

const EMPTY: Place[] = [];

function omit<V>(rec: Record<string, V>, key: string): Record<string, V> {
  const { [key]: _drop, ...rest } = rec;
  return rest;
}
