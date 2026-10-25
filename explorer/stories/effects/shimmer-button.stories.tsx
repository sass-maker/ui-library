import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/shimmer-button';

const meta={id: "effects-shimmer-button", title: "Molecules/Effects/Shimmer button",parameters:{docs:{description:{component:"Give one primary action a subtle moving highlight.\n\nImport from `@saas-maker/ui/effects/shimmer-button`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [clicked,setClicked]=useState(false);return <div className="story-stack"><C.ShimmerButton onClick={()=>setClicked(true)}>Explore components</C.ShimmerButton><output>{clicked?"Example action selected":""}</output></div>;}};
