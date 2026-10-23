import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/context-menu";

const meta = { title: "Overlays/Context menu", component: C.ContextMenu, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/context-menu`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.ContextMenu><C.ContextMenuTrigger className="grid min-h-48 max-w-xl place-items-center rounded-xl border border-dashed border-border px-6 text-center text-sm text-muted-foreground">Right-click, long press, or focus and press Shift F10.</C.ContextMenuTrigger><C.ContextMenuContent><C.ContextMenuItem>Open component</C.ContextMenuItem><C.ContextMenuItem>Copy import path</C.ContextMenuItem><C.ContextMenuSeparator/><C.ContextMenuItem disabled>Unavailable action</C.ContextMenuItem></C.ContextMenuContent></C.ContextMenu>; } };
