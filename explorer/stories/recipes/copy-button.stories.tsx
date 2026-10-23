import { SharingContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/copy-button';

const meta={id: "interactions-copy-button", title: "Molecules/Patterns/Copy button",parameters:{docs:{description:{component:"Copy a useful value with a small icon transition, a clear result, and an accessible announcement.\n\nImport from `@saas-maker/ui/recipes/copy-button`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="story-row"><code>pnpm storybook</code><C.CopyButton value="pnpm storybook"/></div>;}};

export const InContext: Story = { render: () => <SharingContext /> };
