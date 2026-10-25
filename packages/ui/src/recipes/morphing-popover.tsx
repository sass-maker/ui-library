"use client";
/** Morphing surface adapted from ibelick/motion-primitives, MIT.
 * See THIRD_PARTY_NOTICES.md. Fleet retains Radix popover keyboard/focus behavior.
 */
import { createContext, useContext, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
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
  const surface = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(false);
  const entrance = useMemo<{ cancelled: boolean; complete?: () => void }>(() => ({ cancelled: false }), [open, ready, reduced]);
  useLayoutEffect(() => {
    entrance.cancelled = false;
    if (!open || !ready) { setSettled(false); return () => { entrance.cancelled = true; }; }
    let finished = false, previous: DOMRect | undefined;
    const complete = () => {
      if (entrance.cancelled || finished) return;
      finished = true;
      cancelFrame(observe);
      setSettled(true);
    };
    // Resize and no-layout updates can snap Motion's projection without calling
    // onLayoutAnimationComplete. Observe only entrance paint, after Motion renders.
    const observe = () => {
      if (entrance.cancelled || finished) { cancelFrame(observe); return; }
      const target = content.current, paint = surface.current;
      if (!target || !paint) { previous = undefined; return; }
      const targetStyle = getComputedStyle(target), paintStyle = getComputedStyle(paint);
      const box = target.getBoundingClientRect(), painted = paint.getBoundingClientRect();
      const keys = ["x", "y", "width", "height"] as const;
      const visible = targetStyle.visibility === "visible" && paintStyle.visibility === "visible" && Number(paintStyle.opacity) > 0 && box.width > 0 && box.height > 0 && box.bottom > 0 && box.right > 0 && box.top < innerHeight && box.left < innerWidth;
      const matches = visible && paintStyle.transform === "none" && painted.width > 0 && painted.height > 0;
      // Projection must be at identity, not merely moving slowly or waiting on a delay.
      // Compare paint with itself: public border/inset/scale styling can differ from Content.
      const prior = previous;
      if (matches && prior && keys.every(key => Math.abs(prior[key] - painted[key]) < .5)) complete();
      previous = matches ? painted : undefined;
    };
    entrance.complete = complete;
    if (reduced) complete();
    else frame.postRender(observe, true);
    return () => { entrance.cancelled = true; entrance.complete = undefined; cancelFrame(observe); };
  }, [open, ready, reduced, entrance]);
  const reveal = ready && (reduced || settled);
  // Keep Radix focus/navigation ownership, but do not activate or edit unseen controls.
  const guardHidden = (event: SyntheticEvent) => {
    if (!reveal) { event.preventDefault(); event.stopPropagation(); }
  };
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
    {ready && <motion.div ref={surface} data-slot="morphing-popover-surface" aria-hidden initial={false} layoutId={reduced ? undefined : `${id}-surface`} transition={reduced ? { duration: 0 } : transition ?? settle}
      onLayoutAnimationComplete={() => entrance.complete?.()}
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit] border border-border bg-popover shadow-lg", surfaceClassName)} />}
    <motion.div className={cn("relative", !reveal && "pointer-events-none")} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: reveal ? 1 : 0 }} transition={{ duration: reduced ? 0 : .16 }}
      onKeyDownCapture={event => { if (event.key !== "Tab" && event.key !== "Escape") guardHidden(event); }}
      onClickCapture={guardHidden} onBeforeInputCapture={guardHidden} onPasteCapture={guardHidden}>{children}</motion.div>
  </Primitive.Content></Primitive.Portal>;
}

export function MorphingPopoverClose({ children, className }: Part) {
  return <Primitive.Close className={cn("min-h-11 rounded-md px-3 py-2 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring", className)}>{children ?? "Close"}</Primitive.Close>;
}
