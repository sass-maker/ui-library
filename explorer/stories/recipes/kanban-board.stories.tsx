import { BoardContext } from "../workflow-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/kanban-board';

const meta={id: "interactions-kanban-board", title: "Organisms/Patterns/Kanban board",parameters:{docs:{description:{component:"Move a work item within or between columns by hand or keyboard, with a clear pickup, drop, and cancel.\n\nImport from `@saas-maker/ui/recipes/kanban-board`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [columns,setColumns]=useState([{id:"research",title:"Research",cards:[{id:"a",title:"Review upstream API"},{id:"b",title:"Check source license"}]},{id:"adapt",title:"Adapt",cards:[{id:"c",title:"Use semantic tokens"}]},{id:"verify",title:"Verify",cards:[{id:"d",title:"Test keyboard controls"}]}]);return <C.KanbanBoard label="Example component workflow" columns={columns} onChange={setColumns}/>;}};

export const InContext: Story = { render: () => <BoardContext /> };
