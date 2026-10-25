import { sourceSnippets } from "virtual:fleet-example-source";
import { ComparisonContext } from "../workflow-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/image-comparison';
import {comparisonBefore,comparisonAfter} from '../fixtures';
const meta={id: "motion-image-comparison", title: "Molecules/Motion/Image comparison",parameters:{docs:{description:{component:"Keep a divider connected to the pointer. Native slider semantics support touch and keyboard comparison.\n\nImport from `@saas-maker/ui/recipes/image-comparison`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="story-stack"><C.ImageComparison className="aspect-[16/10] w-full max-w-2xl"><C.ImageComparisonImage src={comparisonBefore} alt="Kith coastal artwork" position="left"/><C.ImageComparisonImage src={comparisonAfter} alt="Kith memory-table artwork" position="right"/><C.ImageComparisonSlider className="w-1 bg-white/80"/></C.ImageComparison><p className="story-caption">Compare two original Kith art directions. Drag, touch or focus the slider and use arrow keys.</p></div>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.ComparisonContext, type: "code", language: "tsx" } } }, render: () => <ComparisonContext /> };
