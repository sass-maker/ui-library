import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/dropdown-menu";

const meta = { title: "Overlays/Dropdown menu", component: C.DropdownMenu, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/dropdown-menu`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.DropdownMenu><C.DropdownMenuTrigger asChild><Button variant="outline">Project actions</Button></C.DropdownMenuTrigger><C.DropdownMenuContent><C.DropdownMenuLabel>UI Library</C.DropdownMenuLabel><C.DropdownMenuSeparator/><C.DropdownMenuItem>Open source</C.DropdownMenuItem><C.DropdownMenuItem>Copy link</C.DropdownMenuItem><C.DropdownMenuSub><C.DropdownMenuSubTrigger>Move to</C.DropdownMenuSubTrigger><C.DropdownMenuSubContent><C.DropdownMenuItem>Active</C.DropdownMenuItem><C.DropdownMenuItem>Review</C.DropdownMenuItem></C.DropdownMenuSubContent></C.DropdownMenuSub><C.DropdownMenuItem disabled>Unavailable action</C.DropdownMenuItem></C.DropdownMenuContent></C.DropdownMenu>; } };
