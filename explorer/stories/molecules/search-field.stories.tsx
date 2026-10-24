import { useArgs } from "storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { Badge } from "@saas-maker/ui/atoms/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@saas-maker/ui/molecules/dialog";
import { SearchField } from "@saas-maker/ui/molecules/search-field";
import { InputField } from "@saas-maker/ui/molecules/input-field";
import { SettingRow } from "@saas-maker/ui/molecules/setting-row";
import { MetricCard } from "@saas-maker/ui/molecules/metric-card";
import { FileCard } from "@saas-maker/ui/molecules/file-card";
import { ActivityItem } from "@saas-maker/ui/molecules/activity-item";
import { sampleActivity, sampleFiles, sampleMetrics } from "../composition-fixtures";


const meta = { component: SearchField, title: "Molecules/Compositions/Search field", parameters: { docs: { description: { component: "A labeled search input with a clear action that restores focus to the field.\n\nImport from `@saas-maker/ui/molecules/search-field`. A focused composition of shared atoms. Examples use local illustrative data. Try the interactions and compare themes, viewport sizes, and reduced motion." } } } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Search: Story = { render: function Render() {
  const [value, setValue] = useState("");
  const results = sampleFiles.filter(file => file.name.toLowerCase().includes(value.toLowerCase()));
  return <div className="w-full max-w-md"><div className="mb-5 flex items-center justify-between"><h2 className="text-sm font-semibold">Search the asset library</h2><Badge variant="outline">{results.length}</Badge></div>
    <SearchField label="Search the library" value={value} onValueChange={setValue} placeholder="Try “home” or “release”…" />
    <ul className="mt-4 divide-y divide-border rounded-lg border border-border">{results.map(file => <li key={file.id} className="flex items-center justify-between gap-3 p-3 text-[0.8125rem]"><span className="min-w-0 truncate">{file.name}</span><span className="shrink-0 text-xs text-muted-foreground">{file.size}</span></li>)}</ul>
    {results.length === 0 && <p role="status" className="mt-5 text-sm text-muted-foreground">No files match “{value}”. Try another name.</p>}
  </div>;
} };


export const Controls: StoryObj<typeof SearchField> = {
  args: { label: "Search files", value: "", placeholder: "Search the library…", disabled: false, onValueChange: () => {} },
  render: function Render() { const [args, updateArgs] = useArgs<React.ComponentProps<typeof SearchField>>(); return <div className="w-full max-w-md"><SearchField {...args} onValueChange={value => updateArgs({ value })} /></div>; },
};
