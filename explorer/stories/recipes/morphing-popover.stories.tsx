import { SharingContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/morphing-popover';

const meta={id: "motion-morphing-popover", title: "Molecules/Motion/Morphing popover",parameters:{docs:{description:{component:"Keep a focused action connected to the surface it opens. Positioning and dismissal are owned by Radix.\n\nImport from `@saas-maker/ui/recipes/morphing-popover`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <C.MorphingPopover><C.MorphingPopoverTrigger>Library details</C.MorphingPopoverTrigger><C.MorphingPopoverContent><h2 className="font-semibold">Fleet UI</h2><p className="my-3 text-sm text-muted-foreground">A shared foundation for product interfaces.</p><C.MorphingPopoverClose/></C.MorphingPopoverContent></C.MorphingPopover>;}};

export const InContext: Story = { render: () => <SharingContext /> };
