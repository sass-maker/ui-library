import { sourceSnippets } from "virtual:fleet-example-source";
import { QuickAccessContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/sortable-grid';

const meta={id: "interactions-sortable-grid", title: "Molecules/Patterns/Sortable grid",parameters:{docs:{description:{component:"Arrange a small set of shortcuts with drag or keyboard while keeping the drop position clear.\n\nImport from `@saas-maker/ui/recipes/sortable-grid`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [items,setItems]=useState<C.SortableGridItem[]>(["Components","Patterns","Tokens","Motion","Blocks","Templates"].map(label=>({id:label,label,icon:<Box className="size-6"/>})));return <C.SortableGrid label="Library sections" items={items} onReorder={setItems}/>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.QuickAccessContext, type: "code", language: "tsx" } } }, render: () => <QuickAccessContext /> };
