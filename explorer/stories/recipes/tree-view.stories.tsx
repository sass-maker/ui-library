import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/tree-view';

const meta={title:"Navigation/Tree view",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/tree-view`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [selected,setSelected]=useState("");return <div className="story-stack"><C.TreeView label="UI source files" nodes={[{name:"packages",children:[{name:"ui",children:[{name:"button.tsx"},{name:"theme.css"}]},{name:"motion",children:[{name:"index.ts"}]}]},{name:"README.md"}]} defaultOpen={["packages","packages/ui"]} onSelect={setSelected}/><output className="story-caption">{selected||"Select a file"}</output></div>;}};
