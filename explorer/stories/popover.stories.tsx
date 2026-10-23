import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/popover";

const meta = { id: "overlays-popover", title: "Molecules/Overlays/Popover", component: C.Popover, parameters: {"docs": {"description": {"component": "A small, anchored surface with collision handling, dismissal, and focus management.\n\nImport from `@saas-maker/ui/molecules/popover`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Popover><C.PopoverTrigger asChild><Button variant="outline">Preview settings</Button></C.PopoverTrigger><C.PopoverContent className="w-72"><h3 className="mb-2 font-semibold">Preview settings</h3><p className="text-sm text-muted-foreground">Themes and device widths are available from the Storybook toolbar.</p></C.PopoverContent></C.Popover>; } };
