"use client";
/** Morphing surface adapted from ibelick/motion-primitives, MIT.
 * See THIRD_PARTY_NOTICES.md. Fleet retains Radix popover keyboard/focus behavior.
 */
import { createContext, useContext, useId, type ReactNode } from "react";
import { Popover as Primitive } from "radix-ui";
import { LayoutGroup, motion, type Transition } from "motion/react";
import { cn } from "../lib/utils";
import { useReducedMotion } from "../lib/use-reduced-motion";

const Context = createContext("");
type Part = { children?: ReactNode; className?: string };
const settle = { type: "spring", duration: .25, bounce: 0 } as const;

export function MorphingPopover({ children, open, onOpenChange }: { children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const id = useId();
  return <Context.Provider value={id}><Primitive.Root open={open} onOpenChange={onOpenChange}><LayoutGroup id={id}>{children}</LayoutGroup></Primitive.Root></Context.Provider>;
}

export function MorphingPopoverTrigger({ children, className }: Part) {
  const id = useContext(Context);
  const reduced = useReducedMotion();
  // Radix measures this button. Project only its decorative layer, never the
  // anchor itself: measuring a moving anchor feeds the morph back into placement.
  return <Primitive.Trigger data-slot="morphing-popover-trigger" className={cn("relative min-h-11 rounded-lg px-4 py-2 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring", className)}>
    <motion.span aria-hidden layoutId={reduced ? undefined : `${id}-surface`} transition={reduced ? { duration: 0 } : settle} className="pointer-events-none absolute inset-0 rounded-[inherit] border border-border bg-card" />
    <span className="relative inline-flex items-center justify-center gap-2">{children}</span>
  </Primitive.Trigger>;
}

export function MorphingPopoverContent({ children, className, side = "bottom", align = "start", transition }: { children: ReactNode; className?: string; side?: "top" | "bottom" | "left" | "right"; align?: "start" | "center" | "end"; transition?: Transition }) {
  const id = useContext(Context);
  const reduced = useReducedMotion();
  return <Primitive.Portal><Primitive.Content data-slot="morphing-popover-content" side={side} align={align} sideOffset={8} collisionPadding={16}
    className={cn("relative z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl p-5 text-popover-foreground outline-none", className)}>
    <motion.div data-slot="morphing-popover-surface" aria-hidden initial={false} layoutId={reduced ? undefined : `${id}-surface`} transition={reduced ? { duration: 0 } : transition ?? settle}
      className="pointer-events-none absolute inset-0 rounded-[inherit] border border-border bg-popover shadow-lg" />
    <motion.div className="relative" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : .16 }}>{children}</motion.div>
  </Primitive.Content></Primitive.Portal>;
}

export function MorphingPopoverClose({ children, className }: Part) {
  return <Primitive.Close className={cn("min-h-11 rounded-md px-3 py-2 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring", className)}>{children ?? "Close"}</Primitive.Close>;
}
