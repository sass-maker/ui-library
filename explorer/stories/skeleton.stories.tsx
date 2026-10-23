import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/skeleton";

const meta = { title: "Feedback/Skeleton", component: C.Skeleton, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/skeleton`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack max-w-md"><div className="story-row"><C.Skeleton className="size-12 rounded-full"/><div className="flex-1 space-y-2"><C.Skeleton className="h-4 w-2/3"/><C.Skeleton className="h-3 w-1/2"/></div></div><C.Skeleton className="h-48 w-full rounded-xl"/><p className="story-caption">Keep placeholders aligned with the actual content geometry.</p></div>; } };
