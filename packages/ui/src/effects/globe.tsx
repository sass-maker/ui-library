"use client";
/** Adapted from magicuidesign/magicui, MIT. See THIRD_PARTY_NOTICES.md.
 * Fleet: current COBE API, offscreen/hidden pause, reduced motion, keyboard
 * rotation, resize cleanup, no implied real-world coverage, and WebGL fallback.
 */
import { useEffect,useRef,useState } from "react";
import createGlobe,{type COBEOptions} from "cobe";
import { cn } from "../lib/utils";
import { useReducedMotion } from "../lib/use-reduced-motion";
const DEFAULT:COBEOptions={width:600,height:600,devicePixelRatio:1.5,phi:0,theta:.3,dark:1,diffuse:.4,mapSamples:12000,mapBrightness:1.2,baseColor:[.4,.45,.6],markerColor:[.57,.65,1],glowColor:[.12,.12,.16],markers:[]};
export function Globe({className,config,label="Interactive globe. Use arrow keys to rotate.",autoRotate=true}:{className?:string;config?:Partial<COBEOptions>;label?:string;autoRotate?:boolean}) {
  const canvas=useRef<HTMLCanvasElement>(null);const rotate=useRef<(delta:number)=>void>(()=>{});const [failed,setFailed]=useState(false);const reduced=useReducedMotion();
  useEffect(()=>{
    const element=canvas.current;if(!element)return;
    let globe:ReturnType<typeof createGlobe>;
    let frame=0,visible=false,disposed=false,phi=config?.phi??0,previous=0;
    const width=()=>Math.max(1,element.clientWidth);
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    try {globe=createGlobe(element,{...DEFAULT,...config,devicePixelRatio:dpr,width:width()*dpr,height:width()*dpr});} catch {setFailed(true);return;}
    setFailed(false);
    const render=()=>{if(!disposed)globe.update({phi});};
    const tick=(time:number)=>{if(disposed||!visible||document.hidden||reduced||!autoRotate){frame=0;return;}if(previous)phi+=Math.min(time-previous,50)*.0003;previous=time;render();frame=requestAnimationFrame(tick);};
    const sync=()=>{if(frame)cancelAnimationFrame(frame);frame=0;previous=0;if(visible&&!document.hidden&&!reduced&&autoRotate)frame=requestAnimationFrame(tick);else render();};
    rotate.current=delta=>{phi+=delta;render();};
    const resize=new ResizeObserver(()=>globe.update({width:width()*dpr,height:width()*dpr}));resize.observe(element);
    const visibility=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;sync();});visibility.observe(element);
    document.addEventListener("visibilitychange",sync);
    return()=>{disposed=true;if(frame)cancelAnimationFrame(frame);rotate.current=()=>{};resize.disconnect();visibility.disconnect();document.removeEventListener("visibilitychange",sync);globe.destroy();};
  },[config,reduced,autoRotate]);
  return <div className={cn("relative mx-auto aspect-square w-full max-w-lg",className)}>
    <canvas ref={canvas} role="img" aria-label={label} aria-hidden={failed||undefined} tabIndex={failed?-1:0} className="size-full rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring" onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();rotate.current(event.key==="ArrowLeft"?-.12:.12);}}}/>
    {failed&&<p className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-muted-foreground">The 3D preview is unavailable in this browser.</p>}
  </div>;
}
