import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/toggle";

const meta = { id: "inputs-toggle", title: "Atoms/Inputs/Toggle", component: C.Toggle, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/toggle`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="story-row"><C.Toggle aria-label="Toggle bold"><Bold/></C.Toggle><C.Toggle aria-label="Toggle italic" variant="outline"><Italic/></C.Toggle><C.Toggle aria-label="Unavailable formatting" disabled><Settings/></C.Toggle></div>; } };
