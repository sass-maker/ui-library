import * as React from "react";
import { icons } from "lucide-react";
import { Button } from "@saas-maker/ui/components/button";
import { SiteHeader } from "@saas-maker/ui/blocks/site-header";
import { Hero } from "@saas-maker/ui/blocks/hero";
import { Section, SectionHeader, FactRow } from "@saas-maker/ui/blocks/layout";
import { FeatureGrid, FeatureSpread, Steps, Stats } from "@saas-maker/ui/blocks/features";
import { Ledger, CodeBlock, StatusPill, DiffBlock } from "@saas-maker/ui/blocks/proof";
import { WindowFrame, Stage } from "@saas-maker/ui/blocks/frames";
import { Faq, Cta } from "@saas-maker/ui/blocks/closing";
import { StudioFooter } from "@saas-maker/ui/blocks/footer";
import { rich } from "./rich";
import { withAssetBase } from "./page";
import { HeroStatus, heroNote } from "./status";
import type { WorkbenchContent, WorkbenchBlock } from "./schema";

/**
 * A complete Workbench landing page from plain data: the dev-tool and
 * desktop-app family (dark ink theme, centered hero, the real app window on a
 * stage). Products supply a content file; all layout lives here.
 * Icons are lucide names, e.g. "Download". *phrase* renders as the accent.
 */

type Link = { label: string; href: string; icon?: string };

export type { WorkbenchContent, WorkbenchBlock };

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

/** One focal region of a product screenshot, framed as a quiet window. */
function Detail({ d }: { d: NonNullable<Extract<WorkbenchBlock, { type: "spread" }>["items"][number]["detail"]> }) {
  const { x, y, w, h } = d.crop;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
      <div
        role="img"
        aria-label={d.alt}
        className="w-full bg-no-repeat"
        style={{
          aspectRatio: `${w} / ${h}`,
          backgroundImage: `url(${d.src})`,
          backgroundSize: `${(d.width / w) * 100}%`,
          backgroundPosition: `${(x / Math.max(1, d.width - w)) * 100}% ${(y / Math.max(1, d.height - h)) * 100}%`,
        }}
      />
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
            media: it.detail ? (
              <Detail d={it.detail} />
            ) : it.diff ? (
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
              <CodeBlock label={it.code.label} code={it.code.code} play />
            ) : null,
          }))}
        />
      );
    case "statement":
      return (
        <div className={className}>
          <SectionHeader align="split" eyebrow={b.eyebrow} title={rich(b.title)} lede={b.lede} />
          {b.points && (
            <dl
              className={`motion-stagger mt-14 grid gap-x-12 gap-y-10 border-t border-border pt-10 ${
                b.points.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : b.points.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
              }`}
            >
              {b.points.map((pt) => (
                <div key={pt.title}>
                  <dt className="font-display text-lg">{pt.title}</dt>
                  <dd className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground text-pretty">{pt.body}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
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

export type WorkbenchPageProps = {
  content: WorkbenchContent;
  /** Replaces the header; false or null renders none. In Astro, a slot="header" element. */
  header?: React.ReactNode;
  /** Replaces the StudioFooter; false or null renders none. In Astro, a slot="footer" element. */
  footer?: React.ReactNode;
  /** Root for relative image paths; overrides the file's page.assetBase. */
  assetBase?: string;
};

export function WorkbenchPage({ content, header, footer, assetBase }: WorkbenchPageProps) {
  const c = withAssetBase(content, assetBase ?? content.page.assetBase);
  const h = c.hero;
  const actions = c.header;
  return (
    <>
      {header !== undefined ? (
        header || null
      ) : actions === false ? null : (
        <SiteHeader
          brand={{ name: c.product, mark: <img src={c.mark} alt="" width={22} height={22} className="size-[22px]" /> }}
          links={c.nav}
          actions={
            <>
              {actions.secondary && <LinkButton link={actions.secondary} size="sm" variant="ghost" />}
              <LinkButton link={actions.primary} size="sm" />
            </>
          }
        />
      )}

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
          note={heroNote(h.status && <HeroStatus status={h.status} />, h.note)}
          media={
            <div className="relative">
              {h.brackets && <Brackets />}
              <Stage
                className="motion-tilt mx-auto max-w-6xl text-left"
                backdrop={h.backdrop ? { image: { src: h.backdrop, alt: "", priority: true } } : "mesh"}
                main={
                  <div className={h.backdrop ? "mx-auto max-w-4xl" : undefined}>
                    <WindowFrame title={h.window.title} chrome={h.window.chrome} image={{ ...h.window, priority: true }} />
                  </div>
                }
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

      {footer !== undefined
        ? footer || null
        : c.footer && (
            <StudioFooter
              product={c.product}
              url={c.url}
              summary={c.footer.summary}
              groups={c.footer.groups}
              legal={c.footer.legal}
              feedbackKey={c.footer.feedbackKey}
              subscribeKey={c.footer.subscribeKey}
              catalogId={c.footer.catalogId}
              capture={c.footer.capture}
              studio={c.footer.studio}
            />
          )}
    </>
  );
}
