import { ArrowUpRight } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { MediaBackdrop, type MediaBackdropProps } from "@saas-maker/ui/molecules/media-backdrop";

const liveSources = [{ src: "./visual/hobby-horizon.mp4", type: "video/mp4" }];

export function LiveBackdropExample({ autoPlay = false, layout = "cover" }: { autoPlay?: boolean; layout?: MediaBackdropProps["layout"] }) {
  return <div className="w-full p-3 sm:p-6">
    <MediaBackdrop label="Live adventure preview" poster="./visual/hobby-horizon-poster.webp" posterSize={{ width: 1280, height: 720 }} layout={layout} sources={liveSources} autoPlay={autoPlay} focalPoint="55% 50%" className={layout === "cover" ? "min-h-[40rem] sm:min-h-[44rem]" : undefined} contentClassName="pb-6 sm:pb-8">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">Live · A little more life</p>
      <h1 className="max-w-[12ch] font-display text-[clamp(2.75rem,1.6rem+4vw,5.5rem)] leading-[1.02] tracking-tight">Make room for <em className="font-accent font-normal">a little wonder.</em></h1>
      <p className="mt-6 max-w-[36ch] text-base leading-relaxed text-white/90 sm:text-lg">Bucket-list ideas and side quests, with a place to keep your own plans.</p>
      <Button asChild size="xl" className="mt-8 gap-6 rounded-full"><a href="https://live.significanthobbies.com">Explore Live <ArrowUpRight aria-hidden className="size-4" /></a></Button>
    </MediaBackdrop>
    <p className="mx-1 mt-4 text-xs leading-relaxed text-muted-foreground">Original Live product artwork and silent film. <a href="./visual/live-horizon-source.json" className="underline underline-offset-4">Source and license</a>.</p>
  </div>;
}


export function KithBackdropExample() {
  return <div className="w-full p-3 sm:p-6">
  <MediaBackdrop label="Kith coastal artwork" poster="./demo/kith/coastal-walk-v2.webp" layout="stacked" posterSize={{ width: 760, height: 507 }} contentClassName="max-w-3xl">
    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">Kith · Keep close</p>
    <h1 className="max-w-[12ch] font-display text-[clamp(2.75rem,1.6rem+4vw,5.5rem)] leading-[1.02] tracking-tight">A little space <em className="font-accent font-normal">for your people.</em></h1>
    <p className="mt-6 max-w-[34ch] text-base leading-relaxed text-white/90 sm:text-lg">Remember the details. Make time for the people who matter.</p>
    <div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="outline" size="xl" className="rounded-full"><a target="_top" href="./?path=/story/start-here-media--complete-page">Explore the Kith example <ArrowUpRight aria-hidden className="size-4" /></a></Button><Button asChild variant="ghost" size="xl" className="rounded-full"><a target="_top" href="./?path=/story/start-here-media--primitives">Media layers</a></Button></div>
  </MediaBackdrop>
  <p className="mx-1 mt-4 text-xs leading-relaxed text-muted-foreground">Original Kith artwork. The complete illustration stays clear of the foreground copy, which sits on its own readable surface.</p>
</div>;
}
