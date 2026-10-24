"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { Progress } from "../components/progress";
import { Checkbox } from "../components/checkbox";
import { MetricCard, type MetricCardProps } from "../molecules/metric-card";
import { ActivityItem, type ActivityEntry } from "../molecules/activity-item";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { motionTiming } from "../lib/motion";
import { cn } from "../lib/utils";

export type ProjectTask = { id: string; title: string; detail: string; complete: boolean };

export function ProjectOverview({ name, description, metrics, tasks, activity, onTaskChange, action, className }: {
  name: string;
  description: string;
  metrics: readonly MetricCardProps[];
  tasks: readonly ProjectTask[];
  activity: readonly ActivityEntry[];
  onTaskChange: (id: string, complete: boolean) => void;
  action?: { label: string; href: string };
  className?: string;
}) {
  const reduced = useReducedMotion();
  const scope = useId();
  const done = tasks.filter(task => task.complete).length;
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  return <section className={cn("@container rounded-2xl border border-border bg-card p-5 text-card-foreground sm:p-8", className)} aria-label={`${name} project overview`}>
    <header className="mb-7 flex flex-wrap items-start justify-between gap-5"><div><p className="mb-3 text-xs text-muted-foreground">Workspace / Overview</p><div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-semibold tracking-tight">{name}</h2><Badge variant="outline">Project workspace</Badge></div><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p></div>
      {action && <Button variant="outline" asChild><a href={action.href} target="_blank" rel="noreferrer">{action.label}<ArrowUpRight /></a></Button>}
    </header>
    <div className="grid gap-4 @min-[500px]:grid-cols-2 @min-[900px]:grid-cols-3">{metrics.map(metric => <MetricCard key={metric.label} {...metric} />)}</div>
    <div className="mt-7 grid gap-7 @min-[900px]:grid-cols-[1.3fr_1fr]">
      <section className="min-w-0 rounded-xl border border-border"><header className="border-b border-border p-5"><div className="flex items-center justify-between gap-4"><h3 className="text-sm font-semibold">Release checklist</h3><span className="text-xs tabular-nums text-muted-foreground" role="status">{done}/{tasks.length} complete</span></div><Progress value={percent} aria-label="Project checklist progress" className="mt-4 h-1.5" /></header>
        <ul className="divide-y divide-border">{tasks.map(task => <motion.li key={task.id} layout={!reduced ? "position" : false} transition={motionTiming.layout} className="flex items-start gap-3 p-5">
          <Checkbox id={`${scope}-task-${task.id}`} checked={task.complete} onCheckedChange={value => onTaskChange(task.id, value === true)} className="mt-0.5" />
          <div className="min-w-0"><label htmlFor={`${scope}-task-${task.id}`} className={cn("cursor-pointer text-sm font-medium leading-relaxed transition-colors", task.complete && "text-muted-foreground line-through decoration-border")}>{task.title}</label><p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">{task.detail}</p></div>
        </motion.li>)}</ul>
        {tasks.length === 0 && <p className="p-5 text-sm text-muted-foreground">No steps to complete yet.</p>}
      </section>
      <section className="min-w-0 rounded-xl border border-border p-5"><h3 className="mb-6 text-sm font-semibold">Recent activity</h3>
        <ol>{activity.map((entry, index) => <ActivityItem key={entry.id} entry={entry} last={index === activity.length - 1} />)}</ol>
        {activity.length === 0 && <p className="text-sm leading-relaxed text-muted-foreground">Your team’s activity will appear here.</p>}
      </section>
    </div>
  </section>;
}
