import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/dialog";

const meta = { title: "Overlays/Dialog", component: C.Dialog, parameters: {"docs": {"description": {"component": "Modal focus, Escape dismissal, accessible title, and focus return use Radix.\n\nImport from `@saas-maker/ui/components/dialog`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Dialog><C.DialogTrigger asChild><Button variant="outline">Edit project</Button></C.DialogTrigger><C.DialogContent><C.DialogHeader><C.DialogTitle>Edit project</C.DialogTitle><C.DialogDescription>Update the display name for this local example.</C.DialogDescription></C.DialogHeader><label className="story-label">Project name<input className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue="UI Library"/></label><C.DialogFooter><C.DialogClose asChild><Button variant="outline">Cancel</Button></C.DialogClose><C.DialogClose asChild><Button>Save changes</Button></C.DialogClose></C.DialogFooter></C.DialogContent></C.Dialog>; } };
