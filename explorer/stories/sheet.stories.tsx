import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/sheet";

const meta = { title: "Overlays/Sheet", component: C.Sheet, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/sheet`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Sheet><C.SheetTrigger asChild><Button variant="outline">Open inspector</Button></C.SheetTrigger><C.SheetContent><C.SheetHeader><C.SheetTitle>Component inspector</C.SheetTitle><C.SheetDescription>Inspect shared properties without leaving the current view.</C.SheetDescription></C.SheetHeader><div className="p-4 text-sm">Use Escape or the close button to return to the trigger.</div><C.SheetFooter><C.SheetClose asChild><Button>Done</Button></C.SheetClose></C.SheetFooter></C.SheetContent></C.Sheet>; } };
