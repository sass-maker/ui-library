import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/number-ticker';

const meta={id: "effects-number-ticker", title: "Molecules/Effects/Number ticker",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/effects/number-ticker`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [value,setValue]=useState(128);return <div className="story-stack"><C.NumberTicker value={value} className="text-6xl font-semibold"/><Button variant="outline" onClick={()=>setValue(value+17)}>Change value</Button></div>;}};
