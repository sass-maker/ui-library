import * as React from "react";
import { cn } from "../lib/utils";

/**
 * Gallery family: the quiet, image-led consumer layout. One idea per section,
 * a monumental centered headline, and real screens or art at full scale.
 * Pair with data-theme="gallery". Text roles: font-display for headlines and
 * UI, font-text (serif) for ledes and captions.
 */

type Img = { src: string; alt: string; width?: number; height?: number; priority?: boolean };

function Picture({ image, className }: { image: Img; className?: string }) {
  return (
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={image.priority ? "eager" : "lazy"}
      fetchPriority={image.priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}

/** A phone whose bezel, corners and island scale with its width. Set width with className. */
export function Device({ image, className }: { image: Img; className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-[13.5%/6.2%] bg-[#0d0a08] p-[3%] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06),0_50px_100px_-30px_rgb(40_20_10/0.45),0_30px_60px_-40px_rgb(40_20_10/0.5)]",
        className,
      )}
    >
      <Picture image={image} className="block h-auto w-full rounded-[11.5%/5.3%]" />
      <span aria-hidden className="absolute left-1/2 top-[3.3%] h-[2.5%] w-[27%] -translate-x-1/2 rounded-full bg-[#0d0a08]" />
    </div>
  );
}

const lede = "font-text text-[clamp(1.1875rem,1rem+0.6vw,1.4375rem)] leading-[1.45] text-pretty text-muted-foreground";
const eyebrowCls = "ui-case font-display text-[0.9375rem] font-semibold tracking-[-0.005em] text-brand-ink";

export function GalleryEyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn(eyebrowCls, className)}>{children}</p>;
}

export function GalleryTitle({
  as: Tag = "h2",
  size = "lg",
  className,
  children,
}: {
  as?: "h1" | "h2";
  size?: "xl" | "lg" | "md";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "font-display text-balance",
        size === "xl" && "text-[clamp(2.875rem,1.6rem+5.4vw,7rem)]",
        size === "lg" && "text-[clamp(2.5rem,1.5rem+4.4vw,5.75rem)]",
        size === "md" && "text-[clamp(2.125rem,1.4rem+3vw,4rem)] leading-[1.02]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function GalleryLede({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn(lede, "max-w-[34em]", className)}>{children}</p>;
}

/** Caption under a plate: a bold sans lead-in, then serif text. */
export function GalleryCaption({ lead, children, className }: { lead?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-text max-w-[40em] text-base leading-[1.45] text-muted-foreground", className)}>
      {lead && <b className="mr-[0.35em] font-display font-semibold tracking-[-0.01em] text-foreground">{lead}</b>}
      {children}
    </p>
  );
}

export function GalleryNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("font-display text-[0.8125rem] text-muted-foreground/80", className)}>{children}</p>;
}

const wrap = "mx-auto w-full max-w-[75rem] px-[clamp(1.25rem,4vw,3.5rem)]";
const pad = "py-[clamp(6rem,13vw,11.25rem)]";

/** Centered monumental hero; the device rises out of a full-bleed backdrop. */
export function GalleryHero({
  eyebrow,
  title,
  lede: ledeText,
  actions,
  note,
  backdrop,
  device,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  note?: React.ReactNode;
  backdrop: string;
  device: Img;
}) {
  return (
    <section className="overflow-hidden pt-[clamp(3rem,5vw,4.5rem)] text-center">
      <div className={wrap}>
        {eyebrow && <GalleryEyebrow className="hero-in mb-5">{eyebrow}</GalleryEyebrow>}
        <GalleryTitle as="h1" size="xl" className="hero-in [--d:60ms]">
          {title}
        </GalleryTitle>
        {ledeText && <GalleryLede className="hero-in mx-auto mt-7 [--d:120ms]">{ledeText}</GalleryLede>}
        {actions && <div className="hero-in mt-8 flex flex-wrap items-center justify-center gap-3.5 [--d:180ms]">{actions}</div>}
        {note && <GalleryNote className="hero-in mt-4 [--d:220ms]">{note}</GalleryNote>}
      </div>
      <div className="relative mt-[clamp(3rem,5vw,4rem)] h-[clamp(32rem,60vw,52.5rem)] overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 bottom-0 top-[clamp(8.75rem,14vw,12.5rem)] overflow-hidden">
          <div className="motion-parallax size-full bg-cover bg-[center_30%]" style={{ backgroundImage: `url(${backdrop})` }} />
        </div>
        <div className="hero-in relative [--d:260ms]">
          <Device image={{ ...device, priority: true }} className="mx-auto w-[clamp(15.5rem,27vw,24.5rem)]" />
        </div>
      </div>
    </section>
  );
}

/** Deep section: centered headline, then one screen at the size of a room. */
export function GalleryShowcase({
  id,
  eyebrow,
  title,
  lede: ledeText,
  device,
  caption,
  note,
}: {
  id?: string;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  device: Img;
  caption?: React.ReactNode;
  note?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        pad,
        "bg-tone-ink text-[#f4ebe0] [--foreground:#f4ebe0] [--muted-foreground:#b4a596] [--accent-ink:#8f7f70] [--brand:#e98a5f] [--brand-ink:#e98a5f]",
      )}
    >
      <div className={cn(wrap, "motion-stagger text-center")}>
        {eyebrow && <GalleryEyebrow>{eyebrow}</GalleryEyebrow>}
        <GalleryTitle className="mt-5">{title}</GalleryTitle>
        {ledeText && <GalleryLede className="mx-auto mt-6">{ledeText}</GalleryLede>}
      </div>
      <figure>
        <div className="relative mt-[clamp(4rem,8vw,7rem)] h-[clamp(37.5rem,58vw,52.5rem)] overflow-hidden bg-[radial-gradient(120%_90%_at_50%_40%,#3a2a1f_0%,#17110d_70%)]">
          <Device
            image={device}
            className="motion-zoom absolute left-1/2 top-[-5.5rem] w-[clamp(21rem,40vw,37.5rem)] origin-top -translate-x-1/2 shadow-[0_80px_160px_-40px_rgb(0_0_0/0.7)] md:top-[-12%]"
          />
        </div>
        {(caption || note) && (
          <figcaption className="mx-auto mt-5 flex max-w-[82.5rem] flex-col gap-1.5 px-[clamp(1.25rem,4vw,3.5rem)] md:flex-row md:items-baseline md:justify-between md:gap-6">
            {caption}
            {note && <GalleryNote className="whitespace-nowrap">{note}</GalleryNote>}
          </figcaption>
        )}
      </figure>
    </section>
  );
}

/** Headline left, lede right, then a device on a full-bleed textured plate. */
export function GallerySpread({
  eyebrow,
  title,
  lede: ledeText,
  backdrop,
  device,
  caption,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** Image behind the device; without one the plate is the theme's surface tone. */
  backdrop?: string;
  device: Img;
  caption?: React.ReactNode;
}) {
  return (
    <section className={pad}>
      <div className={cn(wrap, "motion-stagger mb-[clamp(3.5rem,7vw,6rem)] grid items-end gap-[clamp(2rem,6vw,6rem)] md:grid-cols-2")}>
        <div>
          {eyebrow && <GalleryEyebrow>{eyebrow}</GalleryEyebrow>}
          <GalleryTitle size="md" className="mt-4">
            {title}
          </GalleryTitle>
        </div>
        {ledeText && <GalleryLede>{ledeText}</GalleryLede>}
      </div>
      <figure>
        <div className="relative isolate overflow-hidden py-[clamp(5rem,10vw,8.75rem)]">
          {backdrop ? (
            <div aria-hidden className="motion-parallax absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${backdrop})` }} />
          ) : (
            <div aria-hidden className="absolute inset-0 -z-10 bg-surface" />
          )}
          <Device image={device} className="motion-reveal mx-auto w-[clamp(16.25rem,30vw,26.25rem)] shadow-[0_60px_120px_-30px_rgb(60_15_0/0.6)]" />
        </div>
        {caption && <figcaption className={cn(wrap, "mt-5")}>{caption}</figcaption>}
      </figure>
    </section>
  );
}

/** Full-bleed photograph with the story bottom-left and a device stepping out of the frame. */
export function GalleryCover({
  as = "h2",
  eyebrow,
  title,
  lede: ledeText,
  actions,
  note,
  image,
  device,
  credit,
}: {
  /** "h1" when the cover is the page hero. */
  as?: "h1" | "h2";
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  note?: React.ReactNode;
  image: string;
  device?: Img;
  credit?: React.ReactNode;
}) {
  return (
    <>
      <section
        className="relative isolate text-white [--foreground:#fff] [--muted-foreground:rgb(255_255_255/0.88)] [--brand-ink:#ffd9c2] [--accent-ink:#ffd9c2] md:min-h-[clamp(40rem,62vw,56rem)]"
      >
        <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
          <div className="motion-parallax size-full bg-cover bg-[40%_center]" style={{ backgroundImage: `url(${image})` }} />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgb(20_12_6/0.74)_0%,rgb(20_12_6/0.5)_45%,rgb(20_12_6/0.12)_80%),linear-gradient(0deg,rgb(20_12_6/0.6),transparent_55%)]"
        />
        <div className={cn(wrap, "relative grid items-end gap-10 pb-[clamp(3.5rem,7vw,6rem)] pt-28 md:min-h-[inherit] md:grid-cols-[1.25fr_0.75fr] md:pt-0")}>
          <div className="motion-stagger">
            {eyebrow && <GalleryEyebrow>{eyebrow}</GalleryEyebrow>}
            <GalleryTitle as={as} size={as === "h1" ? "xl" : "lg"} className="mt-4">
              {title}
            </GalleryTitle>
            {ledeText && <GalleryLede className="mt-6">{ledeText}</GalleryLede>}
            {actions && <div className="mt-8 flex flex-wrap items-center gap-3.5">{actions}</div>}
            {note && <GalleryNote className="mt-4 text-white/75">{note}</GalleryNote>}
          </div>
          {device && (
            <Device image={device} className="motion-reveal mx-auto w-[13.75rem] md:mx-0 md:w-[clamp(13.75rem,22vw,20rem)] md:translate-y-[clamp(7rem,12vw,11.25rem)] md:justify-self-end" />
          )}
        </div>
        {credit && <span className="absolute bottom-3 right-[clamp(1.25rem,4vw,3.5rem)] font-display text-xs text-white/80">{credit}</span>}
      </section>
      {device && <div aria-hidden className="hidden h-[clamp(7rem,12vw,11.25rem)] md:block" />}
    </>
  );
}

/** Centered statement with quiet ruled rows beneath, and an optional two-column aside. */
export function GalleryStatement({
  id,
  eyebrow,
  title,
  lede: ledeText,
  rows,
  aside,
  className,
}: {
  id?: string;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  rows?: { title: string; body: React.ReactNode; status?: string; on?: boolean }[];
  aside?: { title: string; body: React.ReactNode }[];
  className?: string;
}) {
  return (
    <section id={id} className={cn(pad, className)}>
      <div className={wrap}>
        <div className="motion-stagger text-center">
          {eyebrow && <GalleryEyebrow>{eyebrow}</GalleryEyebrow>}
          <GalleryTitle className="mt-5">{title}</GalleryTitle>
          {ledeText && <GalleryLede className="mx-auto mt-6">{ledeText}</GalleryLede>}
        </div>
        {rows && (
          <dl className="motion-stagger mt-[clamp(3.5rem,7vw,5.5rem)] border-t border-border">
            {rows.map((r) => (
              <div key={r.title} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5 border-b border-border py-6 md:grid-cols-[12.5rem_1fr_7.5rem] md:gap-6">
                <dt className="font-display text-[1.375rem] font-semibold tracking-[-0.025em]">{r.title}</dt>
                <dd className="col-span-full row-start-2 font-text text-[1.1875rem] text-muted-foreground md:col-span-1 md:row-start-auto">{r.body}</dd>
                {r.status && (
                  <dd className={cn("col-start-2 row-start-1 text-right font-display text-[0.8125rem] font-semibold md:col-start-auto md:row-start-auto", r.on ? "text-brand-ink" : "text-muted-foreground/80")}>
                    {r.status}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        )}
        {aside && (
          <div className="motion-stagger mt-[clamp(4.5rem,9vw,7.5rem)] grid gap-[clamp(2rem,6vw,6rem)] md:grid-cols-2">
            {aside.map((a) => (
              <div key={a.title}>
                <h3 className="mb-2.5 font-display text-[0.9375rem] font-semibold">{a.title}</h3>
                <p className="font-text text-lg text-muted-foreground">{a.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Closing image: the page settles into artwork under a centered call to action. */
export function GalleryClosing({
  id,
  title,
  actions,
  note,
  image,
  credit,
}: {
  id?: string;
  title: React.ReactNode;
  actions?: React.ReactNode;
  note?: React.ReactNode;
  image: string;
  credit?: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="relative isolate flex min-h-[clamp(38.75rem,64vw,57.5rem)] items-start overflow-hidden"
    >
      <div aria-hidden className="motion-drift absolute inset-0 -z-10 bg-cover bg-[12%_60%] md:bg-[center_60%]" style={{ backgroundImage: `url(${image})` }} />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_srgb,var(--background)_85%,transparent)_38%,transparent_72%)]"
      />
      <div className={cn(wrap, "motion-stagger relative pt-[clamp(5rem,10vw,8.75rem)] text-center")}>
        <GalleryTitle>{title}</GalleryTitle>
        {actions && <div className="mt-8 flex flex-wrap justify-center gap-3.5">{actions}</div>}
        {note && <GalleryNote className="mt-4">{note}</GalleryNote>}
      </div>
      {credit && <span className="absolute bottom-5 right-[clamp(1.25rem,4vw,3.5rem)] font-display text-xs text-white/85">{credit}</span>}
    </section>
  );
}

/** Pill buttons for Gallery pages. Render as links. */
export function GalleryButton({ href, variant = "primary", children }: { href: string; variant?: "primary" | "link"; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={cn(
        "ui-case inline-flex h-[3.25rem] items-center gap-[0.45em] rounded-full font-display text-[1.0625rem] font-semibold tracking-[-0.01em] transition-colors",
        variant === "primary" && "bg-brand px-[1.625rem] text-brand-foreground hover:bg-[color-mix(in_oklch,var(--brand)_88%,black)]",
        variant === "link" && "px-2 text-brand-ink hover:underline hover:underline-offset-4",
      )}
    >
      {children}
    </a>
  );
}

/** A quiet grid of image tiles (catalogs, collections): image, small label, one line. */
export function GalleryGrid({
  id,
  eyebrow,
  title,
  lede: ledeText,
  items,
}: {
  id?: string;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lede?: React.ReactNode;
  items: { image: Img; label?: string; title: string; href?: string }[];
}) {
  return (
    <section id={id} className={pad}>
      <div className={wrap}>
        <div className="motion-stagger grid items-end gap-[clamp(2rem,6vw,6rem)] md:grid-cols-2">
          <div>
            {eyebrow && <GalleryEyebrow>{eyebrow}</GalleryEyebrow>}
            <GalleryTitle size="md" className="mt-4">
              {title}
            </GalleryTitle>
          </div>
          {ledeText && <GalleryLede>{ledeText}</GalleryLede>}
        </div>
        <ul className="motion-stagger mt-[clamp(3.5rem,7vw,5.5rem)] grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const body = (
              <>
                <div className="overflow-hidden rounded-[var(--radius)]">
                  <Picture image={it.image} className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                </div>
                {it.label && <p className={cn(eyebrowCls, "mt-5 text-[0.8125rem]")}>{it.label}</p>}
                <p className="mt-1.5 font-display text-[1.375rem] leading-tight tracking-[-0.02em]">{it.title}</p>
              </>
            );
            return (
              <li key={it.title}>
                {it.href ? (
                  <a href={it.href} className="group block">
                    {body}
                  </a>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/**
 * A Mac window and an iPhone on one plate, for products (or families) that
 * ship both. The phone overlaps the window's lower corner; the backdrop starts
 * below the window's top edge so the pair stands on a stage.
 */
export function GalleryPair({
  backdrop,
  window: win,
  device,
  className,
}: {
  /** Image behind the pair; without one the plate is the theme's surface tone. */
  backdrop?: string;
  /** A desktop capture, shown under a quiet dark title bar. */
  window: Img & { title?: string };
  device: Img;
  className?: string;
}) {
  return (
    <div className={cn("relative isolate overflow-hidden pb-[clamp(3.5rem,8vw,7rem)]", className)}>
      <div aria-hidden className="absolute inset-x-0 bottom-0 top-[clamp(6rem,16vw,15rem)] -z-10 overflow-hidden">
        {backdrop ? (
          <div className="motion-parallax size-full bg-cover bg-center" style={{ backgroundImage: `url(${backdrop})` }} />
        ) : (
          <div className="size-full bg-surface" />
        )}
      </div>
      <div className={wrap}>
        <div className="relative mx-auto max-w-[66rem] pb-[30%] md:pb-[9%]">
          <figure className="w-full overflow-hidden rounded-[clamp(0.5rem,1vw,0.875rem)] bg-[#141210] shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_60px_120px_-40px_rgb(40_15_0/0.65),0_30px_60px_-30px_rgb(40_15_0/0.4)] md:w-[84%]">
            <div className="flex h-[clamp(1.375rem,2.6vw,2.25rem)] items-center gap-[clamp(0.25rem,0.5vw,0.4rem)] border-b border-white/[0.06] px-[clamp(0.5rem,1.1vw,0.875rem)]">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span key={c} aria-hidden className="size-[clamp(0.375rem,0.75vw,0.625rem)] rounded-full" style={{ background: c }} />
              ))}
              {win.title && <span className="mx-auto pr-10 font-display text-[clamp(0.5625rem,0.9vw,0.75rem)] text-white/45">{win.title}</span>}
            </div>
            <Picture image={win} className="block h-auto w-full" />
          </figure>
          <Device image={device} className="absolute bottom-0 right-[-2%] w-[34%] md:right-0 md:w-[23%]" />
        </div>
      </div>
    </div>
  );
}
