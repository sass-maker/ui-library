import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/empty-state";

const meta = { title: "Feedback/Empty state", component: C.EmptyState, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/empty-state`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-panel max-w-xl"><C.EmptyState icon={<FolderOpen/>} title="No saved views" description="Save a filtered view to return to it later." primaryAction={{label:"Create a view",onClick:()=>{}}}/></div>; } };
