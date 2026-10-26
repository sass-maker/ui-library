"use client";
/** Morphing surface adapted from ibelick/motion-primitives, MIT.
 * See THIRD_PARTY_NOTICES.md. Fleet retains Radix popover keyboard/focus behavior.
 */
import { createContext, useCallback, useContext, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Popover as Primitive } from "radix-ui";
import { LayoutGroup, motion, type Transition } from "motion/react";
import { frame, cancelFrame } from "motion";
import { cn } from "../lib/utils";
import { useReducedMotion } from "../lib/use-reduced-motion";

const Context = createContext<{ id: string; open: boolean; ready: boolean; pointerOpen: boolean; setReady: (ready: boolean) => void; rememberPointer: (pointer: boolean) => void }>({ id: "", open: false, ready: false, pointerOpen: false, setReady: () => {}, rememberPointer: () => {} });
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
  const [requestedPointer, setRequestedPointer] = useState(false);
  const [pointerOpen, setPointerOpen] = useState(false);
  const pendingPointer = useRef(false), wasOpen = useRef(false);
  const rememberPointer = useCallback((pointer: boolean) => { pendingPointer.current = pointer; }, []);
  const open = controlled ?? local;
  useLayoutEffect(() => {
    if (open && !wasOpen.current) setPointerOpen(requestedPointer);
    if (!open) { setReady(false); setPointerOpen(false); }
    wasOpen.current = open;
    // Consume requests even when a controlled owner declines to open.
    if (requestedPointer) setRequestedPointer(false);
  }, [open, requestedPointer]);
  return <Context.Provider value={{ id, open, ready: open && ready, pointerOpen, setReady, rememberPointer }}><Primitive.Root open={open} onOpenChange={next => {
    setRequestedPointer(next && pendingPointer.current); pendingPointer.current = false;
    if (controlled === undefined) setLocal(next);
    onOpenChange?.(next);
  }}><LayoutGroup id={id}>{children}</LayoutGroup></Primitive.Root></Context.Provider>;
}

export function MorphingPopoverTrigger({ children, className, surfaceClassName }: SurfacePart) {
  const { id, rememberPointer } = useContext(Context);
  const reduced = useReducedMotion();
  // Radix measures this button. Project only its decorative layer, never the
  // anchor itself: measuring a moving anchor feeds the morph back into placement.
  return <Primitive.Trigger onClickCapture={event => rememberPointer(event.detail > 0)} data-slot="morphing-popover-trigger" className={cn("relative min-h-11 rounded-lg px-4 py-2 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring", className)}>
    <motion.span data-slot="morphing-popover-trigger-surface" aria-hidden layoutId={reduced ? undefined : `${id}-surface`} transition={reduced ? { duration: 0 } : settle} className={cn("pointer-events-none absolute inset-0 rounded-[inherit] border border-border bg-card", surfaceClassName)} />
    <span className="relative inline-flex items-center justify-center gap-2">{children}</span>
  </Primitive.Trigger>;
}

export function MorphingPopoverContent({ children, className, surfaceClassName, side = "bottom", align = "start", transition }: SurfacePart & { children: ReactNode; side?: "top" | "bottom" | "left" | "right"; align?: "start" | "center" | "end"; transition?: Transition }) {
  const { id, open, ready, pointerOpen, setReady } = useContext(Context);
  const reduced = useReducedMotion();
  const content = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const instant = reduced || !pointerOpen;
  useLayoutEffect(() => { if (!open) setEngaged(false); }, [open]);
  const engage = useCallback(() => {
    if (open && !instant && !engaged) flushSync(() => setEngaged(true));
  }, [open, instant, engaged]);
  // Bind the native editing event at portal mount; React's beforeinput is synthetic.
  const foreground = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    node.addEventListener("beforeinput", engage, true);
    return () => node.removeEventListener("beforeinput", engage, true);
  }, [engage]);
  const entrance = useMemo<{ cancelled: boolean; complete?: () => void }>(() => ({ cancelled: false }), [open, ready, instant, engaged]);
  useLayoutEffect(() => {
    entrance.cancelled = false;
    if (!open || !ready) { setSettled(false); return () => { entrance.cancelled = true; }; }
    if (engaged) return () => { entrance.cancelled = true; };
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
    if (instant) complete();
    else frame.postRender(observe, true);
    return () => { entrance.cancelled = true; entrance.complete = undefined; cancelFrame(observe); };
  }, [open, ready, instant, engaged, entrance]);
  const reveal = ready && (instant || engaged || settled);
  const paintClass = cn("pointer-events-none absolute inset-0 rounded-[inherit] border border-border bg-popover shadow-lg", surfaceClassName);
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
    <div data-slot="morphing-popover-shared-paint" aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ opacity: engaged ? 0 : 1 }}>
      {ready && <motion.div ref={surface} data-slot={engaged ? "morphing-popover-shared-surface" : "morphing-popover-surface"} initial={false} layoutId={instant ? undefined : `${id}-surface`} transition={instant ? { duration: 0 } : transition ?? settle}
        onLayoutAnimationComplete={() => entrance.complete?.()} className={paintClass} />}
    </div>
    {ready && engaged && <div data-slot="morphing-popover-surface" aria-hidden className={paintClass} />}
    <div ref={foreground} className="relative" style={{ opacity: reveal ? 1 : 0, transition: instant || engaged ? "none" : "opacity .16s cubic-bezier(0.2,0,0,1)" }}
      onKeyDownCapture={engage} onPointerDownCapture={engage} onClickCapture={engage} onPasteCapture={engage} onCompositionStartCapture={engage} onSubmitCapture={engage}>{children}</div>
  </Primitive.Content></Primitive.Portal>;
}

export function MorphingPopoverClose({ children, className }: Part) {
  return <Primitive.Close className={cn("min-h-11 rounded-md px-3 py-2 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring", className)}>{children ?? "Close"}</Primitive.Close>;
}
