"use client";
/** Adapted from magicuidesign/magicui, MIT. See THIRD_PARTY_NOTICES.md.
 * Fleet: Radix modal focus and dismissal, semantic surfaces, deliberate media loading.
 */
import { Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../components/dialog";
import { cn } from "../lib/utils";

export function HeroVideoDialog({ videoSrc, thumbnailSrc, thumbnailAlt = "Play product walkthrough", title = "Product walkthrough", className }: {
  videoSrc: string; thumbnailSrc: string; thumbnailAlt?: string; title?: string; className?: string;
}) {
  return <Dialog>
    <DialogTrigger asChild>
      <button type="button" aria-label={`Play ${title}`} className={cn("group relative block w-full overflow-hidden rounded-xl border border-border bg-card outline-none focus-visible:ring-[3px] focus-visible:ring-ring", className)}>
        <img src={thumbnailSrc} alt={thumbnailAlt} width={1600} height={900} loading="lazy" className="aspect-video w-full object-cover transition-[filter] duration-200 group-hover:brightness-90" />
        <span aria-hidden className="absolute inset-0 grid place-items-center"><span className="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"><Play className="size-6 fill-current" /></span></span>
      </button>
    </DialogTrigger>
    <DialogContent className="w-[calc(100%-2rem)] max-w-5xl p-3 sm:max-w-5xl" aria-describedby={undefined}>
      <DialogTitle className="sr-only">{title}</DialogTitle>
      <iframe src={videoSrc} title={title} className="aspect-video w-full rounded-lg border-0" allowFullScreen allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" />
    </DialogContent>
  </Dialog>;
}
