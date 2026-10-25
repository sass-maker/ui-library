import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/blur-fade';

const meta={id: "effects-blur-fade", title: "Molecules/Effects/Blur fade",parameters:{docs:{description:{component:"Introduce a small piece of content with a brief, quiet entrance.\n\nImport from `@saas-maker/ui/effects/blur-fade`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [key,setKey]=useState(0);return <div className="story-stack"><C.BlurFade key={key}><h2 className="text-3xl font-semibold">Clarity, then detail.</h2><p className="mt-3 text-muted-foreground">A short entrance for supporting content.</p></C.BlurFade><Button variant="outline" onClick={()=>setKey(key+1)}>Replay</Button></div>;}};
