import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/hover-card";

const meta = { id: "overlays-hover-card", title: "Molecules/Overlays/Hover card", component: C.HoverCard, parameters: {"docs": {"description": {"component": "A supplementary preview attached to a link, without hiding information needed to complete the main task.\n\nImport from `@saas-maker/ui/components/hover-card`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.HoverCard><C.HoverCardTrigger asChild><a className="text-brand-ink underline underline-offset-4" href="https://github.com/sass-maker/ui-library">UI Library source</a></C.HoverCardTrigger><C.HoverCardContent><h3 className="mb-2 font-semibold">One design system</h3><p className="text-sm text-muted-foreground">Shared web components, page templates, tokens, and SwiftUI components.</p></C.HoverCardContent></C.HoverCard>; } };
