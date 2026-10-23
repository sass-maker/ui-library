import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/kanban-board';

const meta={title:"Interactions/Kanban board",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/kanban-board`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [columns,setColumns]=useState([{id:"research",title:"Research",cards:[{id:"a",title:"Review upstream API"},{id:"b",title:"Check source license"}]},{id:"adapt",title:"Adapt",cards:[{id:"c",title:"Use semantic tokens"}]},{id:"verify",title:"Verify",cards:[{id:"d",title:"Test keyboard controls"}]}]);return <C.KanbanBoard label="Example component workflow" columns={columns} onChange={setColumns}/>;}};
