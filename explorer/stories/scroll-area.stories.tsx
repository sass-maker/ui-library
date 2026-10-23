import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/scroll-area";

const meta = { id: "navigation-scroll-area", title: "Molecules/Layout/Scroll area", component: C.ScrollArea, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/scroll-area`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.ScrollArea className="h-64 w-full max-w-sm rounded-xl border border-border"><div className="p-5"><h3 className="mb-3 font-semibold">Library categories</h3>{["Foundations","Inputs","Navigation","Overlays","Feedback","Data","Interactions","Motion","Effects","Blocks","Templates","Native"].map(name=><p key={name} className="border-b border-border py-3 text-sm">{name}</p>)}</div></C.ScrollArea>; } };
