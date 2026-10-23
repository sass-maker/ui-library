import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/autosave-status';

const meta={title:"Feedback/Autosave status",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/autosave-status`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [state,setState]=useState<"unsaved"|"saving"|"saved">("unsaved");return <div className="story-stack"><div className="story-row">{(["unsaved","saving","saved"] as const).map(value=><Button key={value} variant="outline" size="sm" onClick={()=>setState(value)}>{value}</Button>)}</div><C.AutosaveStatus state={state} savedAt={state==="saved"?Date.now():null} now={Date.now()}/><p className="story-caption">State controls only; no background save.</p></div>;}};
