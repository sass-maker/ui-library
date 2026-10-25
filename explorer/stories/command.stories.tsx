import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/command";

const meta = { id: "navigation-command", title: "Molecules/Navigation/Command", component: C.Command, parameters: {"docs": {"description": {"component": "Filter and select actions from a keyboard-friendly local command list.\n\nImport from `@saas-maker/ui/components/command`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Command className="max-w-md rounded-xl border border-border"><C.CommandInput placeholder="Search components"/><C.CommandList><C.CommandEmpty>No matching components.</C.CommandEmpty><C.CommandGroup heading="Components"><C.CommandItem><Search/>Combobox</C.CommandItem><C.CommandItem><Settings/>Settings panel</C.CommandItem><C.CommandItem><Mail/>Notification inbox</C.CommandItem></C.CommandGroup></C.CommandList></C.Command>; } };
