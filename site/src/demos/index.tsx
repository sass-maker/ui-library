import * as React from "react";
import { SiteHeader } from "@saas-maker/ui/blocks/site-header";
import {
  GalleryButton,
  Device,
  GalleryCaption,
  GalleryEyebrow,
  GalleryLede,
  GalleryNote,
  GalleryPair,
  GalleryTitle,
} from "@saas-maker/ui/blocks/gallery";
import { CodeBlock } from "@saas-maker/ui/blocks/proof";
import { StudioFooter } from "@saas-maker/ui/blocks/footer";

/** The library's own home page, built from the Gallery blocks it ships. */

const wrap = "mx-auto w-full max-w-[75rem] px-[clamp(1.25rem,4vw,3.5rem)]";
const pad = "py-[clamp(6rem,13vw,11.25rem)]";

const mark = (
  <span aria-hidden className="grid size-[1.625rem] place-items-center rounded-[0.45rem] bg-brand font-display text-[0.75rem] font-extrabold tracking-[-0.04em] text-brand-foreground">
    ui
  </span>
);

const kithExcerpt = `{
  "template": "gallery",
  "page": { "theme": "gallery" },
  "product": "Kith",
  "hero": {
    "title": "Remember the people you want to stay close to.",
    "backdrop": "/demo/kith/book-stage.webp",
    "screen": { "src": "/demo/kith/constellation.webp" }
  },
  "sections": [
    {
      "kind": "showcase",
      "title": "See closeness the way *you chose it.*"
    }
  ]
}`;

const webInstall = `# from the GitHub repo, not npm (pnpm add drops #tag&path)
G="github:sass-maker/ui-library#v0.1.12"
pnpm pkg set "dependencies.@saas-maker/ui=$G&path:/packages/ui" \\
  "dependencies.@saas-maker/motion=$G&path:/packages/motion" \\
  "dependencies.@saas-maker/templates=$G&path:/packages/templates"
pnpm install`;

const swiftInstall = `.package(
  url: "https://github.com/sass-maker/ui-library",
  from: "0.1.12"
)`;

function DemoLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="ui-case font-display text-[1.0625rem] font-semibold tracking-[-0.01em] text-brand-ink hover:underline hover:underline-offset-4">
      {children} <span aria-hidden>›</span>
    </a>
  );
}

function Family({
  plate,
  eyebrow,
  title,
  body,
  links,
}: {
  plate: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  links: { label: string; href: string }[];
}) {
  return (
    <article>
      <a href={links[0].href} className="group block overflow-hidden rounded-[var(--radius)]" aria-label={`${title}: open the ${links[0].label} demo`}>
        <div className="relative aspect-[4/5] overflow-hidden transition-transform duration-700 ease-out group-hover:scale-[1.015] sm:aspect-[5/6]">{plate}</div>
      </a>
      <GalleryEyebrow className="mt-7">{eyebrow}</GalleryEyebrow>
      <h3 className="mt-2 font-display text-[clamp(2rem,1.5rem+2vw,3rem)]">{title}</h3>
      <p className="mt-3 max-w-[30em] font-text text-[1.1875rem] leading-[1.45] text-muted-foreground">{body}</p>
      <p className="mt-5 flex flex-wrap gap-x-7 gap-y-2">
        {links.map((l) => (
          <DemoLink key={l.href} href={l.href}>
            {l.label}
          </DemoLink>
        ))}
      </p>
    </article>
  );
}

export default function IndexPage() {
  return (
    <>
      <SiteHeader
        brand={{ name: "SaaS Maker UI", mark }}
        links={[
          { label: "Families", href: "#families" },
          { label: "Content", href: "#content" },
          { label: "Apple", href: "#apple" },
          { label: "Install", href: "#install" },
        ]}
        actions={
          <a href="#install" className="ui-case rounded-full bg-primary px-3.5 py-[0.45rem] text-[0.8125rem] font-semibold text-primary-foreground">
            Install
          </a>
        }
      />

      <main id="main">
        {/* Hero: one system, two screens. */}
        <section className="overflow-hidden pt-[clamp(3.5rem,7vw,6.5rem)] text-center">
          <div className={wrap}>
            <GalleryEyebrow className="hero-in mb-5">SaaS Maker UI</GalleryEyebrow>
            <GalleryTitle as="h1" size="xl" className="hero-in mx-auto max-w-[11em] [--d:60ms]">
              One design system for <em>every Fleet product.</em>
            </GalleryTitle>
            <GalleryLede className="hero-in mx-auto mt-7 [--d:120ms]">
              Components, page templates and quiet motion for the web, and a Swift package for Mac and iPhone. Products bring the words and pictures; the craft is shared.
            </GalleryLede>
            <div className="hero-in mt-8 flex flex-wrap items-center justify-center gap-3.5 [--d:180ms]">
              <GalleryButton href="#families">See the demos</GalleryButton>
              <GalleryButton href="#install" variant="link">
                Install ›
              </GalleryButton>
            </div>
          </div>
          <GalleryPair
            className="hero-in mt-[clamp(3.5rem,6vw,5rem)] [--d:260ms]"
            backdrop="/demo/kith/book-stage.webp"
            window={{
              src: "/demo/codevetter/workbench.png",
              alt: "CodeVetter's desktop review workbench with a finding beside the changed code",
              width: 1440,
              height: 900,
              priority: true,
              title: "CodeVetter",
            }}
            device={{
              src: "/demo/kith/constellation.webp",
              alt: "Kith on iPhone: a warm constellation of people sized by chosen closeness",
              width: 603,
              height: 1311,
              priority: true,
            }}
          />
          <div className={wrap}>
            <GalleryCaption lead="CodeVetter on the Mac, Kith on the iPhone." className="mx-auto mt-5 text-left md:text-center">
              Two products, one library.
            </GalleryCaption>
          </div>
        </section>

        {/* The two page families. */}
        <section id="families" className={pad}>
          <div className={wrap}>
            <div className="motion-stagger text-center">
              <GalleryEyebrow>Two page families</GalleryEyebrow>
              <GalleryTitle className="mt-5">
                Pick the family. <em>Bring the content.</em>
              </GalleryTitle>
              <GalleryLede className="mx-auto mt-6">
                Every landing page is one of two templates. Products differ by tokens, imagery and copy, never by a forked component.
              </GalleryLede>
            </div>
            <div className="motion-stagger mt-[clamp(3.5rem,7vw,5.5rem)] grid gap-x-[clamp(1.5rem,3vw,2.5rem)] gap-y-16 md:grid-cols-2">
              <Family
                eyebrow="For consumer products"
                title="Gallery"
                body="Image-led and quiet: a monumental headline, then real screens and artwork at full scale, one idea per section."
                links={[
                  { label: "Kith", href: "/demo/kith/" },
                  { label: "Live", href: "/demo/live/" },
                ]}
                plate={
                  <>
                    <img src="/demo/kith/memory-table-v2.webp" alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                    <Device
                      image={{ src: "/demo/kith/person.webp", alt: "Kith person page for Maya Rao, from the Kith demo", width: 603, height: 1311 }}
                      className="absolute left-1/2 top-[13%] w-[48%] -translate-x-1/2"
                    />
                  </>
                }
              />
              <Family
                eyebrow="For developer tools"
                title="Workbench"
                body="The real app window on a stage, then the proof: steps, evidence and the exact commands, on a dark or paper theme."
                links={[
                  { label: "CodeVetter", href: "/demo/codevetter/" },
                  { label: "Reader", href: "/demo/reader/" },
                ]}
                plate={
                  <>
                    <div className="absolute inset-0 bg-tone-ink" />
                    <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_30%_30%,#3a2a1f_0%,transparent_70%)]" />
                    <img
                      src="/demo/reader/reading-surface.png"
                      alt="Reader's reading surface: a saved article with a highlighted passage and notes, from the Reader demo"
                      width={1792}
                      height={780}
                      loading="lazy"
                      decoding="async"
                      className="absolute left-[12%] top-[22%] w-[150%] max-w-none rounded-[0.75rem] shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_50px_90px_-30px_rgb(0_0_0/0.7)]"
                    />
                  </>
                }
              />
            </div>
            <GalleryCaption lead="Internal tools and dashboards" className="mx-auto mt-[clamp(4rem,8vw,6rem)] text-center">
              use the app shell, charts and tables instead. <a href="/demo/app-health/" className="font-display font-semibold text-brand-ink hover:underline hover:underline-offset-4">See App Health ›</a>
            </GalleryCaption>
          </div>
        </section>

        {/* A product is one content file. */}
        <section id="content" className={`${pad} bg-surface`}>
          <div className={`${wrap} grid items-center gap-[clamp(3rem,7vw,7rem)] md:grid-cols-[0.9fr_1.1fr]`}>
            <div className="motion-stagger">
              <GalleryEyebrow>Content, not code</GalleryEyebrow>
              <GalleryTitle size="md" className="mt-4">
                A product is <em>one content file.</em>
              </GalleryTitle>
              <GalleryLede className="mt-6">
                Copy, image paths and links live in one JSON file. The template does the layout, and the build checks the file before it ships. Wrap a phrase in asterisks to make it the accent.
              </GalleryLede>
              <div className="mt-7">
                <DemoLink href="/demo/kith/">See this file as a page</DemoLink>
              </div>
            </div>
            <CodeBlock className="motion-reveal min-w-0 rounded-[calc(var(--radius)*0.8)] border-0 shadow-[0_50px_100px_-40px_rgb(40_20_10/0.5)]" label="src/content/kith.json (excerpt)" code={kithExcerpt} />
          </div>
        </section>

        {/* Web and Apple share one theme. */}
        <section
          id="apple"
          className={`${pad} bg-tone-ink text-[#f4ebe0] [--foreground:#f4ebe0] [--muted-foreground:#b4a596] [--accent-ink:#8f7f70] [--brand-ink:#e98a5f]`}
        >
          <div className={`${wrap} motion-stagger text-center`}>
            <GalleryEyebrow>Web and Apple</GalleryEyebrow>
            <GalleryTitle className="mt-5">
              The same voice <em>on Mac and iPhone.</em>
            </GalleryTitle>
            <GalleryLede className="mx-auto mt-6">
              SaaSMakerUI, the Swift package, carries the same palette and the same fonts, generated from the web theme, and keeps the lowercase voice for headings and buttons.
            </GalleryLede>
          </div>
          {/* Column flow: both specimens share row one (baseline-aligned), both captions row two. */}
          <div className={`${wrap} motion-stagger mt-[clamp(4rem,8vw,6.5rem)] grid items-baseline gap-x-14 text-center sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-[auto_auto]`}>
            <p aria-hidden className="font-display text-[clamp(7rem,4rem+12vw,14rem)] leading-none">
              Aa
            </p>
            <GalleryCaption lead="Figtree" className="mx-auto mb-14 mt-6 sm:mb-0">
              for headings, buttons and navigation.
            </GalleryCaption>
            <p aria-hidden className="font-text text-[clamp(7rem,4rem+12vw,14rem)] leading-none tracking-[-0.03em]">
              Aa
            </p>
            <GalleryCaption lead="Newsreader" className="mx-auto mt-6">
              for ledes and captions.
            </GalleryCaption>
          </div>
        </section>

        {/* Install. */}
        <section id="install" className={pad}>
          <div className={wrap}>
            <div className="motion-stagger text-center">
              <GalleryEyebrow>Install</GalleryEyebrow>
              <GalleryTitle className="mt-5">
                From GitHub, <em>not npm.</em>
              </GalleryTitle>
              <GalleryLede className="mx-auto mt-6">
                SaaS Maker UI is not published to npm. Products add it from the GitHub repo at a tagged release.
              </GalleryLede>
            </div>
            <div className="motion-stagger mt-[clamp(3.5rem,7vw,5.5rem)] grid gap-x-8 gap-y-12 md:grid-cols-2">
              <div className="min-w-0">
                <h3 className="font-display text-[1.375rem]">Web, with pnpm</h3>
                <p className="mt-1.5 font-text text-[1.0625rem] text-muted-foreground">ui, motion and templates, side by side.</p>
                <CodeBlock className="mt-5 rounded-[calc(var(--radius)*0.8)] border-0" label="terminal" code={webInstall} />
              </div>
              <div className="min-w-0">
                <h3 className="font-display text-[1.375rem]">Mac and iPhone, with Swift</h3>
                <p className="mt-1.5 font-text text-[1.0625rem] text-muted-foreground">Add the package by its git URL.</p>
                <CodeBlock className="mt-5 rounded-[calc(var(--radius)*0.8)] border-0" label="Package.swift" code={swiftInstall} />
              </div>
            </div>
            <GalleryNote className="mt-[clamp(4rem,8vw,6rem)] text-center text-[0.9375rem]">
              The classic layouts are still here:{" "}
              <a href="/demo/codevetter-classic/" className="font-semibold text-foreground hover:underline hover:underline-offset-4">CodeVetter</a>,{" "}
              <a href="/demo/live-classic/" className="font-semibold text-foreground hover:underline hover:underline-offset-4">Live</a> and{" "}
              <a href="/demo/reader-classic/" className="font-semibold text-foreground hover:underline hover:underline-offset-4">Reader</a>.
            </GalleryNote>
          </div>
        </section>
      </main>

      <StudioFooter
        variant="gallery"
        product="SaaS Maker UI"
        mark={mark}
        url="https://github.com/sass-maker/ui-library"
        summary="One design system for Fleet products: web components, page templates and motion, and a Swift package for Mac and iPhone."
        groups={[
          {
            title: "Links",
            links: [
              { label: "Kith", href: "/demo/kith/" },
              { label: "Live", href: "/demo/live/" },
              { label: "CodeVetter", href: "/demo/codevetter/" },
              { label: "Reader", href: "/demo/reader/" },
              { label: "App Health", href: "/demo/app-health/" },
              { label: "Install", href: "#install" },
            ],
          },
        ]}
      />
    </>
  );
}
