import * as React from "react";
import { SiteHeader } from "@saas-maker/ui/blocks/site-header";
import {
  GalleryButton,
  GalleryCaption,
  GalleryClosing,
  GalleryCover,
  GalleryGrid,
  GalleryHero,
  GalleryShowcase,
  GallerySpread,
  GalleryStatement,
} from "@saas-maker/ui/blocks/gallery";
import { Faq } from "@saas-maker/ui/blocks/closing";
import { StudioFooter } from "@saas-maker/ui/blocks/footer";
import { rich } from "./rich";
import type { GalleryContent, GallerySection } from "./schema";

/**
 * A complete Gallery landing page from plain data. Products supply a content
 * file (copy, image paths, links); all layout lives here and in the blocks.
 * In any text field, *words* render as the theme's accent phrase.
 */

type Screen = NonNullable<GalleryContent["hero"]["screen"]>;
type Caption = { lead?: string; text?: string };

export type { GalleryContent, GallerySection };

export function GalleryPage({ content: c }: { content: GalleryContent }) {
  const size = c.screenSize ?? { width: 603, height: 1311 };
  const device = (s: Screen) => ({ ...s, ...size });
  const caption = (cap?: Caption) => cap && <GalleryCaption lead={cap.lead}>{cap.text}</GalleryCaption>;
  const mark = <img src={c.mark} alt="" width={26} height={26} className="size-[1.625rem] rounded-[0.45rem]" />;

  const heroActions = (
    <>
      <GalleryButton href={c.hero.primary.href}>{c.hero.primary.label}</GalleryButton>
      {c.hero.secondary && (
        <GalleryButton href={c.hero.secondary.href} variant="link">
          {c.hero.secondary.label}
        </GalleryButton>
      )}
    </>
  );

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
        {c.hero.image ? (
          <GalleryCover
            as="h1"
            eyebrow={c.hero.eyebrow}
            title={rich(c.hero.title)}
            lede={c.hero.lede}
            actions={heroActions}
            note={c.hero.note}
            image={c.hero.image}
          />
        ) : (
          <GalleryHero
            eyebrow={c.hero.eyebrow}
            title={rich(c.hero.title)}
            lede={c.hero.lede}
            actions={heroActions}
            note={c.hero.note}
            backdrop={c.hero.backdrop!}
            device={device(c.hero.screen!)}
          />
        )}

        {c.sections.map((s, i) => {
          // A cover's device steps out of the photo; the next section starts closer.
          const prev = c.sections[i - 1];
          const afterDevice = prev?.kind === "cover" && prev.screen ? "pt-[clamp(2.5rem,6vw,5rem)]" : undefined;
          if (s.kind === "faq")
            return (
              <section key={i} id={s.id} className="py-[clamp(5rem,10vw,8rem)]">
                <div className="mx-auto w-full max-w-[75rem] px-[clamp(1.25rem,4vw,3.5rem)]">
                  <Faq className="motion-reveal" title={s.title && rich(s.title)} lede={s.lede} items={s.items} />
                </div>
              </section>
            );
          const common = { eyebrow: s.eyebrow, title: rich(s.title), lede: s.lede };
          switch (s.kind) {
            case "grid":
              return <GalleryGrid key={i} {...common} id={s.id} items={s.items.map((t) => ({ image: { src: t.image, alt: t.alt }, label: t.label, title: t.title, href: t.href }))} />;
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
          title={<span className="[&_em]:text-brand-ink">{rich(c.closing.title)}</span>}
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
        subscribeKey={c.footer.subscribeKey}
        catalogId={c.footer.catalogId}
        art={c.footer.art}
      />
    </>
  );
}
