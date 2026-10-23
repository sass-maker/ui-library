import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/combobox";

const meta = { title: "Inputs/Combobox", component: C.Combobox, parameters: {"docs": {"description": {"component": "Search, keyboard selection, and empty results using the upstream accessible primitive.\n\nImport from `@saas-maker/ui/components/combobox`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <div className="max-w-sm"><label className="story-label" id="framework-label">Find a Fleet project</label><C.Combobox items={["UI Library", "App Health", "CodeVetter", "Kith", "Anchor"]}><C.ComboboxInput aria-labelledby="framework-label" placeholder="Search projects"/><C.ComboboxContent><C.ComboboxEmpty>No matching projects.</C.ComboboxEmpty><C.ComboboxList>{(item: string) => <C.ComboboxItem key={item} value={item}>{item}</C.ComboboxItem>}</C.ComboboxList></C.ComboboxContent></C.Combobox></div>; } };
