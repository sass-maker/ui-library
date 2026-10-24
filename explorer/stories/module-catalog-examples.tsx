import { useMemo, useRef, useState } from "react";
import { ArrowUpRight, Box, Download, SearchX, X } from "lucide-react";
import { ConsolePage } from "@saas-maker/templates/console-page";
import { Button } from "@saas-maker/ui/atoms/button";
import { Badge } from "@saas-maker/ui/atoms/badge";
import { DataTable, type DataColumn } from "@saas-maker/ui/organisms/data-table";
import { SearchField } from "@saas-maker/ui/molecules/search-field";
import { CopyButton } from "@saas-maker/ui/recipes/copy-button";
import { SearchPalette } from "@saas-maker/ui/blocks/search-palette";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@saas-maker/ui/molecules/dialog";
import { moduleCatalog } from "./module-catalog-data";

type CatalogModule = (typeof moduleCatalog)[number];
const catalogLayers = ["All modules", "Atoms", "Molecules", "Organisms"] as const;

const catalogColumns: DataColumn<CatalogModule>[] = [
  { id: "name", header: "Module", value: item => item.name, hideable: false, minWidth: "clamp(10rem,20vw,14rem)", cell: item => <div className="py-1"><span className="block font-medium">{item.name}</span><span className="mt-1 block text-xs text-muted-foreground">{item.section.split(" / ").slice(1).join(" / ")}</span></div> },
  { id: "layer", header: "Layer", value: item => item.layer, cell: item => <Badge variant="outline">{item.layer}</Badge> },
  { id: "import", header: "Import path", value: item => item.importPath, minWidth: "23rem", cell: item => <code className="text-xs text-muted-foreground">{item.importPath}</code> },
  { id: "packages", header: "Packages", value: item => item.dependencies.length, align: "right" },
];

export function ModuleCatalogExample() {
  const [query, setQuery] = useState("");
  const [layer, setLayer] = useState<(typeof catalogLayers)[number]>("All modules");
  const [selected, setSelected] = useState<string[]>([]);
  const [current, setCurrent] = useState<CatalogModule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const filter = useRef<HTMLInputElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const selectedModules = moduleCatalog.filter(item => selected.includes(item.id));
  const visible = moduleCatalog.filter(item => (layer === "All modules" || item.layer === layer) && `${item.name} ${item.importPath} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  const openModule = (item: CatalogModule, fromSearch = false) => {
    opener.current = fromSearch ? [...(root.current?.querySelectorAll<HTMLElement>("[data-search-trigger]") ?? [])].find(element => element.getClientRects().length) ?? null
      : document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCurrent(item); setDetailOpen(true);
  };
  const sources = useMemo(() => [{ id: "modules", label: "Library modules", search: (value: string) => moduleCatalog
    .filter(item => `${item.name} ${item.importPath} ${item.description}`.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 12).map(item => ({ id: item.id, title: item.name, subtitle: item.importPath, meta: item.layer })) }], []);
  const clearFilters = () => { setQuery(""); setLayer("All modules"); filter.current?.focus(); };
  const download = (records: readonly CatalogModule[]) => {
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([JSON.stringify({ release: moduleCatalog[0].sourceRef, modules: records }, null, 2)], { type: "application/json" }));
      const link = document.createElement("a"); link.href = url; link.download = "fleet-ui-modules.json"; link.click();
      setNotice(`Prepared ${records.length} module records for download.`);
      const completed = url; setTimeout(() => URL.revokeObjectURL(completed), 1000);
    } catch {
      if (url) URL.revokeObjectURL(url);
      setNotice("The export could not be prepared. Please try again.");
    }
  };
  return <div ref={root}>
    <ConsolePage brand={{ name: "Fleet UI", mark: <Box aria-hidden className="size-5 stroke-[1.5] text-brand" />, href: "./?path=/story/start-here-overview--explore", target: "_top" }}
      title="Component catalog" titleRef={heading} description="Search the shipped modules, inspect an import, and open its working example. This inventory comes from the actual repository sources."
      search={{ label: "Find a component" }} breadcrumbs={[{ label: "Fleet UI" }, { label: "Library" }]}
      nav={[{ title: "Library", items: catalogLayers.map(value => ({ label: value, href: `#catalog-${value.toLowerCase().replaceAll(" ", "-")}`, active: layer === value, count: value === "All modules" ? moduleCatalog.length : moduleCatalog.filter(item => item.layer === value).length })) }]}
      onNavigate={href => {
        const next = catalogLayers.find(value => href === `#catalog-${value.toLowerCase().replaceAll(" ", "-")}`);
        if (!next) return;
        setLayer(next); setQuery(""); requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); });
      }}
      actions={<Badge variant="outline">{moduleCatalog[0].sourceRef} · {moduleCatalog.length} modules</Badge>}
      sidebarFooter={<div className="space-y-3"><p>One source, from atom to complete workflow.</p><a target="_top" href="./?path=/story/start-here-workspace--complete-workflow" className="inline-flex min-h-11 items-center gap-2 rounded-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore the workspace<ArrowUpRight aria-hidden className="size-3.5" /></a></div>}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
        <SearchField ref={filter} label="Filter modules" placeholder="Name, purpose or import path…" value={query} onValueChange={setQuery} className="w-full sm:max-w-sm" />
        <div role="group" aria-label="Atomic layer" className="grid w-full grid-cols-2 gap-1 min-[440px]:flex min-[440px]:w-auto">{catalogLayers.map(value => <Button key={value} size="sm" variant={layer === value ? "secondary" : "ghost"} aria-pressed={layer === value} onClick={() => setLayer(value)}>{value}</Button>)}</div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 py-4 text-xs text-muted-foreground"><span role="status">{visible.length} of {moduleCatalog.length} modules</span><span>Sort a column. Select imports. Open a row.</span></div>
      <DataTable label="Component catalog" data={visible} columns={catalogColumns} getRowId={item => item.id} pageSize={12} maxHeight="min(68dvh,42rem)"
        selectedId={detailOpen ? current?.id : null} onRowClick={item => openModule(item)} selection={{ selected, onChange: setSelected, rowLabel: item => item.name }}
        toolbar={view => <><Button variant="outline" size="sm" onClick={() => download(view.rows)}><Download />Download view</Button>{selectedModules.length > 0 && <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-muted-foreground">{selectedModules.length} selected</span><CopyButton value={selectedModules.map(item => item.importStatement).join("\n")} label="Copy selected imports" className="[&_button]:size-11" /><Button variant="ghost" size="sm" onClick={() => { setSelected([]); setNotice("Selection cleared."); feedback.current?.focus({ preventScroll: true }); }}><X />Clear selection</Button></div>}</>}
        empty={<div className="flex flex-col items-center gap-3 px-5 py-8 text-center"><SearchX aria-hidden className="size-8 stroke-[1.5] text-muted-foreground" /><p className="font-medium">No matching modules</p><p className="max-w-sm text-sm text-muted-foreground">Try another name or return to the full library.</p><Button variant="outline" onClick={clearFilters}>Clear filters</Button></div>} />
      <div ref={feedback} tabIndex={-1} role="status" aria-live="polite" className="mt-4 min-h-5 text-xs leading-relaxed text-muted-foreground outline-none">{notice}</div>
      <p className="mt-5 max-w-3xl border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">Package counts describe the registry’s dependency pins, including shared imports. They are not bundle-size measurements. Selection is kept when you change filters.</p>
    </ConsolePage>
    <SearchPalette sources={sources} placeholder="Find a component by name or purpose…" emptyHint="Try “dialog”, “upload recovery” or “workspace”." onSelect={result => { const item = moduleCatalog.find(item => item.id === result.id); if (item) openModule(item, true); }} />
    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-2xl" onOpenAutoFocus={event => { event.preventDefault(); detailHeading.current?.focus({ preventScroll: true }); }}
        onCloseAutoFocus={event => { event.preventDefault(); (opener.current?.isConnected && opener.current.getClientRects().length ? opener.current : heading.current)?.focus({ preventScroll: true }); }}>
        {current && <><DialogHeader><p className="mb-2 text-xs text-muted-foreground">{current.section}</p><DialogTitle ref={detailHeading} tabIndex={-1} className="text-2xl outline-none">{current.name}</DialogTitle><DialogDescription>{current.description}</DialogDescription></DialogHeader>
          <section className="min-w-0 rounded-xl border border-border bg-muted/40 p-4"><div className="mb-2 flex items-center justify-between gap-4"><h3 className="text-xs font-medium">Import from the shared package</h3><CopyButton value={current.importStatement} label={`Copy ${current.name} import`} className="[&_button]:size-11" /></div><pre className="overflow-x-auto pb-2 text-xs leading-relaxed"><code>{current.importStatement}</code></pre></section>
          <section><h3 className="text-sm font-medium">Registry dependencies</h3>{current.dependencies.length ? <ul className="mt-3 flex flex-wrap gap-2">{current.dependencies.map(dependency => <li key={dependency} className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground">{dependency}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No additional package pins in this registry item.</p>}</section>
          <div className="flex flex-wrap gap-2 border-t border-border pt-4"><Button asChild><a target="_top" href={`./?path=/story/${current.storyId}`}>Open live example<ArrowUpRight /></a></Button><Button variant="outline" asChild><a target="_blank" rel="noreferrer" href={`https://github.com/sass-maker/ui-library/blob/${current.sourceRef}/${current.sourcePath}`}>View source<ArrowUpRight /></a></Button></div>
          <a target="_blank" rel="noreferrer" href={`https://github.com/sass-maker/ui-library/blob/${current.sourceRef}/THIRD_PARTY_NOTICES.md`} className="inline-flex min-h-11 items-center text-xs text-muted-foreground underline underline-offset-4">Upstream provenance and license notices</a>
        </>}
      </DialogContent>
    </Dialog>
  </div>;
}
