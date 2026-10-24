import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/toggle-group";

const meta = { id: "inputs-toggle-group", title: "Molecules/Inputs/Toggle group", component: C.ToggleGroup, parameters: {"docs": {"description": {"component": "A related set of single or multiple pressed actions with shared keyboard behavior.\n\nImport from `@saas-maker/ui/components/toggle-group`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.ToggleGroup type="multiple" aria-label="Text formatting"><C.ToggleGroupItem value="bold" aria-label="Bold"><Bold/></C.ToggleGroupItem><C.ToggleGroupItem value="italic" aria-label="Italic"><Italic/></C.ToggleGroupItem></C.ToggleGroup>; } };
