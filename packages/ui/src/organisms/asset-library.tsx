"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { FolderOpen, Grid2X2, List, SearchX, X, ImageIcon, FileText, ArrowUpRight } from "lucide-react";
import { Button } from "../components/button";
import { ResponsiveImage } from "../components/responsive-image";
import { Badge } from "../components/badge";
import { Skeleton } from "../components/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/dialog";
import { SearchField } from "../molecules/search-field";
import { FileCard, type LibraryFile } from "../molecules/file-card";
import { TransitionPanel } from "../recipes/transition-panel";
import { motionTiming } from "../lib/motion";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";

export type AssetLibraryState =
  | { kind: "ready"; files: readonly LibraryFile[] }
  | { kind: "loading" }
  | { kind: "error"; message: string; onRetry: () => void };

export type AssetLibraryProps = {
  state: AssetLibraryState;
  title?: string;
  description?: string;
  action?: ReactNode;
  /** Omit repeated page chrome when the host already supplies a heading. */
  showHeader?: boolean;
  onRemove?: (ids: string[]) => void;
  className?: string;
};

export function AssetLibrary({ state, title = "Asset library", description = "A home for the files behind your next release.", action, showHeader = true, onRemove, className }: AssetLibraryProps) {
  const reduced = useReducedMotion();
  const opener = useRef<HTMLButtonElement | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const region = useRef<HTMLElement>(null);
  const focusLibrary = () => { const target = heading.current ?? region.current; if (target?.getClientRects().length) target.focus({ preventScroll: true }); };
  const focusFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(focusFrame.current), []);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [collection, setCollection] = useState("All files");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<string | null>(null);
  const files = state.kind === "ready" ? state.files : [];
  const selectedFiles = files.filter(file => selected.has(file.id));
  const previewFile = files.find(file => file.id === preview);
  const collections = ["All files", ...new Set(files.map(file => file.collection))];
  const currentCollection = collections.includes(collection) ? collection : "All files";
  const visible = useMemo(() => files.filter(file => (currentCollection === "All files" || file.collection === currentCollection) && file.name.toLowerCase().includes(query.trim().toLowerCase())), [files, currentCollection, query]);
  const remove = (ids: string[]) => {
    onRemove?.(ids);
    setSelected(previous => new Set([...previous].filter(id => !ids.includes(id))));
    // A modal action menu must release its focus trap before we restore focus.
    cancelAnimationFrame(focusFrame.current);
    focusFrame.current = requestAnimationFrame(focusLibrary);
  };
  const select = (id: string, value: boolean) => setSelected(previous => {
    const next = new Set(previous);
    if (value) next.add(id); else next.delete(id);
    return next;
  });
  return <section ref={region} tabIndex={-1} className={cn("@container overflow-hidden rounded-2xl border border-border bg-card text-card-foreground outline-none", className)} aria-label={title}>
    {showHeader && <header className="flex flex-wrap items-start justify-between gap-5 border-b border-border px-5 py-6 sm:px-8">
      <div><div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground"><FolderOpen aria-hidden className="size-3.5" />Workspace / Library</div>
        <h2 ref={heading} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none">{title}</h2><p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{description}</p></div>
      {action && <div className="sm:pt-6">{action}</div>}
    </header>}
    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
      {!showHeader && action && <div className="flex w-full justify-end">{action}</div>}
      <div className="flex max-w-full gap-1 overflow-x-auto" aria-label="Collections">
        {collections.map(item => <button type="button" key={item} aria-pressed={currentCollection === item} onClick={() => setCollection(item)}
          className={cn("relative min-h-11 shrink-0 rounded-md px-3 py-2 text-[0.8125rem] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", currentCollection === item ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground")}>{item}</button>)}
      </div>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <SearchField label="Search files" value={query} onValueChange={setQuery} placeholder="Search files…" className="min-w-0 flex-1 sm:w-56" />
        <div className="flex shrink-0 rounded-lg border border-border bg-background p-1" aria-label="File view">
          <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon-sm" aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")}><Grid2X2 /></Button>
          <Button variant={view === "list" ? "secondary" : "ghost"} size="icon-sm" aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")}><List /></Button>
        </div>
      </div>
    </div>
    <div className="px-5 pb-6 sm:px-8 sm:pb-8">
      <AnimatePresence initial={false}>
        {selectedFiles.length > 0 && <motion.div initial={{ opacity: 0, height: reduced ? undefined : 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: reduced ? undefined : 0 }} transition={motionTiming.content} className="overflow-hidden">
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
            <span className="mr-auto text-sm font-medium" role="status">{selectedFiles.length} selected</span>
            {onRemove && <Button variant="ghost" size="sm" onClick={() => remove(selectedFiles.map(file => file.id))}>Remove selected</Button>}
            <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={() => { focusLibrary(); setSelected(new Set()); }}><X /></Button>
          </div>
        </motion.div>}
      </AnimatePresence>
      <TransitionPanel activeIndex={state.kind === "loading" ? 0 : state.kind === "error" ? 1 : visible.length === 0 ? 2 : 3}>{[
        <div role="status" aria-label="Loading files" className="grid grid-cols-1 gap-4 @min-[420px]:grid-cols-2 @min-[900px]:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="overflow-hidden rounded-xl border border-border"><Skeleton className="aspect-[4/3] rounded-none" /><div className="space-y-2 p-4"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-2.5 w-1/2" /></div></div>)}</div>,
        state.kind === "error" ? <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center" role="alert"><FolderOpen aria-hidden className="mb-2 size-9 stroke-1 text-muted-foreground" /><h3 className="font-medium">Files couldn’t be loaded</h3><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{state.message}</p><Button variant="outline" onClick={() => { focusLibrary(); state.onRetry(); }}>Try again</Button></div> : null,
        <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center"><SearchX aria-hidden className="mb-2 size-9 stroke-1 text-muted-foreground" /><h3 className="font-medium">{query ? "No matching files" : "Room for your next idea"}</h3><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{query ? `No files match “${query}”. Try another name or collection.` : "Add your first file to start building a shared library."}</p>{(query || currentCollection !== "All files") && <Button variant="outline" onClick={() => { focusLibrary(); setQuery(""); setCollection("All files"); }}>Clear filters</Button>}</div>,
        <LayoutGroup><motion.div layout={!reduced} className={view === "grid" ? "grid grid-cols-1 gap-4 @min-[420px]:grid-cols-2 @min-[900px]:grid-cols-3" : "grid gap-2"}>
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map(file => <motion.div key={file.id} layout={!reduced ? "position" : false} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={motionTiming.feedback}>
              <FileCard file={file} selected={selected.has(file.id)} onSelectedChange={value => select(file.id, value)} onOpen={trigger => { opener.current = trigger; setPreview(file.id); }} onRemove={onRemove ? () => remove([file.id]) : undefined} view={view} />
            </motion.div>)}
          </AnimatePresence>
        </motion.div></LayoutGroup>,
      ]}</TransitionPanel>
      {state.kind === "ready" && <p className="mt-5 text-xs text-muted-foreground" role="status">{visible.length} of {files.length} files</p>}
    </div>
    <Dialog open={!!previewFile} onOpenChange={open => { if (!open) setPreview(null); }}>
      <DialogContent onCloseAutoFocus={event => { event.preventDefault(); (opener.current?.isConnected ? opener.current : heading.current ?? region.current)?.focus({ preventScroll: true }); }} className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-2xl">
        {previewFile && <><DialogHeader><DialogTitle className="break-words pr-6">{previewFile.name}</DialogTitle><DialogDescription>{previewFile.collection} <span aria-hidden>·</span> {previewFile.size}</DialogDescription></DialogHeader>
          <div className="mt-3 flex min-h-48 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
            {previewFile.preview ? <ResponsiveImage src={previewFile.preview} alt={previewFile.name} width={960} height={600} className="max-h-[55dvh] w-full" imageClassName="object-contain" /> : <FileText aria-hidden className="size-14 stroke-1 text-muted-foreground" />}
          </div><div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><span>Updated {previewFile.updated}</span><Badge variant="outline">{previewFile.kind === "image" ? <ImageIcon /> : <FileText />}{previewFile.kind}</Badge></div>
          {previewFile.preview && <Button variant="outline" asChild><a href={previewFile.preview} target="_blank" rel="noreferrer">Open original<ArrowUpRight /></a></Button>}</>}
      </DialogContent>
    </Dialog>
  </section>;
}
