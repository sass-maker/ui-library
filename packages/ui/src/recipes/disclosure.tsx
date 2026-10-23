"use client";
/** Adapted from motion-primitives (MIT). Radix owns keyboard and controlled state.
 * Original notice: THIRD_PARTY_NOTICES.md; pinned source: packages/ui/upstream.json.
 */
import { Collapsible } from "radix-ui";
import { motion, MotionConfig, type Transition, type Variant } from "motion/react";
import { type ReactNode, type ComponentProps } from "react";
import { useReducedMotion } from "../lib/use-reduced-motion";
export type DisclosureProps = ComponentProps<typeof Collapsible.Root> & { transition?: Transition; variants?: {expanded:Variant;collapsed:Variant} };
export function Disclosure({transition,variants,children,...props}:DisclosureProps) {
 const reduced=useReducedMotion();
 return <MotionConfig reducedMotion={reduced?"always":"user"} transition={reduced?{duration:0}:transition??{duration:.2}}><Collapsible.Root {...props}>{children}</Collapsible.Root></MotionConfig>;
}
export function DisclosureTrigger({children,className}:{children:ReactNode;className?:string}) {return <Collapsible.Trigger asChild className={className}>{children}</Collapsible.Trigger>;}
export function DisclosureContent({children,className}:{children:ReactNode;className?:string}) {return <Collapsible.Content className={className}><motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}>{children}</motion.div></Collapsible.Content>;}
