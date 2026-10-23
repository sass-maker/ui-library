import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/tabs";

const meta = { title: "Navigation/Tabs", component: C.Tabs, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/tabs`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Tabs defaultValue="components" className="max-w-xl"><C.TabsList><C.TabsTrigger value="components">Components</C.TabsTrigger><C.TabsTrigger value="tokens">Tokens</C.TabsTrigger><C.TabsTrigger value="native">SwiftUI</C.TabsTrigger></C.TabsList><C.TabsContent value="components" className="story-panel mt-4">Accessible primitives and composed interactions.</C.TabsContent><C.TabsContent value="tokens" className="story-panel mt-4">Shared color, type, spacing, and surface roles.</C.TabsContent><C.TabsContent value="native" className="story-panel mt-4">Native controls use the same semantic design language.</C.TabsContent></C.Tabs>; } };
