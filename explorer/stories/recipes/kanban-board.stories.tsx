import { sourceSnippets } from "virtual:fleet-example-source";
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

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.BoardContext, type: "code", language: "tsx" } } }, render: () => <BoardContext /> };

// A controlled consumer with unequal lane scroll offsets and grid overrides.
export const ScrollableLanes: Story = {
    render: function Render() {
        const [columns, setColumns] = useState<C.KanbanColumn[]>([
            { id: "queue", title: "Queue", cards: Array.from({ length: 8 }, (_, i) => ({ id: `queued-${i + 1}`, title: `Queued task ${i + 1}` })) },
            { id: "active", title: "Active", cards: [{ id: "moving", title: "Move between scrolled lanes" }] },
            { id: "done", title: "Done", cards: [{ id: "finished", title: "Finished task" }] },
        ]);
        return <C.KanbanBoard label="Scrollable workflow" columns={columns} onChange={setColumns} className="h-[520px] gap-6" />;
    },
};
