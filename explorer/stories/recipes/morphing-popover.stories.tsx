import { sourceSnippets } from "virtual:fleet-example-source";
import { SharingContext } from "../recipe-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/morphing-popover';

const meta={id: "motion-morphing-popover", title: "Molecules/Motion/Morphing popover",parameters:{docs:{description:{component:"Keep a focused action connected to the surface it opens. Positioning and dismissal are owned by Radix.\n\nImport from `@saas-maker/ui/recipes/morphing-popover`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj<{ownership?:"uncontrolled"|"controlled"|"closed";surfaceDuration?:number;surfaceVisualDuration?:number;surfaceDelay?:number}>;
export const Playground:Story={args:{ownership:"uncontrolled"},argTypes:{surfaceDuration:{control:"number"},surfaceVisualDuration:{control:"number"},surfaceDelay:{control:"number"}},render:function Render({ownership="uncontrolled",surfaceDuration,surfaceVisualDuration,surfaceDelay}){
  const [open,setOpen]=useState(false),[requests,setRequests]=useState<boolean[]>([]);
  return <div className="contents" data-popover-ownership={ownership} data-open-requests={requests.join(",")} data-surface-duration={surfaceDuration} data-surface-visual-duration={surfaceVisualDuration} data-surface-delay={surfaceDelay}><C.MorphingPopover open={ownership==="uncontrolled"?undefined:ownership==="closed"?false:open} onOpenChange={next=>{setRequests(previous=>[...previous,next]);if(ownership==="controlled")setOpen(next);}}><C.MorphingPopoverTrigger className="text-primary-foreground" surfaceClassName="border-transparent bg-primary">Library details</C.MorphingPopoverTrigger><C.MorphingPopoverContent surfaceClassName="shadow-sm" transition={surfaceDuration===undefined&&surfaceVisualDuration===undefined&&surfaceDelay===undefined?undefined:{type:"spring",duration:surfaceDuration,visualDuration:surfaceVisualDuration,delay:surfaceDelay,bounce:0}}><h2 className="font-semibold">Fleet UI</h2><p className="my-3 text-sm text-muted-foreground">A shared foundation for product interfaces.</p><C.MorphingPopoverClose/>{ownership==="controlled"&&<Button variant="ghost" onClick={()=>setOpen(false)}>Close externally</Button>}</C.MorphingPopoverContent></C.MorphingPopover></div>;
}};

export const InContext: Story = { parameters: { docs: { source: { code: sourceSnippets.SharingContext, type: "code", language: "tsx" } } }, render: () => <SharingContext /> };
