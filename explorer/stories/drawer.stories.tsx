import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/drawer";

const meta = { id: "overlays-drawer", title: "Molecules/Overlays/Drawer", component: C.Drawer, parameters: {"docs": {"description": {"component": "A focused surface that comes from the edge and keeps the task within reach.\n\nImport from `@saas-maker/ui/molecules/drawer`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Drawer><C.DrawerTrigger asChild><Button variant="outline">Open drawer</Button></C.DrawerTrigger><C.DrawerContent><div className="mx-auto w-full max-w-md pb-8"><C.DrawerHeader><C.DrawerTitle>Choose a preview</C.DrawerTitle><C.DrawerDescription>Drag to dismiss on touch or use the close action.</C.DrawerDescription></C.DrawerHeader><C.DrawerFooter><C.DrawerClose asChild><Button variant="outline">Close drawer</Button></C.DrawerClose></C.DrawerFooter></div></C.DrawerContent></C.Drawer>; } };
