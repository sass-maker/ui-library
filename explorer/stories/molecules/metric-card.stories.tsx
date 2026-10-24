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


const meta = { component: MetricCard, title: "Molecules/Compositions/Metric card", parameters: { docs: { description: { component: "A labeled value, supporting context and an optional trend, presented with a compact sparkline.\n\nImport from `@saas-maker/ui/molecules/metric-card`. A focused composition of shared atoms. Examples use local illustrative data. Try the interactions and compare themes, viewport sizes, and reduced motion." } } } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Metrics: Story = { render: function Render() {
  const [read, setRead] = useState(false);
  return <div className="w-full max-w-4xl space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium">Review activity</p><Button variant="outline" size="sm" onClick={() => setRead(!read)}>{read ? "Reset unread" : "Mark feedback read"}</Button></div><div className="grid gap-4 sm:grid-cols-3">{sampleMetrics.map((metric, index) => <MetricCard key={metric.label} {...metric} value={read && index === 2 ? "0" : metric.value} />)}</div><p className="story-caption">Counts come from the sample files, checklist and inbox. Marking feedback read cross-fades the unread count.</p></div>;
} };


export const Controls: StoryObj<typeof MetricCard> = {
  args: { ...sampleMetrics[0] },
  render: args => <div className="w-full max-w-sm"><MetricCard {...args} /></div>,
};
