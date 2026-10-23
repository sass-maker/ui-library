import { DeleteContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/hold-to-delete';

const meta={id: "interactions-hold-to-delete", title: "Molecules/Patterns/Hold to delete",parameters:{docs:{description:{component:"A deliberate hold gives people time to reconsider. Cancelling releases the action; completion awaits the callback.\n\nImport from `@saas-maker/ui/recipes/hold-to-delete`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [deleted,setDeleted]=useState(false);return <div className="story-stack">{deleted?<><p role="status">Example item removed.</p><Button variant="outline" onClick={()=>setDeleted(false)}>Restore example</Button></>:<C.HoldToDelete onDelete={()=>setDeleted(true)}/>}</div>;}};

export const InContext: Story = { render: () => <DeleteContext /> };
