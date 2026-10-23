import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/error-state";

const meta = { title: "Feedback/Error state", component: C.ErrorState, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/error-state`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { const [retried,setRetried]=useState(false);return <div className="story-panel max-w-xl"><C.ErrorState title={retried ? "Preview retry requested" : "Could not load this view"} description="Your previous selection is retained. This example makes no network request." onRetry={()=>setRetried(true)} detail="Example: the data service is temporarily unavailable."/></div>; } };
