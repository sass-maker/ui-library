import * as React from "react";
import { SiteHeader } from "@saas-maker/ui/blocks/site-header";
import {
  GalleryButton,
  GalleryCaption,
  GalleryClosing,
  GalleryCover,
  GalleryHero,
  GalleryShowcase,
  GallerySpread,
  GalleryStatement,
} from "@saas-maker/ui/blocks/gallery";
import { StudioFooter } from "@saas-maker/ui/blocks/footer";
import { rich } from "./rich";

/**
 * A complete Gallery landing page from plain data. Products supply a content
 * file (copy, image paths, links); all layout lives here and in the blocks.
 * In any text field, *words* render as the theme's accent phrase.
 */

type Link = { label: string; href: string };
type Screen = { src: string; alt: string };
type Caption = { lead?: string; text?: string };

export type GallerySection =
  | { kind: "showcase"; id?: string; eyebrow?: string; title: string; lede?: string; screen: Screen; caption?: Caption; note?: string }
  | { kind: "spread"; id?: string; eyebrow?: string; title: string; lede?: string; backdrop: string; screen: Screen; caption?: Caption }
  | { kind: "cover"; id?: string; eyebrow?: string; title: string; lede?: string; image: string; screen?: Screen; credit?: string }
  | {
      kind: "statement";
      id?: string;
      eyebrow?: string;
      title: string;
      lede?: string;
      rows?: { title: string; body: string; status?: string; on?: boolean }[];
      aside?: { title: string; body: string }[];
    };

export type GalleryContent = {
  product: string;
  url: string;
  mark: string;
  /** Pixel size of the phone screenshots, for layout stability. */
  screenSize?: { width: number; height: number };
  nav: Link[];
  headerAction: Link;
  hero: { eyebrow?: string; title: string; lede?: string; primary: Link; secondary?: Link; note?: string; backdrop: string; screen: Screen };
  sections: GallerySection[];
  closing: { id?: string; title: string; primary: Link; note?: string; image: string; credit?: string };
  footer: { summary: string; links: Link[]; legal?: string; feedbackKey?: string };
};

export function GalleryPage({ content: c }: { content: GalleryContent }) {
  const size = c.screenSize ?? { width: 603, height: 1311 };
  const device = (s: Screen) => ({ ...s, ...size });
  const caption = (cap?: Caption) => cap && <GalleryCaption lead={cap.lead}>{cap.text}</GalleryCaption>;
  const mark = <img src={c.mark} alt="" width={26} height={26} className="size-[1.625rem] rounded-[0.45rem]" />;

  return (
    <>
      <SiteHeader
        brand={{ name: c.product, mark }}
        links={c.nav}
        actions={
          <a href={c.headerAction.href} className="ui-case rounded-full bg-primary px-3.5 py-[0.45rem] text-[0.8125rem] font-semibold text-primary-foreground">
            {c.headerAction.label}
          </a>
        }
      />

      <main id="main">
        <GalleryHero
          eyebrow={c.hero.eyebrow}
          title={rich(c.hero.title)}
          lede={c.hero.lede}
          actions={
            <>
              <GalleryButton href={c.hero.primary.href}>{c.hero.primary.label}</GalleryButton>
              {c.hero.secondary && (
                <GalleryButton href={c.hero.secondary.href} variant="link">
                  {c.hero.secondary.label}
                </GalleryButton>
              )}
            </>
          }
          note={c.hero.note}
          backdrop={c.hero.backdrop}
          device={device(c.hero.screen)}
        />

        {c.sections.map((s, i) => {
          // A cover's device steps out of the photo; the next section starts closer.
          const prev = c.sections[i - 1];
          const afterDevice = prev?.kind === "cover" && prev.screen ? "pt-[clamp(2.5rem,6vw,5rem)]" : undefined;
          const common = { eyebrow: s.eyebrow, title: rich(s.title), lede: s.lede };
          switch (s.kind) {
            case "showcase":
              return <GalleryShowcase key={i} {...common} id={s.id} device={device(s.screen)} caption={caption(s.caption)} note={s.note} />;
            case "spread":
              return <GallerySpread key={i} {...common} backdrop={s.backdrop} device={device(s.screen)} caption={caption(s.caption)} />;
            case "cover":
              return <GalleryCover key={i} {...common} image={s.image} device={s.screen && device(s.screen)} credit={s.credit} />;
            case "statement":
              return <GalleryStatement key={i} {...common} className={afterDevice} id={s.id} rows={s.rows} aside={s.aside} />;
          }
        })}

        <GalleryClosing
          id={c.closing.id}
          title={<span className="[&_em]:text-brand">{rich(c.closing.title)}</span>}
          actions={<GalleryButton href={c.closing.primary.href}>{c.closing.primary.label}</GalleryButton>}
          note={c.closing.note}
          image={c.closing.image}
          credit={c.closing.credit}
        />
      </main>

      <StudioFooter
        variant="gallery"
        product={c.product}
        mark={mark}
        url={c.url}
        summary={c.footer.summary}
        groups={[{ title: "Links", links: c.footer.links }]}
        legal={c.footer.legal}
        feedbackKey={c.footer.feedbackKey}
      />
    </>
  );
}
