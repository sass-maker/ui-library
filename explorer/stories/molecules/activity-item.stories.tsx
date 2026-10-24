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


const meta = { component: ActivityItem, title: "Molecules/Compositions/Activity item", parameters: { docs: { description: { component: "A readable timeline entry that pairs an actor, action and time with a consistent status marker.\n\nImport from `@saas-maker/ui/molecules/activity-item`. A focused composition of shared atoms. Examples use local illustrative data. Try the interactions and compare themes, viewport sizes, and reduced motion." } } } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Activity: Story = { render: function Render() {
  const [added, setAdded] = useState(false);
  const items = added ? [{ ...sampleActivity[0], id: "new", actor: "You", subject: "the motion review", time: "Just now" }, ...sampleActivity] : sampleActivity;
  return <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6"><div className="mb-7 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">Recent activity</h2><Button variant="ghost" size="sm" disabled={added} onClick={() => setAdded(true)}><Plus />Add activity</Button></div><ol><AnimatePresence initial={false}>{items.map((entry,index) => <ActivityItem key={entry.id} entry={entry} last={index === items.length-1} />)}</AnimatePresence></ol></div>;
} };

export const Controls: StoryObj<typeof ActivityItem> = {
  args: { entry: sampleActivity[0], last: true },
  render: args => <ol className="w-full max-w-md"><ActivityItem {...args} /></ol>,
};
