import { useId, useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { ResponsiveImage } from "@saas-maker/ui/atoms/responsive-image";
import { AssetLibrary } from "@saas-maker/ui/organisms/asset-library";
import { CopyButton } from "@saas-maker/ui/recipes/copy-button";
import { fontFaces, fontPairings } from "@saas-maker/ui/lib/typography";
import { fontOverrides } from "../../packages/templates/src/fonts";
import { sampleFiles } from "./composition-fixtures";

export function FontPairingBench() {
  const [selected, setSelected] = useState(0);
  const pairing = fontPairings[selected];
  const preview = useId();
  const variables = { ...fontOverrides(pairing.fonts), "--font-mono": '"Geist Mono Variable", ui-monospace, monospace' };
  const config = JSON.stringify({ fonts: pairing.fonts }, null, 2);
  const css = `:root {\n${Object.entries(variables).map(([key, value]) => `  ${key}: ${value};`).join('\n')}\n}`;
  return <main className="mx-auto max-w-[1360px] px-5 py-8 sm:px-10 sm:py-12">
    <header className="max-w-3xl"><p className="eyebrow mb-4">Type, with a point of view</p><h1 className="font-display text-4xl leading-[1.12] sm:text-5xl">A voice for the story.<br /><em>A rhythm for the product.</em></h1><p className="mt-5 max-w-[65ch] text-base leading-[1.6] text-muted-foreground">Four free, open-source pairings. The same Kith landing and working asset library, so you can judge the headline, controls, long filenames, and reading rhythm together.</p></header>
    <div role="group" aria-label="Choose a font pairing" className="my-8 grid grid-cols-2 gap-3 xl:grid-cols-4">{fontPairings.map((item, index) => <button key={item.id} type="button" aria-pressed={selected === index} aria-controls={preview} onClick={() => setSelected(index)} className={`min-w-0 rounded-xl border p-4 text-left outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring motion-reduce:transition-none ${selected === index ? 'border-foreground bg-accent' : 'border-border bg-card hover:bg-surface'}`}><span className="block text-lg font-semibold" style={{ fontFamily: fontFaces[item.fonts.display], fontWeight: item.fonts.display === 'newsreader' ? 500 : 600 }}>{item.name}</span><span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{item.label}</span></button>)}</div>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">{pairing.label}</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{pairing.description}</p></div><p className="text-xs text-muted-foreground">Self-hosted · SIL Open Font License 1.1</p></div>
    <div id={preview} data-testid="font-pairing-preview" data-pairing={pairing.id} style={{ ...variables, fontFamily: 'var(--font-sans)', fontFeatureSettings: 'normal' } as CSSProperties}>
      <section aria-label="Kith landing preview" className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12"><p className="mb-10 text-sm font-semibold tracking-wide">kith<span aria-hidden className="text-muted-foreground"> / </span><span className="font-normal text-muted-foreground">People, remembered.</span></p><h3 data-testid="pairing-headline" className="font-display text-[clamp(2.5rem,4.5vw,4.5rem)] leading-[1.08] tracking-[-.02em]">A few things<br /><em>worth keeping.</em></h3><p className="mt-6 max-w-[42ch] text-base leading-[1.65]">The photograph, the coffee, the story behind it. A little space for the people and moments you want to come back to.</p><Button asChild className="mt-7 w-fit"><a href={`#${preview}-library`}>Explore the collection<ArrowRight aria-hidden /></a></Button><p className="mt-7 text-xs leading-relaxed text-muted-foreground">Original Kith artwork. The words and layout stay the same as you switch type.</p></div>
        <ResponsiveImage src="./demo/kith/coastal-walk-v2.webp" alt="Two people walking along Kith’s illustrated coastal path" width={760} height={790} loading="eager" className="aspect-[4/3] min-w-0 w-full rounded-none lg:aspect-auto lg:min-h-[34rem]" style={{ aspectRatio: undefined }} imageClassName="object-cover" />
      </section>
      <div id={`${preview}-library`} className="mt-6 scroll-mt-6"><AssetLibrary state={{ kind: 'ready', files: sampleFiles }} title="Your collection" description="The artwork, notes, and memories behind your next story." /></div>
    </div>
    <section aria-label="Use this pairing" className="mt-8 grid gap-5 lg:grid-cols-2">
      {[{ title: 'Content-driven pages', code: config, label: 'Copy page font configuration' }, { title: 'React and CSS applications', code: css, label: 'Copy font role CSS' }].map(item => <div key={item.title} className="min-w-0 overflow-hidden rounded-xl border border-border bg-card"><div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3"><h2 className="text-sm font-medium">{item.title}</h2><CopyButton value={item.code} label={item.label} /></div><pre className="overflow-x-auto p-5 text-xs leading-relaxed"><code>{item.code}</code></pre></div>)}
    </section>
    <p className="mt-6 max-w-[75ch] text-sm leading-[1.6] text-muted-foreground">Import the shared theme once. Only the faces your page renders are downloaded. Keep one pairing across the landing and app; use the mono role for identifiers. Manrope and Bricolage ship upright styles here, so their pairings use a real italic serif or an upright accent. Bundled font licenses are in <code className="text-xs">@saas-maker/ui/fonts/licenses/</code>.</p>
  </main>;
}
