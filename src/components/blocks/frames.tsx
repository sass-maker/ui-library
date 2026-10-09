import * as React from "react";
import { cn } from "@/lib/utils";

type ImgProps = { src: string; alt: string; width?: number; height?: number; priority?: boolean };

function Img({ src, alt, width, height, priority, className }: ImgProps & { className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={cn("block h-auto w-full", className)}
    />
  );
}

/** Desktop app or web capture inside quiet window chrome. */
export function WindowFrame({
  image,
  title,
  chrome = "mac",
  className,
  children,
}: {
  image?: ImgProps;
  title?: string;
  chrome?: "mac" | "browser" | "none";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-xl ring-1 ring-black/[0.03]",
        className,
      )}
    >
      {chrome !== "none" && (
        <div className="flex h-9 items-center gap-3 border-b border-hairline bg-surface px-3.5">
          <div aria-hidden className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[oklch(0.7_0.17_25)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.82_0.15_85)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.75_0.15_150)]" />
          </div>
          {title && (
            <span
              className={cn(
                "mx-auto truncate font-mono text-[0.6875rem] text-muted-foreground",
                chrome === "browser" && "rounded-md border border-hairline bg-background px-3 py-0.5",
              )}
            >
              {title}
            </span>
          )}
          <span aria-hidden className="w-[42px]" />
        </div>
      )}
      {image ? <Img {...image} /> : children}
    </figure>
  );
}

/** iPhone silhouette around an original portrait capture. */
export function PhoneFrame({ image, className }: { image: ImgProps; className?: string }) {
  return (
    <figure
      className={cn(
        "relative mx-auto w-full max-w-[18rem] rounded-[2.9rem] bg-[oklch(0.18_0.005_60)] p-[0.6rem] shadow-xl ring-1 ring-black/10",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[2.35rem] bg-black">
        <Img {...image} />
      </div>
      <span aria-hidden className="absolute left-1/2 top-[1.15rem] h-[1.45rem] w-[5.6rem] -translate-x-1/2 rounded-full bg-black" />
    </figure>
  );
}

/** Photograph or artwork with a paper mat and optional caption. */
export function Photo({
  image,
  caption,
  note,
  tilt,
  className,
}: {
  image: ImgProps;
  caption?: React.ReactNode;
  /** Small provenance note, e.g. "Illustrative artwork". */
  note?: string;
  tilt?: "left" | "right";
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "rounded-[calc(var(--radius)*0.6)] bg-card p-2 shadow-lg ring-1 ring-black/5",
        tilt === "left" && "-rotate-2",
        tilt === "right" && "rotate-2",
        className,
      )}
    >
      <Img {...image} className="rounded-[calc(var(--radius)*0.4)]" />
      {(caption || note) && (
        <figcaption className="flex items-baseline justify-between gap-3 px-1.5 pb-0.5 pt-2.5 text-[0.8125rem]">
          {caption && <span className="text-foreground">{caption}</span>}
          {note && <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">{note}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/** Full-bleed artwork panel with rounded corners; used for scenes and footers. */
export function Artwork({ image, className, overlay }: { image: ImgProps; className?: string; overlay?: React.ReactNode }) {
  return (
    <figure className={cn("relative overflow-hidden rounded-2xl", className)}>
      <Img {...image} className="h-full object-cover" />
      {overlay && <div className="absolute inset-0 flex items-end p-6 sm:p-10">{overlay}</div>}
    </figure>
  );
}

/** Image-led card for catalogs, collections and categories. */
export function MediaCard({
  image,
  label,
  title,
  href,
  meta,
  className,
}: {
  image: ImgProps;
  label?: string;
  title: React.ReactNode;
  href?: string;
  meta?: React.ReactNode;
  className?: string;
}) {
  const Comp = href ? "a" : "div";
  return (
    <Comp
      {...(href ? { href } : {})}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[calc(var(--radius)*1.2)] bg-card shadow-sm ring-1 ring-black/5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <div className="overflow-hidden">
        <Img {...image} className="aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {label && <span className="eyebrow">{label}</span>}
        <span className="font-display text-[1.625rem] leading-[1.08]">{title}</span>
        {meta && <span className="mt-auto pt-2 text-sm text-muted-foreground">{meta}</span>}
      </div>
    </Comp>
  );
}

/**
 * A stage: product UI composed over art. The backdrop is product artwork or
 * generated brand light; `main` sits centered and `overlay` overlaps a corner.
 * This is the hero pattern behind Cursor and Stripe pages.
 */
export function Stage({
  backdrop,
  main,
  overlay,
  overlayPosition = "bottom-left",
  caption,
  className,
}: {
  backdrop: { image?: ImgProps } | "mesh";
  main: React.ReactNode;
  overlay?: React.ReactNode;
  overlayPosition?: "bottom-left" | "bottom-right" | "top-right";
  caption?: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("relative", className)}>
      <div className="relative isolate overflow-hidden rounded-2xl ring-1 ring-black/5">
        {backdrop === "mesh" ? (
          <div aria-hidden className="mesh grain absolute inset-0 -z-10" />
        ) : (
          backdrop.image && (
            <img
              src={backdrop.image.src}
              alt=""
              loading={backdrop.image.priority ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 -z-10 size-full object-cover"
            />
          )
        )}
        <div className="px-4 pb-0 pt-6 sm:px-10 sm:pt-10 lg:px-14 lg:pt-12">
          <div className="translate-y-px [&>figure]:rounded-b-none [&>figure]:border-b-0">{main}</div>
        </div>
      </div>
      {overlay && (
        <div
          className={cn(
            "relative z-10 mx-4 -mt-10 sm:absolute sm:mx-0 sm:mt-0 sm:w-[min(24rem,46%)]",
            overlayPosition === "bottom-left" && "sm:-bottom-8 sm:-left-6",
            overlayPosition === "bottom-right" && "sm:-bottom-8 sm:-right-6",
            overlayPosition === "top-right" && "sm:-right-6 sm:top-10",
          )}
        >
          {overlay}
        </div>
      )}
      {caption && (
        <figcaption
          className={cn(
            "mt-4 font-mono text-xs text-muted-foreground sm:mt-5",
            !overlay && "text-center",
            overlay && overlayPosition === "bottom-left" && "sm:pl-[calc(min(24rem,46%)+1rem)] sm:text-right",
            overlay && overlayPosition !== "bottom-left" && "sm:pr-[calc(min(24rem,46%)+1rem)]",
          )}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
