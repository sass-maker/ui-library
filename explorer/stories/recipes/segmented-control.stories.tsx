import { sourceSnippets } from "virtual:fleet-example-source";
import { SegmentedContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/segmented-control';

const meta={id: "interactions-segmented-control", title: "Molecules/Patterns/Segmented control",parameters:{docs:{description:{component:"A selected surface that follows the current choice and retargets when you change your mind mid-flight.\n\nImport from `@saas-maker/ui/recipes/segmented-control`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [value,setValue]=useState("Components");return <div className="story-stack"><C.SegmentedControl className="self-start max-w-full" label="Library view" options={["Components","Patterns","Pages"]} value={value} onChange={setValue}/><p role="status">{value}</p></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.SegmentedContext, type: "code", language: "tsx" } } }, render: () => <SegmentedContext /> };
