import type { Meta, StoryObj } from "@storybook/react-vite";
import { sourceSnippets } from "virtual:fleet-example-source";
import { AtomicCompositionExample } from "./system-examples";

const meta = { title: "Start here/Composition", parameters: { docs: { description: { component: "Atomic architecture is a dependency direction. Edit one shared draft across an atom, a molecule, and a complete settings organism." } } } } satisfies Meta;
export default meta;

export const FromAtomToOrganism: StoryObj = {
  parameters: { docs: { source: { code: sourceSnippets.AtomicCompositionExample, type: "code", language: "tsx" } } },
  render: () => <AtomicCompositionExample />,
};
