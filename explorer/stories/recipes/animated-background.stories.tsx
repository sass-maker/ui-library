import { sourceSnippets } from "virtual:fleet-example-source";
import { SegmentedContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/animated-background';

const meta={id: "motion-animated-background", title: "Molecules/Motion/Animated background",parameters:{docs:{description:{component:"A shared highlight for a small group of actions, with a stable selected state and optional hover behavior.\n\nImport from `@saas-maker/ui/recipes/animated-background`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="flex flex-wrap gap-2"><C.AnimatedBackground defaultValue="Components" className="rounded-lg bg-accent">{["Components","Tokens","Motion"].map(label=><button type="button" key={label} data-id={label} className="relative px-4 py-3 text-sm">{label}</button>)}</C.AnimatedBackground></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.SegmentedContext, type: "code", language: "tsx" } } }, render: () => <SegmentedContext /> };
