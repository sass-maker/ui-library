import type { Meta, StoryObj } from "@storybook/react-vite";
import { sourceSnippets } from "virtual:fleet-example-source";
import { KithMediaPage } from "./media-examples";
import { ResponsiveImage } from "@saas-maker/ui/components/responsive-image";
import { Video } from "@saas-maker/ui/components/video";
import { MediaFrame } from "@saas-maker/ui/molecules/media-frame";
import { MediaSequence } from "@saas-maker/ui/organisms/media-sequence";
import { CopyButton } from "@saas-maker/ui/recipes/copy-button";

const meta = { title: "Start here/Media", tags: ["!autodocs"], parameters: { layout: "fullscreen" } } satisfies Meta;
export default meta;

export const CompletePage: StoryObj = { parameters: { docs: { source: { code: sourceSnippets.KithMediaPage, type: "code", language: "tsx" } } }, render: () => <><aside aria-label="Example tools" className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-5 py-2 text-xs text-muted-foreground sm:px-10"><span>Complete page / Kith</span><div className="flex items-center gap-4"><a target="_top" href="./?path=/story/start-here-media--primitives" className="inline-flex min-h-11 items-center rounded-sm underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore the media layers</a><CopyButton value={sourceSnippets.KithMediaPage} label="Copy complete page source" className="[&_button]:size-11" /></div></aside><KithMediaPage /></> };
export const Primitives: StoryObj = { render: () => <main className="mx-auto max-w-4xl space-y-9 px-5 py-10">
  <header><p className="eyebrow">Atoms → molecules → organisms</p><h1 className="mt-3 font-display text-4xl">Media that belongs.</h1><p className="mt-4 text-sm text-muted-foreground">Native responsive images, deliberate video playback, shared captions and a browsable product sequence.</p></header>
  <MediaFrame caption="Native picture selection: the small viewport uses a coastal scene; the wider viewport uses a memory table." credit="Existing Kith artwork"><ResponsiveImage src="./demo/kith/memory-table-v2.webp" sources={[{ media: "(max-width: 600px)", srcSet: "./demo/kith/coastal-walk-v2.webp" }]} alt="Responsive Kith artwork" width={960} height={600} className="rounded-xl" /></MediaFrame>
  <MediaFrame caption="The movie is not requested until playback. It pauses offscreen and on a live reduced-motion change."><Video title="Kith screen sequence" poster="./demo/kith/onboarding.webp" sources={[{ src: "./visual/kith-sequence.webm", type: "video/webm" }, { src: "./visual/kith-sequence.mp4", type: "video/mp4" }]} captions={{ src: "./visual/kith-sequence.vtt", language: "en", label: "English descriptions" }} /></MediaFrame>
  <MediaSequence label="Media layers" chapters={[{ id: "image", title: "Image", description: "Reserved geometry, art direction and a visible fallback.", caption: "Image atom inside the media-frame molecule.", media: <ResponsiveImage src="./demo/kith/memory-table-v2.webp" alt="Kith memory table" width={760} height={507} className="rounded-xl" /> }, { id: "fallback", title: "Failure", description: "A failed image retains its space and meaningful alternative.", caption: "Deliberate missing-image fixture.", media: <ResponsiveImage src="./visual/intentionally-missing.webp" alt="Example artwork" width={760} height={507} className="rounded-xl" /> }, { id: "recovery", title: "Recovery", description: "The small-viewport source deliberately fails. A wider source can still recover when the viewport changes.", caption: "Resize past600px to recover the image without reloading the page.", media: <ResponsiveImage src="./demo/kith/memory-table-v2.webp" sources={[{ media: "(max-width: 600px)", srcSet: "./visual/intentionally-missing.webp" }]} alt="Responsive recovery artwork" width={760} height={507} className="rounded-xl" /> }]} />
  <div aria-hidden className="h-[100vh]" />
</main> };
