import type { Meta, StoryObj } from "@storybook/react-vite";
import { sourceSnippets } from "virtual:fleet-example-source";
import { StateLabExample } from "./system-examples";

const meta = { title: "Start here/States", tags: ["!autodocs"], parameters: { docs: { description: { component: "Inspect and recover from ready, loading, empty, and error states in the same composed asset library." } } } } satisfies Meta;
export default meta;

export const StateLab: StoryObj = {
  parameters: { docs: { source: { code: sourceSnippets.StateLabExample, type: "code", language: "tsx" } } },
  render: () => <StateLabExample />,
};
