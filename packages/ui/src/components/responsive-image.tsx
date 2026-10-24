"use client";

import { useEffect, useRef, useState, type CSSProperties, type ImgHTMLAttributes } from "react";
import { cn } from "../lib/utils";

export type ImageSource = { srcSet: string; media?: string; type?: string; sizes?: string };
export type ResponsiveImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "width" | "height" | "alt" | "src"> & {
  src: string;
  alt: string;
  width: number;
  height: number;
  sources?: ImageSource[];
  /** CSS object-position values; preserve the subject at each breakpoint. */
  focalPoint?: string;
  wideFocalPoint?: string;
  imageClassName?: string;
};

/** Native picture selection, reserved geometry and an explicit failure state. */
export function ResponsiveImage({ src, ...props }: ResponsiveImageProps) {
  return <Image key={JSON.stringify([src, props.srcSet, props.sources])} src={src} {...props} />;
}

function Image({ src, alt, width, height, sources, focalPoint = "50% 50%", wideFocalPoint = focalPoint, className, imageClassName, style, onLoad, onError, loading = "lazy", decoding = "async", ...props }: ResponsiveImageProps) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => { if (ref.current?.complete) setState(ref.current.naturalWidth ? "ready" : "error"); }, []);
  return <span aria-hidden={alt === "" ? true : undefined} data-media-state={state} className={cn("relative block overflow-hidden bg-muted", className)} style={{ aspectRatio: `${width} / ${height}`, ...style }}>
    <picture aria-hidden={state === "error" ? true : undefined}>
      {sources?.map(source => <source key={`${source.media ?? ""}:${source.srcSet}`} {...source} />)}
      <img {...props} ref={ref} src={src} alt={alt} width={width} height={height} loading={loading} decoding={decoding}
        style={{ "--media-focal": focalPoint, "--media-focal-wide": wideFocalPoint } as CSSProperties}
        className={cn("absolute inset-0 size-full object-cover object-[var(--media-focal)] md:object-[var(--media-focal-wide)]", imageClassName, state === "error" && "opacity-0")}
        onLoad={event => { setState("ready"); onLoad?.(event); }} onError={event => { setState("error"); onError?.(event); }} />
    </picture>
    {state === "error" && <span role="img" aria-label={alt ? `${alt} — image unavailable` : "Image unavailable"} className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-muted-foreground">Image unavailable</span>}
  </span>;
}
