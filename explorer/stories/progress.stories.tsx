import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/progress";

const meta = { id: "feedback-progress", title: "Atoms/Feedback/Progress", component: C.Progress, parameters: {"docs": {"description": {"component": "A stable track that connects successive progress values. The value is exposed to assistive technology.\n\nImport from `@saas-maker/ui/atoms/progress`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { const [value,setValue]=useState(40);return <div className="story-stack max-w-md"><label className="story-label">Example progress: {value}%</label><C.Progress aria-label="Example progress" value={value}/><div className="story-row"><Button variant="outline" onClick={()=>setValue(Math.max(0,value-20))}>Decrease</Button><Button variant="outline" onClick={()=>setValue(Math.min(100,value+20))}>Increase</Button></div><p className="story-caption">Controlled preview values; no upload is running.</p></div>; } };
