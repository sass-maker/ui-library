import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/popover";

const meta = { title: "Overlays/Popover", component: C.Popover, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/popover`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Popover><C.PopoverTrigger asChild><Button variant="outline">Preview settings</Button></C.PopoverTrigger><C.PopoverContent className="w-72"><h3 className="mb-2 font-semibold">Preview settings</h3><p className="text-sm text-muted-foreground">Themes and device widths are available from the Storybook toolbar.</p></C.PopoverContent></C.Popover>; } };
