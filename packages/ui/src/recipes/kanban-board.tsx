/** Adapted from xevrion/ui-lab (846633609287fada19a1585dad1d4d4673eb76fe).
 * https://github.com/xevrion/ui-lab/blob/846633609287fada19a1585dad1d4d4673eb76fe/src/lab/components/kanban-board.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: semantic tokens, framework-independent imports, and isolated demos.
 */
"use client";

import { GripVertical } from "lucide-react";

import { useEffect, useId, useLayoutEffect, useRef, useState, } from "react";

import { AnimatePresence, MotionConfig, animate, motion, motionValue, useMotionValue, useSpring, useTransform, useVelocity, type MotionValue, type Variants, } from "motion/react";

import { useReducedMotion } from "../lib/use-reduced-motion";

import { cn } from "../lib/utils";

export type KanbanCard = {
    id: string;
    title: string;
};

export type KanbanColumn = {
    id: string;
    title: string;
    cards: KanbanCard[];
};

const LIFT = { type: "spring", duration: 0.25, bounce: 0 } as const;

// Critically damped (damping = 2 * sqrt(stiffness)): a released card glides
// home carrying momentum toward its slot, without flinging past the board.
const HOME = { type: "spring", stiffness: 500, damping: 45 } as const;

// Enough to read as picked up without the card outgrowing its column.
const LIFT_SCALE = 1.03;

// Pointer speed (px/s) that reaches the full tilt, and that tilt in degrees.
const TILT_SPEED = 1000;

const TILT = 2;

// Movement before a press becomes a drag, so a click still just focuses.
const DRAG_SLOP = 4;

// Matches gap-2 between cards.
const GAP = 8;

// Layered and transparent, so it darkens whatever is below. The 1px ring
// keeps the lifted edge visible in dark mode, where shadows barely show.
const LIFTED_SHADOW = [
    "0 0 0 1px light-dark(oklch(0 0 0 / 0.06), oklch(1 0 0 / 0.08))",
    "0 2px 4px light-dark(oklch(0 0 0 / 0.06), oklch(0 0 0 / 0.4))",
    "0 12px 24px -6px light-dark(oklch(0 0 0 / 0.2), oklch(0 0 0 / 0.7))",
].join(", ");

type CardValues = {
    x: MotionValue<number>;
    y: MotionValue<number>;
    lift: MotionValue<number>;
    rotate: MotionValue<number>;
    z: MotionValue<number>;
};

type Held = {
    id: string;
    mode: "pointer" | "keyboard";
    before: KanbanColumn[];
};

type FloatingCard = {
    id: string;
    title: string;
    width: number;
    height: number;
    boardLeft: number;
    boardTop: number;
    phase: "pointer" | "settling" | "pressed";
    generation: number;
};

type Session = {
    id: string;
    pointerId: number;
    startX: number;
    startY: number;
    // Where on the card it was grabbed, so it stays pinned under the pointer.
    grabX: number;
    grabY: number;
    lastX: number;
    lastY: number;
    started: boolean;
    stop: () => void;
};

const makeValues = (): CardValues => ({
    x: motionValue(0),
    y: motionValue(0),
    lift: motionValue(0),
    rotate: motionValue(0),
    z: motionValue(0),
});

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

function locate(columns: KanbanColumn[], id: string) {
    const col = columns.findIndex((c) => c.cards.some((card) => card.id === id));
    const index = col < 0 ? -1 : columns[col].cards.findIndex((c) => c.id === id);
    return { col, index };
}

function moveCard(columns: KanbanColumn[], id: string, toCol: number, toIndex: number) {
    const { col, index } = locate(columns, id);
    const card = columns[col].cards[index];
    const next = columns.map((c) => ({
        ...c,
        cards: c.cards.filter((other) => other.id !== id),
    }));
    next[toCol].cards.splice(toIndex, 0, card);
    return next;
}

/**
 * Drag cards within and between columns, or from the keyboard: Space picks
 * the focused card up, arrows move it, Space drops it and Escape puts it
 * back. Without a card held, the arrows move focus between cards.
 */
export function KanbanBoard({ columns, onChange, label, className, wrapperClassName, }: {
    columns: KanbanColumn[];
    onChange: (columns: KanbanColumn[]) => void;
    label: string;
    className?: string;
    wrapperClassName?: string;
}) {
    const reduceMotion = !!useReducedMotion();
    const boardRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [overflow, setOverflow] = useState(false);
    const [scrollEdges, setScrollEdges] = useState({ left: false, right: false });
    useEffect(() => {
        const viewport = scrollRef.current;
        const board = boardRef.current;
        if (!viewport || !board) return;
        const measure = () => {
            setOverflow(viewport.scrollWidth > viewport.clientWidth + 1);
            const view = viewport.getBoundingClientRect();
            const content = board.getBoundingClientRect();
            const left = content.left < view.left - 1;
            const right = content.right > view.right + 1;
            setScrollEdges(current => current.left === left && current.right === right ? current : { left, right });
        };
        const observer = new ResizeObserver(measure);
        observer.observe(viewport);
        observer.observe(board);
        measure();
        viewport.addEventListener("scroll", measure, { passive: true });
        return () => { observer.disconnect(); viewport.removeEventListener("scroll", measure); };
    }, []);
    const slots = useRef(new Map<string, HTMLLIElement>());
    const buttons = useRef(new Map<string, HTMLButtonElement>());
    const lists = useRef<(HTMLUListElement | null)[]>([]);
    const session = useRef<Session | null>(null);
    const [held, setHeld] = useState<Held | null>(null);
    const [focusId, setFocusId] = useState(columns[0]?.cards[0]?.id ?? "");
    const [announcement, setAnnouncement] = useState("");
    const instructions = useId();
    const floating = useRef(new Map<string, FloatingCard>());
    const [floatingCards, setFloatingCards] = useState<FloatingCard[]>([]);
    // One set per card that outlives remounts, since a card moving between
    // columns is a new element in a new list.
    const [values] = useState(() => new Map(columns.flatMap((c) => c.cards).map((card) => [card.id, makeValues()])));
    const valuesFor = (id: string) => {
        let v = values.get(id);
        if (!v)
            values.set(id, (v = makeValues()));
        return v;
    };
    // Tilt follows the pointer's horizontal speed, smoothed so a jittery hand
    // doesn't wobble the card.
    const pointerX = useMotionValue(0);
    const tiltTarget = useTransform(useVelocity(pointerX), [-TILT_SPEED, TILT_SPEED], [-TILT, TILT]);
    const tilt = useSpring(tiltTarget, { stiffness: 400, damping: 30 });
    // Only for the release velocity.
    const pointerY = useMotionValue(0);
    const restoreFocus = useRef<string | null>(null);
    const release = useRef<{
        id: string;
        left: number;
        top: number;
        velocity: {
            x: number;
            y: number;
        };
    } | null>(null);
    // For window listeners and callbacks that outlive the render that made them.
    const latest = useRef({ columns, held, onChange });
    useLayoutEffect(() => {
        latest.current = { columns, held, onChange };
    });
    const title = (id: string, list = columns) => list.flatMap((c) => c.cards).find((c) => c.id === id)?.title ?? "";
    const where = (id: string, list = columns) => {
        const { col, index } = locate(list, id);
        return `${list[col].title}, position ${index + 1} of ${list[col].cards.length}`;
    };
    const lift = (id: string) => {
        const v = valuesFor(id);
        v.z.set(10);
        if (reduceMotion)
            v.lift.jump(1);
        else
            animate(v.lift, 1, LIFT);
    };
    // Slots never project/transform. All geometry is measured in viewport
    // coordinates; only the final overlay position is converted to board space.
    const geometry = (id: string) => {
        const board = boardRef.current;
        const slot = slots.current.get(id);
        if (!board || !slot) return null;
        return { board: board.getBoundingClientRect(), home: slot.getBoundingClientRect() };
    };
    const clearFloating = (id: string) => {
        floating.current.delete(id);
        setFloatingCards([...floating.current.values()]);
    };
    // Keep the overlay outside lane clips until it has reached its resting slot.
    const settle = (id: string, velocity = { x: 0, y: 0 }) => {
        const v = valuesFor(id);
        const f = floating.current.get(id);
        const g = geometry(id);
        const generation = f ? ++f.generation : 0;
        if (f) f.phase = "settling";
        const done = () => {
            if (f && (f.generation !== generation || f.phase !== "settling")) return;
            if (!f && (latest.current.held?.id === id || session.current?.id === id)) return;
            v.z.set(0);
            if (f) clearFloating(id);
        };
        const x = f && g ? g.home.left - g.board.left : 0;
        const y = f && g ? g.home.top - g.board.top : 0;
        if (reduceMotion) {
            v.x.jump(x);
            v.y.jump(y);
            v.rotate.jump(0);
            v.lift.jump(0);
            done();
            return;
        }
        // A fast release away from home can launch a spring beyond the board's
        // clipping viewport. Retain only toward-home momentum, bounded by the
        // remaining distance so the critically damped return stays monotonic.
        const homeVelocity = (position: number, target: number, requested: number) => {
            const distance = target - position;
            const direction = Math.sign(distance);
            return direction * Math.min(Math.max(0, requested * direction), Math.abs(distance) * Math.sqrt(HOME.stiffness));
        };
        Promise.all([
            animate(v.x, x, { ...HOME, velocity: homeVelocity(v.x.get(), x, velocity.x) }),
            animate(v.y, y, { ...HOME, velocity: homeVelocity(v.y.get(), y, velocity.y) }),
        ]).then(done);
        animate(v.rotate, 0, HOME);
        animate(v.lift, 0, LIFT);
    };
    // Keeps the dragged card under the pointer, inside the board, and moves
    // its slot to wherever its centre now sits.
    const follow = (moveSlot = true) => {
        const s = session.current;
        const board = boardRef.current;
        const slot = s && slots.current.get(s.id);
        if (!s?.started || !board || !slot)
            return;
        const g = geometry(s.id);
        const f = floating.current.get(s.id);
        const viewport = scrollRef.current?.getBoundingClientRect();
        if (!g || !f || !viewport) return;
        const { board: box } = g;
        const w = f.width;
        const h = f.height;
        const left = clamp(s.lastX - s.grabX,
            Math.max(box.left, viewport.left, 0) + 3,
            Math.min(box.right, viewport.right, window.innerWidth) - w - 3);
        const top = clamp(s.lastY - s.grabY, box.top + 3, box.bottom - h - 3);
        const v = valuesFor(s.id);
        v.x.jump(left - box.left);
        v.y.jump(top - box.top);
        f.boardLeft = box.left;
        f.boardTop = box.top;
        if (!moveSlot) return;
        const { columns: current } = latest.current;
        const centreX = left + w / 2;
        const centreY = top + h / 2;
        let toCol = 0;
        let best = Infinity;
        lists.current.forEach((list, i) => {
            if (!list)
                return;
            const r = list.getBoundingClientRect();
            const d = Math.abs(centreX - (r.left + r.width / 2));
            if (d < best)
                [best, toCol] = [d, i];
        });
        const list = lists.current[toCol];
        if (!list)
            return;
        const others = current[toCol].cards.filter((c) => c.id !== s.id).length;
        // Rounding switches slots once the card is halfway into the next one.
        const toIndex = clamp(Math.round((centreY - list.getBoundingClientRect().top - list.clientTop + list.scrollTop - h / 2) / (h + GAP)), 0, others);
        const from = locate(current, s.id);
        if (from.col === toCol && from.index === toIndex)
            return;
        latest.current.onChange(moveCard(current, s.id, toCol, toIndex));
    };
    // After the slot moves, re-pin the card to the pointer before paint.
    useLayoutEffect(() => {
        if (session.current?.started)
            follow(false);
        // A released card glides home from exactly where it was let go, even
        // when a cancel has just moved its slot back to where it started.
        const r = release.current;
        const board = boardRef.current;
        const slot = r && slots.current.get(r.id);
        if (r && board && slot) {
            release.current = null;
            const box = board.getBoundingClientRect();
            const v = valuesFor(r.id);
            v.x.jump(r.left - box.left);
            v.y.jump(r.top - box.top);
            settle(r.id, r.velocity);
        }
        // Focus rides along when a card moves to another list and remounts.
        const focusTarget = restoreFocus.current ?? held?.id;
        if (focusTarget) {
            const button = buttons.current.get(focusTarget);
            if (button && document.activeElement !== button) {
                button.focus({ preventScroll: true });
            }
            if (!session.current?.started) revealCard(focusTarget);
            restoreFocus.current = null;
        }
    });
    useEffect(() => () => session.current?.stop(), []);
    const endDrag = (cancelled: boolean) => {
        const s = session.current;
        if (!s)
            return;
        s.stop();
        session.current = null;
        if (!s.started) {
            if (floating.current.has(s.id)) settle(s.id);
            return;
        }
        const { columns: current, held: h } = latest.current;
        const slot = slots.current.get(s.id);
        const board = boardRef.current;
        if (slot && board) {
            const box = board.getBoundingClientRect();
            const v = valuesFor(s.id);
            release.current = {
                id: s.id,
                left: box.left + v.x.get(),
                top: box.top + v.y.get(),
                velocity: { x: pointerX.getVelocity(), y: pointerY.getVelocity() },
            };
        }
        restoreFocus.current = s.id;
        if (cancelled && h)
            latest.current.onChange(h.before);
        setHeld(null);
        const list = cancelled && h ? h.before : current;
        setAnnouncement(`${cancelled ? "Cancelled. Returned" : "Dropped"} ${title(s.id, list)} to ${where(s.id, list)}.`);
    };
    const onPointerDown = (id: string, event: React.PointerEvent) => {
        if (event.button !== 0 || session.current)
            return;
        // Keep touch panning native in both directions; a visible handle opts into dragging.
        if (event.pointerType === "touch" && !(event.target as Element).closest("[data-kanban-drag-handle], [data-kanban-overlay]"))
            return;
        if (held)
            drop();
        const returning = floating.current.get(id);
        if (returning) {
            returning.generation++;
            returning.phase = "pressed";
            valuesFor(id).x.stop();
            valuesFor(id).y.stop();
        }
        const onMove = (e: PointerEvent) => {
            const s = session.current;
            // Ignores a second finger, so switching fingers can't yank the card.
            if (!s || e.pointerId !== s.pointerId)
                return;
            s.lastX = e.clientX;
            s.lastY = e.clientY;
            if (!s.started) {
                if (Math.hypot(e.clientX - s.startX, e.clientY - s.startY) < DRAG_SLOP)
                    return;
                const slot = slots.current.get(id);
                const board = boardRef.current;
                if (!slot || !board)
                    return;
                const v = valuesFor(id);
                // Grabbing a card that is still settling picks it up from where it
                // visibly is, not from its slot.
                v.x.stop();
                v.y.stop();
                const g = geometry(id);
                if (!g) return;
                let f = floating.current.get(id);
                const left = f ? g.board.left + v.x.get() : g.home.left;
                const top = f ? g.board.top + v.y.get() : g.home.top;
                s.grabX = s.startX - left;
                s.grabY = s.startY - top;
                if (!f) {
                    f = { id, title: title(id, latest.current.columns), width: g.home.width, height: g.home.height,
                        boardLeft: g.board.left, boardTop: g.board.top, phase: "pointer", generation: 0 };
                    floating.current.set(id, f);
                    setFloatingCards([...floating.current.values()]);
                }
                f.phase = "pointer";
                f.generation++;
                s.started = true;
                pointerX.jump(e.clientX);
                pointerY.jump(e.clientY);
                if (!reduceMotion) {
                    const unsubscribe = tilt.on("change", (r) => v.rotate.set(r));
                    const stop = s.stop;
                    s.stop = () => {
                        stop();
                        unsubscribe();
                    };
                }
                setHeld({ id, mode: "pointer", before: latest.current.columns });
                lift(id);
                setAnnouncement(`Picked up ${title(id)}.`);
            }
            pointerX.set(e.clientX);
            pointerY.set(e.clientY);
            follow();
        };
        const onUp = (e: PointerEvent) => {
            if (e.pointerId === session.current?.pointerId)
                endDrag(false);
        };
        const onCancel = (e: PointerEvent) => {
            if (e.pointerId === session.current?.pointerId)
                endDrag(true);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && session.current?.started) {
                e.preventDefault();
                endDrag(true);
            }
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onCancel);
        window.addEventListener("keydown", onKey);
        session.current = {
            id,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            grabX: 0,
            grabY: 0,
            lastX: event.clientX,
            lastY: event.clientY,
            started: false,
            stop: () => {
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
                window.removeEventListener("pointercancel", onCancel);
                window.removeEventListener("keydown", onKey);
            },
        };
    };
    const pickUp = (id: string) => {
        if (floating.current.has(id)) {
            const v = valuesFor(id);
            v.x.stop();
            v.y.stop();
            floating.current.get(id)!.generation++;
            clearFloating(id);
        }
        setHeld({ id, mode: "keyboard", before: columns });
        lift(id);
        setAnnouncement(`Picked up ${title(id)}, ${where(id)}.`);
    };
    const drop = () => {
        const h = latest.current.held;
        if (!h)
            return;
        setHeld(null);
        settle(h.id);
        setAnnouncement(`Dropped ${title(h.id)} in ${where(h.id)}.`);
    };
    const cancel = () => {
        if (!held)
            return;
        restoreFocus.current = held.id;
        onChange(held.before);
        setHeld(null);
        settle(held.id);
        setAnnouncement(`Cancelled. ${title(held.id)} returned to ${where(held.id, held.before)}.`);
    };
    const onKeyDown = (id: string, event: React.KeyboardEvent) => {
        if (session.current?.started)
            return;
        const { col, index } = locate(columns, id);
        const isHeld = held?.id === id;
        // Moves focus to the nearest card in the next column that has any.
        const focusAcross = (step: number) => {
            for (let c = col + step; c >= 0 && c < columns.length; c += step) {
                const cards = columns[c].cards;
                if (!cards.length)
                    continue;
                buttons.current.get(cards[Math.min(index, cards.length - 1)].id)?.focus();
                return;
            }
        };
        const focusWithin = (step: number) => {
            const target = columns[col].cards[index + step];
            if (target)
                buttons.current.get(target.id)?.focus();
        };
        const move = (toCol: number, toIndex: number) => {
            if (toCol < 0 || toCol >= columns.length)
                return;
            const others = columns[toCol].cards.filter((c) => c.id !== id).length;
            const target = clamp(toIndex, 0, others);
            if (toCol === col && target === index)
                return;
            const next = moveCard(columns, id, toCol, target);
            onChange(next);
            setAnnouncement(`Moved to ${where(id, next)}.`);
        };
        const keys: Record<string, (() => void) | undefined> = {
            " ": () => (isHeld ? drop() : pickUp(id)),
            Enter: () => (isHeld ? drop() : pickUp(id)),
            Escape: isHeld ? cancel : undefined,
            ArrowUp: () => (isHeld ? move(col, index - 1) : focusWithin(-1)),
            ArrowDown: () => (isHeld ? move(col, index + 1) : focusWithin(1)),
            ArrowLeft: () => (isHeld ? move(col - 1, index) : focusAcross(-1)),
            ArrowRight: () => (isHeld ? move(col + 1, index) : focusAcross(1)),
        };
        const run = keys[event.key];
        if (!run)
            return;
        event.preventDefault();
        run();
    };
    // Tabbing or clicking away sets a keyboard-held card down where it is.
    // Checked a frame later, because a move between columns remounts the card
    // and blurs it until the layout effect refocuses it.
    const blurFrame = useRef(0);
    useEffect(() => () => cancelAnimationFrame(blurFrame.current), []);
    const onBlur = (id: string) => {
        cancelAnimationFrame(blurFrame.current);
        blurFrame.current = requestAnimationFrame(() => {
            const h = latest.current.held;
            if (h?.id !== id || h.mode !== "keyboard")
                return;
            if (document.activeElement === buttons.current.get(id))
                return;
            drop();
        });
    };
    const revealCard = (id: string) => {
        const viewport = scrollRef.current;
        const slot = slots.current.get(id);
        const list = slot?.parentElement;
        if (!viewport || !slot || !list || session.current?.started) return;
        const view = viewport.getBoundingClientRect();
        const bounds = slot.getBoundingClientRect();
        if (bounds.left < view.left + 8) viewport.scrollLeft += bounds.left - view.left - 8;
        else if (bounds.right > view.right - 8) viewport.scrollLeft += bounds.right - view.right + 8;
        const lane = list.getBoundingClientRect();
        if (bounds.top < lane.top) list.scrollTop += bounds.top - lane.top;
        else if (bounds.bottom > lane.bottom) list.scrollTop += bounds.bottom - lane.bottom;
    };
    const scrollWork = useRef(() => {});
    useLayoutEffect(() => {
        scrollWork.current = () => {
            if (session.current?.started) follow();
            for (const f of floating.current.values()) {
                if (f.phase !== "settling") continue;
                const g = geometry(f.id);
                if (!g) continue;
                const v = valuesFor(f.id);
                const velocity = { x: v.x.getVelocity(), y: v.y.getVelocity() };
                // Preserve the painted viewport position before retargeting the
                // new home after lane, horizontal-viewport or document scroll.
                v.x.jump(v.x.get() + f.boardLeft - g.board.left);
                v.y.jump(v.y.get() + f.boardTop - g.board.top);
                f.boardLeft = g.board.left;
                f.boardTop = g.board.top;
                settle(f.id, velocity);
            }
        };
    });
    useEffect(() => {
        let frame = 0;
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(() => {
                frame = 0;
                scrollWork.current();
            });
        };
        window.addEventListener("scroll", schedule, true);
        window.addEventListener("resize", schedule);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", schedule, true);
            window.removeEventListener("resize", schedule);
            for (const f of floating.current.values()) f.generation++;
            for (const v of values.values()) Object.values(v).forEach(value => value.stop());
        };
    }, [values]);
    // Controlled parents can remove work items while a drag is active (for
    // example, after a live update). Cancel that session without restoring the
    // stale pre-drag snapshot or leaving its visual copy above the board.
    useLayoutEffect(() => {
        const ids = new Set(columns.flatMap(column => column.cards.map(card => card.id)));
        const active = session.current;
        if (active && !ids.has(active.id)) {
            active.stop();
            session.current = null;
        }
        if (release.current && !ids.has(release.current.id)) release.current = null;
        let changed = false;
        for (const card of floating.current.values()) {
            if (ids.has(card.id)) continue;
            card.generation++;
            const v = values.get(card.id);
            if (v) Object.values(v).forEach(value => value.stop());
            floating.current.delete(card.id);
            values.delete(card.id);
            changed = true;
        }
        if (changed) setFloatingCards([...floating.current.values()]);
        if (held && !ids.has(held.id)) {
            const removedValues = values.get(held.id);
            if (removedValues) Object.values(removedValues).forEach(value => value.stop());
            values.delete(held.id);
            const removedTitle = title(held.id, held.before);
            setHeld(null);
            setAnnouncement(`${removedTitle} is no longer on this board.`);
            const next = columns.flatMap(column => column.cards)[0];
            if (next) {
                setFocusId(next.id);
                buttons.current.get(next.id)?.focus({ preventScroll: true });
            }
        }
    }, [columns]);
    const pointerDragging = held?.mode === "pointer";
    const tabStop = columns.some((c) => c.cards.some((card) => card.id === focusId))
        ? focusId
        : columns.flatMap((c) => c.cards)[0]?.id;
    return (<MotionConfig reducedMotion="user">
        <div className={cn("min-w-0 w-full max-w-full", wrapperClassName)}>
        {overflow && <p id={`${instructions}-scroll`} className="mb-3 text-xs leading-relaxed text-muted-foreground">Scroll horizontally to explore all lanes. Arrow keys move between tasks.</p>}
        <div ref={scrollRef} role="region" aria-label={`${label} lanes`} aria-describedby={overflow ? `${instructions}-scroll` : undefined} tabIndex={overflow ? 0 : -1} style={{ "--kanban-edge-mask": scrollEdges.left && scrollEdges.right ? "linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)" : scrollEdges.left ? "linear-gradient(to right, transparent, black 24px)" : scrollEdges.right ? "linear-gradient(to right, black calc(100% - 24px), transparent)" : "none" } as React.CSSProperties} className="overflow-x-auto overscroll-x-contain rounded-[18px] p-1 [mask-image:var(--kanban-edge-mask)] focus-visible:[mask-image:none] outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div ref={boardRef} role="group" aria-label={label} style={{ minWidth: "min-content", "--kanban-cols": `repeat(${Math.max(1, columns.length)}, minmax(var(--kanban-lane-min, 260px), 1fr))` } as React.CSSProperties} className={cn("relative mx-auto grid h-[380px] w-full grid-cols-[var(--kanban-cols)] gap-3", className, pointerDragging && "cursor-grabbing select-none [&_*]:cursor-grabbing")}>
          {columns.map((column, c) => (<div key={column.id} 
        // Concentric with the cards: 18 = 10 radius + 8 padding.
        className="flex min-h-0 min-w-0 flex-col rounded-[18px] bg-surface p-2">
              <div aria-hidden className="flex h-9 shrink-0 items-center justify-between px-2 text-sm font-medium text-muted-foreground">
                <span>{column.title}</span>
                <Count value={column.cards.length}/>
              </div>
              <ul ref={(node) => {
                lists.current[c] = node;
            }} aria-label={column.title} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto [overflow-anchor:none]">
                {column.cards.map((card) => (<Card key={card.id} card={card} floating={floating.current.has(card.id)} values={valuesFor(card.id)} held={held?.id === card.id ? held.mode : null} tabbable={card.id === tabStop} describedBy={instructions} slotRef={(node) => {
                    if (node)
                        slots.current.set(card.id, node);
                    else
                        slots.current.delete(card.id);
                }} buttonRef={(node) => {
                    if (node)
                        buttons.current.set(card.id, node);
                    else
                        buttons.current.delete(card.id);
                }} onPointerDown={(e) => onPointerDown(card.id, e)} onKeyDown={(e) => onKeyDown(card.id, e)} onFocus={() => {
                    setFocusId(card.id);
                    revealCard(card.id);
                }} onBlur={() => onBlur(card.id)}/>))}
              </ul>
            </div>))}
          {floatingCards.map(card => <FloatingCardView key={card.id} card={card} values={valuesFor(card.id)} onPointerDown={event => onPointerDown(card.id, event)} />)}
          <p id={instructions} className="sr-only">
            Use the drag handle on touch screens, or press Space to pick up. While holding, use the arrow keys to move
            within or between columns, Space to drop, or Escape to cancel.
          </p>
          <p className="sr-only" aria-live="assertive" aria-atomic>
            {announcement}
          </p>
        </div>
        </div>
        </div>
    </MotionConfig>);
}

function Card({ card, floating, values, held, tabbable, describedBy, slotRef, buttonRef, onPointerDown, onKeyDown, onFocus, onBlur, }: {
    card: KanbanCard;
    floating: boolean;
    values: CardValues;
    held: Held["mode"] | null;
    tabbable: boolean;
    describedBy: string;
    slotRef: (node: HTMLLIElement | null) => void;
    buttonRef: (node: HTMLButtonElement | null) => void;
    onPointerDown: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFocus: () => void;
    onBlur: () => void;
}) {
    const scale = useTransform(values.lift, [0, 1], [1, LIFT_SCALE]);
    // Stable semantic anchors never project across clipping lane boundaries.
    // Keyboard moves land immediately; pointer travel uses the board overlay.
    return (<li ref={slotRef} className={cn("h-16 shrink-0 rounded-[10px]",
        // The drop placeholder: the slot shows through once the card leaves it.
        held &&
            "bg-foreground/[0.03] outline-1 -outline-offset-1 outline-foreground/20 outline-dashed")}>
      <motion.button ref={buttonRef} type="button" tabIndex={tabbable ? 0 : -1} aria-describedby={describedBy} aria-pressed={held ? true : undefined} style={{
            opacity: floating ? 0 : 1,
            scale: floating ? 1 : scale,
        }} onPointerDown={onPointerDown} onKeyDown={onKeyDown} onFocus={onFocus} onBlur={onBlur} className={cn("relative flex size-full cursor-grab touch-manipulation items-center rounded-[10px] bg-background px-3 text-left text-sm text-foreground shadow-md outline-hidden select-none", "transition-[scale] duration-150 ease-out active:scale-[0.96] motion-reduce:transition-none", "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-1 focus-visible:outline-foreground",
        // Lifted already reads as pressed; don't shrink under the lift.
        held && "active:scale-100")}>
        <motion.span aria-hidden style={{ opacity: values.lift, boxShadow: LIFTED_SHADOW }} className="pointer-events-none absolute inset-0 rounded-[inherit]"/>
        <span className="relative min-w-0 flex-1 line-clamp-2 leading-snug">{card.title}</span>
        <span data-kanban-drag-handle aria-hidden="true" className="relative ml-1 flex size-11 shrink-0 touch-none items-center justify-center rounded-md text-muted-foreground/70"><GripVertical className="size-4" /></span>
      </motion.button>
    </li>);
}

function FloatingCardView({ card, values, onPointerDown }: {
    card: FloatingCard;
    values: CardValues;
    onPointerDown: (event: React.PointerEvent) => void;
}) {
    const scale = useTransform(values.lift, [0, 1], [1, LIFT_SCALE]);
    return <motion.div aria-hidden="true" data-kanban-overlay={card.id}
        onPointerDown={event => { event.preventDefault(); onPointerDown(event); }}
        style={{ width: card.width, height: card.height, x: values.x, y: values.y,
            scale, rotate: values.rotate, zIndex: values.z }}
        className="absolute top-0 left-0 flex cursor-grab touch-none items-center rounded-[10px] bg-background px-3 text-left text-sm text-foreground shadow-md select-none">
        <motion.span style={{ opacity: values.lift, boxShadow: LIFTED_SHADOW }} className="pointer-events-none absolute inset-0 rounded-[inherit]" />
        <span className="relative min-w-0 flex-1 line-clamp-2 leading-snug">{card.title}</span>
        <span data-kanban-drag-handle aria-hidden="true" className="relative ml-1 flex size-11 shrink-0 touch-none items-center justify-center rounded-md text-muted-foreground/70"><GripVertical className="size-4" /></span>
    </motion.div>;
}

// Rolls up when a column gains a card and down when it loses one.
const ROLL: Variants = {
    enter: (dir: number) => ({ y: dir * 8, opacity: 0, filter: "blur(2px)" }),
    center: {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] },
    },
    exit: (dir: number) => ({
        y: dir * -8,
        opacity: 0,
        filter: "blur(2px)",
        transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
    }),
};

function Count({ value }: {
    value: number;
}) {
    const [shown, setShown] = useState({ value, dir: 1 });
    // Direction is decided during render, so the new number enters from the
    // right side on the very render it appears.
    if (shown.value !== value) {
        setShown({ value, dir: value > shown.value ? 1 : -1 });
    }
    return (<span className="relative inline-flex h-4 min-w-2 justify-end overflow-hidden text-xs tabular-nums">
      <AnimatePresence mode="popLayout" initial={false} custom={shown.dir}>
        <motion.span key={value} custom={shown.dir} variants={ROLL} initial="enter" animate="center" exit="exit" className="leading-4">
          {value}
        </motion.span>
      </AnimatePresence>
    </span>);
}
