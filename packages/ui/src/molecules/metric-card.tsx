"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { motionTiming } from "../lib/motion";
import { cn } from "../lib/utils";

export type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  trend?: { direction: "up" | "down" | "flat"; label: string };
  series?: readonly number[];
  className?: string;
};

export function MetricCard({ label, value, detail, trend, series = [], className }: MetricCardProps) {
  const reduced = useReducedMotion();
  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const points = series.map((point, i) => `${i * 160 / Math.max(series.length - 1, 1)},${44 - (point - min) / (max - min || 1) * 36}`).join(" ");
  const Icon = trend?.direction === "up" ? ArrowUpRight : trend?.direction === "down" ? ArrowDownRight : Minus;
  return <section className={cn("relative flex min-w-0 flex-col gap-5 overflow-hidden rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-6", className)}>
    <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="relative min-h-10 text-3xl font-semibold tracking-[-0.035em] tabular-nums sm:text-4xl">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={value} className="inline-block" initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -6 }} transition={motionTiming.content}>{value}</motion.span>
          </AnimatePresence>
        </div>
        
      </div>
      {series.length > 1 && <svg aria-hidden viewBox="0 0 160 48" className="h-12 w-20 shrink-0 text-brand sm:w-28">
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>}
    </div>
    <p className="-mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    {trend && <div className="flex items-center gap-1 text-xs leading-relaxed"><Icon aria-hidden className="size-3.5" /><span>{trend.label}</span></div>}
  </section>;
}
