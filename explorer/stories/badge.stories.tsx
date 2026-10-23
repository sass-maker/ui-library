import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/badge";

const meta = { title: "Foundations/Badge", component: C.Badge, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/badge`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-row">{(["default","secondary","outline","destructive"] as const).map(variant=><C.Badge variant={variant} key={variant}>{variant}</C.Badge>)}</div>; } };
