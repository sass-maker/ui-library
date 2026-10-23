import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/breadcrumb";

const meta = { title: "Navigation/Breadcrumb", component: C.Breadcrumb, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/breadcrumb`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Breadcrumb><C.BreadcrumbList><C.BreadcrumbItem><C.BreadcrumbLink href="https://github.com/sass-maker/ui-library">UI Library</C.BreadcrumbLink></C.BreadcrumbItem><C.BreadcrumbSeparator/><C.BreadcrumbItem><C.BreadcrumbLink href="?path=/docs/inputs-input--docs">Inputs</C.BreadcrumbLink></C.BreadcrumbItem><C.BreadcrumbSeparator/><C.BreadcrumbItem><C.BreadcrumbPage>Combobox</C.BreadcrumbPage></C.BreadcrumbItem></C.BreadcrumbList></C.Breadcrumb>; } };
