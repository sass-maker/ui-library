import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/label";

const meta = { title: "Inputs/Label", component: C.Label, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/label`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack max-w-sm"><C.Label htmlFor="project-field">Project name</C.Label><input id="project-field" className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="UI Library"/><p className="story-caption">A visible label stays associated with the field even when it has a value.</p></div>; } };
