import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/empty-state";

const meta = { id: "feedback-empty-state", title: "Molecules/Feedback/Empty state", component: C.EmptyState, parameters: {"docs": {"description": {"component": "Explain an empty collection and give people a useful next action.\n\nImport from `@saas-maker/ui/molecules/empty-state`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-panel max-w-xl"><C.EmptyState icon={<FolderOpen/>} title="No saved views" description="Save a filtered view to return to it later." primaryAction={{label:"Create a view",onClick:()=>{}}}/></div>; } };
