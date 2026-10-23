import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/select";

const meta = { id: "inputs-select", title: "Atoms/Inputs/Select", component: C.Select, parameters: {"docs": {"description": {"component": "A choice from a bounded set, with focus management, disabled options, and keyboard navigation.\n\nImport from `@saas-maker/ui/atoms/select`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { const [project,setProject]=useState("ui-library");return <div className="story-stack max-w-sm"><label className="story-label" id="project-label">project</label><C.Select value={project} onValueChange={setProject}><C.SelectTrigger aria-labelledby="project-label" className="w-full"><C.SelectValue/></C.SelectTrigger><C.SelectContent><C.SelectGroup><C.SelectLabel>Fleet</C.SelectLabel><C.SelectItem value="ui-library">UI Library</C.SelectItem><C.SelectItem value="app-health">App Health</C.SelectItem><C.SelectItem value="codevetter">CodeVetter</C.SelectItem><C.SelectItem value="unavailable" disabled>Unavailable project</C.SelectItem></C.SelectGroup></C.SelectContent></C.Select><p className="story-caption">Selected: {project}</p></div>; } };
