import { sourceSnippets } from "virtual:fleet-example-source";
import { TypeContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/text-morph';

const meta={id: "motion-text-morph", title: "Molecules/Motion/Text morph",parameters:{docs:{description:{component:"Keep shared characters connected while a short label changes. Reduced motion uses a simple fade.\n\nImport from `@saas-maker/ui/recipes/text-morph`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [word,setWord]=useState("Components");return <div className="story-stack"><C.TextMorph className="text-4xl font-semibold">{word}</C.TextMorph><Button variant="outline" onClick={()=>setWord(word==="Components"?"Compositions":"Components")}>Morph text</Button></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.TypeContext, type: "code", language: "tsx" } } }, render: () => <TypeContext /> };
