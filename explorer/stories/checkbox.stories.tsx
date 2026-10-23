import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/checkbox";

const meta = { id: "inputs-checkbox", title: "Atoms/Inputs/Checkbox", component: C.Checkbox, parameters: {"docs": {"description": {"component": "A small selection control with visible checked, mixed, focus, and disabled states.\n\nImport from `@saas-maker/ui/atoms/checkbox`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { const [checked,setChecked]=useState<boolean | "indeterminate">("indeterminate"); return <div className="story-stack"><label className="story-row"><C.Checkbox checked={checked} onCheckedChange={setChecked} /> Include selected projects</label><label className="story-row"><C.Checkbox defaultChecked /> Show active products</label><label className="story-row"><C.Checkbox disabled /> Unavailable option</label></div>; } };
