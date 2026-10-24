import { useId, useState } from "react";
import { ArrowRight, ArrowLeft, Check, FileText, ImageIcon, Plus, Upload, RotateCcw } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { Badge } from "@saas-maker/ui/atoms/badge";
import { InputField } from "@saas-maker/ui/molecules/input-field";
import { ResponsiveImage } from "@saas-maker/ui/atoms/responsive-image";
import { FileDropzone } from "@saas-maker/ui/recipes/file-dropzone";
import { MultiStepForm } from "@saas-maker/ui/recipes/multi-step-form";
import { KanbanBoard, type KanbanColumn } from "@saas-maker/ui/recipes/kanban-board";
import { PricingCalculator } from "@saas-maker/ui/recipes/pricing-calculator";
import ToolbarDynamic from "@saas-maker/ui/recipes/toolbar-dynamic";
import { ProgressStepper } from "@saas-maker/ui/recipes/progress-stepper";
import { TransitionPanel } from "@saas-maker/ui/recipes/transition-panel";
import { TreeView } from "@saas-maker/ui/recipes/tree-view";
import * as Carousel from "@saas-maker/ui/recipes/carousel";
import * as Comparison from "@saas-maker/ui/recipes/image-comparison";
import { sampleFiles } from "./composition-fixtures";

export function UploadContext() {
  const [reject,setReject]=useState(false);
  return <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-7"><div className="mb-6"><p className="mb-2 text-xs text-muted-foreground">Kith / Asset library</p><h2 className="text-xl font-semibold tracking-tight">Add release assets</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">A useful upload keeps the filename, progress, and a way back in view.</p></div>
    <FileDropzone accept="image/*,.pdf,.md,.txt" maxSize={5*1024*1024} hint="Images, PDF, Markdown or text · up to 5 MB" onUpload={async(_file,{signal,onProgress})=>{
      await new Promise<void>((resolve,rejectPromise)=>{
        let progress=0;
        const stop=()=>{clearInterval(timer);signal.removeEventListener("abort",abort);};
        const abort=()=>{stop();rejectPromise(new Error("Cancelled"));};
        const timer=setInterval(()=>{progress+=20;onProgress(progress);if(progress>=100){stop();if(reject)rejectPromise(new Error("Example connection interrupted"));else resolve();}},240);
        signal.addEventListener("abort",abort,{once:true});
        if(signal.aborted)abort();
      });
    }} />
    <div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-t border-border pt-4"><p className="max-w-xs text-xs leading-relaxed text-muted-foreground">Simulated local transport. No file contents leave this browser. Cancel, reject, and retry to inspect recovery.</p><label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={reject} onChange={event=>setReject(event.target.checked)} />Reject upload</label></div>
  </section>;
}
export function OnboardingContext() {
  const [reject,setReject]=useState(false);
  return <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-[.75fr_1fr] lg:items-center"><aside><Badge variant="outline">A new beginning</Badge><h2 className="mt-5 font-display text-3xl leading-tight">A little space<br /><em>for your next idea.</em></h2><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">Start with the essentials. Keep every choice in place as you move forward, go back, or recover from a failed request.</p><ul className="mt-6 space-y-3 text-[0.8125rem]">{["Your workspace, your name","One considered step at a time","A clear way back when something fails"].map(label=><li key={label} className="flex items-center gap-2"><Check className="size-3.5 text-muted-foreground" />{label}</li>)}</ul></aside>
    <div className="min-w-0"><MultiStepForm plans={[{id:"personal",name:"Personal",note:"A home for your own ideas",price:"Example"},{id:"studio",name:"Studio",note:"A place to build together",price:"Example"}]} onCreate={async()=>{await new Promise(resolve=>setTimeout(resolve,900));if(reject)throw new Error("The example request was interrupted. Your choices are still here.");}} /><label className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={reject} onChange={event=>setReject(event.target.checked)} />Reject creation to try the recovery path</label><p className="mt-3 text-xs leading-relaxed text-muted-foreground">Illustrative setup. No account or subscription is created.</p></div></div>;
}
const initialBoard: KanbanColumn[] = [
  {id:"next",title:"Up next",cards:[{id:"upload",title:"Make upload recovery clearer"},{id:"empty",title:"Give empty states a little care"},{id:"mobile",title:"Review the phone layout"}]},
  {id:"progress",title:"In progress",cards:[{id:"motion",title:"Connect the changing views"},{id:"labels",title:"Refine the form labels"}]},
  {id:"ready",title:"Ready to review",cards:[{id:"tokens",title:"Bring the foundations together"},{id:"focus",title:"Keep keyboard focus visible"}]},
];
export function BoardContext() {
  const [columns,setColumns]=useState(initialBoard);
  return <section className="w-full max-w-5xl rounded-2xl border border-border bg-card p-5 sm:p-7"><header className="mb-7 flex flex-wrap items-start justify-between gap-5"><div><p className="mb-2 text-xs text-muted-foreground">Kith / Release planning</p><h2 className="text-xl font-semibold tracking-tight">October release board</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Move a card by hand, or pick it up with Space and move it with the arrow keys. Escape returns it to where you started.</p></div><Button variant="outline" size="sm" onClick={()=>setColumns(initialBoard)}><RotateCcw />Reset board</Button></header>
    <KanbanBoard columns={columns} onChange={setColumns} label="Kith release board" /><p className="mt-5 text-xs text-muted-foreground">Illustrative work items. Changes stay in this example.</p>
  </section>;
}
export function PricingContext() {
  return <section className="grid w-full max-w-3xl grid-cols-1 gap-8 rounded-2xl border border-border bg-card p-6 sm:p-8 md:grid-cols-2 md:items-center"><div><Badge variant="outline">Illustrative pricing</Badge><h2 className="mt-5 font-display text-3xl leading-tight">Room to build<br /><em>together.</em></h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Choose the team size and billing period. The current plan, seat price, and total stay connected as the numbers change.</p><p className="mt-5 text-xs leading-relaxed text-muted-foreground">These are sample plans for exploring the component. They are not product offers.</p></div><PricingCalculator plans={[{name:"Small team",minSeats:1,seatPrice:12},{name:"Growing studio",minSeats:5,seatPrice:10},{name:"Together at scale",minSeats:12,seatPrice:8}]} maxSeats={20} /></section>;
}
export function SearchToolbarContext() {
  const [query,setQuery]=useState("");
  const files=sampleFiles.filter(file=>file.name.toLowerCase().includes(query.toLowerCase()));
  return <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-6"><header className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-xs text-muted-foreground">Your everyday library</p><h2 className="text-xl font-semibold tracking-tight">Search your files</h2></div><ToolbarDynamic label="Search files" onSearch={setQuery} /></header>
    {query&&<div className="mb-4 flex items-center justify-between text-xs text-muted-foreground"><span>Results for “{query}”</span><Button variant="ghost" size="sm" onClick={()=>setQuery("")}>Clear results</Button></div>}
    <ul className="divide-y divide-border">{files.map(file=><li key={file.id} className="flex items-center gap-3 py-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">{file.kind==="image"?<ImageIcon className="size-4 text-muted-foreground" />:<FileText className="size-4 text-muted-foreground" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{file.name}</span><span className="mt-1 block text-xs text-muted-foreground">{file.collection} · {file.size}</span></span></li>)}</ul>
    {files.length===0&&<p role="status" className="py-10 text-center text-sm text-muted-foreground">No matching files. Try another name.</p>}
  </section>;
}
export function StepperContext() {
  const [step,setStep]=useState(0);
  return <section className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card"><div className="p-6 sm:p-8"><p className="mb-2 text-xs text-muted-foreground">A release, made considered</p><h2 className="mb-8 text-xl font-semibold tracking-tight">Prepare the release</h2><ProgressStepper steps={["Prepare","Review","Ready"]} current={step} label="Release preparation" /><div className="mt-8"><TransitionPanel activeIndex={step}>{[<div><h3 className="font-medium">Get the small things together.</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Collect your artwork, check the release notes, and make sure every state has a clear next action.</p></div>,<div><h3 className="font-medium">Look at the real experience.</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Try a phone, a tablet, and a wide screen. Use the keyboard. Interrupt the animations and retry a failed save.</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">There’s no substitute for seeing the pieces work together.</p></div>,<div><span className="mb-4 flex size-10 items-center justify-center rounded-full bg-accent"><Check className="size-5" /></span><h3 className="font-medium">Ready for another pair of eyes.</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">The example checklist is complete. Nothing has been published.</p></div>]}</TransitionPanel></div></div><footer className="flex justify-between border-t border-border px-6 py-4 sm:px-8"><Button variant="ghost" disabled={step===0} onClick={()=>setStep(step-1)}><ArrowLeft />Back</Button><Button onClick={()=>setStep(step===2?0:step+1)}>{step===2?"Start again":"Continue"}<ArrowRight /></Button></footer></section>;
}
export function MediaContext() {
  const [index, setIndex] = useState(0);
  const titleId = useId();
  const moments = [
    { id: "coast", image: "coastal-walk-v2", title: "The long way home.", description: "A conversation on the coast. A small detail that brings the whole afternoon back.", alt: "Illustrated coastal path above a quiet blue sea", kind: "Original artwork", width: 760, height: 790 },
    { id: "memory", image: "memory-table-v2", title: "A table full of memories.", description: "The photograph, the coffee, the story behind it. Make room for the context worth keeping.", alt: "An illustrated memory book, coastal photograph and cup of coffee", kind: "Original artwork", width: 760, height: 507 },
    { id: "book", image: "book-stage", title: "Stories worth keeping.", description: "Some things deserve a place beyond a contact card. The little things you want to come back to.", alt: "Kith’s illustrated book and warm tabletop setting", kind: "Original artwork", width: 760, height: 507 },
    { id: "people", image: "constellation", title: "Your own constellation.", description: "Lanterns sized by the closeness you choose. An actual Kith screen, shown whole.", alt: "Kith’s actual constellation screen with people shown as warm lanterns", kind: "Actual app screen", width: 603, height: 1311 },
  ];
  return <section aria-labelledby={titleId} className="w-full max-w-4xl">
    <header className="mb-7 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="eyebrow mb-4">Kith / A collection of moments</p><h2 id={titleId} className="max-w-lg font-display text-3xl leading-[1.12] sm:text-5xl">A few things<br /><em>worth keeping.</em></h2></div><p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Original artwork and a real app screen. One quiet frame, with the whole story in view.</p></header>
    <Carousel.Carousel index={index} onIndexChange={setIndex} label="Kith moments" className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card has-[[data-slot=carousel-viewport]:focus-visible]:ring-[3px] has-[[data-slot=carousel-viewport]:focus-visible]:ring-ring has-[[data-slot=carousel-viewport]:focus-visible]:ring-offset-2 has-[[data-slot=carousel-viewport]:focus-visible]:ring-offset-background">
      <Carousel.CarouselContent viewportClassName="rounded-none focus-visible:ring-0 focus-visible:ring-offset-0">{moments.map((moment, position) => <Carousel.CarouselItem key={moment.id} label={moment.title}>
        <figure className="grid h-full sm:grid-cols-[1.15fr_1fr]">
          <div className="relative aspect-[4/5] min-w-0 overflow-hidden bg-surface sm:aspect-auto sm:min-h-[25rem]">
            {moment.id === "people" ? <div className="absolute inset-7 flex items-center justify-center"><ResponsiveImage src={`./demo/kith/${moment.image}.webp`} alt={moment.alt} width={moment.width} height={moment.height} className="h-full w-auto max-w-full rounded-[10%/4.6%] border border-border bg-transparent shadow-sm" imageClassName="object-contain" /></div> : <ResponsiveImage src={`./demo/kith/${moment.image}.webp`} alt={moment.alt} width={moment.width} height={moment.height} loading={position === 0 ? "eager" : "lazy"} className="absolute! inset-0 size-full" imageClassName="object-cover" />}
            <span className="absolute bottom-4 left-4 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium">{moment.kind}</span>
          </div>
          <figcaption className="flex min-w-0 flex-col justify-center px-6 py-7 sm:px-8 sm:py-10"><h3 className="font-display text-2xl leading-tight sm:text-3xl">{moment.title}</h3><p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{moment.description}</p><a target="_top" href="./?path=/story/start-here-media--complete-page" className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-sm text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring">Explore Kith<ArrowRight aria-hidden className="size-4" /></a></figcaption>
        </figure>
      </Carousel.CarouselItem>)}</Carousel.CarouselContent>
      <footer className="flex items-center justify-between gap-4 border-t border-border px-6 py-2 sm:px-8"><span aria-hidden className="font-mono text-xs tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")} <span className="mx-1 opacity-50">/</span> {String(moments.length).padStart(2, "0")}</span><Carousel.CarouselIndicator className="static inset-auto hidden w-auto sm:flex" /><Carousel.CarouselNavigation className="static inset-auto w-auto translate-y-0 gap-2 p-0" /></footer>
    </Carousel.Carousel>
    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Swipe or use the controls. Keyboard: focus the frame, then use ← →, Home or End. Nothing advances automatically.</p>
  </section>;
}
export function ComparisonContext() {
  return <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card"><Comparison.ImageComparison className="aspect-[16/10] w-full"><Comparison.ImageComparisonImage src="./demo/kith/coastal-walk-v2.webp" alt="Kith coastal-walk artwork" position="left" /><Comparison.ImageComparisonImage src="./demo/kith/memory-table-v2.webp" alt="Kith memory-table artwork" position="right" /><Comparison.ImageComparisonSlider className="w-0.5 bg-white" /></Comparison.ImageComparison><div className="p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Two moments. One frame.</h2><Badge variant="outline">Compare</Badge></div><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Drag the divider, or focus it and use the arrow keys. The handle stays connected to your pointer without an extra animation competing with your hand.</p></div></section>;
}
export function SourceTreeContext() {
  const [selected,setSelected]=useState("workspace/README.md");
  const texts: Record<string,string>={"workspace/README.md":"A small system, with clear responsibilities. Atoms provide the geometry. Molecules give them a purpose. Organisms bring the whole interaction together.","workspace/atoms/button.tsx":"The action’s geometry, focus, hover, press, and disabled state live here. Product behavior belongs in its parent.","workspace/molecules/input-field.tsx":"A label, input, description, and validation message—associated and composed once.","workspace/organisms/workspace-settings.tsx":"The complete interaction: edits, pending state, save failure, retry, and the saved result."};
  return <section className="grid w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[.85fr_1.15fr]"><div className="border-b border-border p-5 md:border-b-0 md:border-r"><p className="mb-4 text-xs font-medium text-muted-foreground">Workspace / Source</p><TreeView label="Atomic source architecture" defaultOpen={["workspace","workspace/atoms","workspace/molecules","workspace/organisms"]} defaultSelected={selected} nodes={[{name:"workspace",children:[{name:"atoms",children:[{name:"button.tsx"}]},{name:"molecules",children:[{name:"input-field.tsx"}]},{name:"organisms",children:[{name:"workspace-settings.tsx"}]},{name:"README.md"}]}]} onSelect={setSelected} /></div><article className="p-6"><Badge variant="outline">Architecture note</Badge><h2 className="mt-5 break-all font-mono text-sm font-medium">{selected.split("/").at(-1)}</h2><p className="mt-5 text-sm leading-[1.8] text-muted-foreground">{texts[selected]??"Choose a file to see its responsibility in the system."}</p><p className="mt-7 border-t border-border pt-4 text-xs text-muted-foreground">Keyboard: arrows to navigate, Enter to select.</p></article></section>;
}
