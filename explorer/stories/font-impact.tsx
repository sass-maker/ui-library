import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@saas-maker/ui/atoms/button';
import { Input } from '@saas-maker/ui/atoms/input';
import { fontFaces } from '@saas-maker/ui/lib/typography';

const families = [
  { name: 'Figtree', family: '"Figtree Variable", ui-sans-serif, system-ui, sans-serif', fallback: 'ui-sans-serif, system-ui, sans-serif', role: 'Interface / humanist sans', note: 'Starboard’s shared interface face. Look at how labels and repository descriptions scan at a compact size.' },
  { name: 'Geist', family: '"Geist Variable", ui-sans-serif, system-ui, sans-serif', fallback: 'ui-sans-serif, system-ui, sans-serif', role: 'Interface / neutral sans', note: 'An alternative already in the library. Compare character shapes and rhythm, rather than assuming similar sans families are interchangeable.' },
  { name: 'Newsreader', family: '"Newsreader Text", Georgia, serif', fallback: 'Georgia, serif', role: 'Reading / text serif', note: 'A text cut for reading. The library also has a separate Newsreader Display cut for large headings; they serve different roles.' },
  { name: 'Instrument Sans', family: fontFaces['instrument-sans'], fallback: 'ui-sans-serif, system-ui, sans-serif', role: 'Interface / editorial sans', note: 'A more distinctive editorial interface. Real upright and italic variable faces are included.' },
  { name: 'Manrope', family: fontFaces.manrope, fallback: 'ui-sans-serif, system-ui, sans-serif', role: 'Interface / geometric sans', note: 'An open, calm geometric voice. Upright only: pair with a real serif italic rather than synthesizing one.' },
  { name: 'Bricolage Grotesque', family: fontFaces['bricolage-grotesque'], fallback: 'ui-sans-serif, system-ui, sans-serif', role: 'Display / expressive grotesque', note: 'Distinctive shapes and optical sizing give large headlines character. Prefer a quieter face for dense interface text; upright only.' },
  { name: 'IBM Plex Sans', family: fontFaces['ibm-plex-sans'], fallback: 'ui-sans-serif, system-ui, sans-serif', role: 'Interface / technical humanist', note: 'A precise voice for product tools. Both real upright and italic variable faces are included.' },
  { name: 'Fraunces', family: fontFaces.fraunces, fallback: 'Georgia, serif', role: 'Display / soft serif', note: 'A warm display accent for short headings. The library pins its SOFT axis; use Newsreader Text for sustained reading.' },
  { name: 'Instrument Serif', family: fontFaces['instrument-serif'], fallback: 'Georgia, serif', role: 'Display / editorial serif', note: 'A narrow, elegant counterpoint. A genuine 400 regular and italic are included; do not request a synthetic semibold.' },
  { name: 'Geist Mono', family: '"Geist Mono Variable", ui-monospace, monospace', fallback: 'ui-monospace, monospace', role: 'Code / fixed-width', note: 'Useful for code, identifiers and aligned data. Compare how much space the same prose and action label consume.' },
];
const copy = 'Starboard finds open-source tools that fit your project. Compare similar repositories, inspect the source evidence, and keep the tools you want to use again.';

function FontSample({ font, fallback, tabular }: { font: typeof families[number]; fallback: boolean; tabular: boolean }) {
  const paragraph = useRef<HTMLParagraphElement>(null);
  const action = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<{ lines: number; button: number }>();
  useEffect(() => {
    let disposed = false;
    const measure = () => {
      if (disposed || !paragraph.current || !action.current) return;
      const range = document.createRange();
      range.selectNodeContents(paragraph.current);
      const lines = new Set([...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top))).size;
      const button = Math.round(action.current.querySelector('button')?.getBoundingClientRect().width ?? 0);
      setMetrics(current => current?.lines === lines && current.button === button ? current : { lines, button });
    };
    const observer = new ResizeObserver(measure);
    if (paragraph.current) observer.observe(paragraph.current);
    document.fonts.ready.then(measure);
    return () => { disposed = true; observer.disconnect(); };
  }, [fallback]);
  return <article className="row-span-3 grid min-w-0 grid-rows-subgrid gap-0 overflow-hidden rounded-xl border border-border bg-card">
    <header className="border-b border-border p-5"><p className="eyebrow mb-2">{font.role}</p><h2 className="text-xl font-semibold">{font.name}</h2></header>
    <div className="p-5" style={{ fontFamily: fallback ? font.fallback : font.family, fontFeatureSettings: "normal", fontSynthesisWeight: font.name === "Instrument Serif" ? "none" : undefined }} data-testid="font-specimen">
      <p style={{ fontWeight: font.name === 'Instrument Serif' ? 400 : 600 }} className="text-[2rem] leading-[1.2] tracking-[-.015em]">Tools that fit<br />your project.</p>
      <p ref={paragraph} className="mt-5 max-w-[65ch] text-base font-normal leading-[1.6] tracking-normal">{copy}</p>
      <div ref={action} className="mt-5"><Button variant="outline" className="max-w-full whitespace-normal">Preview project<ArrowRight /></Button></div>
      <label className="mt-5 block text-sm font-medium">Public repository<Input className="mt-2" defaultValue="vercel/next.js" /></label>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-lg leading-relaxed" role="group" style={{ fontVariantNumeric: tabular ? 'tabular-nums' : 'proportional-nums' }} aria-label={`${font.name} numeral comparison`}><span>1,111,111</span><span>8,888,888</span><span>00:11:11</span><span>08:58:08</span></div>
      <p className="mt-3 text-base leading-relaxed">Il1 · O0 · rn m · @ # &amp;</p>
    </div>
    <footer className="border-t border-border p-5"><p className="font-mono text-xs tabular-nums" data-testid="font-measurement">{metrics ? `${metrics.lines} body lines · ${metrics.button}px button` : 'Measuring after font load…'}</p><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{font.note}</p></footer>
  </article>;
}

export function FontImpactBench() {
  const [fallback, setFallback] = useState(false);
  const [tabular, setTabular] = useState(true);
  return <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-10 sm:py-12">
    <header className="max-w-3xl"><p className="eyebrow mb-4">The typography bench</p><h1 className="font-display text-4xl sm:text-5xl">The same words.<br /><em>A different experience.</em></h1><p className="mt-5 max-w-[65ch] text-base leading-[1.6] text-muted-foreground">Typeface changes voice and geometry. Compare the same product copy at the same size, weight, and line height. Resize the viewport to see wrapping change.</p></header>
    <div className="my-7 flex flex-wrap gap-3"><Button variant="outline" aria-pressed={fallback} onClick={() => setFallback(value => !value)}>System fallbacks {fallback ? 'on' : 'off'}</Button><Button variant="outline" aria-pressed={tabular} onClick={() => setTabular(value => !value)}>Tabular numbers {tabular ? 'on' : 'off'}</Button></div>
    <p className="mb-5 text-xs leading-relaxed text-muted-foreground">Body: 1rem / 1.6 / 400. Heading: 2rem / 1.2 / 600 (Instrument Serif: its real 400). Button: the same shared component. Measurements use this browser’s rendered layout; they are not quality scores.</p>
    <section aria-label="Font comparisons" className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{families.map(font => <FontSample key={font.name} font={font} fallback={fallback} tabular={tabular} />)}</section>
    <section aria-label="Choosing type by role" className="mt-8 grid gap-5 border-t border-border pt-6 text-sm leading-[1.6] text-muted-foreground sm:grid-cols-3"><p><strong className="text-foreground">Identity and hierarchy.</strong><br />Use a distinctive display role where it helps the product’s voice, with a consistent interface face for controls and dense lists.</p><p><strong className="text-foreground">Readability and fit.</strong><br />Check real copy, long names, 200% zoom, language coverage and full text recovery. Keep mobile inputs at 16px to avoid focus zoom.</p><p><strong className="text-foreground">Delivery and stability.</strong><br />Load the weights and styles you use, compare system fallbacks, and reserve tabular numerals for changing values. Self-hosted subsets keep font requests on the product’s origin.</p></section>
  </main>;
}
