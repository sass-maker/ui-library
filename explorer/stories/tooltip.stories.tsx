import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/tooltip";

const meta = { title: "Overlays/Tooltip", component: C.Tooltip, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/tooltip`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-row">{[{label:"Search components",icon:<Search/>},{label:"Create project",icon:<Plus/>},{label:"Open settings",icon:<Settings/>}].map(item=><C.Tooltip key={item.label}><C.TooltipTrigger asChild><Button variant="outline" size="icon" aria-label={item.label}>{item.icon}</Button></C.TooltipTrigger><C.TooltipContent>{item.label}</C.TooltipContent></C.Tooltip>)}</div>; } };
