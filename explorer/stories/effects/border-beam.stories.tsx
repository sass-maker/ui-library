import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/border-beam';

const meta={id: "effects-border-beam", title: "Molecules/Effects/Border beam",parameters:{docs:{description:{component:"Use a moving border highlight to draw attention to one important surface.\n\nImport from `@saas-maker/ui/effects/border-beam`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="story-panel relative grid min-h-60 place-content-center overflow-hidden"><h2 className="text-xl font-semibold">A focused edge</h2><p className="story-caption">Use sparingly on a focal surface.</p><C.BorderBeam duration={6}/></div>;}};
