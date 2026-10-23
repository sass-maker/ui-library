import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/calendar";

const meta = { id: "inputs-calendar", title: "Molecules/Inputs/Calendar", component: C.Calendar, parameters: {"docs": {"description": {"component": "Choose a date with a readable grid, keyboard navigation, and complete day names.\n\nImport from `@saas-maker/ui/molecules/calendar`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { const [date,setDate]=useState<Date | undefined>(new Date(2026,9,23));return <div className="story-stack"><C.Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={new Date(2026,9,1)} className="w-fit rounded-xl border border-border"/><p className="story-caption">{date ? date.toLocaleDateString() : "Choose a date"}</p></div>; } };
