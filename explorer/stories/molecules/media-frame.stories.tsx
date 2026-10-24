import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResponsiveImage } from "@saas-maker/ui/atoms/responsive-image";
import { MediaFrame } from "@saas-maker/ui/molecules/media-frame";

const meta = { title: "Molecules/Media/Media frame", component: MediaFrame, parameters: { docs: { description: { component: "Give images, video or interactive artwork one consistent caption and credit. Import from `@saas-maker/ui/molecules/media-frame`. Compose the media inside; the frame does not invent captions or attribution." } } } } satisfies Meta<typeof MediaFrame>;
export default meta;
export const CaptionAndCredit: StoryObj = { render: () => <MediaFrame caption="A place for the people you keep close." credit="Existing Kith artwork" className="max-w-3xl"><ResponsiveImage src="./demo/kith/coastal-walk-v2.webp" alt="An illustrative coastal walk from Kith" width={760} height={507} className="rounded-xl" /></MediaFrame> };
