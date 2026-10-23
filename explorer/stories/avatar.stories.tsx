import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/avatar";

const meta = { title: "Foundations/Avatar", component: C.Avatar, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/avatar`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-row"><C.Avatar><C.AvatarFallback>UI</C.AvatarFallback></C.Avatar><C.Avatar className="size-12"><C.AvatarImage src="missing-avatar.png" alt="App Health"/><C.AvatarFallback>AH</C.AvatarFallback></C.Avatar><span className="story-caption">Initials remain usable when an image is unavailable.</span></div>; } };
