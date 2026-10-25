import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/file-tree';

const meta={id: "effects-file-tree", title: "Molecules/Effects/File tree",parameters:{docs:{description:{component:"Present nested files and folders as a compact visual hierarchy.\n\nImport from `@saas-maker/ui/effects/file-tree`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="story-panel h-80"><C.Tree aria-label="UI package files" elements={[{id:"ui",name:"ui",children:[{id:"button",name:"button.tsx"},{id:"theme",name:"theme.css"}]},{id:"readme",name:"README.md"}]} initialExpandedItems={["ui"]}/></div>;}};
