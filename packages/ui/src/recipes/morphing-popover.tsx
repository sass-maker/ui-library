"use client";
/** Morphing surface adapted from ibelick/motion-primitives, MIT.
 * See THIRD_PARTY_NOTICES.md. Fleet retains Radix popover keyboard/focus behavior.
 */
import { createContext, useContext, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Popover as Primitive } from "radix-ui";
import { LayoutGroup, motion, type Transition } from "motion/react";
import { frame, cancelFrame } from "motion";
import { cn } from "../lib/utils";
import { useReducedMotion } from "../lib/use-reduced-motion";

const Context = createContext<{ id: string; open: boolean; ready: boolean; setReady: (ready: boolean) => void }>({ id: "", open: false, ready: false, setReady: () => {} });
type Part = { children?: ReactNode; className?: string };
type SurfacePart = Part & {
  /** Paint the animated surface; className styles the stable layout/foreground. */
  surfaceClassName?: string;
};
const settle = { type: "spring", duration: .25, bounce: 0 } as const;

export function MorphingPopover({ children, open: controlled, onOpenChange }: { children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const id = useId();
  const [local, setLocal] = useState(false);
  const [ready, setReady] = useState(false);
  const open = controlled ?? local;
  useLayoutEffect(() => { if (!open) setReady(false); }, [open]);
  return <Context.Provider value={{ id, open, ready: open && ready, setReady }}><Primitive.Root open={open} onOpenChange={next => { if (controlled === undefined) setLocal(next); onOpenChange?.(next); }}><LayoutGroup id={id}>{children}</LayoutGroup></Primitive.Root></Context.Provider>;
}

export function MorphingPopoverTrigger({ children, className, surfaceClassName }: SurfacePart) {
  const { id } = useContext(Context);
  const reduced = useReducedMotion();
  // Radix measures this button. Project only its decorative layer, never the
  // anchor itself: measuring a moving anchor feeds the morph back into placement.
  return <Primitive.Trigger data-slot="morphing-popover-trigger" className={cn("relative min-h-11 rounded-lg px-4 py-2 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring", className)}>
    <motion.span data-slot="morphing-popover-trigger-surface" aria-hidden layoutId={reduced ? undefined : `${id}-surface`} transition={reduced ? { duration: 0 } : settle} className={cn("pointer-events-none absolute inset-0 rounded-[inherit] border border-border bg-card", surfaceClassName)} />
    <span className="relative inline-flex items-center justify-center gap-2">{children}</span>
  </Primitive.Trigger>;
}

export function MorphingPopoverContent({ children, className, surfaceClassName, side = "bottom", align = "start", transition }: SurfacePart & { children: ReactNode; side?: "top" | "bottom" | "left" | "right"; align?: "start" | "center" | "end"; transition?: Transition }) {
  const { id, open, ready, setReady } = useContext(Context);
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(false);
  const entrance = useMemo(() => ({ started: false, cancelled: false }), [open, ready, reduced]);
  useLayoutEffect(() => {
    if (!open || !ready) { setSettled(false); return; }
    entrance.started = false;
    entrance.cancelled = false;
    // Layout animation starts in Motion's update phase. After rendering, a
    // missing start means this opening has no projection animation to await.
    const revealIfIdle = () => {
      if (!entrance.cancelled && !entrance.started) setSettled(true);
    };
    if (reduced) setSettled(true);
    else frame.postRender(revealIfIdle);
    return () => { entrance.cancelled = true; cancelFrame(revealIfIdle); };
  }, [open, ready, reduced, entrance]);
  const reveal = ready && (reduced || settled);
  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0, cancelled = false;
    const check = () => {
      if (cancelled) return;
      // Wait for public placement data before the next React commit mounts the paint.
      if (content.current && getComputedStyle(content.current).getPropertyValue("--radix-popover-content-transform-origin").trim()) {
        setReady(true);
        return;
      }
      frame = requestAnimationFrame(check);
    };
    frame = requestAnimationFrame(check);
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [open, setReady]);
  return <Primitive.Portal><Primitive.Content ref={content} data-slot="morphing-popover-content" side={side} align={align} sideOffset={8} collisionPadding={16}
    className={cn("relative z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl p-5 text-popover-foreground outline-none", className)}>
    {ready && <motion.div data-slot="morphing-popover-surface" aria-hidden initial={false} layoutId={reduced ? undefined : `${id}-surface`} transition={reduced ? { duration: 0 } : transition ?? settle}
      onLayoutAnimationStart={() => { if (!entrance.cancelled) entrance.started = true; }}
      onLayoutAnimationComplete={() => { if (!entrance.cancelled) setSettled(true); }}
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit] border border-border bg-popover shadow-lg", surfaceClassName)} />}
    <motion.div className={cn("relative", !reveal && "pointer-events-none")} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: reveal ? 1 : 0 }} transition={{ duration: reduced ? 0 : .16 }}>{children}</motion.div>
  </Primitive.Content></Primitive.Portal>;
}

export function MorphingPopoverClose({ children, className }: Part) {
  return <Primitive.Close className={cn("min-h-11 rounded-md px-3 py-2 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring", className)}>{children ?? "Close"}</Primitive.Close>;
}
