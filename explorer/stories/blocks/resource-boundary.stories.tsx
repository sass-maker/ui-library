import { sourceSnippets } from "virtual:fleet-example-source";
import { ReleaseArtworkContext } from "../catalog-product-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/blocks/resource-boundary';
const meta={id: "blocks-resource-boundary", title: "Organisms/Blocks/Resource boundary",parameters:{docs:{description:{component:"Keep loading, empty, failure and ready states distinct around application data.\n\nImport from `@saas-maker/ui/blocks/resource-boundary`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [status,setStatus]=useState<"loading"|"success"|"empty"|"error">("success");return <div className="story-stack"><div className="story-row">{(["loading","success","empty","error"] as const).map(value=><Button key={value} variant="outline" onClick={()=>setStatus(value)}>{value[0].toUpperCase() + value.slice(1)}</Button>)}</div><C.ResourceBoundary delay={0} resource={{status,data:status==="success"?["Button","Dialog"]:undefined,error:status==="error"?new Error("Example failure"):undefined,isRevalidating:false,retry:async()=>setStatus("success")}} skeleton={<div className="story-panel animate-pulse">Loading component list…</div>}>{items=><ul className="story-panel">{items.map(item=><li key={item}>{item}</li>)}</ul>}</C.ResourceBoundary></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.ReleaseArtworkContext, type: "code", language: "tsx" } } }, render: () => <ReleaseArtworkContext /> };

export const Loading: Story = { render: () => <ReleaseArtworkContext initialStatus="loading" /> };
export const Empty: Story = { render: () => <ReleaseArtworkContext initialStatus="empty" /> };
export const Failure: Story = { name: "Error and retry", render: () => <ReleaseArtworkContext initialStatus="error" /> };
