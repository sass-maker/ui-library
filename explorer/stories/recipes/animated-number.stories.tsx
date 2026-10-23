import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/animated-number';

const meta={title:"Motion/Animated number",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/animated-number`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [value,setValue]=useState(24);return <div className="story-stack"><C.AnimatedNumber value={value} className="text-5xl font-semibold tabular-nums"/><div className="story-row"><Button variant="outline" onClick={()=>setValue(Math.max(0,value-1))}>Decrease</Button><Button onClick={()=>setValue(value+1)}>Increase</Button></div></div>;}};
