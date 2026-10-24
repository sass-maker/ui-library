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


const meta = { component: InputField, title: "Molecules/Compositions/Input field", parameters: { docs: { description: { component: "A field composed with its label, description and validation message, with the associations handled together.\n\nImport from `@saas-maker/ui/molecules/input-field`. A focused composition of shared atoms. Examples use local illustrative data. Try the interactions and compare themes, viewport sizes, and reduced motion." } } } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Fields: Story = { render: function Render() {
  const [email, setEmail] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [done, setDone] = useState(false);
  const error = attempted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter an email address with a name and domain." : undefined;
  return <form noValidate className="w-full max-w-md space-y-6" onSubmit={event => { event.preventDefault(); setAttempted(true); if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setDone(true); }}>
    <div><h2 className="text-lg font-semibold tracking-tight">Workspace details</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">A label, an input, and useful feedback should feel like one decision.</p></div>
    <InputField label="Workspace name" defaultValue="Kith Studio" description="A familiar name for the people you work with." />
    <InputField label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={event => { setEmail(event.target.value); setDone(false); }} error={error} description="We’ll use this for workspace invitations." />
    <InputField label="Your role" optional placeholder="Designer, developer, or something in between" />
    <Button type="submit">{done ? <><Check />Looking good</> : "Check details"}</Button>
    {done && <p role="status" className="text-sm text-muted-foreground">Valid example details. No invitation was sent.</p>}
  </form>;
} };


export const Controls: StoryObj<typeof InputField> = {
  args: { label: "Workspace name", placeholder: "A familiar name", description: "Use a name your team will recognize.", optional: false, disabled: false, error: "" },
  render: args => <div className="w-full max-w-md"><InputField {...args} /></div>,
};
