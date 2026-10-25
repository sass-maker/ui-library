import { sourceSnippets } from "virtual:fleet-example-source";
import { ProductNotesContext , ProductNotesListExample } from "../catalog-product-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/blocks/quote-list';
const meta={id: "blocks-quote-list", title: "Organisms/Blocks/Quote list",parameters:{docs:{description:{component:"Group attributed quotations while keeping their sources and context visible.\n\nImport from `@saas-maker/ui/blocks/quote-list`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground: Story = { render: () => <ProductNotesListExample /> };

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.ProductNotesContext, type: "code", language: "tsx" } } }, render: () => <ProductNotesContext /> };
