import { sourceSnippets } from "virtual:fleet-example-source";
import { ProjectDetailsContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/inline-edit';

const meta={id: "interactions-inline-edit", title: "Molecules/Patterns/Inline edit",parameters:{docs:{description:{component:"Edit in place without shifting the surrounding layout. Enter commits; Escape restores the previous value.\n\nImport from `@saas-maker/ui/recipes/inline-edit`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [value,setValue]=useState("Fleet UI library");return <C.InlineEdit label="Project name" value={value} onSave={setValue} placeholder="Name this project" className="text-xl font-semibold"/>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.ProjectDetailsContext, type: "code", language: "tsx" } } }, render: () => <ProjectDetailsContext /> };
