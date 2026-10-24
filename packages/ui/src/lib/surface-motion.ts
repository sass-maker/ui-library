/** Radix owns presence and focus. Shared classes keep its enter/exit contract
 * while giving every anchored surface the same fast, trigger-centred motion.
 * Timings mirror motionTiming.feedback/content; consumers can override in cn.
 */
const presence = "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-reduce:animate-none";
const feedback = "ease-[cubic-bezier(0.2,0,0,1)] data-[state=closed]:duration-100";

export const popupMotion = `${presence} ${feedback} data-[state=open]:duration-150 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95`;
export const modalMotion = `${presence} data-[state=open]:duration-220 data-[state=closed]:duration-140 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95`;
export const overlayMotion = `${presence} ${feedback} data-[state=open]:duration-220 data-[state=closed]:duration-140`;
export const drawerMotion = "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-260 data-[state=closed]:duration-180 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none";
export const instantSurface = "data-[state=open]:animate-none data-[state=closed]:animate-none";
