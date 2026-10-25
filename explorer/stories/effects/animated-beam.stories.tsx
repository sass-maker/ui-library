import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/animated-beam';

const meta={id: "effects-animated-beam", title: "Molecules/Effects/Animated beam",parameters:{docs:{description:{component:"Connect related elements with a decorative beam that follows their measured positions.\n\nImport from `@saas-maker/ui/effects/animated-beam`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const container=useRef<HTMLDivElement>(null),from=useRef<HTMLDivElement>(null),to=useRef<HTMLDivElement>(null);return <div ref={container} className="relative flex h-60 w-full max-w-xl items-center justify-between p-8"><div ref={from} className="story-panel relative z-10"><Code aria-label="Source"/></div><div ref={to} className="story-panel relative z-10"><Box aria-label="Component"/></div><C.AnimatedBeam containerRef={container} fromRef={from} toRef={to}/></div>;}};
