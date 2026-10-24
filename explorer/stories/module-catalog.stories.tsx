import type { Meta, StoryObj } from "@storybook/react-vite";
import { sourceSnippets } from "virtual:fleet-example-source";
import { CopyButton } from "@saas-maker/ui/recipes/copy-button";
import { ModuleCatalogExample } from "./module-catalog-examples";

const meta = { title: "Start here/Catalog", tags: ["!autodocs"], parameters: { layout: "fullscreen", docs: { description: { component: "A complete data workspace driven by the actual library inventory. Every import is compiled, every live-example ID is checked, and the source is copyable." } } } } satisfies Meta;
export default meta;

export const AllModules: StoryObj = {
  parameters: { docs: { source: { code: sourceSnippets.ModuleCatalogExample, type: "code", language: "tsx" } } },
  render: () => <><aside aria-label="Example source" className="flex items-center justify-between gap-4 border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground"><span>Complete data workspace · repository inventory</span><CopyButton value={sourceSnippets.ModuleCatalogExample} label="Copy module browser source" className="[&_button]:size-11" /></aside><ModuleCatalogExample /></>,
};
