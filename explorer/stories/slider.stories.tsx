import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/slider";

const meta = { id: "inputs-slider", title: "Atoms/Inputs/Slider", component: C.Slider, argTypes: { orientation: { options: ["horizontal", "vertical"], control: "inline-radio" } }, parameters: {"docs": {"description": {"component": "Direct manipulation with native keyboard behavior and an accessible name on every thumb.\n\nImport from `@saas-maker/ui/atoms/slider`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj<{ orientation?: "horizontal" | "vertical" }>;

export const Playground: Story = { args: { orientation: "horizontal" }, render: function Render({ orientation = "horizontal" }) { const [range,setRange]=useState([25,75]);return <div className="story-stack max-w-md"><label className="story-label">Score range: {range.join(" – ")}</label><div className={orientation === "vertical" ? "h-64 w-11" : undefined}><C.Slider orientation={orientation} aria-label="Score range" value={range} onValueChange={setRange} min={0} max={100} step={1}/></div><div><p className="story-label">Unavailable slider</p><C.Slider className="mt-3" aria-label="Unavailable slider" disabled defaultValue={[50]}/></div></div>; } };
