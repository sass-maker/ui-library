import { MediaContext } from "../workflow-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/carousel';

const meta={id: "motion-carousel", title: "Molecules/Motion/Carousel",parameters:{docs:{description:{component:"Move between related images or panels with focusable navigation and a stable viewing frame.\n\nImport from `@saas-maker/ui/recipes/carousel`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <C.Carousel className="relative mx-auto w-full max-w-xl pb-10"><C.CarouselContent>{["Semantic tokens","Accessible primitives","Composable pages"].map((title,i)=><C.CarouselItem key={title}><div className="story-panel grid min-h-64 place-content-center text-center"><span className="story-label">0{i+1}</span><h2 className="text-2xl font-semibold">{title}</h2></div></C.CarouselItem>)}</C.CarouselContent><C.CarouselNavigation className="left-0 w-full"/><C.CarouselIndicator/></C.Carousel>;}};

export const InContext: Story = { render: () => <MediaContext /> };
