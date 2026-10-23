"use client";
/** Adapted from motion-primitives (MIT). Radix owns keyboard and disclosure semantics. */
import { Collapsible } from "radix-ui";
import { motion, type Transition, type Variant } from "motion/react";
import { createContext, useContext, useState, type ReactNode, type ComponentProps } from "react";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { motionTiming } from "../lib/motion";

type DisclosureState = { open: boolean; transition?: Transition; variants?: { expanded: Variant; collapsed: Variant } };
const State = createContext<DisclosureState>({ open: false });
export type DisclosureProps = ComponentProps<typeof Collapsible.Root> & Pick<DisclosureState, "transition" | "variants">;

export function Disclosure({ transition, variants, children, open, defaultOpen = false, onOpenChange, ...props }: DisclosureProps) {
  const [local, setLocal] = useState(defaultOpen);
  const expanded = open ?? local;
  return <State.Provider value={{ open: expanded, transition, variants }}>
    <Collapsible.Root {...props} open={expanded} onOpenChange={value => { setLocal(value); onOpenChange?.(value); }}>{children}</Collapsible.Root>
  </State.Provider>;
}
export function DisclosureTrigger({ children, className }: { children: ReactNode; className?: string }) {
  return <Collapsible.Trigger asChild className={className}>{children}</Collapsible.Trigger>;
}
export function DisclosureContent({ children, className }: { children: ReactNode; className?: string }) {
  const { open, transition, variants } = useContext(State);
  const reduced = useReducedMotion();
  return <Collapsible.Content forceMount asChild>
    <motion.div initial={false} animate={open ? "expanded" : "collapsed"} aria-hidden={!open} inert={!open}
      variants={variants ?? { expanded: { height: "auto", opacity: 1 }, collapsed: { height: 0, opacity: 0 } }}
      transition={reduced ? { duration: 0 } : transition ?? motionTiming.content} className="overflow-hidden">
      <div className={className}>{children}</div>
    </motion.div>
  </Collapsible.Content>;
}
