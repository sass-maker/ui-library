import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/input";

const meta = { id: "inputs-input", title: "Atoms/Inputs/Input", component: C.Input, parameters: {"docs": {"description": {"component": "A single-line field with native editing, validation, read-only, and disabled states.\n\nImport from `@saas-maker/ui/atoms/input`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack max-w-sm"><label className="story-label">project name<C.Input className="mt-2" placeholder="App Health" /></label><label className="story-label">invalid input<C.Input className="mt-2" aria-invalid aria-describedby="name-error" defaultValue="" /><span id="name-error" className="text-destructive">Enter a project name.</span></label><C.Input aria-label="Read-only project" readOnly value="UI Library" /><C.Input aria-label="Unavailable field" disabled placeholder="unavailable" /></div>; } };
