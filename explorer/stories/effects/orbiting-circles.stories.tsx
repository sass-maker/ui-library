import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/orbiting-circles';

const meta={id: "effects-orbiting-circles", title: "Molecules/Effects/Orbiting circles",parameters:{docs:{description:{component:"Arrange related marks around a central idea, retaining the composition when motion is reduced.\n\nImport from `@saas-maker/ui/effects/orbiting-circles`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-xl border border-border"><Box className="size-9 text-brand" aria-label="Shared UI"/><C.OrbitingCircles radius={110} iconSize={32}><Code/><Cloud/><Settings/></C.OrbitingCircles><C.OrbitingCircles radius={60} iconSize={24} reverse><FileText/><Globe/></C.OrbitingCircles></div>;}};
