import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/code-comparison';

const meta={id: "effects-code-comparison", title: "Molecules/Effects/Code comparison",parameters:{docs:{description:{component:"Compare supplied code snippets in two labelled, readable panels.\n\nImport from `@saas-maker/ui/effects/code-comparison`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <C.CodeComparison filename="button.tsx" language="tsx" beforeCode={'<button style={{ color: "blue" }}>\n  Save\n</button>'} afterCode={'<Button variant="default">\n  Save\n</Button>'}/>;}};
