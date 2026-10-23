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


const meta = { component: SettingRow, title: "Molecules/Compositions/Setting row", parameters: { docs: { description: { component: "Import from `@saas-maker/ui/molecules/setting-row`. A focused composition of shared atoms. Examples use local illustrative data. Try the interactions and compare themes, viewport sizes, and reduced motion." } } } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Preferences: Story = { render: function Render() {
  const [digest, setDigest] = useState(false);
  const [updates, setUpdates] = useState(true);
  return <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card px-5 sm:px-6"><SettingRow label="Weekly digest" description="A short digest of what changed, what’s ready, and what comes next." checked={digest} onCheckedChange={setDigest} /><div className="border-t border-border" /><SettingRow label="Release notifications" description="A note when a new release is ready. No daily noise." checked={updates} onCheckedChange={setUpdates} /></div>;
} };


export const Controls: StoryObj<typeof SettingRow> = {
  args: { label: "Weekly digest", description: "One thoughtful summary of what changed.", checked: false, disabled: false, onCheckedChange: () => {} },
  render: function Render() { const [args, updateArgs] = useArgs<React.ComponentProps<typeof SettingRow>>(); return <div className="w-full max-w-lg"><SettingRow {...args} onCheckedChange={checked => updateArgs({ checked })} /></div>; },
};
