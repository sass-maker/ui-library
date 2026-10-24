import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/dialog";
import { InputField } from "@saas-maker/ui/molecules/input-field";

const meta = { id: "overlays-dialog", title: "Molecules/Overlays/Dialog", component: C.Dialog, parameters: {"docs": {"description": {"component": "A focused task with an accessible title, Escape dismissal, contained scrolling, and focus return.\n\nImport from `@saas-maker/ui/molecules/dialog`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() {
  const [name, setName] = useState("UI Library");
  const [draft, setDraft] = useState(name);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const field = useRef<HTMLInputElement>(null);
  return <div className="story-stack max-w-lg"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5"><div><p className="text-xs text-muted-foreground">Project details</p><p role="status" className="mt-2 text-lg font-medium [overflow-wrap:anywhere]">{name}</p></div>
    <C.Dialog open={open} onOpenChange={next => { if (next) { setDraft(name); setError(undefined); } setOpen(next); }}><C.DialogTrigger asChild><Button variant="outline">Edit project</Button></C.DialogTrigger><C.DialogContent>
      <C.DialogHeader><C.DialogTitle>Edit project</C.DialogTitle><C.DialogDescription>A name your team will recognize. Changes apply to this local example.</C.DialogDescription></C.DialogHeader>
      <form className="grid gap-7" noValidate onSubmit={event => { event.preventDefault(); if (!draft.trim()) { setError("Enter a project name."); field.current?.focus(); return; } setName(draft.trim()); setOpen(false); }}>
        <InputField ref={field} label="Project name" value={draft} maxLength={80} required error={error} description="Shown in navigation, search and shared links." onChange={event => { setDraft(event.target.value); setError(undefined); }} />
        <C.DialogFooter><C.DialogClose asChild><Button type="button" variant="outline">Cancel</Button></C.DialogClose><Button type="submit">Save changes</Button></C.DialogFooter>
      </form>
    </C.DialogContent></C.Dialog></div><p className="story-caption">Save a name, cancel a draft, or try submitting an empty field. Escape returns you to the trigger.</p></div>;
} };
