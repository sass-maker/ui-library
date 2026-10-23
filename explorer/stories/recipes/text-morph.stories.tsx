import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/text-morph';

const meta={title:"Motion/Text morph",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/text-morph`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [word,setWord]=useState("Components");return <div className="story-stack"><C.TextMorph className="text-4xl font-semibold">{word}</C.TextMorph><Button variant="outline" onClick={()=>setWord(word==="Components"?"Compositions":"Components")}>Morph text</Button></div>;}};
