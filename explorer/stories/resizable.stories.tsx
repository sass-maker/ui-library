import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/resizable";

const meta = { title: "Navigation/Resizable panels", component: C.ResizablePanelGroup, parameters: {"docs": {"description": {"component": "Resize with a pointer or focus the divider and use arrow keys.\n\nImport from `@saas-maker/ui/components/resizable`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.ResizablePanelGroup orientation="horizontal" className="min-h-64 max-w-3xl rounded-xl border border-border"><C.ResizablePanel defaultSize="35%" minSize="20%"><div className="p-5">Components</div></C.ResizablePanel><C.ResizableHandle withHandle/><C.ResizablePanel defaultSize="65%" minSize="25%"><div className="p-5">Preview and controls</div></C.ResizablePanel></C.ResizablePanelGroup>; } };
