import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/segmented-control';

const meta={title:"Interactions/Segmented control",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/segmented-control`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [value,setValue]=useState("Components");return <div className="story-stack"><C.SegmentedControl label="Library view" options={["Components","Patterns","Pages"]} value={value} onChange={setValue}/><p role="status">{value}</p></div>;}};
