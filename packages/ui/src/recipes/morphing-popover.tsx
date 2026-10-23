"use client";
/** Morphing surface adapted from ibelick/motion-primitives, MIT.
 * See THIRD_PARTY_NOTICES.md. Fleet retains Radix popover keyboard/focus behavior.
 */
import { createContext,useContext,useId,type ReactNode } from "react";
import { Popover as Primitive } from "radix-ui";
import { LayoutGroup,motion,type Transition } from "motion/react";
import { cn } from "../lib/utils";
import { useReducedMotion } from "../lib/use-reduced-motion";
const Context=createContext("");
type Part={children?:ReactNode;className?:string};
export function MorphingPopover({children,open,onOpenChange}:{children:ReactNode;open?:boolean;onOpenChange?:(open:boolean)=>void}) {
  const id=useId();return <Context.Provider value={id}><Primitive.Root open={open} onOpenChange={onOpenChange}><LayoutGroup id={id}>{children}</LayoutGroup></Primitive.Root></Context.Provider>;
}
export function MorphingPopoverTrigger({children,className}:Part) {
  const id=useContext(Context);return <Primitive.Trigger asChild><motion.button type="button" layoutId={`${id}-surface`} className={cn("rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring",className)}>{children}</motion.button></Primitive.Trigger>;
}
export function MorphingPopoverContent({children,className,side="bottom",align="start",transition}:{children:ReactNode;className?:string;side?:"top"|"bottom"|"left"|"right";align?:"start"|"center"|"end";transition?:Transition}) {
  const id=useContext(Context);const reduced=useReducedMotion();return <Primitive.Portal><Primitive.Content asChild side={side} align={align} sideOffset={8} collisionPadding={16}><motion.div layoutId={`${id}-surface`} transition={reduced?{duration:0}:transition??{type:"spring",duration:.25,bounce:0}} className={cn("z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-popover p-5 text-popover-foreground shadow-lg outline-none",className)}>{children}</motion.div></Primitive.Content></Primitive.Portal>;
}
export function MorphingPopoverClose({children,className}:Part) {return <Primitive.Close className={cn("rounded-md px-3 py-2 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring",className)}>{children??"Close"}</Primitive.Close>;}
