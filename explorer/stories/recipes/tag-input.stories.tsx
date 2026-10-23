import { sourceSnippets } from "virtual:fleet-example-source";
import { ProjectDetailsContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/tag-input';

const meta={id: "interactions-tag-input", title: "Molecules/Patterns/Tag input",parameters:{docs:{description:{component:"Add, remove, and navigate tags with a keyboard. The layout makes room as the collection changes.\n\nImport from `@saas-maker/ui/recipes/tag-input`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){const [tags,setTags]=useState(["React","Accessible"]);return <C.TagInput label="Component tags" tags={tags} onTagsChange={setTags}/>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.ProjectDetailsContext, type: "code", language: "tsx" } } }, render: () => <ProjectDetailsContext /> };
