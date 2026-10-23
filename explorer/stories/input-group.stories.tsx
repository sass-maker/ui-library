import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/input-group";

const meta = { title: "Inputs/Input group", component: C.InputGroup, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/input-group`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack max-w-sm"><C.InputGroup><C.InputGroupInput aria-label="Search library" placeholder="Search components"/><C.InputGroupAddon><Search aria-hidden/></C.InputGroupAddon><C.InputGroupAddon align="inline-end"><C.InputGroupText>⌘ K</C.InputGroupText></C.InputGroupAddon></C.InputGroup><C.InputGroup><C.InputGroupInput aria-label="Project domain" placeholder="sassmaker"/><C.InputGroupAddon align="inline-end"><C.InputGroupText>.com</C.InputGroupText></C.InputGroupAddon></C.InputGroup></div>; } };
