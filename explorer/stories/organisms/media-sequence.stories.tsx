import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResponsiveImage } from "@saas-maker/ui/atoms/responsive-image";
import { MediaSequence } from "@saas-maker/ui/organisms/media-sequence";

const meta = { title: "Organisms/Media/Media sequence", component: MediaSequence, parameters: { docs: { description: { component: "A product story composed from native tabs and captioned media. Import from `@saas-maker/ui/organisms/media-sequence`. Arrow keys move between chapters; changing a chapter removes its video and stops playback. Content is stable while reading." } } } } satisfies Meta<typeof MediaSequence>;
export default meta;
export const Chapters: StoryObj = { render: () => <MediaSequence label="Kith story" chapters={[
  { id: "people", title: "Your people", description: "A private relationship-memory app for iPhone.", caption: "Existing Kith artwork", media: <ResponsiveImage src="./demo/kith/coastal-walk-v2.webp" alt="Kith coastal scene" width={760} height={507} className="rounded-xl" /> },
  { id: "moments", title: "Their moments", description: "Keep the small details and dated moments that help you show up with context.", caption: "Existing Kith artwork", media: <ResponsiveImage src="./demo/kith/memory-table-v2.webp" alt="Kith memory table" width={760} height={507} className="rounded-xl" /> },
]} /> };
