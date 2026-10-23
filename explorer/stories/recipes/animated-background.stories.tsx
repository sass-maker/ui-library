import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/animated-background';

const meta={title:"Motion/Animated background",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/animated-background`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="flex flex-wrap gap-2"><C.AnimatedBackground defaultValue="Components" className="rounded-lg bg-accent">{["Components","Tokens","Motion"].map(label=><button type="button" key={label} data-id={label} className="relative px-4 py-3 text-sm">{label}</button>)}</C.AnimatedBackground></div>;}};
