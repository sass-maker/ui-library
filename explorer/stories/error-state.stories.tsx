import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/error-state";

const meta = { id: "feedback-error-state", title: "Molecules/Feedback/Error state", component: C.ErrorState, parameters: {"docs": {"description": {"component": "Keep the failure specific and provide a clear retry path.\n\nImport from `@saas-maker/ui/molecules/error-state`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { const [retried,setRetried]=useState(false);return <div className="story-panel max-w-xl"><C.ErrorState title={retried ? "Preview retry requested" : "Could not load this view"} description="Your previous selection is retained. This example makes no network request." onRetry={()=>setRetried(true)} detail="Example: the data service is temporarily unavailable."/></div>; } };
