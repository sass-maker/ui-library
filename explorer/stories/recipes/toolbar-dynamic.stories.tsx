import { SearchToolbarContext } from "../workflow-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/toolbar-dynamic';
import ToolbarDynamic from '@saas-maker/ui/recipes/toolbar-dynamic';
const meta={id: "motion-dynamic-toolbar", title: "Molecules/Motion/Dynamic toolbar",parameters:{docs:{description:{component:"Expand a compact action into a focused search field, then return focus when the search closes.\n\nImport from `@saas-maker/ui/recipes/toolbar-dynamic`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [query,setQuery]=useState("");return <div className="story-stack"><ToolbarDynamic onSearch={setQuery}/><output className="story-caption">{query?`Local search: ${query}`:"Expand the search field."}</output></div>;}};

export const InContext: Story = { render: () => <SearchToolbarContext /> };
