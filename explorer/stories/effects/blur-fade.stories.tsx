import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/blur-fade';

const meta={title:"Effects/Blur fade",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/effects/blur-fade`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [key,setKey]=useState(0);return <div className="story-stack"><C.BlurFade key={key}><h2 className="text-3xl font-semibold">Clarity, then detail.</h2><p className="mt-3 text-muted-foreground">A short entrance for supporting content.</p></C.BlurFade><Button variant="outline" onClick={()=>setKey(key+1)}>Replay</Button></div>;}};
