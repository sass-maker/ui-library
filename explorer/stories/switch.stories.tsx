import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/switch";

const meta = { title: "Inputs/Switch", component: C.Switch, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/switch`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { const [on,setOn]=useState(true);return <div className="story-stack"><label className="story-row"><C.Switch checked={on} onCheckedChange={setOn}/> Respect reduced motion</label><label className="story-row"><C.Switch disabled/> Unavailable setting</label><p className="story-caption">Preview setting only: {on ? "enabled" : "disabled"}.</p></div>; } };
