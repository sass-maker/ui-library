import * as React from "react";
import { ArrowUpRightIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/blocks/site-header";
import { Hero } from "@/components/blocks/hero";
import { Section, SectionHeader, FactRow } from "@/components/blocks/layout";
import { FeatureGrid, Steps } from "@/components/blocks/features";
import { Ledger, Quote } from "@/components/blocks/proof";
import { WindowFrame, Stage } from "@/components/blocks/frames";
import { Faq, Cta } from "@/components/blocks/closing";
import { StudioFooter } from "@/components/blocks/footer";

const Mark = () => (
  <span className="inline-flex size-7 items-center justify-center rounded-[5px] bg-primary font-display text-[1.05rem] italic leading-none text-primary-foreground">
    R
  </span>
);

/** The reading surface, drawn in HTML so it stays crisp and themeable. */
function ReadingSurface() {
  return (
    <WindowFrame chrome="browser" title="reader / systems" className="shadow-xl">
      <div className="grid min-h-[22rem] grid-cols-1 text-left sm:grid-cols-[10.5rem_1fr_11rem]">
        <aside className="hidden border-r border-hairline bg-surface p-4 sm:block">
          <p className="eyebrow mb-3 text-[0.625rem]">Research set</p>
          <ul className="flex flex-col gap-1 text-[0.8125rem]">
            {["Durable systems", "Interface memory", "Trust signals"].map((t, i) => (
              <li key={t} className={i === 0 ? "rounded-md bg-card px-2 py-1.5 font-medium shadow-xs" : "px-2 py-1.5 text-muted-foreground"}>
                <span className="mr-1.5 font-mono text-[0.6875rem] text-brand">0{i + 1}</span>
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-[0.625rem] text-muted-foreground">3 sources · 7 notes</p>
        </aside>
        <article className="px-5 py-5 sm:px-7">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-muted-foreground">Saved article · 14 min</p>
          <h3 className="font-display mt-2 text-[1.6rem]">How durable systems earn trust</h3>
          <div className="mt-4 space-y-3 font-display text-[0.9375rem] leading-[1.65] text-foreground/85" style={{ fontWeight: 380, letterSpacing: 0 }}>
            <p>A useful research system does not ask you to remember where the evidence lived. It keeps the source close enough to inspect again.</p>
            <p>
              <mark className="rounded-[2px] bg-brand-soft px-0.5 text-foreground">The goal is not a larger reading list. It is a shorter distance between a claim, the passage behind it, and the note you made while thinking.</mark>
            </p>
            <p className="hidden sm:block">That distance becomes the difference between collecting material and building understanding from it.</p>
          </div>
        </article>
        <aside className="hidden border-l border-hairline p-4 sm:block">
          <div className="flex gap-3 border-b border-hairline pb-2 text-[0.75rem]">
            <span className="font-medium">Notes</span>
            <span className="text-muted-foreground">Ask</span>
          </div>
          <div className="mt-3 rounded-md border border-border bg-card p-3 shadow-xs">
            <p className="font-mono text-[0.625rem] text-brand">NOTE 04</p>
            <p className="mt-1.5 text-[0.8125rem] leading-snug">Evidence and interpretation should stay adjacent.</p>
          </div>
          <div className="mt-3 rounded-md bg-surface p-3">
            <p className="font-mono text-[0.625rem] text-muted-foreground">Ask this source</p>
            <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted-foreground">Where does the author separate collection from understanding?</p>
          </div>
        </aside>
      </div>
    </WindowFrame>
  );
}

export default function ReaderPage() {
  return (
    <>
      <SiteHeader
        brand={{ name: "Reader", mark: <Mark /> }}
        links={[
          { label: "The loop", href: "#loop" },
          { label: "Library", href: "#library" },
          { label: "Current state", href: "#state" },
          { label: "FAQ", href: "#faq" },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" asChild>
              <a href="#">Sign in</a>
            </Button>
            <Button size="sm" asChild>
              <a href="#">Open Reader</a>
            </Button>
          </>
        }
      />

      <main id="main">
        <Hero
          layout="editorial"
          backdrop="paper"
          eyebrow={<p className="eyebrow">Personal research library</p>}
          title={
            <>
              Turn the things you save into <em>things you can use.</em>
            </>
          }
          lede="Reader is for people who save serious articles and PDFs, then lose them among browser tabs and bookmarks. It gives each source a quiet place to read, mark, question, and find again."
          actions={
            <>
              <Button size="xl" asChild>
                <a href="#">
                  Open Reader <ArrowUpRightIcon />
                </a>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <a href="#">Try a sample document</a>
              </Button>
            </>
          }
          note={<FactRow items={["Browser-local start", "Google sign-in for the library", "No checkout"]} className="text-[0.8125rem]" />}
          footer={
            <Stage
              backdrop={{ image: { src: "/demo/reader/reader-precise-original-v1.webp", alt: "", priority: true } }}
              main={<div className="mx-auto max-w-4xl"><ReadingSurface /></div>}
              caption="Illustrative interface · example text, not a customer document"
            />
          }
        />

        <Section id="loop" rule>
          <div className="container-page">
            <SectionHeader
              align="split"
              index="01"
              eyebrow="The reading loop"
              title={
                <>
                  A saved tab is <em>only an intention.</em>
                </>
              }
              lede="Reader earns its place after “save”. It carries one source through attentive reading and back into reach when the thought becomes useful."
            />
            <Steps
              className="mt-14"
              items={[
                { title: "Capture the source", body: "Paste an article URL or upload a PDF. Reader keeps the source and prepares it for focused reading." },
                { title: "Read without the page", body: "Web clutter falls away. The text, document structure, reading controls and your place remain." },
                { title: "Mark what matters", body: "Highlight the exact passage, leave a note beside it, or listen when reading is not practical." },
                { title: "Find the thought again", body: "Search the library, return through tags and lists, arrange a board, or question the open source." },
              ]}
            />
          </div>
        </Section>

        <Section id="library" surface="muted" rule>
          <div className="container-page">
            <SectionHeader
              index="02"
              eyebrow="One working library"
              title={
                <>
                  Keep the source, the mark, and <em>the next question</em> together.
                </>
              }
            />
            <FeatureGrid
              className="mt-14"
              items={[
                { kicker: "Sources", title: "Articles and PDFs, one shelf", body: "Web articles and PDFs live in the same library. PDF text is extracted for search and source-grounded discussion." },
                { kicker: "Reading", title: "Typography first", body: "Highlights, notes, reading progress and text-to-speech sit beside the source, never on top of it." },
                { kicker: "Retrieval", title: "More than one way back", body: "Full-text search, tags, lists and boards give the same source several useful ways back in." },
                { kicker: "Assistance", title: "AI over what you chose", body: "Summaries and chat work on material you opened. Use the Fleet gateway or browser-held keys." },
                { kicker: "Feeds", title: "RSS when you want it", body: "Import OPML and refresh RSS or Atom feeds by hand, then save an item into the library." },
                { kicker: "Portability", title: "Yours to take", body: "Account data exports as JSON. Public sharing is an explicit action, never the default." },
              ]}
            />
          </div>
        </Section>

        <Section rule>
          <div className="container-page grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-6 flex items-center gap-3">
                <span className="text-brand">03</span>
                <span aria-hidden className="h-px w-6 bg-border" />
                Why it exists
              </p>
              <Quote
                quote="I wanted any article or PDF to become a focused reading and research surface instead of another forgotten browser tab."
                name="Product maker note"
              />
            </div>
            <Ledger
              variant="paper"
              className="lg:col-span-5"
              title="How Reader behaves"
              rows={[
                { label: "Capture", value: "Mozilla Readability prepares saved pages; PDFs join the same library." },
                { label: "Evidence", value: "Highlights stay anchored to the passage that prompted them." },
                { label: "Return", value: "Search and organisation run over the material and notes you saved." },
                { label: "Scope", value: "No social feed, recommendation engine, or paid team workspace." },
              ]}
            />
          </div>
        </Section>

        <Section id="state" surface="muted" rule>
          <div className="container-page">
            <SectionHeader
              align="split"
              index="04"
              eyebrow="Current boundary"
              title={
                <>
                  Maintained for real use, <em>not expansion for its own sake.</em>
                </>
              }
              lede="Reader is a mature personal-use product in maintenance-first support. New work is limited to problems that block the capture-to-reading loop."
            />
            <Ledger
              className="mt-14"
              title="Current state"
              meta="maintenance-first"
              rows={[
                { label: "No account", value: "Capture and read in this browser without a Reader account.", status: { tone: "success", label: "available" } },
                { label: "Google sign-in", value: "Account library, isolated per user; PDFs behind an ownership-checking proxy.", status: { tone: "success", label: "available" } },
                { label: "Extension", value: "Source-built MV3 companion for local unpacked installs.", status: { tone: "neutral", label: "source only" } },
                { label: "Commerce", value: "No public plan or checkout, and no promise either way.", status: { tone: "neutral", label: "none" } },
              ]}
            />
          </div>
        </Section>

        <Section id="faq" rule>
          <div className="container-page">
            <Faq
              title={
                <>
                  Before you put <em>a source inside.</em>
                </>
              }
              items={[
                { q: "Does Reader publish what I save?", a: "No. Libraries are private by default. Sharing an article or board requires an explicit share action." },
                { q: "What does AI see?", a: "AI features work on the material you open and ask about. Browser-held keys are used per request and never stored server-side." },
                { q: "Can I install the Chrome extension?", a: "It is available from source for local unpacked installation. Public browser-store distribution is deferred." },
                { q: "Can I take my data out?", a: "Yes. Reader includes a JSON export for account-scoped articles, boards, and lists." },
              ]}
            />
          </div>
        </Section>

        <Section size="compact">
          <div className="container-page">
            <Cta
              variant="inverse"
              eyebrow="Open the library"
              title={
                <>
                  Bring one source you mean <em>to understand.</em>
                </>
              }
              lede="Start in this browser, or sign in with Google for the account-backed library."
              actions={
                <>
                  <Button size="xl" variant="secondary" asChild>
                    <a href="#">
                      Open Reader <ArrowUpRightIcon />
                    </a>
                  </Button>
                  <Button size="xl" variant="ghost" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" asChild>
                    <a href="#">
                      Try the sample <ArrowRightIcon />
                    </a>
                  </Button>
                </>
              }
            />
          </div>
        </Section>
      </main>

      <StudioFooter
        product="Reader"
        url="https://read.significanthobbies.com"
        summary="A maintained personal research library for turning saved sources into working knowledge. Personal use, maintenance-first, no public checkout."
        groups={[
          { title: "Product", links: [{ label: "Open Reader", href: "#" }, { label: "Changelog", href: "#" }, { label: "Roadmap", href: "#" }] },
          { title: "Resources", links: [{ label: "FAQ", href: "#faq" }, { label: "Current state", href: "#state" }] },
          { title: "Company", links: [{ label: "About", href: "#" }, { label: "Privacy", href: "#" }] },
        ]}
        art={{ src: "/demo/reader/reader-precise-original-v1.webp", alt: "Illustration of a reading room" }}
        legal="© 2026 Significant Hobbies"
      />
    </>
  );
}
