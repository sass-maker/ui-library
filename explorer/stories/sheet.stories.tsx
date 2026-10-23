import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/sheet";

const meta = { id: "overlays-sheet", title: "Molecules/Overlays/Sheet", component: C.Sheet, parameters: {"docs": {"description": {"component": "A side panel for supporting work that keeps the surrounding product context clear.\n\nImport from `@saas-maker/ui/molecules/sheet`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Sheet><C.SheetTrigger asChild><Button variant="outline">Open inspector</Button></C.SheetTrigger><C.SheetContent><C.SheetHeader><C.SheetTitle>Component inspector</C.SheetTitle><C.SheetDescription>Inspect shared properties without leaving the current view.</C.SheetDescription></C.SheetHeader><div className="p-4 text-sm">Use Escape or the close button to return to the trigger.</div><C.SheetFooter><C.SheetClose asChild><Button>Done</Button></C.SheetClose></C.SheetFooter></C.SheetContent></C.Sheet>; } };
