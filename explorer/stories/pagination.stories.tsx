import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/pagination";

const meta = { id: "navigation-pagination", title: "Molecules/Navigation/Pagination", component: C.Pagination, parameters: {"docs": {"description": {"component": "\n\nImport from `@saas-maker/ui/components/pagination`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = {render:function Render(){const [page,setPage]=useState(0);return <C.Pagination page={page} pageCount={12} onPageChange={setPage} rowCount={117} pageSize={10}/>;}};
