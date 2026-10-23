import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/calendar";

const meta = { title: "Inputs/Calendar", component: C.Calendar, parameters: {"docs": {"description": {"component": "Single-date keyboard selection; the same component supports ranges and multiple dates.\n\nImport from `@saas-maker/ui/components/calendar`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { const [date,setDate]=useState<Date | undefined>(new Date(2026,9,23));return <div className="story-stack"><C.Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={new Date(2026,9,1)} className="w-fit rounded-xl border border-border"/><p className="story-caption">{date ? date.toLocaleDateString() : "Choose a date"}</p></div>; } };
