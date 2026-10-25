import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/marquee';

const meta={id: "effects-marquee", title: "Molecules/Effects/Marquee",parameters:{docs:{description:{component:"Arrange supplied items in a repeating strip for peripheral content.\n\nImport from `@saas-maker/ui/effects/marquee`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="story-stack"><C.Marquee pauseOnHover className="max-w-3xl [--duration:24s]">{["Components","Tokens","Motion","Blocks","Templates"].map(label=><div key={label} className="story-panel w-44 text-center">{label}</div>)}</C.Marquee><p className="story-caption">Pauses on hover and keyboard focus. Reduced motion displays a static row.</p></div>;}};
