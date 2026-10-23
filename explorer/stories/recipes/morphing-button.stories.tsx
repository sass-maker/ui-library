import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/morphing-button';

const meta={title:"Interactions/Morphing button",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/morphing-button`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [fail,setFail]=useState(false); return <div className="story-stack"><label className="story-row"><input type="checkbox" checked={fail} onChange={e=>setFail(e.target.checked)}/> Reject save</label><C.MorphingButton onSave={async()=>{if(fail)throw new Error("Save rejected");}}/><p className="story-caption">Local promise only. Toggle rejection to inspect retry.</p></div>;}};
