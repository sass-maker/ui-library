import { sourceSnippets } from "virtual:fleet-example-source";
import { CodeVetterPatternContext } from "../catalog-product-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/dot-pattern';

const meta={id: "effects-dot-pattern", title: "Molecules/Effects/Dot pattern",parameters:{docs:{description:{component:"Add a restrained dotted backdrop beneath the content.\n\nImport from `@saas-maker/ui/effects/dot-pattern`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="relative grid h-72 place-items-center overflow-hidden rounded-xl border border-border"><C.DotPattern className="text-muted-foreground/30"/><h2 className="relative px-6 py-3 text-2xl font-semibold">A quiet backdrop</h2></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.CodeVetterPatternContext, type: "code", language: "tsx" } } }, render: () => <CodeVetterPatternContext /> };
