import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowDownToLine, ArrowRight, ArrowUpRight, Palette, Pause, Play, Search } from 'lucide-react';
import { Button } from '@saas-maker/ui/atoms/button';
import { Input } from '@saas-maker/ui/atoms/input';
import { Badge } from '@saas-maker/ui/atoms/badge';
import { CopyButton } from '@saas-maker/ui/recipes/copy-button';
import { useReducedMotion } from '@saas-maker/ui/lib/use-reduced-motion';
import { motionTiming } from '@saas-maker/ui/lib/motion';
import { visualMaterials } from '@saas-maker/ui/lib/visual-materials';
import catalog from '@saas-maker/ui/visual-sources.json';

const meta = {
  title: 'Start here/Visual sources', tags: ['!autodocs'],
  parameters: { layout: 'fullscreen', docs: { description: { component: 'A curated visual source shelf, with original material studies and explicit reuse terms. Import the data from @saas-maker/ui/visual-sources.json.' } } },
} satisfies Meta;
export default meta;

const categories = ['All', 'Gradients', 'Photography', 'Video', 'Animation', 'Illustration', 'Pixel art', '3D', 'Textures', 'Patterns', 'Icons', 'Typography', 'Audio'];
const rights = catalog.rightsLabels;
type Rights = keyof typeof rights;

function downloadCatalog() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fleet-visual-sources.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function MaterialBench() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const material = visualMaterials[index];
  const moving = playing && !reduced && visible && index < 2;
  return <section aria-labelledby="material-heading" className="grid overflow-hidden rounded-2xl border border-border md:grid-cols-[1.3fr_1fr]">
    <div ref={ref} className="relative min-h-64 overflow-hidden bg-muted sm:min-h-80" data-testid="material-preview">
      {visualMaterials.map((item, i) => <motion.div key={item.id} aria-hidden className="absolute -inset-8" style={{ ...item.style, animation: i < 2 && !reduced ? 'material-light-drift 12s ease-in-out infinite' : undefined, animationPlayState: moving && i === index ? 'running' : 'paused' }}
        initial={false} animate={{ opacity: i === index ? 1 : 0 }} transition={motionTiming.content} />)}
      <div className="absolute inset-5 flex items-end justify-between gap-4"><span className="rounded-full border border-white/30 bg-black/70 px-3 py-1.5 font-mono text-xs text-white">{material.family}</span>
        {index < 2 && <Button variant="secondary" size="sm" disabled={reduced} aria-pressed={playing && !reduced} onClick={() => setPlaying(value => !value)}>{playing && !reduced ? <Pause /> : <Play />}{reduced ? 'Reduced motion' : playing ? 'Pause motion' : 'Play motion'}</Button>}
      </div>
    </div>
    <div className="flex flex-col p-6 sm:p-8">
      <p className="eyebrow mb-3">The material bench</p><h2 id="material-heading" className="font-display text-3xl">A little atmosphere.</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Original CSS studies, ready to use. Start still; add motion when it helps the story.</p>
      <div className="my-5 grid grid-cols-4 gap-2" aria-label="Choose a material">{visualMaterials.map((item, i) => <button type="button" key={item.id} onClick={() => setIndex(i)} aria-pressed={i === index} aria-label={item.name} className="group rounded-md p-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span style={item.style} className={`mb-2 block h-12 rounded-md border-2 transition-[border-color] duration-150 ${i === index ? 'border-foreground' : 'border-transparent group-hover:border-foreground/40'}`} /><span className="block text-[0.6875rem] leading-snug">{item.name}</span>
      </button>)}</div>
      <div className="mt-auto flex items-start justify-between gap-3 border-t border-border pt-4"><div><h3 className="text-sm font-semibold">{material.name}</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{material.description}</p></div><CopyButton value={material.css} label={`Copy ${material.name} CSS`} /></div>
      <details className="mt-3 text-xs text-muted-foreground"><summary className="w-fit cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">View CSS</summary><pre className="mt-3 whitespace-pre-wrap break-all rounded-lg bg-muted p-3 leading-relaxed">{material.css}</pre></details>
    </div>
  </section>;
}

export const SourceShelf: StoryObj = { render: function Render() {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [reuse, setReuse] = useState('all');
  const search = query.trim().toLocaleLowerCase();
  const sources = catalog.sources.filter(source =>
    (category === 'All' || source.categories.includes(category)) &&
    (reuse === 'all' || source.rights === reuse) &&
    `${source.name} ${source.categories.join(' ')} ${source.formats} ${source.license} ${source.bestFor} ${source.notes}`.toLocaleLowerCase().includes(search));
  return <main className="mx-auto max-w-[1280px] px-5 py-6 sm:px-10 sm:py-10 lg:px-14">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5"><a target="_top" href="./?path=/story/start-here-overview--explore" className="flex items-center gap-2 rounded-sm text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"><Palette aria-hidden className="size-4 text-brand" />Fleet UI / Visual sources</a><Button variant="ghost" size="sm" onClick={downloadCatalog}><ArrowDownToLine />Download source catalog</Button></header>
    <section className="grid gap-6 pb-9 pt-10 lg:grid-cols-[1.3fr_1fr] lg:items-end"><div><p className="eyebrow mb-4">A working collection</p><h1 className="font-display text-4xl leading-[1.08] sm:text-6xl">Good materials.<br /><em>Considered details.</em></h1></div><div><p className="max-w-md text-base leading-relaxed text-muted-foreground">Find the image, movement, texture, or tiny pixel world that belongs in your product.</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{catalog.sources.length} curated sources. Original links, useful formats, and explicit reuse notes. Reviewed {catalog.reviewedOn}.</p></div></section>
    <MaterialBench />
    <section aria-label="Reusable art samples" className="mt-5 grid gap-5 sm:grid-cols-2">
      <figure className="overflow-hidden rounded-xl border border-border"><div className="flex h-56 items-center justify-center bg-[#e5eadb] p-5"><img src="./visual/tiny-town-tiles.png" alt="Kenney Tiny Town tiles: trees, roofs, paths, characters and small village objects" width="192" height="176" className="h-44 w-48 object-contain [image-rendering:pixelated]" /></div><figcaption className="flex items-start justify-between gap-4 p-5"><div><h2 className="text-sm font-semibold">A tiny world, one tile at a time.</h2><p className="mt-1 text-xs text-muted-foreground">Tiny Town by Kenney · CC0 · original 16px tiles</p></div><a href="https://kenney.nl/assets/tiny-town" target="_blank" rel="noreferrer" aria-label="Open Kenney Tiny Town source" className="rounded-sm p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowUpRight aria-hidden className="size-4" /></a></figcaption></figure>
      <figure className="overflow-hidden rounded-xl border border-border"><div className="flex h-56 items-end justify-center bg-[#f1e7df] px-5 pt-5"><img src="./visual/peep-92.svg" alt="A hand-drawn person from the Open Peeps illustration library" width="240" height="324" className="h-48 w-auto object-contain" /></div><figcaption className="flex items-start justify-between gap-4 p-5"><div><h2 className="text-sm font-semibold">A face with a little character.</h2><p className="mt-1 text-xs text-muted-foreground">Open Peeps by Pablo Stanley · CC0</p></div><a href="https://www.openpeeps.com/" target="_blank" rel="noreferrer" aria-label="Open Open Peeps source" className="rounded-sm p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowUpRight aria-hidden className="size-4" /></a></figcaption></figure>
    </section>
    <p className="mt-3 text-[0.6875rem] text-muted-foreground">These two samples are hosted locally. <a href="./visual/SOURCES.json" target="_blank" rel="noreferrer" className="underline underline-offset-4">Download records, licenses and file hashes</a>.</p>
    <section aria-labelledby="sources-heading" className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-2">The source shelf</p><h2 id="sources-heading" className="font-display text-3xl">Choose your medium.</h2></div><p className="text-xs text-muted-foreground">A source directory. Individual assets stay with their creators.</p></div>
      <div className="mt-5 flex flex-wrap gap-1" aria-label="Filter by medium">{categories.map(value => <Button key={value} variant={category === value ? 'secondary' : 'ghost'} size="sm" aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</Button>)}</div>
      <div className="mt-5 grid gap-3 border-y border-border py-4 sm:grid-cols-[1fr_auto]">
        <div className="relative"><Search aria-hidden className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search visual sources" placeholder="Search sources, formats, licenses…" value={query} onChange={event => setQuery(event.target.value)} className="pl-9" /></div>
        <label className="flex items-center gap-3 text-xs text-muted-foreground">Reuse<select aria-label="Filter by reuse terms" value={reuse} onChange={event => setReuse(event.target.value)} className="h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="all">All terms</option><option value="redistributable">Open reuse</option><option value="end-product">Product use</option><option value="mixed">Free / paid</option><option value="per-asset">Per asset</option><option value="review">Needs review</option></select></label>
      </div>
      <p role="status" className="my-4 text-xs text-muted-foreground">{sources.length} {sources.length === 1 ? 'source' : 'sources'}{category !== 'All' ? ` · ${category}` : ''}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="source-results">{sources.map(source => <motion.article key={source.id} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={motionTiming.feedback} className="flex flex-col rounded-xl border border-border p-5 transition-colors duration-150 hover:border-foreground/30">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><span className="text-[0.6875rem] text-muted-foreground">{source.categories.join(' / ')}</span>{source.featured && <Badge variant="secondary">Start here</Badge>}</div>
        <h3 className="text-lg font-semibold"><a href={source.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-sm outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring">{source.name}<ArrowUpRight aria-hidden className="size-4 shrink-0 text-muted-foreground" /></a></h3>
        <p className="mt-2 text-sm leading-relaxed">{source.bestFor}</p><p className="mt-3 font-mono text-[0.6875rem] leading-relaxed text-muted-foreground">{source.formats}</p>
        <div className="mt-5 border-t border-border pt-4"><a href={source.licenseUrl} target="_blank" rel="noreferrer" className="text-xs font-medium underline decoration-border underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">{source.license}<span className="sr-only"> — {source.name} reuse terms</span></a><p className="mt-1 text-[0.6875rem] text-muted-foreground">{rights[source.rights as Rights]}</p><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{source.notes}</p></div>
      </motion.article>)}</div>
      {!sources.length && <div className="rounded-xl border border-dashed border-border px-5 py-12 text-center"><h3 className="font-display text-2xl">No materials on this shelf.</h3><p className="mt-2 text-sm text-muted-foreground">Try a broader term or reset the filters.</p><Button variant="outline" className="mt-5" onClick={() => { setQuery(''); setCategory('All'); setReuse('all'); }}>Reset filters<ArrowRight /></Button></div>}
    </section>
    <footer className="mt-10 grid gap-5 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground sm:grid-cols-3"><p><strong className="text-foreground">Keep a source record.</strong><br />Save the exact item URL, creator, license, download date and any attribution alongside each imported asset.</p><p><strong className="text-foreground">Give motion a reason.</strong><br />Use a poster or still fallback, pause offscreen, respect reduced motion, and keep sound off by default.</p><p><strong className="text-foreground">One visual language.</strong><br />Match palette, grain, lighting and icon weight across the landing page, onboarding and app.</p></footer>
  </main>;
} };
