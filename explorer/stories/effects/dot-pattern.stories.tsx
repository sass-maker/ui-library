import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/dot-pattern';

const meta={id: "effects-dot-pattern", title: "Molecules/Effects/Dot pattern",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/effects/dot-pattern`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="relative grid h-72 place-items-center overflow-hidden rounded-xl border border-border"><C.DotPattern className="text-muted-foreground/30"/><h2 className="relative bg-background/90 px-6 py-3 text-2xl font-semibold">A quiet backdrop</h2></div>;}};
