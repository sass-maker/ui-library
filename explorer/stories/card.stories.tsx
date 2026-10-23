import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/card";

const meta = { id: "foundations-card", title: "Atoms/Foundations/Card", component: C.Card, parameters: {"docs": {"description": {"component": "A quiet surface with consistent header, content, action, and footer geometry.\n\nImport from `@saas-maker/ui/atoms/card`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Card className="max-w-md"><C.CardHeader><C.CardTitle>UI Library</C.CardTitle><C.CardDescription>Shared components, tokens, and motion for Fleet products.</C.CardDescription></C.CardHeader><C.CardContent><p className="text-sm leading-relaxed">Explore the actual components in every theme and inspect their states before using them in a product.</p></C.CardContent><C.CardFooter><Button variant="outline">Explore components <ArrowRight/></Button></C.CardFooter></C.Card>; } };
