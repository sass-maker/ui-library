import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/table";

const meta = { id: "data-table", title: "Atoms/Data/Table", component: C.Table, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/table`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() { return <C.Table><C.TableCaption>Shared package roles.</C.TableCaption><C.TableHeader><C.TableRow><C.TableHead>Package</C.TableHead><C.TableHead>Purpose</C.TableHead></C.TableRow></C.TableHeader><C.TableBody>{[{name:"ui",purpose:"Components, blocks, and tokens"},{name:"motion",purpose:"Progressive scroll motion"},{name:"templates",purpose:"Gallery, Workbench, and Console"}].map(row=><C.TableRow key={row.name}><C.TableCell className="font-medium">{row.name}</C.TableCell><C.TableCell>{row.purpose}</C.TableCell></C.TableRow>)}</C.TableBody></C.Table>; } };
