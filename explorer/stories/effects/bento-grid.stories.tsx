import { sourceSnippets } from "virtual:fleet-example-source";
import { CodeVetterCapabilityGrid } from "../catalog-product-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/bento-grid';

const meta={id: "effects-bento-grid", title: "Molecules/Effects/Bento grid",parameters:{docs:{description:{component:"Compose related capabilities into a varied grid with a clear visual hierarchy.\n\nImport from `@saas-maker/ui/effects/bento-grid`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <C.BentoGrid><C.BentoCard className="md:col-span-2" name="Components" description="Build on accessible, themeable primitives." Icon={Box} href="https://github.com/sass-maker/ui-library/tree/main/packages/ui" cta="Read source" background={<div className="flex h-28 flex-wrap items-center justify-center gap-3 border-b border-border bg-surface px-5 text-xs text-muted-foreground"><span className="rounded-md border border-border bg-background px-3 py-2">Button</span><span className="rounded-md border border-border bg-background px-3 py-2">Field</span><span className="rounded-full border border-border bg-background px-3 py-2">Badge</span></div>}/><C.BentoCard className="md:col-span-1" name="Motion" description="Use purposeful transitions." Icon={ArrowRight} href="https://github.com/sass-maker/ui-library/tree/main/packages/motion" cta="Read source" background={<div className="flex h-28 items-center justify-center gap-3 border-b border-border bg-surface text-sm"><span className="font-mono text-xs text-muted-foreground">01</span><ArrowRight aria-hidden className="size-4 text-brand"/><span>State change</span></div>}/></C.BentoGrid>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.CodeVetterCapabilityGrid, type: "code", language: "tsx" } } }, render: () => <CodeVetterCapabilityGrid /> };
