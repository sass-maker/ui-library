import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/accordion";

const meta = { title: "Navigation/Accordion", component: C.Accordion, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/accordion`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Accordion type="single" collapsible className="max-w-xl"><C.AccordionItem value="source"><C.AccordionTrigger>Can I adapt the source?</C.AccordionTrigger><C.AccordionContent>Yes. Keep the MIT attribution for adapted components and use the shared tokens to fit the product.</C.AccordionContent></C.AccordionItem><C.AccordionItem value="motion"><C.AccordionTrigger>What happens with reduced motion?</C.AccordionTrigger><C.AccordionContent>State changes remain understandable while movement is reduced. Use the toolbar to inspect this behavior.</C.AccordionContent></C.AccordionItem></C.Accordion>; } };
