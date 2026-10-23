import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/checkbox";

const meta = { title: "Inputs/Checkbox", component: C.Checkbox, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/checkbox`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { const [checked,setChecked]=useState<boolean | "indeterminate">("indeterminate"); return <div className="story-stack"><label className="story-row"><C.Checkbox checked={checked} onCheckedChange={setChecked} /> Include selected projects</label><label className="story-row"><C.Checkbox defaultChecked /> Show active products</label><label className="story-row"><C.Checkbox disabled /> Unavailable option</label></div>; } };
