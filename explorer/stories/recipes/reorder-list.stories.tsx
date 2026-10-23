import { sourceSnippets } from "virtual:fleet-example-source";
import { OrderedWorkspaceContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/reorder-list';

const meta={id: "interactions-reorder-list", title: "Molecules/Patterns/Reorder list",parameters:{docs:{description:{component:"Move priorities by pointer or keyboard. Neighbors make room and a cancelled move returns home.\n\nImport from `@saas-maker/ui/recipes/reorder-list`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [items,setItems]=useState<C.ReorderListItem[]>([{id:"tokens",label:"Theme tokens",meta:"Foundation"},{id:"inputs",label:"Input components",meta:"Interaction"},{id:"blocks",label:"Page blocks",meta:"Composition"}]);return <C.ReorderList label="Build order" items={items} onReorder={setItems}/>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.OrderedWorkspaceContext, type: "code", language: "tsx" } } }, render: () => <OrderedWorkspaceContext /> };
