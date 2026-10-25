import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/text-animate';

const meta={id: "effects-text-animate", title: "Molecules/Effects/Text animate",parameters:{docs:{description:{component:"Introduce a short heading in readable units with a controlled entrance.\n\nImport from `@saas-maker/ui/effects/text-animate`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [key,setKey]=useState(0);return <div className="story-stack"><C.TextAnimate key={key} animation="blurInUp" by="word" className="text-3xl font-semibold">One visual language across the Fleet.</C.TextAnimate><Button variant="outline" onClick={()=>setKey(key+1)}>Replay</Button></div>;}};
