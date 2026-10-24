import { useId, useState, type CSSProperties } from "react";
import { ArrowDown, Check } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { GalleryEditorial } from "@saas-maker/ui/blocks/gallery";
import { AssetLibrary } from "@saas-maker/ui/organisms/asset-library";
import { CopyButton } from "@saas-maker/ui/recipes/copy-button";
import { fontFaces, fontPairings } from "@saas-maker/ui/lib/typography";
import { fontOverrides } from "../../packages/templates/src/fonts";
import { sampleFiles } from "./composition-fixtures";
import "./font-pairings.css";

// Illustrative excerpts supplied with the fixtures, never fetched from a private document.
const pairingFiles = sampleFiles.map(file => ({
  ...file,
  previewFit: file.id === 'sky' || file.id === 'book' ? 'contain' as const : 'cover' as const,
  previewFocalPoint: '50% 50%',
  previewText: file.id === 'notes' ? 'Release notes\n\nA quieter place for the people and moments you want to remember.\n\nPhotography, notes, and stories, together.' : file.id === 'brief' ? 'The next chapter\n\nKeep the small things close. The photograph from that walk. A note from an old friend. The story behind it.' : undefined,
}));

export function FontPairingBench() {
  const [selected, setSelected] = useState(0);
  const pairing = fontPairings[selected];
  const preview = useId();
  const variables = { ...fontOverrides(pairing.fonts), "--font-mono": '"Geist Mono Variable", ui-monospace, monospace' };
  const config = JSON.stringify({ fonts: pairing.fonts }, null, 2);
  const css = ":root {\n" + Object.entries(variables).map(([key, value]) => "  " + key + ": " + value + ";").join("\n") + "\n}";

  return <main className="type-studio">
    <header className="type-studio-heading">
      <div><p className="type-overline">The typography edit</p><h1>Good type.<br /><span className="text-muted-foreground">A different feeling.</span></h1></div>
      <p>Four considered pairings. One landing page and a working collection. Find the voice that fits, then take it into your product.</p>
    </header>
    <div role="group" aria-label="Choose a font pairing" className="type-choices">
      {fontPairings.map((item, index) => <button
        key={item.id} type="button" aria-pressed={selected === index} aria-controls={preview}
        aria-label={item.name + " · " + item.label} onClick={() => setSelected(index)}
        className="type-choice" style={{ fontFamily: fontFaces[item.fonts.display], '--specimen-weight': item.id === 'expressive' ? 700 : 500 } as CSSProperties}
      >
        <span className="type-choice-top"><span className="type-choice-name">{item.name}</span><span className="type-choice-check" aria-hidden>{selected === index && <Check size={13} />}</span></span>
        <span className="type-choice-specimen" aria-hidden>A<span style={{ fontFamily: fontFaces[item.fonts.accent], fontStyle: item.fonts.accentStyle, fontWeight: 400 }}>a</span><span className="type-choice-punctuation">.</span></span>
        <span className="type-choice-label">{item.label}</span>
      </button>)}
    </div>
    <div className="type-preview-label"><p>{pairing.description}</p><span>Self-hosted <span aria-hidden>·</span> Open source</span></div>
    <div id={preview} data-testid="font-pairing-preview" data-pairing={pairing.id} className="type-product" style={{ ...variables, fontFamily: 'var(--font-sans)', fontFeatureSettings: 'normal' } as CSSProperties}>
      <section aria-label="Kith landing preview" className="type-editorial">
        <header className="type-masthead">
          <a className="type-wordmark" href={"#" + preview}>kith</a>
          <span className="type-masthead-note">People, remembered.</span>
          <a className="type-text-link" href={"#" + preview + "-library"}>Your collection<ArrowDown size={14} aria-hidden /></a>
        </header>
        <GalleryEditorial
          eyebrow="A little space for what matters"
          title={<>A few things<br /><em>worth keeping.</em></>}
          lede="The photograph, the coffee, the story behind it. Keep the people and moments you want to come back to."
          className={pairing.id === 'editorial' ? '[&_em]:text-[1.08em]' : undefined}
          actions={<Button asChild className="h-11 w-fit rounded-full px-5 normal-case"><a href={"#" + preview + "-library"}>Explore the collection<ArrowDown aria-hidden /></a></Button>}
          image={{ src: './demo/kith/coastal-walk-v2.webp', alt: 'Two people walking along Kith’s illustrated coastal path', width: 760, height: 790, priority: true, focalPoint: '50% 62%' }}
          caption={<div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span>The long way home</span><span className="text-muted-foreground">Original Kith artwork</span></div>}
          related={{ image: { src: './demo/kith/memory-table-v2.webp', alt: 'Kith artwork of photographs, a notebook, and coffee gathered on a table', width: 800, height: 600 }, eyebrow: 'A table full of memories', title: <>Some things get better <em>with time.</em></> }}
        />
      </section>
      <section id={preview + "-library"} aria-label="Kith application preview" className="type-collection">
        <header className="type-collection-heading"><div><p className="type-overline">The personal archive</p><h2 className="font-display">Your collection<span className="text-brand-ink">.</span></h2></div><p>The artwork, notes, and memories<br className="hidden sm:block" /> behind your next story.</p></header>
        <AssetLibrary showHeader={false} state={{ kind: 'ready', files: pairingFiles }} title="Your collection" className="rounded-none border-0 bg-transparent" />
      </section>
    </div>
    <h2 className="mb-4 mt-10 text-lg font-medium">Take this pairing with you</h2>
    <section aria-label="Use this pairing" className="grid gap-5 lg:grid-cols-2">
      {[{ title: 'Content-driven pages', code: config, label: 'Copy page font configuration' }, { title: 'React and CSS applications', code: css, label: 'Copy font role CSS' }].map(item => <div key={item.title} className="min-w-0 overflow-hidden rounded-xl border border-border bg-card"><div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3"><h2 className="text-sm font-medium">{item.title}</h2><CopyButton value={item.code} label={item.label} /></div><pre role="region" aria-label={item.title + " configuration"} tabIndex={0} className="overflow-x-auto p-5 text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><code>{item.code}</code></pre></div>)}
    </section>
    <p className="mt-6 max-w-[75ch] text-sm leading-[1.6] text-muted-foreground">Every pairing is free under the SIL Open Font License 1.1. Import the shared theme once; only the faces your page renders are downloaded. The landing and collection share the same font roles. Each bundled family includes its full license.</p>
  </main>;
}
