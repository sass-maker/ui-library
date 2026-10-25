import type { Meta, StoryObj } from "@storybook/react-vite";
import { sourceSnippets } from "virtual:fleet-example-source";
import { LiveBackdropExample, KithBackdropExample } from "../backdrop-examples";
import { MediaBackdrop } from "@saas-maker/ui/molecules/media-backdrop";

const meta = {
  title: "Molecules/Media/Media backdrop",
  component: MediaBackdrop,
  parameters: { layout: "fullscreen", docs: { description: { component: "Original artwork and optional silent film, with a readable foreground that belongs to the product.\n\nThe poster is the first render and remains the reduced-motion/data-saving fallback. Video loads only after play unless a product explicitly opts into visible-only autoplay. A permanent 44px pause control, offscreen-artwork/hidden-tab pause and failure recovery are built in. The default layout=\"cover\" places copy over cropped artwork with a readability gradient. Use layout=\"stacked\" for the complete picture above a separate foreground; video and its controls stay within the picture. Supply posterSize={{ width, height }} from the actual asset to reserve its intrinsic aspect ratio before it loads. focalPoint applies to cover crops; className, contentClassName and children remain available for product composition. Import from `@saas-maker/ui/molecules/media-backdrop`." } } },
} satisfies Meta<typeof MediaBackdrop>;
export default meta;
type Story = StoryObj;

export const VideoCover: Story = { parameters: { docs: { source: { code: sourceSnippets.LiveBackdropExample, type: "code", language: "tsx" } } }, render: () => <LiveBackdropExample /> };
export const AutomaticVideo: Story = { parameters: { docs: { source: { code: sourceSnippets.LiveBackdropExample, type: "code", language: "tsx" } } }, render: () => <LiveBackdropExample autoPlay /> };
export const StackedVideo: Story = { render: () => <LiveBackdropExample layout="stacked" /> };
export const ImageCover: Story = { name: "Stacked image", parameters: { docs: { source: { code: sourceSnippets.KithBackdropExample, type: "code", language: "tsx" } } }, render: () => <KithBackdropExample /> };
