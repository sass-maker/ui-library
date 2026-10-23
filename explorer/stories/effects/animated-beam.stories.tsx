import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/animated-beam';

const meta={title:"Effects/Animated beam",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/effects/animated-beam`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const container=useRef<HTMLDivElement>(null),from=useRef<HTMLDivElement>(null),to=useRef<HTMLDivElement>(null);return <div ref={container} className="relative flex h-60 w-full max-w-xl items-center justify-between p-8"><div ref={from} className="story-panel relative z-10"><Code aria-label="Source"/></div><div ref={to} className="story-panel relative z-10"><Box aria-label="Component"/></div><C.AnimatedBeam containerRef={container} fromRef={from} toRef={to}/></div>;}};
