import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/menubar";

const meta = { id: "navigation-menubar", title: "Molecules/Navigation/Menubar", component: C.Menubar, parameters: {"docs": {"description": {"component": "A persistent row of action menus with keyboard navigation between menu groups.\n\nImport from `@saas-maker/ui/components/menubar`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Menubar><C.MenubarMenu><C.MenubarTrigger>Library</C.MenubarTrigger><C.MenubarContent><C.MenubarItem>Explore components</C.MenubarItem><C.MenubarItem>View tokens</C.MenubarItem><C.MenubarSeparator/><C.MenubarItem>View source</C.MenubarItem></C.MenubarContent></C.MenubarMenu><C.MenubarMenu><C.MenubarTrigger>View</C.MenubarTrigger><C.MenubarContent><C.MenubarItem>Light theme</C.MenubarItem><C.MenubarItem>Dark theme</C.MenubarItem></C.MenubarContent></C.MenubarMenu></C.Menubar>; } };
