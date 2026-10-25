import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/number-ticker';

const meta={id: "effects-number-ticker", title: "Molecules/Effects/Number ticker",parameters:{docs:{description:{component:"Present a numeric value with a deliberate counting transition.\n\nImport from `@saas-maker/ui/effects/number-ticker`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [value,setValue]=useState(128);return <div className="story-stack"><C.NumberTicker value={value} className="text-6xl font-semibold"/><Button variant="outline" onClick={()=>setValue(value+17)}>Change value</Button></div>;}};
