import * as React from "react";
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import { Button } from "@saas-maker/ui/components/button";
import { SiteHeader } from "@saas-maker/ui/blocks/site-header";
import { Hero } from "@saas-maker/ui/blocks/hero";
import { Section, SectionHeader } from "@saas-maker/ui/blocks/layout";
import { FeatureGrid } from "@saas-maker/ui/blocks/features";
import { CodeBlock } from "@saas-maker/ui/blocks/proof";

const themes = [
  { id: "base", name: "Base", use: "Internal tools, dashboards, neutral products", sample: <>Ship the <em>calm</em> version.</> },
  { id: "paper", name: "Paper", use: "Reading, research, writing, editorial", sample: <>Turn notes into <em>knowledge.</em></> },
  { id: "ink", name: "Ink", use: "Developer tools, AI infra, Mac utilities", sample: <>Verify the <em>exact change.</em></> },
  { id: "hearth", name: "Hearth", use: "Personal iPhone and life apps", sample: <>Stay close to <em>your people.</em></> },
  { id: "signal", name: "Signal", use: "Playful consumer and community", sample: <>Make it <em>happen.</em></> },
];

const demos = [
  { href: "/demo/codevetter/", name: "CodeVetter", theme: "Ink", note: "Receipt hero, steps, stats, CLI, FAQ" },
  { href: "/demo/kith/", name: "Kith", theme: "Hearth", note: "Phone stage, artwork scene, privacy ledger" },
  { href: "/demo/reader/", name: "Reader", theme: "Paper", note: "Editorial hero, HTML product surface, ruled grid" },
  { href: "/demo/live/", name: "Live", theme: "Signal", note: "Cover hero, color bands, catalog cards" },
  { href: "/demo/app-health/", name: "App Health", theme: "Base", note: "App shell, stat cards, charts, tables" },
];

function ThemeCard({ id, name, use, sample }: (typeof themes)[number]) {
  return (
    <div data-theme={id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-sm">
      <div className="flex-1 p-6">
        <p className="eyebrow">{name}</p>
        <p className="font-display mt-4 text-[2rem]">{sample}</p>
        <div className="mt-6 flex gap-2">
          <Button size="sm">Primary</Button>
          <Button size="sm" variant="outline">
            Secondary
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-hairline bg-surface px-6 py-3">
        <span className="text-xs text-muted-foreground">{use}</span>
        <span className="flex gap-1" aria-hidden>
          {["bg-background", "bg-surface", "bg-primary", "bg-brand"].map((c) => (
            <span key={c} className={`size-3.5 rounded-full ring-1 ring-black/10 ${c}`} />
          ))}
        </span>
      </div>
    </div>
  );
}

export default function IndexPage() {
  return (
    <>
      <SiteHeader
        brand={{
          name: "Fleet UI",
          mark: <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary font-mono text-[0.6875rem] font-semibold text-primary-foreground">ui</span>,
        }}
        links={[
          { label: "Themes", href: "#themes" },
          { label: "Blocks", href: "#blocks" },
          { label: "Demos", href: "#demos" },
          { label: "Install", href: "#install" },
        ]}
        actions={
          <Button size="sm" asChild>
            <a href="#demos">See demos</a>
          </Button>
        }
      />
      <main id="main">
        <Hero
          layout="centered"
          backdrop="grid"
          eyebrow="One library for every Fleet surface"
          title={
            <>
              Solid basics, <em>distinct products.</em>
            </>
          }
          lede="shadcn/ui components, five theme presets and production blocks for landings, internal tools and footers. Products differ by tokens, imagery and the blocks they choose, never by forking components."
          actions={
            <>
              <Button size="xl" asChild>
                <a href="#demos">
                  Browse the demos <ArrowRightIcon />
                </a>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <a href="#install">Install a block</a>
              </Button>
            </>
          }
        />

        <Section id="themes" rule>
          <div className="container-page">
            <SectionHeader
              align="split"
              eyebrow="Theme presets"
              title={
                <>
                  Five starting points. <em>Your brand on top.</em>
                </>
              }
              lede="Each preset sets type, surfaces, radius and accent behavior. A product then overrides --brand and supplies its own imagery."
            />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((t) => (
                <ThemeCard key={t.id} {...t} />
              ))}
            </div>
          </div>
        </Section>

        <Section id="blocks" surface="muted" rule>
          <div className="container-page">
            <SectionHeader eyebrow="Blocks" title={<>Everything a product page <em>actually uses.</em></>} />
            <FeatureGrid
              className="mt-14"
              items={[
                { kicker: "Navigation", title: "SiteHeader", body: "Bar or floating header with a zero-JS phone menu built on the Popover API." },
                { kicker: "Openers", title: "Hero", body: "Split, centered, editorial and full-bleed cover layouts with accent phrases and honest notes." },
                { kicker: "Media", title: "Frames", body: "Window, browser and iPhone frames, matted photos, artwork panels and catalog cards." },
                { kicker: "Story", title: "Features, Spread, Steps, Stats", body: "Ruled or card grids, alternating media rows, numbered process and big numbers." },
                { kicker: "Proof", title: "Ledger, CodeBlock, Quote", body: "Receipts of evidence, wrapping terminal blocks and attributed maker notes." },
                { kicker: "Closing", title: "Faq, Cta, Band", body: "Native details FAQ, closing panels and full-bleed color-block sections." },
                { kicker: "Footer", title: "StudioFooter", body: "The Fleet contract: routes, Ask AI handoff, newsletter, wordmark, art and studio line." },
                { kicker: "Apps", title: "AppShell, PageHeader", body: "Sidebar shell with phone drawer, page header with actions and tabs." },
                { kicker: "Data", title: "StatCard, AreaChart, Table", body: "Sparklines, server-rendered charts with readable axes, and shadcn tables." },
              ]}
            />
          </div>
        </Section>

        <Section id="demos" rule>
          <div className="container-page">
            <SectionHeader eyebrow="Demos" title={<>Real products, <em>rebuilt on the library.</em></>} lede="Each demo uses the product's real copy and imagery, so it can be scored against the live site." />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {demos.map((d) => (
                <li key={d.href}>
                  <a href={d.href} className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md">
                    <span className="eyebrow">{d.theme}</span>
                    <span className="flex items-center justify-between text-lg font-semibold">
                      {d.name} <ArrowUpRightIcon className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                    <span className="text-sm text-muted-foreground">{d.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section id="install" surface="muted" rule>
          <div className="container-page grid gap-10 lg:grid-cols-2">
            <SectionHeader
              eyebrow="Install"
              title={<>Copy the source, <em>not a dependency.</em></>}
              lede="Blocks install through the shadcn CLI from this library's registry. The code lands in your repo, so nothing breaks when the library moves on."
            />
            <CodeBlock
              label="terminal"
              code={`# tokens and presets first
pnpm dlx shadcn@latest add <ui-library>/r/theme.json

# then the blocks you need
pnpm dlx shadcn@latest add <ui-library>/r/hero.json
pnpm dlx shadcn@latest add <ui-library>/r/studio-footer.json`}
            />
          </div>
        </Section>
      </main>
    </>
  );
}
