import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/interactive-hover-button';

const meta={id: "effects-interactive-hover-button", title: "Molecules/Effects/Interactive hover button",parameters:{docs:{description:{component:"Give a primary action a directional hover response while retaining one accessible label.\n\nImport from `@saas-maker/ui/effects/interactive-hover-button`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [clicked,setClicked]=useState(false);return <div className="story-stack items-start"><C.InteractiveHoverButton onClick={()=>setClicked(true)}>Explore components</C.InteractiveHoverButton><output>{clicked?"Example action selected":""}</output></div>;}};
