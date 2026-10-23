"use client";
/** Expanding toolbar adapted from ibelick/motion-primitives, MIT.
 * See THIRD_PARTY_NOTICES.md. Fleet adds an application callback, responsive width,
 * semantic tokens, Escape cancellation, and focus return.
 */
import { useEffect,useRef,useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft,Search } from "lucide-react";
import { Button } from "../components/button";
import { cn } from "../lib/utils";
import { useReducedMotion } from "../lib/use-reduced-motion";
import useClickOutside from "../lib/use-click-outside";
export default function ToolbarDynamic({onSearch,label="Search components",className}:{onSearch:(query:string)=>void;label?:string;className?:string}) {
  const [open,setOpen]=useState(false);const [query,setQuery]=useState("");const root=useRef<HTMLDivElement>(null);const input=useRef<HTMLInputElement>(null);const trigger=useRef<HTMLButtonElement>(null);const reduced=useReducedMotion();
  useClickOutside(root,()=>setOpen(false));
  useEffect(()=>{if(open)input.current?.focus();},[open]);
  const close=()=>{setOpen(false);trigger.current?.focus();};
  return <motion.div ref={root} layout transition={reduced?{duration:0}:{type:"spring",duration:.25,bounce:0}} className={cn("inline-flex max-w-full items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm",className)} onKeyDown={event=>{if(event.key==="Escape"&&open){event.preventDefault();close();}}}>
    <Button ref={trigger} size="icon" variant="ghost" aria-label={open?"Close search":label} aria-expanded={open} onClick={()=>open?close():setOpen(true)}>{open?<ArrowLeft/>:<Search/>}</Button>
    {open&&<form className="flex min-w-0 flex-1 gap-2" onSubmit={event=>{event.preventDefault();if(query.trim())onSearch(query.trim());}}><input ref={input} value={query} onChange={event=>setQuery(event.currentTarget.value)} type="search" aria-label={label} placeholder={label} className="h-9 min-w-0 w-[min(15rem,45vw)] rounded-md bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"/><Button type="submit" size="sm" disabled={!query.trim()}>Search</Button></form>}
  </motion.div>;
}
