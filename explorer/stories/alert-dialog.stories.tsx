import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/alert-dialog";

const meta = { title: "Overlays/Alert dialog", component: C.AlertDialog, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/alert-dialog`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.AlertDialog><C.AlertDialogTrigger asChild><Button variant="destructive">Remove example</Button></C.AlertDialogTrigger><C.AlertDialogContent><C.AlertDialogHeader><C.AlertDialogTitle>Remove this example?</C.AlertDialogTitle><C.AlertDialogDescription>This preview does not delete product data. Cancel is the safe default.</C.AlertDialogDescription></C.AlertDialogHeader><C.AlertDialogFooter><C.AlertDialogCancel>Cancel</C.AlertDialogCancel><C.AlertDialogAction>Remove example</C.AlertDialogAction></C.AlertDialogFooter></C.AlertDialogContent></C.AlertDialog>; } };
