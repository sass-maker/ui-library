import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/kbd";

const meta = { id: "foundations-keyboard-hints", title: "Atoms/Foundations/Keyboard hints", component: C.Kbd, parameters: {"docs": {"description": {"component": "A compact visual key or shortcut hint that stays legible beside an action or instruction.\n\nImport from `@saas-maker/ui/components/kbd`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-row"><span>Search components</span><C.Kbd>⌘</C.Kbd><C.Kbd>K</C.Kbd><span className="story-caption">Use platform-appropriate shortcut labels in consuming applications.</span></div>; } };
