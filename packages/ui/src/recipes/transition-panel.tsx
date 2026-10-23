/** Adapted from ibelick/motion-primitives. MIT; see THIRD_PARTY_NOTICES.md. */
"use client";
import { AnimatePresence, motion, type MotionProps, type Transition, type Variant } from "motion/react";
import useMeasure from "react-use-measure";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { motionTiming } from "../lib/motion";
import { cn } from "../lib/utils";

export type TransitionPanelProps = {
  children: React.ReactNode[];
  className?: string;
  transition?: Transition;
  activeIndex: number;
  variants?: { enter: Variant; center: Variant; exit: Variant };
} & MotionProps;

/** Resizes with its content; rapid changes retarget the current spring. */
export function TransitionPanel({ children, className, transition, variants, activeIndex, ...motionProps }: TransitionPanelProps) {
  const reduced = useReducedMotion();
  const [measure, bounds] = useMeasure();
  const states = variants ?? {
    enter: { opacity: 0, y: reduced ? 0 : 6 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduced ? 0 : -4 },
  };
  return <motion.div initial={false} animate={{ height: bounds.height || "auto" }}
    transition={reduced ? { duration: 0 } : motionTiming.layout} className={cn("relative", className)}>
    <AnimatePresence initial={false} mode="popLayout" custom={motionProps.custom}>
      <motion.div key={activeIndex} ref={measure} variants={states} initial="enter" animate="center" exit="exit"
        transition={reduced ? motionTiming.feedback : transition ?? motionTiming.content} {...motionProps}>
        {children[activeIndex]}
      </motion.div>
    </AnimatePresence>
  </motion.div>;
}
