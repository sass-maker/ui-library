import { sourceSnippets } from "virtual:fleet-example-source";
import { TypeContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/text-effect';

const meta={id: "motion-text-effect", title: "Molecules/Motion/Text effect",parameters:{docs:{description:{component:"Stage an infrequent headline or reveal. Keep expressive entrances separate from everyday controls.\n\nImport from `@saas-maker/ui/recipes/text-effect`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [key,setKey]=useState(0);return <div className="story-stack"><C.TextEffect key={key} per="word" preset="fade-in-blur" className="text-3xl font-semibold">Build with a shared visual language.</C.TextEffect><Button variant="outline" onClick={()=>setKey(key+1)}>Replay</Button></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.TypeContext, type: "code", language: "tsx" } } }, render: () => <TypeContext /> };
