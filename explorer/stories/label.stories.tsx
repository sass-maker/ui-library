import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/label";

const meta = { id: "inputs-label", title: "Atoms/Inputs/Label", component: C.Label, parameters: {"docs": {"description": {"component": "The accessible name that connects a visible label to its control.\n\nImport from `@saas-maker/ui/atoms/label`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack max-w-sm"><C.Label htmlFor="project-field">Project name</C.Label><input id="project-field" className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="UI Library"/><p className="story-caption">A visible label stays associated with the field even when it has a value.</p></div>; } };
