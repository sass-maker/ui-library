import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Loader2, RotateCcw, Zap, Layers3, MousePointer2 } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { Badge } from "@saas-maker/ui/atoms/badge";
import { Progress } from "@saas-maker/ui/atoms/progress";
import { SegmentedControl } from "@saas-maker/ui/recipes/segmented-control";
import { TransitionPanel } from "@saas-maker/ui/recipes/transition-panel";
import { useReducedMotion } from "@saas-maker/ui/lib/use-reduced-motion";
import { motionTiming } from "@saas-maker/ui/lib/motion";

const meta = { title: "Foundations/Motion", parameters: { docs: { description: { component: "A shared rhythm for atoms, molecules, and organisms. Feedback settles quickly; content has a little more room; layouts carry their current velocity. Use the toolbar to compare reduced motion." } } } } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Rhythm: Story = { render: function Render() {
  const [active,setActive]=useState("Feedback");
  const [progress,setProgress]=useState(32);
  const reduced=useReducedMotion();
  const choices=["Feedback","Content","Layout"];
  const panels=[
    <div className="grid gap-6 sm:grid-cols-[auto_1fr]"><div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-surface"><MousePointer2 className="size-6 stroke-[1.5]" /></div><div><h3 className="text-xl font-semibold tracking-tight">Keep up with the hand.</h3><p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">Hover, focus, and press feedback should arrive immediately. They help an action feel connected to the control.</p><div className="mt-6 flex flex-wrap gap-3"><Button onClick={()=>setProgress(current=>current===100?0:Math.min(100,current+17))}>Move forward<ArrowRight /></Button><Button variant="outline" onClick={()=>setProgress(0)}><RotateCcw />Reset</Button></div><Progress value={progress} aria-label="Example progress" className="mt-6 h-1.5" /><p className="mt-3 text-xs tabular-nums text-muted-foreground">{progress}% complete</p></div></div>,
    <div><div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-border bg-surface"><Layers3 className="size-6 stroke-[1.5]" /></div><h3 className="text-xl font-semibold tracking-tight">Keep the context in view.</h3><p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">A small shift and a cross-fade connect one view to the next. The surrounding surface resizes with the content instead of jumping.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{["A gentle entrance","A shorter exit"].map(label=><div key={label} className="rounded-lg border border-border p-4 text-sm">{label}</div>)}</div></div>,
    <div><div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-border bg-surface"><Zap className="size-6 stroke-[1.5]" /></div><h3 className="text-xl font-semibold tracking-tight">Change your mind mid-flight.</h3><p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">Click between these sections quickly. Springs should retarget from their current position, without restarting a fixed sequence or waiting for the last animation.</p><p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">With reduced motion, spatial movement becomes a short fade. The selected state and every action remain clear.</p></div>
  ];
  return <main className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-10"><p className="eyebrow mb-4">The shared rhythm</p><h1 className="font-display text-4xl sm:text-5xl">Motion with a reason.</h1><p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">Responsive at the fingertips. Considered between moments.</p>
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4"><SegmentedControl options={choices} value={active} onChange={setActive} label="Motion category" /><Badge variant="outline">{reduced?"Reduced motion":"System motion"}</Badge></div>
    <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-9"><TransitionPanel activeIndex={choices.indexOf(active)}>{panels}</TransitionPanel></div>
    <div className="mt-7 grid gap-4 text-sm sm:grid-cols-3">{[["140 ms","Feedback"],["220 ms","Content"],["280 ms","Layout settle"]].map(([time,label])=><div key={label} className="border-t border-border pt-4"><p className="font-mono text-xs text-muted-foreground">{time}</p><p className="mt-2 font-medium">{label}</p></div>)}</div>
  </main>;
} };
