import { useState } from "react";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, FileText, FolderOpen, Layers3, MoreHorizontal, Plus, Settings2, Share2, Sparkles } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { Badge } from "@saas-maker/ui/atoms/badge";
import { Textarea } from "@saas-maker/ui/atoms/textarea";
import { InputField } from "@saas-maker/ui/molecules/input-field";
import { InlineEdit } from "@saas-maker/ui/recipes/inline-edit";
import { TagInput } from "@saas-maker/ui/recipes/tag-input";
import { AvatarStack } from "@saas-maker/ui/recipes/avatar-stack";
import { AutosaveStatus } from "@saas-maker/ui/recipes/autosave-status";
import { MorphingButton } from "@saas-maker/ui/recipes/morphing-button";
import { CopyButton } from "@saas-maker/ui/recipes/copy-button";
import { SegmentedControl } from "@saas-maker/ui/recipes/segmented-control";
import { StorageMeter } from "@saas-maker/ui/recipes/storage-meter";
import { Disclosure, DisclosureTrigger, DisclosureContent } from "@saas-maker/ui/recipes/disclosure";
import { TransitionPanel } from "@saas-maker/ui/recipes/transition-panel";
import { AnimatedBackground } from "@saas-maker/ui/recipes/animated-background";
import { NotificationBell } from "@saas-maker/ui/recipes/notification-bell";
import { ProgressStepper } from "@saas-maker/ui/recipes/progress-stepper";
import { ReorderList, type ReorderListItem } from "@saas-maker/ui/recipes/reorder-list";
import { SortableGrid, type SortableGridItem } from "@saas-maker/ui/recipes/sortable-grid";
import * as MorphDialog from "@saas-maker/ui/recipes/morphing-dialog";
import * as MorphPopover from "@saas-maker/ui/recipes/morphing-popover";
import { TextEffect } from "@saas-maker/ui/recipes/text-effect";
import { TextMorph } from "@saas-maker/ui/recipes/text-morph";
import { AnimatedNumber } from "@saas-maker/ui/recipes/animated-number";
import { SlidingNumber } from "@saas-maker/ui/recipes/sliding-number";
import { HoldToDelete } from "@saas-maker/ui/recipes/hold-to-delete";

export function ProjectDetailsContext() {
  const [name,setName] = useState("Kith · October release");
  const [description,setDescription] = useState("Prepare the new artwork and recovery states for the October review.");
  const [tags,setTags] = useState(["Release","Design"]);
  const [state,setState] = useState<"unsaved"|"saving"|"saved">("saved");
  const [savedAt,setSavedAt] = useState<number|null>(null);
  const [reject,setReject] = useState(false);
  return <div className="w-full max-w-xl">
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[16/5] overflow-hidden bg-surface"><img src="./demo/kith/coastal-walk-v2.webp" alt="A coastal walk from the Kith demo artwork" className="size-full object-cover object-center" /></div>
      <div className="p-6 sm:p-7"><div className="mb-4 flex items-center justify-between gap-3"><Badge variant="outline">Kith / Release</Badge><AutosaveStatus state={state} savedAt={savedAt} now={Date.now()} /></div>
        <InlineEdit label="Release name" value={name} onSave={value=>{setName(value);setState("unsaved");}} placeholder="Name this release" className="text-2xl font-semibold tracking-tight" />
        <label className="mt-5 block text-xs font-medium text-muted-foreground" htmlFor="context-description">Release notes</label>
        <Textarea id="context-description" value={description} onChange={event=>{setDescription(event.target.value);setState("unsaved");}} className="mt-2 min-h-24 resize-none text-sm leading-relaxed" />
        <div className="mt-6"><TagInput className="w-full" fieldClassName="border border-input bg-transparent shadow-xs" label="Release tags" tags={tags} onTagsChange={value=>{setTags(value);setState("unsaved");}} /></div>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-border px-6 py-4 sm:px-7"><AvatarStack label="Illustrative collaborators" people={[{name:"Maya Chen"},{name:"Arjun Patel"},{name:"Leah Martin"},{name:"You"}]} max={3} />
        <MorphingButton label="Save release" onSave={async()=>{setState("saving");await new Promise(resolve=>setTimeout(resolve,900));if(reject){setState("unsaved");throw new Error("Local example failure");}setState("saved");setSavedAt(Date.now());}} />
      </footer>
    </section>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="story-caption">Edit the name, description, or tags. Changes stay in this example.</p><label className="story-caption flex items-center gap-2"><input type="checkbox" checked={reject} onChange={event=>setReject(event.target.checked)} />Reject save</label></div>
  </div>;
}

export function SharingContext() {
  const [access,setAccess] = useState("Invited only");
  return <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-7"><div className="mb-5 flex items-center justify-between"><div className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface"><FolderOpen aria-hidden className="size-5 stroke-[1.5]" /></div><Badge variant="outline">Private collection</Badge></div>
    <h2 className="text-xl font-semibold tracking-tight">Kith release assets</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">A shared collection of photography, notes, and little things that belong together.</p>
    <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><AvatarStack label="Collection collaborators" people={[{name:"Maya Chen"},{name:"Arjun Patel"},{name:"Leah Martin"}]} />
      <MorphPopover.MorphingPopover><MorphPopover.MorphingPopoverTrigger className="flex items-center gap-2"><Share2 className="size-3.5" />Share collection</MorphPopover.MorphingPopoverTrigger><MorphPopover.MorphingPopoverContent>
        <h3 className="text-base font-semibold">Share collection</h3><p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">This is a local permissions example. No access is granted.</p>
        <div className="mt-5"><label htmlFor="share-access" className="mb-2 block text-xs font-medium">Who can open this?</label><select id="share-access" value={access} onChange={event=>setAccess(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option>Invited only</option><option>Anyone with the link</option></select></div>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-surface p-2"><code className="min-w-0 flex-1 break-words text-xs leading-relaxed">https://example.com/<wbr />collections/<wbr />kith</code><CopyButton value="https://example.com/collections/kith" label="Copy collection link" /></div>
        <div className="mt-5 flex justify-end"><MorphPopover.MorphingPopoverClose>Done</MorphPopover.MorphingPopoverClose></div>
      </MorphPopover.MorphingPopoverContent></MorphPopover.MorphingPopover>
    </div><div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">{access} <span aria-hidden>·</span> Example permissions</div>
  </div>;
}

export function StorageContext() {
  const [cleared,setCleared] = useState(false);
  return <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-7"><div className="mb-6 flex items-start justify-between gap-3"><div><p className="mb-2 text-xs text-muted-foreground">Workspace / Storage</p><h2 className="text-xl font-semibold tracking-tight">Workspace storage</h2></div><Badge variant="outline">Example workspace</Badge></div>
    <p className="mb-7 text-sm leading-relaxed text-muted-foreground">Review storage by category and clear the rebuildable cache.</p>
    <StorageMeter capacity={100} cleanable="cache" cleared={cleared} onClearedChange={setCleared} categories={[{id:"photos",name:"Photography",gb:38,color:"var(--brand)"},{id:"files",name:"Documents",gb:24,color:"var(--chart-2)"},{id:"cache",name:"Cache",gb:12,color:"var(--chart-3)"}]} />
    <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">Illustrative usage. “Clear cache” changes this example only; Undo restores it.</p>
  </section>;
}

export function DisclosureContext() {
  return <section className="w-full max-w-xl"><p className="mb-3 text-xs text-muted-foreground">A few useful answers</p><h2 className="mb-7 text-2xl font-semibold tracking-tight">Before you get started.</h2><div className="divide-y divide-border border-y border-border">
    {[["Does this work with my existing app?","The components are composed from shared primitives. Use the layers you need, keep your application state in the app, and supply callbacks for saves and uploads."],["Can I make it feel like my product?","Every component reads semantic theme roles. Change the palette, type, imagery, and content while keeping the same interaction and accessibility behavior."],["What happens with reduced motion?","Spatial movement settles immediately or becomes a short fade. Selected states, text labels, and progress remain visible without relying on motion."]].map(([question,answer])=><Disclosure key={question} className="group"><DisclosureTrigger><button type="button" className="flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">{question}<ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" /></button></DisclosureTrigger><DisclosureContent><p className="max-w-lg pb-5 pr-6 text-sm leading-relaxed text-muted-foreground">{answer}</p></DisclosureContent></Disclosure>)}
    </div></section>;
}

export function CollectionDialogContext() {
  return <MorphDialog.MorphingDialog>
    <MorphDialog.MorphingDialogTrigger className="w-full max-w-sm"><MorphDialog.MorphingDialogImage src="./demo/kith/coastal-walk-v2.webp" alt="A coastal path in the Kith collection" className="aspect-[4/3]" /><div className="p-5"><p className="mb-3 text-xs text-muted-foreground">Kith / Collected moments</p><MorphDialog.MorphingDialogTitle>The long way home</MorphDialog.MorphingDialogTitle><MorphDialog.MorphingDialogSubtitle className="mt-2 leading-relaxed">Some things are better when you take your time.</MorphDialog.MorphingDialogSubtitle><span className="mt-5 flex items-center gap-2 text-xs font-medium">Take a closer look<ArrowUpRight className="size-3.5" /></span></div></MorphDialog.MorphingDialogTrigger>
    <MorphDialog.MorphingDialogContainer><MorphDialog.MorphingDialogContent className="p-0"><MorphDialog.MorphingDialogImage src="./demo/kith/coastal-walk-v2.webp" alt="A coastal path in the Kith collection" className="max-h-[45dvh] object-cover" /><div className="p-6 sm:p-7"><p className="mb-3 text-xs text-muted-foreground">Kith / Collected moments</p><MorphDialog.MorphingDialogTitle>The long way home</MorphDialog.MorphingDialogTitle><MorphDialog.MorphingDialogDescription>A small walk, a wide sky, and enough time to notice. This artwork is part of the existing Kith demo collection.</MorphDialog.MorphingDialogDescription><div className="mt-6 flex items-center justify-between border-t border-border pt-5"><Badge variant="outline">Photography</Badge><CopyButton value="The long way home — Kith collection" label="Copy collection title" /></div></div><MorphDialog.MorphingDialogClose className="bg-card/95 shadow-sm" /></MorphDialog.MorphingDialogContent></MorphDialog.MorphingDialogContainer>
  </MorphDialog.MorphingDialog>;
}

export function SegmentedContext() {
  const [period,setPeriod] = useState("Week");
  const [view,setView] = useState("Overview");
  const values = period === "Week" ? [24,7,75] : period === "Month" ? [86,12,92] : [148,4,98];
  return <section className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card"><div className="p-6"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h2 className="text-lg font-semibold">Review activity</h2><Badge variant="outline">Illustrative metrics</Badge></div>
    <SegmentedControl label="Review period" options={["Week","Month","Year"]} value={period} onChange={setPeriod} />
    <div className="mt-8 grid grid-cols-3 gap-4">{values.map((value,index)=><div key={index}><p className="mb-3 text-3xl font-semibold tracking-tight"><AnimatedNumber value={value} />{index===2&&"%"}</p><p className="text-xs text-muted-foreground">{["Reviewed","Open notes","Ready"][index]}</p></div>)}</div>
    </div><div className="flex gap-2 border-y border-border px-3 py-2"><AnimatedBackground defaultValue="Overview" onValueChange={value=>{if(value)setView(value);}} className="rounded-md bg-accent">{["Overview","Activity","Notes"].map(label=><button key={label} type="button" data-id={label} className="rounded-md px-3 py-2 text-[0.8125rem] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">{label}</button>)}</AnimatedBackground></div>
    <div className="p-6"><TransitionPanel activeIndex={["Overview","Activity","Notes"].indexOf(view)}>{[<p className="text-sm leading-relaxed text-muted-foreground">The foundations are in place. A few small details remain before the next review.</p>,<div className="space-y-3 text-sm"><p>Maya completed the empty-state review.</p><p className="text-muted-foreground">Arjun added a note about upload progress.</p></div>,<div className="space-y-3"><h3 className="text-sm font-medium">Keep the context in view.</h3><p className="text-sm leading-relaxed text-muted-foreground">Focus on interruptions, changes of mind, and the transition back to a stable state. Try changing the period while you switch these views.</p></div>]}</TransitionPanel></div>
  </section>;
}

export function OrderedWorkspaceContext() {
  const [items,setItems] = useState<ReorderListItem[]>([{id:"foundation",label:"Set the foundation",meta:"Tokens, type, and shared geometry"},{id:"states",label:"Care for every state",meta:"Loading, empty, error, success"},{id:"motion",label:"Connect the moments",meta:"Smooth, interruptible motion"},{id:"review",label:"Look at the real thing",meta:"Phone, tablet, and desktop"}]);
  return <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-6"><div className="mb-6"><p className="mb-2 text-xs text-muted-foreground">Workspace / Priorities</p><h2 className="text-xl font-semibold tracking-tight">Release priorities</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Drag to reorder. Or focus a row, press Space to pick it up, then use the arrow keys.</p></div><ReorderList label="Release priorities" items={items} onReorder={setItems} /><p className="mt-5 text-xs text-muted-foreground">Your order stays in this example.</p></section>;
}

export function QuickAccessContext() {
  const [items,setItems] = useState<SortableGridItem[]>([{id:"files",label:"Library",icon:<FolderOpen className="size-5" />},{id:"notes",label:"Notes",icon:<FileText className="size-5" />},{id:"settings",label:"Settings",icon:<Settings2 className="size-5" />},{id:"projects",label:"Projects",icon:<Layers3 className="size-5" />}]);
  return <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-6"><p className="mb-2 text-xs text-muted-foreground">Make yourself at home</p><h2 className="mb-6 text-xl font-semibold tracking-tight">Quick access</h2><SortableGrid label="Quick access shortcuts" items={items} onReorder={setItems} /><p className="mt-5 text-xs leading-relaxed text-muted-foreground">Arrange your shortcuts with drag or keyboard. No destination opens in this local layout example.</p></section>;
}

export function NotificationContext() {
  const [items,setItems] = useState([{id:"review",title:"Maya left a note on the upload flow",time:"12 minutes ago"},{id:"assets",title:"New Kith photography is ready",time:"38 minutes ago"}]);
  return <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-6"><div className="flex items-center justify-between gap-5"><div><p className="mb-2 text-xs text-muted-foreground">Kith Studio</p><h2 className="text-xl font-semibold tracking-tight">Workspace updates</h2></div><NotificationBell notifications={items} /></div><p className="mt-5 text-sm leading-relaxed text-muted-foreground">A few useful updates from your workspace, without leaving the page.</p><div className="mt-7 flex items-center justify-between border-t border-border pt-5"><span className="text-xs text-muted-foreground">Illustrative notifications</span><Button variant="outline" size="sm" onClick={()=>setItems(current=>[{id:String(Date.now()),title:"Your next review is ready",time:"Just now"},...current])}><Plus />Add update</Button></div></section>;
}

export function DeleteContext() {
  const [deleted,setDeleted] = useState(false);
  return <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-6"><p className="mb-2 text-xs text-muted-foreground">Workspace / Danger zone</p><h2 className="text-lg font-semibold">Remove the draft collection</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">A deliberate hold gives you time to change your mind. Let go or press Escape to cancel before the hold completes.</p><div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5"><span role="status" className="text-sm text-muted-foreground">{deleted?"Example collection removed.":"Only this local example is affected."}</span>{deleted?<Button variant="outline" onClick={()=>setDeleted(false)}>Restore example</Button>:<HoldToDelete onDelete={async()=>{await new Promise(resolve=>setTimeout(resolve,600));setDeleted(true);}} />}</div></section>;
}

export function TypeContext() {
  const [edition,setEdition] = useState(0);
  const [count,setCount] = useState(24);
  return <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card">
    <div className="aspect-[16/6] overflow-hidden"><img src="./demo/kith/memory-table-v2.webp" alt="A table of collected memories from the Kith demo" className="size-full object-cover" /></div>
    <div className="p-6 sm:p-8"><p className="mb-5 text-xs text-muted-foreground">A moment worth keeping</p><TextEffect key={edition} per="word" preset="fade-in-blur" className="font-display text-3xl leading-tight sm:text-4xl">The little things become the story.</TextEffect><p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">Give expressive motion a place to breathe. Keep it out of the controls you use every few seconds.</p><div className="mt-7 flex flex-wrap items-center justify-between gap-5 border-t border-border pt-5"><div><div className="text-2xl font-semibold"><SlidingNumber value={count} /></div><TextMorph className="mt-2 text-xs text-muted-foreground">{count===24?"moments collected":"a few more memories"}</TextMorph></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={()=>setEdition(current=>current+1)}>Replay title</Button><Button size="sm" onClick={()=>setCount(current=>current===24?32:24)}>Add memories<ArrowRight /></Button></div></div></div>
  </section>;
}
