import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/orbiting-circles';

const meta={title:"Effects/Orbiting circles",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/effects/orbiting-circles`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-xl border border-border"><Box className="size-9 text-brand" aria-label="Shared UI"/><C.OrbitingCircles radius={110} iconSize={32}><Code/><Cloud/><Settings/></C.OrbitingCircles><C.OrbitingCircles radius={60} iconSize={24} reverse><FileText/><Globe/></C.OrbitingCircles></div>;}};
