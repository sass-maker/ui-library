import { sourceSnippets } from "virtual:fleet-example-source";
import { FoundationFormExample } from "./system-examples";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/button";

const meta = { id: "foundations-button", title: "Atoms/Foundations/Button", component: C.Button, parameters: {"docs": {"description": {"component": "Shared action geometry, visible focus, clear variants, and immediate press feedback.\n\nImport from `@saas-maker/ui/atoms/button`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack"><div className="story-row">{(["default","brand","secondary","outline","ghost","destructive","link"] as const).map(variant => <C.Button key={variant} variant={variant}>{variant === "brand" ? "Create project" : variant[0].toUpperCase() + variant.slice(1)}</C.Button>)}</div><div className="story-row"><C.Button size="sm">Compact</C.Button><C.Button>Regular</C.Button><C.Button size="lg">Large</C.Button><C.Button disabled>Unavailable</C.Button><C.Button variant="outline" size="icon" aria-label="Open settings"><Settings /></C.Button></div><p className="story-caption">Size variants keep a minimum 44px touch target on coarse-pointer screens.</p></div>; } };

export const Controls: Story = { args: { children: "Create project", variant: "brand", size: "default", disabled: false }, argTypes: { variant: { control: "select", options: ["default", "brand", "outline", "secondary", "ghost", "link", "destructive"] }, size: { control: "select", options: ["xs", "sm", "default", "lg", "xl", "icon"] }, disabled: { control: "boolean" }, children: { control: "text" } }, render: args => <C.Button {...args} /> };
export const LongLabel: Story = { render: () => <C.Button className="h-auto min-h-11 max-w-full whitespace-normal text-left">Create a project with a deliberately longer, localized action label</C.Button> };

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.FoundationFormExample, type: "code", language: "tsx" } } }, render: () => <FoundationFormExample /> };
