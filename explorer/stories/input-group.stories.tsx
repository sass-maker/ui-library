import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/input-group";

const meta = { id: "inputs-input-group", title: "Molecules/Inputs/Input group", component: C.InputGroup, parameters: {"docs": {"description": {"component": "Combine a field with its nearby action or context without changing the input\u2019s responsibility.\n\nImport from `@saas-maker/ui/molecules/input-group`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack max-w-sm"><label className="story-label">Search library<C.InputGroup className="mt-2"><C.InputGroupInput aria-label="Search library" placeholder="Search components"/><C.InputGroupAddon><Search aria-hidden/></C.InputGroupAddon><C.InputGroupAddon align="inline-end"><C.InputGroupText>⌘ K</C.InputGroupText></C.InputGroupAddon></C.InputGroup></label><label className="story-label">Project domain<C.InputGroup className="mt-2"><C.InputGroupInput aria-label="Project domain" placeholder="sassmaker"/><C.InputGroupAddon align="inline-end"><C.InputGroupText>.com</C.InputGroupText></C.InputGroupAddon></C.InputGroup></label></div>; } };
