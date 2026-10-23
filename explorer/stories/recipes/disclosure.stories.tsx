import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/disclosure';

const meta={title:"Motion/Disclosure",parameters:{docs:{description:{component:"Import from `@saas-maker/ui/recipes/disclosure`.  Example data is local to this story. Use the toolbar to compare presets, light/dark and reduced motion. Upstream attribution and pinned source are in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <C.Disclosure className="story-panel"><C.DisclosureTrigger><Button variant="ghost">How do themes work?</Button></C.DisclosureTrigger><C.DisclosureContent className="px-3 pt-3"><p className="text-sm text-muted-foreground">Components read semantic CSS variables from the active theme. Change the toolbar preset to compare.</p></C.DisclosureContent></C.Disclosure>;}};
