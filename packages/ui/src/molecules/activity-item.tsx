"use client";
import { motion } from "motion/react";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { motionTiming } from "../lib/motion";
import { Check, FileUp, MessageSquare, UserPlus } from "lucide-react";
import { cn } from "../lib/utils";

export type ActivityEntry = {
  id: string;
  kind: "completed" | "upload" | "comment" | "member";
  actor: string;
  action: string;
  subject: string;
  time: string;
  dateTime: string;
};

const icons = { completed: Check, upload: FileUp, comment: MessageSquare, member: UserPlus };

export function ActivityItem({ entry, last = false, className }: { entry: ActivityEntry; last?: boolean; className?: string }) {
  const reduced = useReducedMotion();
  const Icon = icons[entry.kind];
  return <motion.li layout={!reduced ? "position" : false} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={motionTiming.content} className={cn("relative flex gap-3 pb-6", className)}>
    {!last && <span aria-hidden className="absolute bottom-0 left-4 top-8 w-px bg-border" />}
    <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"><Icon aria-hidden className="size-3.5" /></span>
    <div className="min-w-0 pt-0.5">
      <p className="text-[0.8125rem] leading-relaxed"><span className="font-medium">{entry.actor}</span> <span className="text-muted-foreground">{entry.action}</span> <span className="font-medium">{entry.subject}</span></p>
      <time dateTime={entry.dateTime} className="mt-1 block text-xs text-muted-foreground">{entry.time}</time>
    </div>
  </motion.li>;
}
