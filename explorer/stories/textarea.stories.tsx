import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/textarea";

const meta = { title: "Inputs/Textarea", component: C.Textarea, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/textarea`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack max-w-lg"><label className="story-label">feedback<C.Textarea className="mt-2" placeholder="What would make this component easier to use?" /></label><C.Textarea aria-label="Unavailable feedback" disabled placeholder="unavailable" /></div>; } };
