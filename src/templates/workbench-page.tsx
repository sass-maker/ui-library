import * as React from "react";
import { icons } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/blocks/site-header";
import { Hero } from "@/components/blocks/hero";
import { Section, SectionHeader, FactRow } from "@/components/blocks/layout";
import { FeatureGrid, FeatureSpread, Steps, Stats } from "@/components/blocks/features";
import { Ledger, CodeBlock, StatusPill, DiffBlock } from "@/components/blocks/proof";
import { WindowFrame, Stage } from "@/components/blocks/frames";
import { Faq, Cta } from "@/components/blocks/closing";
import { StudioFooter } from "@/components/blocks/footer";
import { rich } from "@/templates/rich";

/**
 * A complete Workbench landing page from plain data: the dev-tool and
 * desktop-app family (dark ink theme, centered hero, the real app window on a
 * stage). Products supply a content file; all layout lives here.
 * Icons are lucide names, e.g. "Download". *phrase* renders as the accent.
 */

type Tone = "neutral" | "success" | "danger" | "warning" | "brand";
type Link = { label: string; href: string; icon?: string };
type Pill = { tone: Tone; label: string };

export type WorkbenchBlock =
  | { type: "steps"; items: { title: string; body: string; code?: string; pill?: Pill }[] }
  | { type: "stats"; items: { value: string; label: string; note?: string }[] }
  | { type: "features"; variant?: "ruled" | "cards" | "plain"; items: { icon?: string; title: string; body: string; meta?: string }[] }
  | {
      type: "spread";
      items: {
        kicker?: string;
        title: string;
        body: string;
        diff?: { file: string; lines: { kind: "add" | "del" | "ctx"; text: string; note?: { pill?: Pill; text: string } }[] };
        code?: { label?: string; code: string };
      }[];
    }
  | { type: "faq"; title?: string; lede?: string; items: { q: string; a: string }[] }
  | { type: "cta"; title: string; lede?: string; primary: Link; secondary?: Link; note?: string };

export type WorkbenchContent = {
  product: string;
  url: string;
  mark: string;
  nav: Link[];
  header: { primary: Link; secondary?: Link };
  hero: {
    eyebrow?: string;
    title: string;
    lede?: string;
    primary: Link;
    secondary?: Link;
    note?: string;
    window: { title: string; src: string; alt: string; width: number; height: number };
    receipt?: { title: string; meta?: string; rows: { label: string; value: string; mono?: boolean; strong?: boolean; status?: Pill }[] };
    caption?: string;
    facts?: string[];
    /** Brand brackets framing the stage (the CodeVetter mark's code scope). */
    brackets?: boolean;
  };
  sections: {
    id?: string;
    surface?: "default" | "muted";
    compact?: boolean;
    header?: { eyebrow?: string; title: string; lede?: string; align?: "start" | "center" | "split" };
    blocks: WorkbenchBlock[];
  }[];
  footer: { summary: string; groups: { title: string; links: Link[] }[]; legal?: string; feedbackKey?: string };
};

function Icon({ name }: { name?: string }) {
  const C = name ? icons[name as keyof typeof icons] : undefined;
  return C ? <C /> : null;
}

function LinkButton({ link, variant, size }: { link: Link; variant?: "outline" | "ghost"; size?: "sm" | "xl" }) {
  return (
    <Button size={size} variant={variant} asChild>
      <a href={link.href}>
        <Icon name={link.icon} />
        {link.label}
      </a>
    </Button>
  );
}

function Brackets() {
  return (
    <div aria-hidden className="motion-draw pointer-events-none absolute inset-x-0 -top-10 bottom-10 hidden lg:block">
      <svg viewBox="0 0 120 600" className="absolute -left-4 top-0 h-full w-auto xl:-left-16" fill="none">
        <path pathLength={1} d="M100 20 L20 300 L100 580" stroke="url(#wb-brackets)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="wb-brackets" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--brand)" stopOpacity="0" />
            <stop offset="0.45" stopColor="var(--brand)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <svg viewBox="0 0 120 600" className="absolute -right-4 top-0 h-full w-auto xl:-right-16" fill="none">
        <path pathLength={1} d="M20 20 L100 300 L20 580" stroke="url(#wb-brackets)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Block({ block: b, className: base }: { block: WorkbenchBlock; className?: string }) {
  // Grids reveal item by item; single pieces reveal whole.
  const grid = b.type === "steps" || b.type === "stats" || b.type === "features";
  const className = [base, grid ? "motion-stagger" : "motion-reveal"].filter(Boolean).join(" ");
  switch (b.type) {
    case "steps":
      return (
        <Steps
          className={className}
          items={b.items.map((s) => ({
            title: s.title,
            body: s.body,
            detail: s.pill ? <StatusPill tone={s.pill.tone}>{s.pill.label}</StatusPill> : s.code && <span className="font-mono text-xs text-muted-foreground">{s.code}</span>,
          }))}
        />
      );
    case "stats":
      return <Stats className={className} items={b.items} />;
    case "features":
      return <FeatureGrid className={className} variant={b.variant} items={b.items.map((f) => ({ ...f, icon: <Icon name={f.icon} /> }))} />;
    case "spread":
      return (
        <FeatureSpread
          className={className}
          items={b.items.map((it) => ({
            kicker: it.kicker,
            title: rich(it.title),
            body: it.body,
            media: it.diff ? (
              <DiffBlock
                file={it.diff.file}
                lines={it.diff.lines.map((l) => ({
                  ...l,
                  note: l.note && (
                    <span className="flex flex-col gap-1.5">
                      {l.note.pill && <StatusPill tone={l.note.pill.tone}>{l.note.pill.label}</StatusPill>}
                      <span>{l.note.text}</span>
                    </span>
                  ),
                }))}
              />
            ) : it.code ? (
              <CodeBlock label={it.code.label} code={it.code.code} />
            ) : null,
          }))}
        />
      );
    case "faq":
      return <Faq className={className} title={b.title && rich(b.title)} lede={b.lede} items={b.items} />;
    case "cta":
      return (
        <Cta
          className={className}
          variant="panel"
          title={rich(b.title)}
          lede={b.lede}
          actions={
            <>
              <LinkButton link={b.primary} size="xl" />
              {b.secondary && <LinkButton link={b.secondary} size="xl" variant="outline" />}
            </>
          }
          note={b.note}
        />
      );
  }
}

export function WorkbenchPage({ content: c }: { content: WorkbenchContent }) {
  const h = c.hero;
  return (
    <>
      <SiteHeader
        brand={{ name: c.product, mark: <img src={c.mark} alt="" width={22} height={22} className="size-[22px]" /> }}
        links={c.nav}
        actions={
          <>
            {c.header.secondary && <LinkButton link={c.header.secondary} size="sm" variant="ghost" />}
            <LinkButton link={c.header.primary} size="sm" />
          </>
        }
      />

      <main id="main">
        <Hero
          layout="centered"
          backdrop="grid"
          eyebrow={h.eyebrow}
          title={rich(h.title)}
          lede={h.lede}
          actions={
            <>
              <LinkButton link={h.primary} size="xl" />
              {h.secondary && <LinkButton link={h.secondary} size="xl" variant="outline" />}
            </>
          }
          note={h.note}
          media={
            <div className="relative">
              {h.brackets && <Brackets />}
              <Stage
                className="motion-tilt mx-auto max-w-6xl text-left"
                backdrop="mesh"
                main={<WindowFrame title={h.window.title} image={{ ...h.window, priority: true }} />}
                overlayPosition="bottom-right"
                overlay={
                  h.receipt && (
                    <Ledger
                      title={h.receipt.title}
                      meta={h.receipt.meta}
                      rows={h.receipt.rows.map((r) => ({
                        label: r.label,
                        value: r.mono ? <span className="font-mono text-[0.8125rem]">{r.value}</span> : r.strong ? <strong className="font-semibold">{r.value}</strong> : r.value,
                        status: r.status,
                      }))}
                    />
                  )
                }
                caption={h.caption}
              />
            </div>
          }
          footer={h.facts && <FactRow className="justify-center font-mono text-xs" items={h.facts} />}
        />

        {c.sections.map((s, i) => (
          <Section key={i} id={s.id} surface={s.surface} rule={!s.compact} size={s.compact ? "compact" : undefined}>
            <div className="container-page">
              {s.header && <SectionHeader className="motion-reveal" align={s.header.align} eyebrow={s.header.eyebrow} title={rich(s.header.title)} lede={s.header.lede} />}
              {s.blocks.map((b, j) => (
                <Block key={j} block={b} className={!s.header && j === 0 ? undefined : j === 0 ? "mt-14" : "mt-20"} />
              ))}
            </div>
          </Section>
        ))}
      </main>

      <StudioFooter product={c.product} url={c.url} summary={c.footer.summary} groups={c.footer.groups} legal={c.footer.legal} feedbackKey={c.footer.feedbackKey} />
    </>
  );
}
