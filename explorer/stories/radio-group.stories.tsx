import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/radio-group";

const meta = { title: "Inputs/Radio group", component: C.RadioGroup, parameters: {"docs": {"description": {"component": "Arrow keys move within the group; Tab moves out.\n\nImport from `@saas-maker/ui/components/radio-group`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.RadioGroup defaultValue="weekly" aria-label="Review cadence" className="gap-4">{["daily","weekly","monthly"].map(value => <label className="story-row" key={value}><C.RadioGroupItem value={value} />{value}</label>)}</C.RadioGroup>; } };
