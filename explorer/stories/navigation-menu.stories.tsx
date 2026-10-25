import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/navigation-menu";

const meta = { id: "navigation-navigation-menu", title: "Molecules/Navigation/Navigation menu", component: C.NavigationMenu, parameters: {"docs": {"description": {"component": "A site-navigation group that supports direct links and richer panels of related destinations.\n\nImport from `@saas-maker/ui/components/navigation-menu`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.NavigationMenu><C.NavigationMenuList><C.NavigationMenuItem><C.NavigationMenuTrigger>Explore</C.NavigationMenuTrigger><C.NavigationMenuContent><div className="grid w-[min(24rem,85vw)] gap-2 p-4"><C.NavigationMenuLink href="https://github.com/sass-maker/ui-library">Source and installation</C.NavigationMenuLink><C.NavigationMenuLink href="https://sassmaker.com">Fleet products</C.NavigationMenuLink></div></C.NavigationMenuContent></C.NavigationMenuItem><C.NavigationMenuItem><C.NavigationMenuLink href="https://github.com/sass-maker/ui-library" className={C.navigationMenuTriggerStyle()}>GitHub</C.NavigationMenuLink></C.NavigationMenuItem></C.NavigationMenuList></C.NavigationMenu>; } };
