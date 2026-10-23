/** Adapted from xevrion/ui-lab (846633609287fada19a1585dad1d4d4673eb76fe).
 * https://github.com/xevrion/ui-lab/blob/846633609287fada19a1585dad1d4d4673eb76fe/src/lab/components/autosave-status.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: semantic tokens, framework-independent imports, and isolated demos.
 */
"use client";

import { AnimatePresence, motion } from "motion/react";

import { useReducedMotion } from "../lib/use-reduced-motion";

import { cn } from "../lib/utils";

export type SaveState = "saved" | "unsaved" | "saving";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const MOVE = { type: "spring", duration: 0.4, bounce: 0.1 } as const;

const MINUTE = 60000;

const CSS = `
@keyframes as-pulse { 0%, 100% { opacity: .25 } 40% { opacity: 1 } }
`;

// Says how long ago, in the words a person would use, and only changes
// when those words would.
function savedLabel(savedAt: number | null, now: number) {
    if (savedAt === null)
        return "Saved";
    const ago = now - savedAt;
    if (ago < 45000)
        return "Saved just now";
    if (ago < 60 * MINUTE)
        return `Saved ${Math.max(1, Math.floor(ago / MINUTE))} min ago`;
    return `Saved at ${new Date(savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

// The icon is one set of three dots throughout: a single dot means there
// are changes, it splits into three that pulse while saving, and the three
// gather back into the middle as the check draws.
export function AutosaveStatus({ state, savedAt = null, now = 0, className, }: {
    state: SaveState;
    savedAt?: number | null;
    now?: number;
    className?: string;
}) {
    const reduceMotion = useReducedMotion();
    const label = state === "saving"
        ? "Saving"
        : state === "unsaved"
            ? "Unsaved changes"
            : savedLabel(savedAt, now);
    const move = reduceMotion ? { duration: 0 } : MOVE;
    return (<div className={cn(
        // A fixed width, as wide as the longest thing it says, so the icon
        // never shifts and old and new words cross in the same spot.
        "flex w-[8.75rem] shrink-0 items-center gap-2 text-[13px] whitespace-nowrap text-muted-foreground", className)}>
      <style>{CSS}</style>
      <span aria-hidden className="relative grid size-4 shrink-0 place-items-center">
        {[-5, 0, 5].map((x, i) => {
            const middle = i === 1;
            return (<motion.span key={i} className="absolute size-[4px]" initial={false} animate={state === "saving"
                    ? { x, opacity: 1, scale: 1 }
                    : state === "unsaved"
                        ? { x: 0, opacity: middle ? 1 : 0, scale: middle ? 1.5 : 1 }
                        : { x: 0, opacity: 0, scale: 0.5 }} transition={move}>
              <span className="block size-full rounded-full bg-current" style={{
                    animation: state === "saving" && !reduceMotion
                        ? `as-pulse 1s ease-in-out ${i * 0.16}s infinite`
                        : "none",
                }}/>
            </motion.span>);
        })}
        <svg viewBox="0 0 16 16" className="absolute size-4 text-foreground" fill="none">
          <motion.path d="M3.75 8.25l2.75 2.75 5.75-6" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" initial={false} animate={state === "saved"
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }} transition={reduceMotion
            ? { duration: 0 }
            : state === "saved"
                ? { duration: 0.35, delay: 0.12, ease: EASE_OUT }
                : { duration: 0.12 }}/>
        </svg>
      </span>
      <span className="relative flex min-w-0 flex-1">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={label} initial={{ opacity: 0, y: 3, filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -3, filter: "blur(3px)", transition: { duration: 0.12 } }} transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: EASE_OUT }}>
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="sr-only" aria-live="polite">
        {state === "saved" && savedAt !== null ? "All changes saved" : ""}
      </span>
    </div>);
}
