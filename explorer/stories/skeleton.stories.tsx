import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/skeleton";

const meta = { id: "feedback-skeleton", title: "Atoms/Feedback/Skeleton", component: C.Skeleton, parameters: {"docs": {"description": {"component": "Reserve the loaded content\u2019s shape while a request is pending.\n\nImport from `@saas-maker/ui/atoms/skeleton`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack max-w-md"><div className="story-row"><C.Skeleton className="size-12 rounded-full"/><div className="flex-1 space-y-2"><C.Skeleton className="h-4 w-2/3"/><C.Skeleton className="h-3 w-1/2"/></div></div><C.Skeleton className="h-48 w-full rounded-xl"/><p className="story-caption">Keep placeholders aligned with the actual content geometry.</p></div>; } };
