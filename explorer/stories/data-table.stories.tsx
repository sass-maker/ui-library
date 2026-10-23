import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/data-table";

const meta = { title: "Data/Data table", component: C.DataTable, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/data-table`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { const data=[{id:"ui",name:"UI Library",kind:"Shared system"},{id:"health",name:"App Health",kind:"Operations"},{id:"vetter",name:"CodeVetter",kind:"Developer tool"},{id:"kith",name:"Kith",kind:"Personal relationships"}];const [selected,setSelected]=useState<string[]>([]);return <div className="story-stack"><C.DataTable data={data} columns={[{id:"name",header:"Product",value:(row:typeof data[number])=>row.name},{id:"kind",header:"Purpose",value:(row:typeof data[number])=>row.kind}]} getRowId={row=>row.id} label="Fleet product examples" selection={{selected,onChange:setSelected,rowLabel:row=>row.name}} pageSize={3}/><p className="story-caption">Example rows · {selected.length} selected. Try sorting, column visibility, selection, and pagination.</p></div>; } };
