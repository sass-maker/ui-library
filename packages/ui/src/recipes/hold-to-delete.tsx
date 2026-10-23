/** Adapted from xevrion/ui-lab (846633609287fada19a1585dad1d4d4673eb76fe).
 * https://github.com/xevrion/ui-lab/blob/846633609287fada19a1585dad1d4d4673eb76fe/src/lab/components/hold-to-delete.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: semantic tokens, framework-independent imports, and isolated demos.
 */
"use client";
import {useEffect,useRef,useState,useId} from "react";
import {cn} from "../lib/utils";
import {useReducedMotion} from "../lib/use-reduced-motion";
type State="idle"|"holding"|"pending"|"done"|"error";
/** The hold uses elapsed time, never a CSS transition event. Reduced motion cannot shorten confirmation. */
export function HoldToDelete({onDelete,holdDuration=2000,disabled=false,className}:{onDelete:()=>void|Promise<void>;holdDuration?:number;disabled?:boolean;className?:string}) {
 const [state,setState]=useState<State>("idle");const active=useRef(false);const pending=useRef(false);const mounted=useRef(true);
 const timer=useRef<ReturnType<typeof setTimeout>>(undefined);const reset=useRef<ReturnType<typeof setTimeout>>(undefined);const id=useId();const reduced=useReducedMotion();
 const duration=Math.max(500,Number.isFinite(holdDuration)?holdDuration:2000);
 const cancel=()=>{if(active.current){active.current=false;clearTimeout(timer.current);setState("idle");}};
 useEffect(()=>{mounted.current=true;const hide=()=>{if(document.hidden)cancel();};document.addEventListener("visibilitychange",hide);return()=>{mounted.current=false;active.current=false;clearTimeout(timer.current);clearTimeout(reset.current);document.removeEventListener("visibilitychange",hide);};},[]);
 useEffect(()=>{if(disabled)cancel();},[disabled]);
 const press=()=>{
  if(disabled||active.current||pending.current||state==="done")return;
  active.current=true;clearTimeout(reset.current);setState("holding");
  timer.current=setTimeout(async()=>{
   if(!active.current||!mounted.current)return;
   active.current=false;pending.current=true;setState("pending");
   try{await onDelete();if(mounted.current){setState("done");reset.current=setTimeout(()=>setState("idle"),2000);}}
   catch{if(mounted.current)setState("error");}
   finally{pending.current=false;}
  },duration);
 };
 const label=state==="pending"?"Deleting…":state==="done"?"Deleted":state==="error"?"Hold to retry":"Hold to delete";
 return <div className="inline-flex flex-col items-start gap-2">
  <button type="button" disabled={disabled} aria-disabled={state==="pending"||state==="done"||undefined} aria-describedby={id} aria-busy={state==="pending"||undefined}
   onPointerDown={event=>{if(event.button===0)press();}} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel} onBlur={cancel} onContextMenu={event=>event.preventDefault()} onClick={event=>event.preventDefault()}
   onKeyDown={event=>{if((event.key===" "||event.key==="Enter")&&!event.repeat){event.preventDefault();press();}}} onKeyUp={event=>{if(event.key===" "||event.key==="Enter"){event.preventDefault();cancel();}}}
   className={cn("relative inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 overflow-hidden rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-50",className)}>
   <span aria-hidden className="pointer-events-none absolute inset-0 origin-left bg-destructive/20" style={{transform:state==="holding"||state==="pending"||state==="done"?"scaleX(1)":"scaleX(0)",transition:reduced?"none":`transform ${state==="holding"?duration:150}ms linear`}}/>
   <svg aria-hidden viewBox="0 0 16 16" className="relative size-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">{state==="done"?<path d="m3.5 8.5 3 3 6-7"/>:<><path d="M2.75 4.25h10.5M6.25 4.25v-1.5h3.5v1.5M4 4.25l.6 8.1a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-8.1M6.75 7v3.75M9.25 7v3.75"/></>}</svg>
   <span className="relative">{label}</span>
  </button>
  <span id={id} className="text-xs text-muted-foreground">Hold for {duration/1000} seconds. Release to cancel.</span>
  <span role="status" className="sr-only">{state==="error"?"Could not delete. Hold to retry.":state==="pending"?"Deleting":state==="done"?"Deleted":""}</span>
 </div>;
}
