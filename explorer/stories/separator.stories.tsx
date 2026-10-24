import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/separator";

const meta = { id: "foundations-separator", title: "Atoms/Foundations/Separator", component: C.Separator, parameters: {"docs": {"description": {"component": "A horizontal or vertical rule that separates related groups without introducing another surface.\n\nImport from `@saas-maker/ui/components/separator`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack max-w-md"><p>One shared design system.</p><C.Separator/><div className="story-row h-5"><span>Web</span><C.Separator orientation="vertical"/><span>SwiftUI</span><C.Separator orientation="vertical"/><span>Tokens</span></div></div>; } };
