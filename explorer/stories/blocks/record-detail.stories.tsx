import { sourceSnippets } from "virtual:fleet-example-source";
import { ReleaseArtworkContext } from "../catalog-product-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/blocks/record-detail';
const meta={id: "blocks-record-detail", title: "Organisms/Blocks/Record detail",parameters:{docs:{description:{component:"Present a selected record with labelled attributes and related actions.\n\nImport from `@saas-maker/ui/blocks/record-detail`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [open,setOpen]=useState(false);return <C.RecordLayout><Button onClick={()=>setOpen(true)}>Inspect Button</Button><C.RecordDetail open={open} onOpenChange={setOpen} title="Button" subtitle="Component source"><C.KeyValueList items={[{label:"Package",value:"@saas-maker/ui"},{label:"Import",value:"components/button"}]}/><C.Provenance info={{source:"UI Library",url:"https://github.com/sass-maker/ui-library",note:"Example record; source is public."}}/></C.RecordDetail></C.RecordLayout>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.ReleaseArtworkContext, type: "code", language: "tsx" } } }, render: () => <ReleaseArtworkContext /> };
