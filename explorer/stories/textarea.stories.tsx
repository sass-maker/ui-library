import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/textarea";

const meta = { id: "inputs-textarea", title: "Atoms/Inputs/Textarea", component: C.Textarea, parameters: {"docs": {"description": {"component": "A multiline editing surface with consistent type, focus, and disabled treatment.\n\nImport from `@saas-maker/ui/atoms/textarea`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack max-w-lg"><label className="story-label">feedback<C.Textarea className="mt-2" placeholder="What would make this component easier to use?" /></label><C.Textarea aria-label="Unavailable feedback" disabled placeholder="unavailable" /></div>; } };
