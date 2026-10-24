import type { Meta, StoryObj } from "@storybook/react-vite";
import { sourceSnippets } from "virtual:fleet-example-source";
import { ModuleCatalogExample } from "./module-catalog-examples";

const meta = { title: "Start here/Catalog", tags: ["!autodocs"], parameters: { layout: "fullscreen", docs: { description: { component: "A complete data workspace driven by the actual library inventory. Every import is compiled, every live-example ID is checked, and the source is copyable." } } } } satisfies Meta;
export default meta;

export const AllModules: StoryObj = {
  parameters: { docs: { source: { code: sourceSnippets.ModuleCatalogExample, type: "code", language: "tsx" } } },
  render: () => <ModuleCatalogExample sourceCode={sourceSnippets.ModuleCatalogExample} />,
};
