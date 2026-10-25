import { sourceSnippets } from "virtual:fleet-example-source";
import { ArtworkCollectionContext, MediaContext } from "../workflow-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/carousel';
import { sampleArtwork } from "../composition-fixtures";
import { ResponsiveImage } from '@saas-maker/ui/atoms/responsive-image';

const meta={id: "motion-carousel", title: "Molecules/Motion/Carousel",parameters:{docs:{description:{component:"Move between related images or panels with focusable navigation and a stable viewing frame.\n\nImport from `@saas-maker/ui/recipes/carousel`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <C.Carousel className="relative mx-auto w-full max-w-xl pb-10"><C.CarouselContent>{["Semantic tokens","Accessible primitives","Composable pages"].map((title,i)=><C.CarouselItem key={title}><div className="story-panel grid min-h-64 place-content-center text-center"><span className="story-label">0{i+1}</span><h2 className="text-2xl font-semibold">{title}</h2></div></C.CarouselItem>)}</C.CarouselContent><C.CarouselNavigation className="left-0 w-full"/><C.CarouselIndicator/></C.Carousel>;}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.MediaContext, type: "code", language: "tsx" } } }, render: () => <MediaContext /> };

export const ControlledSelection: Story = { render: function Render() {
  const [index, setIndex] = useState(1);
  const [frozen, setFrozen] = useState(false);
  return <section className="w-full max-w-xl space-y-5"><header className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-semibold">The parent owns the selection</h2><p className="mt-2 text-sm text-muted-foreground">Freeze selection to keep the current artwork while navigation requests are ignored.</p></div><Button variant="outline" aria-pressed={frozen} onClick={() => setFrozen(value => !value)}>{frozen ? "Unlock selection" : "Freeze selection"}</Button></header>
    <C.Carousel label="Controlled release artwork" index={index} onIndexChange={next => { if (!frozen) setIndex(next); }} className="overflow-hidden rounded-xl border border-border bg-card"><C.CarouselContent>{sampleArtwork.slice(0, 3).map(item => <C.CarouselItem key={item.id} label={item.title}><figure><ResponsiveImage src={`./demo/kith/${item.file}`} alt={item.alt} width={item.width} height={item.height} className="aspect-[3/2] w-full" imageClassName="object-cover" /><figcaption className="p-5 text-sm font-medium">{item.title}</figcaption></figure></C.CarouselItem>)}</C.CarouselContent><footer className="flex items-center justify-between border-t border-border px-4 py-2"><C.CarouselIndicator className="static inset-auto w-auto" /><C.CarouselNavigation className="static inset-auto w-auto translate-y-0 gap-2 p-0" /></footer></C.Carousel>
  </section>;
} };

export const ResponsiveCollection: Story = { parameters: { docs: { source: { code: sourceSnippets.ArtworkCollectionContext, type: "code", language: "tsx" } } }, render: () => <ArtworkCollectionContext /> };

export const RightToLeft: Story = { render: () => <div dir="rtl" className="w-full max-w-xl"><C.Carousel label="Right to left gallery" className="pb-12"><C.CarouselContent>{["البداية", "الذكريات", "الأشخاص"].map(title => <C.CarouselItem key={title}><div className="story-panel grid min-h-56 place-items-center"><h2 lang="ar" className="text-3xl">{title}</h2></div></C.CarouselItem>)}</C.CarouselContent><C.CarouselNavigation /><C.CarouselIndicator /></C.Carousel></div> };
