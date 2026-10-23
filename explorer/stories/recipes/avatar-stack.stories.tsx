import { sourceSnippets } from "virtual:fleet-example-source";
import { ProjectDetailsContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/avatar-stack';

const meta={id: "data-avatar-stack", title: "Molecules/Patterns/Avatar stack",parameters:{docs:{description:{component:"A compact group that makes room for people on hover or focus, with a readable member list.\n\nImport from `@saas-maker/ui/recipes/avatar-stack`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <C.AvatarStack label="Example maintainers" people={[{name:"Sarthak"},{name:"UI contributors"},{name:"Motion contributors"},{name:"Community"}]} max={3}/>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.ProjectDetailsContext, type: "code", language: "tsx" } } }, render: () => <ProjectDetailsContext /> };
