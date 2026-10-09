import * as React from "react";
import { cn } from "@/lib/utils";

type HeroProps = {
  eyebrow?: React.ReactNode;
  /** Use <em> for the accent phrase; it picks up the theme's accent face. */
  title: React.ReactNode;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  /** Availability or honesty line under the actions. */
  note?: React.ReactNode;
  media?: React.ReactNode;
  /** Content under the hero, e.g. a FactRow or proof strip. */
  footer?: React.ReactNode;
  /**
   * split: copy left, media right. centered: copy centered, media below.
   * editorial: oversized title across the page, lede and actions in a column.
   * cover: full-bleed image behind light text; pass `image`.
   */
  layout?: "split" | "centered" | "editorial" | "cover";
  /** Background image for the cover layout. */
  image?: { src: string; alt?: string };
  /** Decorative background. */
  backdrop?: "none" | "glow" | "grid" | "paper";
  className?: string;
};

export function Hero({
  eyebrow,
  title,
  lede,
  actions,
  note,
  media,
  footer,
  layout = "split",
  backdrop = "none",
  image,
  className,
}: HeroProps) {
  const eyebrowNode = eyebrow && (
    <div className="hero-in mb-6 [--d:0ms]">
      {typeof eyebrow === "string" ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-[0.8125rem] text-muted-foreground backdrop-blur">
          <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          {eyebrow}
        </span>
      ) : (
        eyebrow
      )}
    </div>
  );
  const actionsNode = actions && <div className="hero-in mt-9 flex flex-wrap items-center gap-3 [--d:160ms] max-sm:[&>*]:w-full">{actions}</div>;
  const noteNode = note && <div className="hero-in mt-5 text-[0.8125rem] text-muted-foreground [--d:200ms]">{note}</div>;

  return (
    <section className={cn("relative isolate overflow-hidden", className)}>
      <Backdrop kind={backdrop} />
      {layout === "split" && (
        <div className="container-page grid items-center gap-14 pb-20 pt-14 md:pb-28 md:pt-20 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-6">
            {eyebrowNode}
            <h1 className="hero-in font-display text-[clamp(2.6rem,1.5rem+4vw,4.6rem)] text-foreground [--d:60ms]">{title}</h1>
            {lede && <p className="hero-in lede mt-7 [--d:110ms]">{lede}</p>}
            {actionsNode}
            {noteNode}
          </div>
          {media && <div className="hero-in relative min-w-0 lg:col-span-6 [--d:180ms]">{media}</div>}
          {footer && <div className="lg:col-span-12">{footer}</div>}
        </div>
      )}

      {layout === "centered" && (
        <div className="container-page flex flex-col items-center pb-16 pt-16 text-center md:pb-24 md:pt-24">
          {eyebrowNode}
          <h1 className="hero-in font-display max-w-5xl text-[clamp(2.75rem,1.5rem+5vw,5.75rem)] [--d:60ms]">{title}</h1>
          {lede && <p className="hero-in lede mx-auto mt-7 [--d:110ms]">{lede}</p>}
          {actionsNode && <div className="flex justify-center">{actionsNode}</div>}
          {noteNode}
          {footer && <div className="hero-in mt-12 [--d:220ms]">{footer}</div>}
          {media && <div className="hero-in mt-16 w-full [--d:260ms] md:mt-20">{media}</div>}
        </div>
      )}

      {layout === "cover" && (
        <div className="relative flex min-h-[min(92svh,56rem)] items-end">
          {image && (
            <img src={image.src} alt={image.alt ?? ""} fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />
          )}
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
          <div className="container-page pb-16 pt-40 text-white md:pb-24 [--foreground:white] [--muted-foreground:rgb(255_255_255/0.78)] [--accent-ink:var(--brand)]">
            {eyebrowNode}
            <h1 className="hero-in font-display max-w-[14ch] text-[clamp(3.25rem,1.6rem+7vw,8rem)] [--d:60ms]">{title}</h1>
            {lede && <p className="hero-in lede mt-7 text-white/80 [--d:110ms]">{lede}</p>}
            {actionsNode}
            {noteNode}
            {footer && <div className="mt-12">{footer}</div>}
          </div>
        </div>
      )}

      {layout === "editorial" && (
        <div className="container-page pb-16 pt-14 md:pb-24 md:pt-20">
          {eyebrowNode}
          <h1 className="hero-in font-display max-w-[16ch] text-[clamp(3rem,1.4rem+6.6vw,7.25rem)] [--d:60ms]">{title}</h1>
          <div className="mt-10 grid gap-10 border-t border-border pt-8 md:grid-cols-12">
            <div className="md:col-span-6 lg:col-span-5">
              {lede && <p className="hero-in lede [--d:110ms]">{lede}</p>}
              {actionsNode}
              {noteNode}
            </div>
            {media && <div className="hero-in md:col-span-6 lg:col-span-7 [--d:180ms]">{media}</div>}
          </div>
          {footer && <div className="mt-12">{footer}</div>}
        </div>
      )}
    </section>
  );
}

function Backdrop({ kind }: { kind: NonNullable<HeroProps["backdrop"]> }) {
  if (kind === "none") return null;
  if (kind === "grid")
    return (
      <div
        aria-hidden
        className="grid-paper absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
    );
  if (kind === "paper") return <div aria-hidden className="grain absolute inset-0 -z-10" />;
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-[-18rem] h-[38rem] w-[70rem] -translate-x-1/2 rounded-full bg-brand opacity-[0.16] blur-[120px]" />
      <div className="grid-paper absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
    </div>
  );
}
