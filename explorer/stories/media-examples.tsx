import { ArrowDown, ArrowRight, BookOpen, Heart, LockKeyhole } from "lucide-react";
import { ResponsiveImage } from "@saas-maker/ui/atoms/responsive-image";
import { Video } from "@saas-maker/ui/atoms/video";
import { MediaFrame } from "@saas-maker/ui/molecules/media-frame";
import { MediaSequence } from "@saas-maker/ui/organisms/media-sequence";
import { Device } from "@saas-maker/ui/blocks/gallery";

const screens = [
  { id: "begin", title: "Begin with one person", description: "A name, their circle and closeness, and one thing worth remembering. Start with someone who matters, without importing an address book.", image: "onboarding", caption: "Kith · first-run flow · actual app screen" },
  { id: "people", title: "Your constellation", description: "Every person becomes a warm lantern. Its size comes only from the 1–5 closeness you choose, not message volume or an algorithm.", image: "constellation", caption: "Kith · chosen closeness · actual app screen" },
  { id: "context", title: "Keep the small things", description: "How you met, a birthday, standing notes, and a dated log of the moments you want to keep. The context is there when you come back.", image: "person", caption: "Kith · person detail · actual app screen" },
];

/** A complete narrative using existing Kith copy, art and actual screens. */
export function KithMediaPage() {
  return <main className="mx-auto max-w-[1360px] px-5 pb-8 sm:px-10 lg:px-14">
    <header className="flex min-h-24 flex-wrap items-center justify-between gap-4 border-b border-border py-5">
      <a href="#kith-top" aria-label="Kith for iPhone" className="rounded-sm font-display text-3xl italic outline-none focus-visible:ring-2 focus-visible:ring-ring">Kith<span className="ml-3 align-middle font-sans text-[0.625rem] not-italic uppercase tracking-[0.14em] text-muted-foreground">for iPhone</span></a>
      <nav aria-label="Kith example" className="flex items-center gap-5 text-xs"><a href="#kith-how" className="hidden min-h-11 items-center rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex">The app</a><a href="#kith-privacy" className="hidden min-h-11 items-center rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex">Privacy</a><a href="#kith-status" className="inline-flex min-h-11 touch-manipulation items-center rounded-sm border border-border px-3 py-2.5 outline-none hover:bg-muted active:bg-muted focus-visible:ring-2 focus-visible:ring-ring">Beta status</a></nav>
    </header>
    <section id="kith-top" className="grid items-center gap-10 py-8 sm:py-12 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:py-20">
      <div className="hero-in"><p className="mb-6 font-mono text-[0.625rem] uppercase tracking-[0.13em] text-muted-foreground">A place for the people you keep close</p>
        <h1 className="max-w-[13ch] font-display text-[clamp(2.75rem,5.2vw,5rem)] leading-[1.02] tracking-[-0.035em] text-balance">Remember the people you want to stay close to.</h1>
        <p className="mt-6 max-w-[35ch] text-base leading-relaxed text-muted-foreground">How you met. What matters now. The moments you don’t want to forget. A private memory for the people you keep close.</p>
        <a href="#kith-how" className="mt-8 inline-flex min-h-11 touch-manipulation items-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground outline-none active:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">Meet Kith<ArrowDown aria-hidden className="size-4" /></a>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Internal TestFlight only. No public invite or App Store listing.</p>
      </div>
      <MediaFrame caption="A little more attention to the people already in your world." credit="Illustrative Kith artwork" className="hero-in">
        <div className="relative pb-4 sm:pb-6"><ResponsiveImage src="./demo/kith/coastal-walk-v2.webp" alt="Illustrative coastal walk in Kith’s warm visual world" width={760} height={790} loading="eager" fetchPriority="high" focalPoint="28% 50%" className="rounded-t-[45%] rounded-b-md" /><Device image={{ src: "./demo/kith/constellation.webp", alt: "Kith’s actual constellation screen, with lanterns sized by chosen closeness", width: 603, height: 1311, priority: true }} className="absolute -right-1 bottom-0 w-[42%] max-w-[15rem] sm:right-5" /></div>
      </MediaFrame>
    </section>
    <section id="kith-how" aria-labelledby="kith-how-title" className="border-t border-border py-12 sm:py-16">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-6"><div><p className="mb-3 font-mono text-[0.625rem] uppercase tracking-[0.13em] text-muted-foreground">01 / A closer look</p><h2 id="kith-how-title" className="max-w-xl font-display text-3xl leading-tight sm:text-5xl">Small details.<br /><em>A fuller picture.</em></h2></div><p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Explore the real screens. A person is more than a contact card.</p></div>
      <MediaSequence label="Explore Kith screens" chapters={screens.map(screen => ({ ...screen, media: <div className="grid min-h-[32rem] place-items-center overflow-hidden rounded-xl bg-surface px-8 py-8 sm:min-h-[38rem]" style={{ backgroundImage: 'url("./demo/kith/book-stage.webp")', backgroundSize: "cover", backgroundPosition: "center" }}><ResponsiveImage src={`./demo/kith/${screen.image}.webp`} alt={screen.caption} width={603} height={1311} imageClassName="object-contain" className="w-[min(100%,15rem)] rounded-[1.75rem] bg-transparent shadow-2xl sm:w-[16rem]" /></div> }))} />
    </section>
    <section aria-labelledby="kith-film-title" className="border-t border-border py-12 sm:py-16">
      <div className="mb-7 grid items-end gap-5 md:grid-cols-2"><div><p className="mb-3 font-mono text-[0.625rem] uppercase tracking-[0.13em] text-muted-foreground">02 / In a few moments</p><h2 id="kith-film-title" className="font-display text-3xl leading-tight sm:text-5xl">From a name<br /><em>to a little context.</em></h2></div><p className="max-w-md text-sm leading-relaxed text-muted-foreground">A short, silent sequence of actual Kith screens. This is an edited screen sequence, not a recording of live app interaction.</p></div>
      <MediaFrame caption="Begin with a name. Keep the context. Come back to what mattered." credit="Original Kith screen sequence">
        <Video title="Kith screen sequence" playLabel="Play" poster="./demo/kith/onboarding.webp" sources={[{ src: "./visual/kith-sequence.webm", type: "video/webm" }, { src: "./visual/kith-sequence.mp4", type: "video/mp4" }]} captions={{ src: "./visual/kith-sequence.vtt", language: "en", label: "English descriptions" }} />
      </MediaFrame>
      <details className="mt-5 border-b border-border pb-5 text-sm"><summary className="w-fit cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">Read the screen sequence</summary><ol className="mt-4 max-w-2xl list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground"><li>Begin with one person, their circle and chosen closeness.</li><li>See a constellation sized by that chosen closeness.</li><li>Open a person to find how you met, standing notes and dated moments.</li></ol></details>
    </section>
    <section id="kith-privacy" aria-labelledby="kith-privacy-title" className="grid gap-10 border-t border-border py-12 md:grid-cols-[0.9fr_1.1fr] sm:py-16">
      <div><p className="mb-3 font-mono text-[0.625rem] uppercase tracking-[0.13em] text-muted-foreground">03 / Yours to keep</p><h2 id="kith-privacy-title" className="max-w-sm font-display text-3xl leading-tight sm:text-5xl">The iPhone stays<br /><em>the working copy.</em></h2></div>
      <div className="divide-y divide-border">{[{ Icon: BookOpen, title: "Useful before sign-in", body: "Adding people, closeness, search and notes all work on your iPhone. Edits save locally first." }, { Icon: LockKeyhole, title: "Sync is optional", body: "An optional Significant Hobbies account syncs through the private Hub. Local use never needs it." }, { Icon: Heart, title: "Care without a score", body: "Kith never browses your address book or decides who deserves care. You choose the closeness." }].map(({ Icon, title, body }) => <div key={title} className="flex gap-4 py-5 first:pt-0"><Icon aria-hidden className="mt-1 size-5 shrink-0 stroke-[1.5] text-brand-ink" /><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p></div></div>)}</div>
    </section>
    <section id="kith-status" className="grid overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-[1.1fr_0.9fr]">
      <div className="p-7 sm:p-12 lg:p-16">
      <p className="mb-4 text-xs font-medium text-brand-ink">Kith / Internal TestFlight</p><h2 className="max-w-xl font-display text-3xl leading-tight sm:text-5xl">Remember what mattered.<br /><em>Show up with the context.</em></h2>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">There is no public invite or App Store listing yet. You can explore the interface above while the private beta continues.</p><a href="#kith-how" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">Back to the real screens<ArrowRight aria-hidden className="size-4" /></a></div>
      <div className="relative min-h-64 border-t border-border lg:border-l lg:border-t-0"><ResponsiveImage src="./demo/kith/memory-table-v2.webp" alt="An illustrated Kith memory book with a coastal photograph and a cup of coffee" width={760} height={507} className="absolute! inset-0 size-full" focalPoint="70% 50%" /></div>
    </section>
    <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground"><span>Kith · A private relationship-memory app for iPhone.</span><span>Library example · existing artwork and actual screens</span></footer>
  </main>;
}
