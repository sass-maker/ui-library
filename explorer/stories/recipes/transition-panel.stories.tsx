import { sourceSnippets } from "virtual:fleet-example-source";
import { SegmentedContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/transition-panel';

const meta={id: "motion-transition-panel", title: "Molecules/Motion/Transition panel",parameters:{docs:{description:{component:"Switch content and resize its container together, with a shorter exit and a gentle settle.\n\nImport from `@saas-maker/ui/recipes/transition-panel`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [index,setIndex]=useState(0);return <div className="story-stack"><div className="story-row">{["Tokens","Components","Pages"].map((label,i)=><Button key={label} variant={index===i?"default":"outline"} onClick={()=>setIndex(i)}>{label}</Button>)}</div><C.TransitionPanel activeIndex={index} transition={{duration:.2}} variants={{enter:{opacity:0,y:8},center:{opacity:1,y:0},exit:{opacity:0,y:-8}}}>{["Semantic colors keep the system coherent.","Accessible primitives support each interaction.","Blocks compose into real product pages."].map(text=><div key={text} className="story-panel min-h-28">{text}</div>)}</C.TransitionPanel></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.SegmentedContext, type: "code", language: "tsx" } } }, render: () => <SegmentedContext /> };
