import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/collapsible";

const meta = { title: "Navigation/Collapsible", component: C.Collapsible, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/collapsible`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Collapsible className="story-panel max-w-md"><C.CollapsibleTrigger asChild><Button variant="outline">Show installation details</Button></C.CollapsibleTrigger><C.CollapsibleContent className="pt-5 text-sm">Products install tagged packages from the UI Library repository. Keep shared package versions aligned.</C.CollapsibleContent></C.Collapsible>; } };
