import { sourceSnippets } from "virtual:fleet-example-source";
import { MediaContext } from "../workflow-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/carousel';
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
    <C.Carousel label="Controlled release artwork" index={index} onIndexChange={next => { if (!frozen) setIndex(next); }} className="overflow-hidden rounded-xl border border-border bg-card"><C.CarouselContent>{[{ image: "coastal-walk-v2", title: "The long way home" }, { image: "memory-table-v2", title: "A table full of memories" }, { image: "book-stage", title: "Stories worth keeping" }].map(item => <C.CarouselItem key={item.image} label={item.title}><figure><ResponsiveImage src={`./demo/kith/${item.image}.webp`} alt={item.title} width={760} height={507} className="aspect-[3/2] w-full" imageClassName="object-cover" /><figcaption className="p-5 text-sm font-medium">{item.title}</figcaption></figure></C.CarouselItem>)}</C.CarouselContent><footer className="flex items-center justify-between border-t border-border px-4 py-2"><C.CarouselIndicator className="static inset-auto w-auto" /><C.CarouselNavigation className="static inset-auto w-auto translate-y-0 gap-2 p-0" /></footer></C.Carousel>
  </section>;
} };

export const ResponsiveCollection: Story = { render: function Render() {
  const [items, setItems] = useState(["Coastal walk", "The memory table", "A place for stories", "Your constellation", "A quiet beginning"]);
  return <section className="w-full max-w-4xl space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Artwork for the next chapter</h2><p className="mt-2 text-sm text-muted-foreground">Two frames on wider screens. The final frame always stays in reach.</p></div><Button variant="outline" onClick={() => setItems(current => current.length ? current.slice(0, -1) : ["Coastal walk", "The memory table", "A place for stories", "Your constellation", "A quiet beginning"])}>{items.length ? "Remove last artwork" : "Restore artwork"}</Button></div>
    <C.Carousel label="Responsive artwork"><C.CarouselContent className="gap-4">{items.map((title, index) => <C.CarouselItem key={title} className="sm:w-[calc((100%-1rem)/2)]"><div className="story-panel flex min-h-52 flex-col items-start justify-center p-6"><span className="story-label">Artwork 0{index + 1}</span><h3 className="mt-4 text-xl font-semibold">{title}</h3><a href={`#artwork-${index + 1}`} className="mt-5 inline-flex min-h-11 items-center rounded-sm text-sm underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">Inspect {title}</a></div></C.CarouselItem>)}</C.CarouselContent><footer className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Browse the collection</span><C.CarouselIndicator className="static inset-auto hidden w-auto md:flex" /><C.CarouselNavigation className="static inset-auto w-auto translate-y-0 gap-2 p-0" /></footer></C.Carousel>
    {!items.length && <p role="status" className="rounded-xl border border-dashed border-border px-6 py-10 text-sm text-muted-foreground">No artwork in this example. Restore the collection to continue browsing.</p>}
  </section>;
} };

export const RightToLeft: Story = { render: () => <div dir="rtl" className="w-full max-w-xl"><C.Carousel label="Right to left gallery" className="pb-12"><C.CarouselContent>{["البداية", "الذكريات", "الأشخاص"].map(title => <C.CarouselItem key={title}><div className="story-panel grid min-h-56 place-items-center"><h2 lang="ar" className="text-3xl">{title}</h2></div></C.CarouselItem>)}</C.CarouselContent><C.CarouselNavigation /><C.CarouselIndicator /></C.Carousel></div> };
