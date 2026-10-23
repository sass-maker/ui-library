import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/badge";

const meta = { id: "foundations-badge", title: "Atoms/Foundations/Badge", component: C.Badge, parameters: {"docs": {"description": {"component": "A compact label for status or metadata, with semantic variants and consistent icon alignment.\n\nImport from `@saas-maker/ui/atoms/badge`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-row">{(["default","secondary","outline","destructive"] as const).map(variant=><C.Badge variant={variant} key={variant}>{variant}</C.Badge>)}</div>; } };
