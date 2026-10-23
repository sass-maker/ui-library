import { sourceSnippets } from "virtual:fleet-example-source";
import { CollectionDialogContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/morphing-dialog';

const meta={id: "motion-morphing-dialog", title: "Molecules/Motion/Morphing dialog",parameters:{docs:{description:{component:"Carry an image and title into a focused modal. Escape, outside dismissal, and focus return use Radix.\n\nImport from `@saas-maker/ui/recipes/morphing-dialog`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <C.MorphingDialog><C.MorphingDialogTrigger className="w-72 p-6"><Box className="mb-6 size-8 text-brand"/><C.MorphingDialogTitle>One shared system</C.MorphingDialogTitle><C.MorphingDialogSubtitle>Explore the implementation</C.MorphingDialogSubtitle></C.MorphingDialogTrigger><C.MorphingDialogContainer><C.MorphingDialogContent><C.MorphingDialogTitle>One shared system</C.MorphingDialogTitle><C.MorphingDialogDescription>Components, motion and tokens share an accessible foundation. Escape closes the dialog and restores focus.</C.MorphingDialogDescription><C.MorphingDialogClose/></C.MorphingDialogContent></C.MorphingDialogContainer></C.MorphingDialog>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.CollectionDialogContext, type: "code", language: "tsx" } } }, render: () => <CollectionDialogContext /> };
