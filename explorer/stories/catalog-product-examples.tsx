import { useEffect, useState } from "react";
import { ArrowRight, FileCode2, ImageIcon, Layers3, ScanLine } from "lucide-react";
import { BentoCard, BentoGrid } from "@saas-maker/ui/effects/bento-grid";
import { Badge } from "@saas-maker/ui/components/badge";
import { Button } from "@saas-maker/ui/components/button";
import { EmptyState } from "@saas-maker/ui/components/empty-state";
import { Skeleton } from "@saas-maker/ui/components/skeleton";
import { CodeBlock, DiffBlock, Ledger, StatusPill } from "@saas-maker/ui/blocks/proof";
import { QuoteList, type QuoteItem } from "@saas-maker/ui/blocks/quote-list";
import { KeyValueList, Provenance, RecordDetail, RecordLayout, useMediaQuery } from "@saas-maker/ui/blocks/record-detail";
import { ResourceBoundary } from "@saas-maker/ui/blocks/resource-boundary";

const codeVetterReadme = "https://github.com/Codevetter/codevetter/blob/efb6744aaf0a229f6e0d24aac61bffaad636477e/README.md";

export function CodeVetterCapabilityGrid() {
  return <section className="w-full max-w-5xl space-y-8">
    <header className="max-w-2xl">
      <p className="eyebrow mb-4 text-brand-ink">CodeVetter / A review is a starting point</p>
      <h2 className="font-display text-3xl sm:text-4xl">Keep the finding.<br /><em className="text-brand-ink">Show the proof.</em></h2>
      <p className="mt-5 text-base leading-relaxed text-muted-foreground">Inspect the changed line, exercise the behavior, and keep the evidence beside the finding.</p>
    </header>
    <BentoGrid className="auto-rows-auto md:grid-cols-1 lg:grid-cols-3">
      <BentoCard className="col-span-1 lg:col-span-2" Icon={FileCode2} name="Start at the changed line" description="Read a finding in the context of the diff. Its severity and explanation are a lead to investigate." href={codeVetterReadme} cta="Explore the review workflow" background={<figure className="border-b border-border bg-[#111111] px-5 pt-5"><img src="./demo/codevetter/workbench.png" width={1440} height={900} alt="Actual CodeVetter change-review interface with a finding beside its diff" className="h-40 w-full rounded-t-lg object-cover object-top" /><figcaption className="sr-only">Actual CodeVetter interface. Findings remain unverified until checked.</figcaption></figure>} />
      <BentoCard className="col-span-1 lg:col-span-1" Icon={ScanLine} name="Keep the evidence distinct" description="A model finding, a reproduced failure and a verified repair are different states." href={`${codeVetterReadme}#product-direction`} cta="Read the principles" background={<div className="border-b border-border bg-surface px-6 py-5"><p className="mb-3 font-mono text-[0.6875rem] uppercase tracking-widest text-muted-foreground">An evidence trail</p><ol className="space-y-2 text-sm"><li className="flex items-center gap-3"><span className="font-mono text-xs text-muted-foreground">01</span>Inspect the change</li><li className="flex items-center gap-3"><span className="font-mono text-xs text-muted-foreground">02</span>Run the relevant check</li><li className="flex items-center gap-3"><span className="font-mono text-xs text-muted-foreground">03</span>Preserve the result</li></ol></div>} />
    </BentoGrid>
    <p className="text-xs leading-relaxed text-muted-foreground">An actual product screen and its documented workflow. The diagram describes a process; it contains no live review results.</p>
  </section>;
}

export function VerifiedSizingContext() {
  return <section className="w-full max-w-5xl space-y-8">
    <header className="max-w-2xl">
      <StatusPill tone="neutral">Actual UI library correction</StatusPill>
      <h2 className="mt-5 font-display text-3xl sm:text-4xl">A small change.<br /><em className="text-brand-ink">A visible difference.</em></h2>
      <p className="mt-5 text-base leading-relaxed text-muted-foreground">On a touch-sized tab bar, an equal-width tab was narrower than its label. Content-based sizing restored the inset while keeping the 44px target.</p>
    </header>
    <div className="grid items-start gap-5 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-5">
        <DiffBlock file="components/tabs.tsx · flex utility excerpt" lines={[
          { kind: "del", text: "flex-1", note: "Equal shares compressed the longer Components label." },
          { kind: "add", text: "flex-auto", note: "The label contributes its intrinsic width before remaining space is shared." },
        ]} />
        <CodeBlock label="Focused regression command" code={'pnpm test:browser --grep "tab labels fit inside their indicators"'} />
      </div>
      <Ledger title="Measured at 390px" meta="Chromium · touch" rows={[
        { label: "Label", value: "83.36px" },
        { label: "Before", value: "77.25px tab width", status: { tone: "warning", label: "Too narrow" } },
        { label: "After", value: "101.36px tab width", status: { tone: "success", label: "Fits" } },
        { label: "Touch height", value: "44px retained" },
        { label: "Keyboard", value: "Arrow selection and focus retained" },
      ]} footer="Captured browser geometry for this committed correction. These values describe this example, not a performance benchmark." />
    </div>
    <a href="https://github.com/sass-maker/ui-library/commit/644e8a68fccfa9811bbfafa3b7d2bb4e59f8f453" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">Read the committed correction<ArrowRight aria-hidden className="size-4" /></a>
  </section>;
}

// Verbatim excerpts from the pinned public README, not testimonials.
const productNotes: QuoteItem[] = [
  { id: "evidence", quote: "Verify AI-generated code with execution evidence, not another LLM opinion.", speaker: { verified: true, name: "CodeVetter documentation" }, source: { label: "README / Introduction", href: codeVetterReadme }, type: "Product principle" },
  { id: "scope", quote: 'The product should prefer narrow, evidence-backed loops over broad "code intelligence" surfaces.', speaker: { verified: true, name: "CodeVetter documentation" }, source: { label: "README / Product direction", href: `${codeVetterReadme}#product-direction` }, type: "Scope" },
  { id: "questions", quote: "What changed, why did the agent change it, what could break, can we reproduce it, did the fix actually work, and did the affected audience succeed with it?", speaker: { verified: true, name: "CodeVetter documentation" }, source: { label: "README / Product direction", href: `${codeVetterReadme}#product-direction` }, type: "Review questions" },
];

export function ProductNotesListExample() {
  return <QuoteList label="CodeVetter documentation excerpts" items={productNotes} className="w-full max-w-3xl" />;
}

export function ProductNotesContext() {
  const [selectedId, setSelectedId] = useState(productNotes[0].id);
  const selected = productNotes.find(note => note.id === selectedId)!;
  return <section className="w-full max-w-5xl">
    <header className="mb-8 max-w-2xl"><p className="eyebrow mb-4 text-brand-ink">Reading notes / CodeVetter</p><h2 className="font-display text-3xl sm:text-4xl">Keep the words.<br /><em className="text-brand-ink">Keep the source.</em></h2><p className="mt-5 leading-relaxed text-muted-foreground">Three verbatim excerpts from the product documentation. Choose one to read it in focus, with its original source one step away.</p></header>
    <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
      <QuoteList label="CodeVetter product notes" items={productNotes} selectedId={selectedId} onOpen={item => setSelectedId(item.id)} />
      <aside aria-label="Selected excerpt" aria-live="polite" className="rounded-xl border border-border bg-surface p-6 sm:p-8"><p className="eyebrow mb-5 text-muted-foreground">Selected excerpt</p><blockquote className="font-display text-2xl leading-snug">“{selected.quote}”</blockquote><p className="mt-6 text-xs text-muted-foreground">CodeVetter documentation · {selected.type}</p><a href={selected.source!.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">Read the original text<ArrowRight aria-hidden className="size-4" /></a></aside>
    </div>
  </section>;
}

const releaseArtwork = [
  { id: "coast", name: "The long way home", file: "coastal-walk-v2.webp", kind: "Artwork", width: 760, height: 507, alt: "Two people walking along the coast in Kith’s original artwork" },
  { id: "memory", name: "Keep the small things", file: "memory-table-v2.webp", kind: "Artwork", width: 1536, height: 1024, alt: "Kith memory book with a photograph and coffee" },
  { id: "constellation", name: "Your constellation", file: "constellation.webp", kind: "Actual screen", width: 603, height: 1311, alt: "Actual Kith constellation interface with warm lanterns" },
];

export function ReleaseArtworkContext() {
  const desktop = useMediaQuery("(min-width: 1024px)");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "empty" | "error">("success");
  useEffect(() => { if (desktop) setSelectedId(current => current ?? releaseArtwork[0].id); }, [desktop]);
  const selected = releaseArtwork.find(item => item.id === selectedId);
  return <section className="w-full max-w-6xl space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow mb-3 text-brand-ink">Kith / Release artwork</p><h2 className="font-display text-3xl">The next chapter.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Review original artwork and actual screens with their dimensions and source attached.</p></div><Badge variant="outline">Local example collection</Badge></header>
    <div role="group" aria-label="Example data state" className="flex flex-wrap gap-2">{([['success', 'Ready'], ['loading', 'Loading'], ['empty', 'Empty'], ['error', 'Error']] as const).map(([value, label]) => <Button key={value} size="sm" variant={status === value ? "default" : "outline"} aria-pressed={status === value} onClick={() => setStatus(value)}>{label}</Button>)}</div>
    <ResourceBoundary delay={0} resource={{ status, data: status === "success" ? releaseArtwork : undefined, error: status === "error" ? new Error("Example collection unavailable") : undefined, isRevalidating: false, retry: async () => setStatus("success") }} skeleton={<div aria-label="Loading release artwork" className="space-y-3 rounded-xl border border-border bg-card p-5">{[0, 1, 2].map(index => <div key={index} className="flex gap-4"><Skeleton className="size-16 shrink-0 rounded-lg" /><div className="flex-1 space-y-3 py-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div></div>)}</div>} empty={<EmptyState title="A new collection starts here" description="Restore the local example collection to inspect its artwork." primaryAction={<Button variant="outline" onClick={() => setStatus("success")}>Restore example artwork</Button>} />}>
      {items => <RecordLayout className="w-full"><div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-card"><div className="flex items-center gap-2 border-b border-border px-5 py-4 text-sm font-medium"><Layers3 aria-hidden className="size-4 text-muted-foreground" />Original media</div><ul className="divide-y divide-border">{items.map(item => <li key={item.id}><button type="button" aria-label={`Inspect ${item.name}`} aria-current={selectedId === item.id || undefined} onClick={event => { event.currentTarget.focus({ preventScroll: true }); setSelectedId(item.id); }} className="flex min-h-24 w-full items-center gap-4 px-4 py-4 text-left outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring aria-[current=true]:bg-brand-soft/40 sm:px-5"><img src={`./demo/kith/${item.file}`} alt="" width={64} height={64} className="size-16 shrink-0 rounded-lg object-cover" /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{item.name}</span><span className="mt-1 block text-xs text-muted-foreground">{item.kind} · {item.width} × {item.height}</span></span><ArrowRight aria-hidden className="size-4 shrink-0 text-muted-foreground" /></button></li>)}</ul></div><RecordDetail open={!!selected} onOpenChange={open => { if (!open) setSelectedId(null); }} title={selected?.name ?? "Artwork"} subtitle={selected?.kind}>{selected && <><figure className="rounded-xl border border-border bg-surface p-2"><img src={`./demo/kith/${selected.file}`} alt={selected.alt} width={selected.width} height={selected.height} className="max-h-72 w-full rounded-lg object-contain" /></figure><KeyValueList align="start" items={[{ label: "File", value: selected.file }, { label: "Dimensions", value: `${selected.width} × ${selected.height}px` }, { label: "Format", value: "WebP" }]} /><Provenance info={{ source: "UI library / Kith demo", url: "https://github.com/sass-maker/ui-library/tree/main/site/public/demo/kith", note: "Original Kith media retained with the library. Replace demo artwork with assets licensed for your product." }} /></>}</RecordDetail></RecordLayout>}
    </ResourceBoundary>
    <p className="text-xs leading-relaxed text-muted-foreground"><ImageIcon aria-hidden className="mr-1.5 inline size-3.5" />Choose an artwork row to inspect it. On phones the detail opens as a bottom sheet.</p>
  </section>;
}
