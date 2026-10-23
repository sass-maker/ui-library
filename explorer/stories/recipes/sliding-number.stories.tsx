import { sourceSnippets } from "virtual:fleet-example-source";
import { TypeContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/sliding-number';

const meta={id: "motion-sliding-number", title: "Molecules/Motion/Sliding number",parameters:{docs:{description:{component:"Roll numerical digits through changing values while preserving the width of each figure.\n\nImport from `@saas-maker/ui/recipes/sliding-number`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [value,setValue]=useState(24);return <div className="story-stack"><div className="text-5xl font-semibold"><C.SlidingNumber value={value}/></div><Button variant="outline" onClick={()=>setValue(value+1)}>Increment</Button></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.TypeContext, type: "code", language: "tsx" } } }, render: () => <TypeContext /> };
