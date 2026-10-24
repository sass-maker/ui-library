/** Adapted from ibelick/motion-primitives. MIT; see THIRD_PARTY_NOTICES.md. */
"use client";
import { forwardRef } from "react";
import { AnimatePresence, motion, useIsPresent, type HTMLMotionProps, type MotionProps, type Transition, type Variant } from "motion/react";
import useMeasure from "react-use-measure";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { motionTiming } from "../lib/motion";
import { cn } from "../lib/utils";

export type TransitionPanelProps = {
  children: React.ReactNode[];
  className?: string;
  transition?: Transition;
  activeIndex: number;
  /** Keep long collections in natural flow while their contents animate. */
  animateHeight?: boolean;
  variants?: { enter: Variant; center: Variant; exit: Variant };
} & MotionProps;

const Panel = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(function Panel(props, ref) {
  const present = useIsPresent();
  return <motion.div {...props} ref={ref} data-slot="transition-panel-content" inert={!present} aria-hidden={present ? undefined : true} />;
});

/** Resizes with its content; rapid changes retarget the current spring. */
export function TransitionPanel({ children, className, transition, variants, activeIndex, animateHeight = true, ...motionProps }: TransitionPanelProps) {
  const reduced = useReducedMotion();
  const [measure, bounds] = useMeasure();
  const states = variants ?? {
    enter: { opacity: 0, y: reduced ? 0 : 6 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduced ? 0 : -4 },
  };
  return <motion.div data-slot="transition-panel" initial={false} animate={{ height: animateHeight ? bounds.height || "auto" : "auto" }}
    transition={reduced ? { duration: 0 } : motionTiming.layout} className={cn("relative", className)}>
    <AnimatePresence initial={false} mode="popLayout" custom={motionProps.custom}>
      <Panel key={activeIndex} ref={measure} variants={states} initial="enter" animate="center" exit="exit"
        transition={reduced ? motionTiming.feedback : transition ?? motionTiming.content} {...motionProps}>
        {children[activeIndex]}
      </Panel>
    </AnimatePresence>
  </motion.div>;
}
