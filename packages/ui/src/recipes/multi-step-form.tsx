/** Adapted from xevrion/ui-lab (846633609287fada19a1585dad1d4d4673eb76fe).
 * https://github.com/xevrion/ui-lab/blob/846633609287fada19a1585dad1d4d4673eb76fe/src/lab/components/multi-step-form.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: semantic tokens, framework-independent imports, and isolated demos.
 */
"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { AnimatePresence, animate, motion, useMotionValue, type Variants, } from "motion/react";

import { useReducedMotion } from "../lib/use-reduced-motion";

import { cn } from "../lib/utils";

export type Plan = {
    id: string;
    name: string;
    note: string;
    price: string;
};

type Panel = 0 | 1 | 2 | "done";

const STEPS = ["Name", "Plan", "Review"] as const;

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// No bounce: a card edge that overshoots reads as the layout being unsure.
const HEIGHT = { type: "spring", duration: 0.3, bounce: 0 } as const;

// Far enough to read as direction, short enough to stay a nudge, not a pan.
const SHIFT = 36;

const ICON_SWAP = { type: "spring", duration: 0.3, bounce: 0 } as const;

// The old step leaves faster and travels less than the new one arrives, so
// the eye goes straight to what is coming in.
const slide: Variants = {
    enter: (d: number) => ({ x: d * SHIFT, opacity: 0, filter: "blur(4px)" }),
    center: {
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration: 0.3, ease: EASE_OUT },
    },
    exit: (d: number) => ({
        x: d * -SHIFT * 0.7,
        opacity: 0,
        filter: "blur(4px)",
        transition: { duration: 0.15, ease: EASE_OUT },
    }),
};

// Reduced motion keeps the cross-fade and drops the travel and blur.
const fade: Variants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } },
    exit: { opacity: 0, transition: { duration: 0.12, ease: EASE_OUT } },
};


export function MultiStepForm({ plans, onCreate, onComplete, completeLabel = "Open workspace", anchor = "end", className, }: {
    plans: Plan[];
    onCreate: (value: {
        name: string;
        plan: string;
    }) => void | Promise<void>;
    /** Continue into the created workspace; omitted examples can still start over. */
    onComplete?: (value: { name: string; plan: string }) => void;
    completeLabel?: string;
    /** Start keeps embedded forms beside their introduction; end anchors the actions in isolated demos. */
    anchor?: "start" | "end";
    className?: string;
}) {
    const reduceMotion = useReducedMotion();
    const uid = useId();
    const [panel, setPanel] = useState<Panel>(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const errorRef = useRef<HTMLParagraphElement>(null);
    useEffect(() => { if (error) errorRef.current?.focus({ preventScroll: true }); }, [error]);
    const pending = useRef(false);
    const [name, setName] = useState("");
    const [planId, setPlanId] = useState<string | null>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const height = useMotionValue(0);
    const [measured, setMeasured] = useState(false);
    const hasMeasured = useRef(false);
    const hasMounted = useRef(false);
    const plan = plans.find((p) => p.id === planId);
    const valid = panel === 0 ? name.trim().length >= 2 : panel === 1 ? !!plan : true;
    // Measured rather than animated with `layout`, so the height is right even
    // when text wraps differently, and the content itself is never scaled.
    useLayoutEffect(() => {
        const el = innerRef.current;
        if (!el)
            return;
        const observer = new ResizeObserver(() => {
            const next = el.offsetHeight;
            if (!hasMeasured.current || reduceMotion) {
                height.jump(next);
                hasMeasured.current = true;
                setMeasured(true);
            }
            else {
                animate(height, next, HEIGHT);
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [height, reduceMotion]);
    // Move focus into the new step so keyboard and screen reader users land
    // where the change happened. Skipped on mount so a page load never steals
    // focus.
    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }
        bodyRef.current
            ?.querySelector<HTMLElement>(`[data-panel="${panel}"] [data-autofocus]`)
            ?.focus({ preventScroll: true });
    }, [panel]);
    const go = (next: Panel, dir: 1 | -1) => {
        setDirection(dir);
        setPanel(next);
    };
    const advance = async () => {
        if (pending.current || !valid)
            return;
        if (panel === 0)
            go(1, 1);
        else if (panel === 1)
            go(2, 1);
        else if (panel === 2) {
            if (!planId) return;
            pending.current = true;
            setBusy(true);
            setError(null);
            try {
                await onCreate({ name: name.trim(), plan: planId });
                go("done", 1);
            } catch {
                setError("Could not create the workspace. Your choices are retained; try again.");
            } finally {
                pending.current = false;
                setBusy(false);
            }
        }
        else {
            if (onComplete && planId) { onComplete({ name: name.trim(), plan: planId }); return; }
            setName("");
            setPlanId(null);
            go(0, -1);
        }
    };
    const back = () => {
        if (pending.current) return;
        setError(null);
        if (panel === 1)
            go(0, -1);
        else if (panel === 2)
            go(1, -1);
    };
    const stepIndex = panel === "done" ? 3 : panel;
    const doneLabel = onComplete ? completeLabel : "Start over";
    const primary = panel === 2 ? "Create" : panel === "done" ? doneLabel : "Continue";
    const content = (p: Panel, prefix: string) => (<PanelContent panel={p} prefix={prefix} plans={plans} name={name} onNameChange={setName} planId={planId} onPlanChange={setPlanId} plan={plan} reduceMotion={reduceMotion}/>);
    return (
    // The card grows up from a fixed bottom, so Back and Continue never move
    // under the cursor. An invisible copy holding every step at once reserves
    // the tallest height, which keeps the outer box a constant size.
    <div className={cn("grid min-w-0 w-[420px] max-w-full grid-cols-1", className)}>
      <div aria-hidden inert className="invisible col-start-1 row-start-1 flex min-w-0 flex-col overflow-hidden">
        <Header stepIndex={stepIndex}/>
        <div className="grid min-w-0 grid-cols-1">
          {([0, 1, 2, "done"] as const).map((p) => (<div key={p} className="col-start-1 row-start-1 p-6">
              {content(p, `${uid}-ghost`)}
            </div>))}
        </div>
        <Footer canGoBack={false} valid={false} primary={busy ? "Creating…" : primary} completeLabel={doneLabel} onBack={() => { }}/>
      </div>

      <form noValidate aria-busy={busy} aria-label="Create a workspace" className={cn("col-start-1 row-start-1 flex min-w-0 flex-col overflow-hidden rounded-[20px] bg-surface shadow-md", anchor === "start" ? "self-start" : "self-end")} onSubmit={(e) => {
            e.preventDefault();
            advance();
        }} onKeyDown={(e) => {
            // Enter submits the step from any field, radios included, which
            // browsers disagree on. Buttons keep their own Enter behavior.
            if (e.key !== "Enter" || e.nativeEvent.isComposing)
                return;
            if ((e.target as HTMLElement).tagName === "BUTTON")
                return;
            e.preventDefault();
            advance();
        }}>
        <Header stepIndex={stepIndex}/>
        <motion.div ref={bodyRef} className="overflow-hidden" style={{ height: measured ? height : "auto" }}>
          <div ref={innerRef} className="relative">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div key={panel} data-panel={panel} custom={direction} variants={reduceMotion ? fade : slide} initial="enter" animate="center" exit="exit" className="p-6">
                {content(panel, uid)}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        {error && <p ref={errorRef} tabIndex={-1} role="alert" className="px-6 pb-3 text-sm text-destructive outline-none">{error}</p>}
        <Footer canGoBack={!busy && (panel === 1 || panel === 2)} valid={valid && !busy} primary={busy ? "Creating…" : primary} completeLabel={doneLabel} onBack={back}/>
        <span className="sr-only" aria-live="polite">
          {panel === "done"
            ? "Workspace created"
            : `Step ${panel + 1} of 3, ${STEPS[panel]}`}
        </span>
      </form>
    </div>);
}

function Header({ stepIndex }: {
    stepIndex: number;
}) {
    return (<div className="flex items-center justify-between gap-4 px-6 pt-6">
      <span className="text-sm text-muted-foreground tabular-nums">
        {stepIndex < 3 ? `Step ${stepIndex + 1} of 3` : "Complete"}
      </span>
      <div aria-hidden className="flex gap-1.5">
        {STEPS.map((step, i) => (<span key={step} className="h-1.5 w-8 overflow-hidden rounded-full bg-foreground/15">
            {/* Fills left to right when reached and drains right to left when
                you step back, so the bar always points the way you moved. */}
            <span className={cn("block h-full rounded-full bg-foreground transition-[scale] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none", i <= stepIndex
                ? "origin-left scale-x-100"
                : "origin-right scale-x-0")}/>
          </span>))}
      </div>
    </div>);
}

function Footer({ canGoBack, valid, primary, completeLabel, onBack, }: {
    canGoBack: boolean;
    valid: boolean;
    primary: string;
    completeLabel: string;
    onBack: () => void;
}) {
    return (<div className="flex items-center justify-between border-t border-border p-4">
      {/* Always rendered, so Continue keeps its place when Back is hidden. */}
      <button type="button" onClick={onBack} disabled={!canGoBack} className={cn("h-11 touch-manipulation rounded-full px-4 text-[15px] font-medium text-muted-foreground outline-hidden transition-[scale,opacity,color,background-color] duration-150 ease-out select-none hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-foreground motion-safe:active:scale-[0.96]", !canGoBack && "pointer-events-none opacity-0")}>
        Back
      </button>
      <button type="submit" disabled={!valid} className="h-11 touch-manipulation rounded-full bg-foreground px-5 text-[15px] font-medium text-background outline-hidden transition-[scale,opacity] duration-150 ease-out select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-foreground motion-safe:enabled:active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40">
        {/* Every label shares one grid cell, so the button holds the width of
            the longest and never resizes as the label changes. */}
        <span className="grid">
          {[...new Set(["Continue", "Create", "Creating…", completeLabel])].map((label) => (<span key={label} aria-hidden={label !== primary} className={cn("col-start-1 row-start-1 transition-[opacity,filter] duration-200 ease-out", label !== primary && "opacity-0 blur-[4px]")}>
              {label}
            </span>))}
        </span>
      </button>
    </div>);
}

function PanelContent({ panel, prefix, plans, name, onNameChange, planId, onPlanChange, plan, reduceMotion, }: {
    panel: Panel;
    prefix: string;
    plans: Plan[];
    name: string;
    onNameChange: (name: string) => void;
    planId: string | null;
    onPlanChange: (id: string) => void;
    plan: Plan | undefined;
    reduceMotion: boolean | null;
}) {
    if (panel === 0) {
        return (<div className="flex flex-col gap-4">
        <Heading title="Name your workspace" note="Use at least two characters. You can change this later." noteId={`${prefix}-name-hint`}/>
        <label htmlFor={`${prefix}-name`} className="sr-only">
          Workspace name
        </label>
        <input id={`${prefix}-name`} aria-describedby={`${prefix}-name-hint`} data-autofocus value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Acme Inc" minLength={2} maxLength={80} autoComplete="organization" className="h-11 min-w-0 w-full rounded-xl bg-background px-3.5 text-base md:text-[15px] [@media(pointer:coarse)]:text-base text-foreground shadow-md outline-hidden placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-foreground"/>
      </div>);
    }
    if (panel === 1) {
        return (<div className="flex flex-col gap-4">
        <Heading title="Choose a plan" note="Switch any time from settings."/>
        <div role="radiogroup" aria-label="Plan" className="flex flex-col gap-2">
          {plans.map((p, i) => {
                const checked = p.id === planId;
                return (<label key={p.id} className={cn("flex cursor-pointer items-center gap-3.5 rounded-xl bg-background px-4 py-3 shadow-md transition-[scale,box-shadow] duration-150 ease-out select-none motion-safe:active:scale-[0.98] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-foreground", checked && "shadow-[0_0_0_1.5px_var(--foreground)]")}>
                <input type="radio" name={`${prefix}-plan`} value={p.id} checked={checked} onChange={() => onPlanChange(p.id)} 
                // The checked option, or the first when none is, is where
                // arrow keys start from.
                data-autofocus={checked || (!planId && i === 0) ? "" : undefined} className="sr-only"/>
                <span aria-hidden className={cn("flex size-5 shrink-0 items-center justify-center rounded-full shadow-[inset_0_0_0_1.5px_var(--border)] transition-[box-shadow] duration-150 ease-out", checked && "shadow-[inset_0_0_0_1.5px_var(--foreground)]")}>
                  <span className={cn("size-2.5 rounded-full bg-foreground transition-[scale,opacity] duration-150 ease-out", checked ? "scale-100 opacity-100" : "scale-[0.25] opacity-0")}/>
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-medium text-foreground">{p.name}</span>
                  <span className="truncate text-sm text-muted-foreground">{p.note}</span>
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">{p.price}</span>
              </label>);
            })}
        </div>
      </div>);
    }
    if (panel === 2) {
        return (<div className="flex flex-col gap-4">
        <Heading title="Review" note="Check the details, then create." focusable/>
        <dl className="flex flex-col gap-2.5 rounded-xl bg-background px-4 py-3 text-[15px] shadow-md">
          <Row term="Name" value={name.trim() || "Untitled"}/>
          <Row term="Plan" value={plan?.name ?? "None"}/>
          <Row term="Billed" value={plan?.price ?? "Free"}/>
        </dl>
      </div>);
    }
    return (<div className="flex flex-col items-center gap-4 py-3 text-center">
      <motion.svg viewBox="0 0 16 16" className="size-6 text-foreground" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden initial={reduceMotion
            ? { opacity: 0 }
            : { scale: 0.25, opacity: 0, filter: "blur(4px)" }} animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }} 
    // One beat late, so the check lands after the panel has arrived.
    transition={{ ...ICON_SWAP, delay: 0.08 }}>
        <path d="m3.5 8.5 3 3 6-7"/>
      </motion.svg>
      <div className="flex w-full min-w-0 flex-col gap-1.5">
        <h3 tabIndex={-1} data-autofocus className="text-[20px] font-medium text-foreground outline-hidden">
          Workspace created
        </h3>
        {/* Truncated here and in the review, so a long name can never make
            the reserved height grow. */}
        <p className="truncate text-[15px] text-muted-foreground">
          {name.trim() || "Untitled"} is ready on {plan?.name ?? "Hobby"}.
        </p>
      </div>
    </div>);
}

function Heading({ title, note, noteId, focusable, }: {
    title: string;
    note: string;
    noteId?: string;
    focusable?: boolean;
}) {
    return (<div className="flex flex-col gap-1.5">
      <h3 tabIndex={focusable ? -1 : undefined} data-autofocus={focusable ? "" : undefined} className="text-[20px] font-medium text-foreground outline-hidden">
        {title}
      </h3>
      <p id={noteId} className="text-[15px] text-muted-foreground">{note}</p>
    </div>);
}

function Row({ term, value }: {
    term: string;
    value: string;
}) {
    return (<div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="min-w-0 truncate font-medium text-foreground">{value}</dd>
    </div>);
}
