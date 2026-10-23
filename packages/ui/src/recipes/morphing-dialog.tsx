"use client";
/** Shared-layout pattern adapted from ibelick/motion-primitives, MIT.
 * See THIRD_PARTY_NOTICES.md. Fleet uses Radix for modal focus and dismissal.
 */
import { createContext, useContext, useId, useState, type ComponentProps, type ReactNode } from "react";
import { Dialog as Primitive } from "radix-ui";
import { LayoutGroup, MotionConfig, motion, type Transition } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";
import { useReducedMotion } from "../lib/use-reduced-motion";

const Context=createContext<{id:string;inside:boolean}>({id:"",inside:false});
type Part={children?:ReactNode;className?:string};
export function MorphingDialog({children,transition,open:controlled,defaultOpen=false,onOpenChange}:{children:ReactNode;transition?:Transition;open?:boolean;defaultOpen?:boolean;onOpenChange?:(open:boolean)=>void}) {
  const id=useId(); const [local,setLocal]=useState(defaultOpen); const reduced=useReducedMotion();
  return <Context.Provider value={{id,inside:false}}><Primitive.Root open={controlled??local} onOpenChange={next=>{setLocal(next);onOpenChange?.(next);}}>
    <LayoutGroup id={id}><MotionConfig transition={reduced?{duration:0}:transition??{type:"spring",duration:.3,bounce:0}}>{children}</MotionConfig></LayoutGroup>
  </Primitive.Root></Context.Provider>;
}
export function MorphingDialogTrigger({children,className,style}:Part & {style?:React.CSSProperties}) {
  const {id}=useContext(Context);
  return <Primitive.Trigger asChild><motion.button type="button" layoutId={`${id}-surface`} style={style} className={cn("inline-flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring",className)}>{children}</motion.button></Primitive.Trigger>;
}
export function MorphingDialogContainer({children}:Part) {
  return <Primitive.Portal><Primitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"/>{children}</Primitive.Portal>;
}
export function MorphingDialogContent({children,className}:Part) {
  const context=useContext(Context);
  return <Primitive.Content asChild><motion.div layoutId={`${context.id}-surface`} className={cn("fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl outline-none",className)}><Context.Provider value={{...context,inside:true}}>{children}</Context.Provider></motion.div></Primitive.Content>;
}
export function MorphingDialogTitle({children,className}:Part) {
  const {id,inside}=useContext(Context);
  const content=<motion.span layoutId={`${id}-title`} className={cn("block text-lg font-semibold",className)}>{children}</motion.span>;
  return inside?<Primitive.Title asChild><motion.h2 layoutId={`${id}-title`} className={cn("block text-lg font-semibold",className)}>{children}</motion.h2></Primitive.Title>:content;
}
export function MorphingDialogSubtitle({children,className}:Part) { return <span className={cn("block text-sm text-muted-foreground",className)}>{children}</span>; }
export function MorphingDialogDescription({children,className}:Part) { return <Primitive.Description className={cn("mt-3 text-sm leading-relaxed text-muted-foreground",className)}>{children}</Primitive.Description>; }
export function MorphingDialogImage({alt,className,...props}:ComponentProps<"img">) {
  const {id}=useContext(Context); return <motion.img layoutId={`${id}-image`} alt={alt??""} className={cn("w-full object-cover",className)} src={props.src} width={props.width} height={props.height}/>;
}
export function MorphingDialogClose({children,className}:Part) {return <Primitive.Close className={cn("absolute top-3 right-3 grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring",className)}>{children??<><X aria-hidden className="size-4"/><span className="sr-only">Close dialog</span></>}</Primitive.Close>;}
