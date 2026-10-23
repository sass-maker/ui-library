import { sourceSnippets } from "virtual:fleet-example-source";
import { ProjectDetailsContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/autosave-status';

const meta={id: "feedback-autosave-status", title: "Molecules/Patterns/Autosave status",parameters:{docs:{description:{component:"Keep unsaved, saving, and saved states visible without letting the label shift the rest of the interface.\n\nImport from `@saas-maker/ui/recipes/autosave-status`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [state,setState]=useState<"unsaved"|"saving"|"saved">("unsaved");return <div className="story-stack"><div className="story-row">{(["unsaved","saving","saved"] as const).map(value=><Button key={value} variant="outline" size="sm" onClick={()=>setState(value)}>{value}</Button>)}</div><C.AutosaveStatus state={state} savedAt={state==="saved"?Date.now():null} now={Date.now()}/><p className="story-caption">State controls only; no background save.</p></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.ProjectDetailsContext, type: "code", language: "tsx" } } }, render: () => <ProjectDetailsContext /> };
