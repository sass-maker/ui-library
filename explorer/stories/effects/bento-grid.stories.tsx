import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/bento-grid';

const meta={id: "effects-bento-grid", title: "Molecules/Effects/Bento grid",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/effects/bento-grid`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <C.BentoGrid><C.BentoCard className="md:col-span-2" name="Components" description="Build on accessible, themeable primitives." Icon={Box} href="https://github.com/sass-maker/ui-library/tree/main/packages/ui" cta="Read source" background={<div className="h-24 bg-brand/10"/>}/><C.BentoCard className="md:col-span-1" name="Motion" description="Use purposeful transitions." Icon={ArrowRight} href="https://github.com/sass-maker/ui-library/tree/main/packages/motion" cta="Read source" background={<div className="h-24 bg-muted"/>}/></C.BentoGrid>;}};
