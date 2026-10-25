import { sourceSnippets } from "virtual:fleet-example-source";
import { StorageContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/storage-meter';

const meta={id: "data-storage-meter", title: "Molecules/Patterns/Storage meter",parameters:{docs:{description:{component:"Show the shape of storage use, focus a category, and demonstrate a reversible cleanup interaction.\n\nImport from `@saas-maker/ui/recipes/storage-meter`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [cleared,setCleared]=useState(false);return <div className="story-stack"><C.StorageMeter capacity={100} cleanable="cache" cleared={cleared} onClearedChange={setCleared} categories={[{id:"source",name:"Source",gb:24,color:"var(--brand)"},{id:"assets",name:"Assets",gb:38,color:"var(--chart-2)"},{id:"cache",name:"Cache",gb:12,color:"var(--chart-3)"}]}/><p className="story-caption">Illustrative storage only. Clear cache and undo to compare the local states.</p></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.StorageContext, type: "code", language: "tsx" } } }, render: () => <StorageContext /> };
