import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/button";

const meta = { title: "Foundations/Button", component: C.Button, parameters: {"docs": {"description": {"component": "Shared action geometry, quiet press feedback, and visible focus.\n\nImport from `@saas-maker/ui/components/button`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack"><div className="story-row">{(["default","brand","secondary","outline","ghost","destructive","link"] as const).map(variant => <C.Button key={variant} variant={variant}>{variant === "brand" ? "create project" : variant}</C.Button>)}</div><div className="story-row"><C.Button size="sm">compact</C.Button><C.Button>regular</C.Button><C.Button size="lg">large</C.Button><C.Button disabled>unavailable</C.Button><C.Button variant="outline" size="icon" aria-label="Open settings"><Settings /></C.Button></div></div>; } };

export const Controls: Story = { args: { children: "create project", variant: "brand", size: "default", disabled: false }, argTypes: { variant: { control: "select", options: ["default", "brand", "outline", "secondary", "ghost", "link", "destructive"] }, size: { control: "select", options: ["xs", "sm", "default", "lg", "xl", "icon"] }, disabled: { control: "boolean" }, children: { control: "text" } }, render: args => <C.Button {...args} /> };
export const LongLabel: Story = { render: () => <C.Button className="h-auto min-h-11 max-w-full whitespace-normal text-left">create a project with a deliberately longer, localized action label</C.Button> };
