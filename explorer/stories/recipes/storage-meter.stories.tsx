import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/storage-meter';

const meta={title:"Data/Storage meter",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/storage-meter`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="story-stack"><C.StorageMeter capacity={100} categories={[{id:"source",name:"Source",gb:24,color:"var(--brand)"},{id:"assets",name:"Assets",gb:38,color:"var(--chart-2)"},{id:"cache",name:"Cache",gb:12,color:"var(--chart-3)"}]}/><p className="story-caption">Illustrative storage only.</p></div>;}};
