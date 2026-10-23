import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/hold-to-delete';

const meta={title:"Interactions/Hold to delete",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/hold-to-delete`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [deleted,setDeleted]=useState(false);return <div className="story-stack">{deleted?<><p role="status">Example item removed.</p><Button variant="outline" onClick={()=>setDeleted(false)}>Restore example</Button></>:<C.HoldToDelete onDelete={()=>setDeleted(true)}/>}</div>;}};
