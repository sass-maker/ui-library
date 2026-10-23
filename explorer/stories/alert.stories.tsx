import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/alert";

const meta = { id: "feedback-alert", title: "Molecules/Feedback/Alert", component: C.Alert, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/alert`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-stack"><C.Alert><Check/><C.AlertTitle>Source is ready to explore</C.AlertTitle><C.AlertDescription>Inspect the component and its states before using it in a product.</C.AlertDescription></C.Alert><C.Alert variant="destructive"><C.AlertTitle>Could not save changes</C.AlertTitle><C.AlertDescription>Your draft is retained. Try again when the connection is available.</C.AlertDescription></C.Alert></div>; } };
