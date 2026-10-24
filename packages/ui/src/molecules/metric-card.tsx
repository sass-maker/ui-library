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
  /** Inline metrics share the host's surface and dividers. */
  variant?: "card" | "inline";
  className?: string;
};

export function MetricCard({ label, value, detail, trend, series = [], variant = "card", className }: MetricCardProps) {
  const reduced = useReducedMotion();
  const max = Math.max(...series, 1);
  const min = Math.min(...series, 0);
  const points = series.map((point, i) => `${i * 160 / Math.max(series.length - 1, 1)},${44 - (point - min) / (max - min || 1) * 36}`).join(" ");
  const Icon = trend?.direction === "up" ? ArrowUpRight : trend?.direction === "down" ? ArrowDownRight : Minus;
  return <section className={cn("relative flex min-w-0 flex-col overflow-hidden text-card-foreground", variant === "card" ? "gap-5 rounded-xl border border-border bg-card p-5 sm:p-6" : "gap-3 bg-transparent px-3 py-4 @min-[500px]:px-5", className)}>
    <h3 className={cn("font-medium leading-relaxed text-muted-foreground", variant === "card" ? "text-sm" : "text-xs")}>{label}</h3>
    <div className={cn("flex justify-between gap-3", variant === "card" ? "items-end" : "flex-col items-start")}>
      <div className="min-w-0">
        <div className={cn("relative font-semibold leading-[1.15] tracking-[-0.035em] tabular-nums", variant === "card" ? "min-h-10 text-3xl sm:text-4xl" : "min-h-9 text-[1.875rem]")}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span key={value} className="inline-block" initial={{ opacity: 0, y: reduced ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -6 }} transition={motionTiming.content}>{value}</motion.span>
          </AnimatePresence>
        </div>
        
      </div>
      {series.length > 1 && <svg aria-hidden viewBox="0 0 160 48" className={cn("shrink-0 text-brand", variant === "card" ? "h-12 w-20 sm:w-28" : "h-6 w-full")}>
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>}
    </div>
    <p className="-mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    {trend && <div className="flex items-center gap-1 text-xs leading-relaxed"><Icon aria-hidden className="size-3.5" /><span>{trend.label}</span></div>}
  </section>;
}
