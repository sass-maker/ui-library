/** Adapted from ibelick/motion-primitives (120f64f6ca60348e251f929e9c81f11ccbe45eda).
 * https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/carousel.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: measured slide geometry, keyboard/touch navigation, semantic
 * tokens, inactive-slide focus isolation and live reduced-motion support.
 */
'use client';

import { Children, createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, type Transition } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motionTiming } from '../lib/motion';
import { useReducedMotion } from '../lib/use-reduced-motion';

export type CarouselContextType = {
  index: number;
  setIndex: (index: number) => void;
  itemsCount: number;
  setItemsCount: (count: number) => void;
  disableDrag: boolean;
};
type Geometry = { offsets: number[]; widths: number[]; travel: number; width: number; rtl: boolean; maxIndex: number };
type CarouselState = CarouselContextType & { geometry: Geometry; setGeometry: (geometry: Geometry) => void };
const emptyGeometry: Geometry = { offsets: [], widths: [], travel: 0, width: 0, rtl: false, maxIndex: 0 };
const CarouselContext = createContext<CarouselState | undefined>(undefined);
const SlideContext = createContext({ position: 0, count: 0, visible: true });
const bound = (value: number, max: number) => Math.max(0, Math.min(Number.isFinite(value) ? Math.trunc(value) : 0, max));

function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('useCarousel must be used within a Carousel');
  return context;
}

// Retained public type for existing consumers.
export type CarouselProviderProps = { children: ReactNode; initialIndex?: number; onIndexChange?: (index: number) => void; disableDrag?: boolean };
export type CarouselProps = CarouselProviderProps & { className?: string; index?: number; label?: string };
function Carousel({ children, className, initialIndex = 0, index: externalIndex, onIndexChange, disableDrag = false, label = 'Featured content' }: CarouselProps) {
  const [internalIndex, setInternalIndex] = useState(initialIndex);
  const [itemsCount, setItemsCount] = useState(0);
  const [geometry, setLayout] = useState(emptyGeometry);
  const geometryRef = useRef(emptyGeometry);
  const setGeometry = useCallback((next: Geometry) => {
    geometryRef.current = next;
    setLayout(next);
  }, []);
  const controlled = externalIndex !== undefined;
  const requested = controlled ? externalIndex : internalIndex;
  const index = bound(requested, geometry.maxIndex);
  const setIndex = (next: number) => {
    const target = bound(next, geometryRef.current.maxIndex);
    if (!controlled) setInternalIndex(target);
    if (target !== index) onIndexChange?.(target);
  };
  // Removing slides or widening the viewport must never strand the track past
  // its new end. Controlled values render safely before the owner updates.
  useEffect(() => {
    if (geometry.width && requested !== index) {
      if (!controlled) setInternalIndex(index);
      onIndexChange?.(index);
    }
  }, [requested, index, controlled, onIndexChange, geometry.width]);
  return <CarouselContext.Provider value={{ index, setIndex, itemsCount, setItemsCount, disableDrag, geometry, setGeometry }}>
    <div role="group" aria-roledescription="carousel" aria-label={label} data-slot="carousel" className={cn('group/hover relative min-w-0', className)}>
      {children}
      <span role="status" aria-atomic="true" className="sr-only">{itemsCount ? `Slide ${index + 1} of ${itemsCount}` : 'No slides'}</span>
    </div>
  </CarouselContext.Provider>;
}

export type CarouselNavigationProps = { className?: string; classNameButton?: string; alwaysShow?: boolean };
function CarouselNavigation({ className, classNameButton, alwaysShow = true }: CarouselNavigationProps) {
  const { index, setIndex, itemsCount, geometry } = useCarousel();
  const visibility = !alwaysShow && '[@media(hover:hover)_and_(pointer:fine)]:opacity-0 group-hover/hover:opacity-100 group-focus-within/hover:opacity-100';
  const button = cn('pointer-events-auto inline-flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm outline-none transition-opacity duration-150 hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none', visibility, classNameButton);
  return <div className={cn('pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-3', className)}>
    <button type="button" aria-label="Previous slide" className={button} disabled={!itemsCount || index === 0} onClick={() => setIndex(index - 1)}><ChevronLeft aria-hidden className="size-4 rtl:rotate-180" /></button>
    <button type="button" aria-label="Next slide" className={button} disabled={!itemsCount || index >= geometry.maxIndex} onClick={() => setIndex(index + 1)}><ChevronRight aria-hidden className="size-4 rtl:rotate-180" /></button>
  </div>;
}

export type CarouselIndicatorProps = { className?: string; classNameButton?: string };
function CarouselIndicator({ className, classNameButton }: CarouselIndicatorProps) {
  const { index, itemsCount, setIndex, geometry } = useCarousel();
  return <div role="group" aria-label="Choose a slide" className={cn('absolute inset-x-0 bottom-0 flex justify-center', className)}>
    {Array.from({ length: itemsCount ? geometry.maxIndex + 1 : 0 }, (_, position) => <button key={position} type="button" aria-label={`Go to slide ${position + 1}`} aria-current={index === position ? 'true' : undefined} onClick={() => setIndex(position)} className={cn('inline-flex size-11 touch-manipulation items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring', classNameButton)}>
      <span aria-hidden className={cn('block h-1.5 rounded-full transition-[background-color] duration-150 motion-reduce:transition-none', index === position ? 'w-6 bg-foreground' : 'w-1.5 bg-muted-foreground')} />
    </button>)}
  </div>;
}

export type CarouselContentProps = { children: ReactNode; className?: string; transition?: Transition };
function CarouselContent({ children, className, transition }: CarouselContentProps) {
  const { index, setIndex, setItemsCount, disableDrag, geometry, setGeometry } = useCarousel();
  const reduced = useReducedMotion();
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const items = Children.toArray(children);
  const count = items.length;
  const position = Math.min(geometry.offsets[index] ?? 0, geometry.travel);
  const measure = useCallback(() => {
    const container = viewport.current;
    const content = track.current;
    if (!container || !content) return;
    const slides = [...content.children] as HTMLElement[];
    const rtl = getComputedStyle(container).direction === 'rtl';
    const origin = slides[0]?.offsetLeft ?? 0;
    const offsets = slides.map(slide => (slide.offsetLeft - origin) * (rtl ? -1 : 1));
    const widths = slides.map(slide => slide.offsetWidth);
    const width = container.clientWidth;
    const travel = Math.max(0, ...offsets.map((offset, i) => offset + widths[i] - width));
    const end = offsets.findIndex(offset => offset >= travel - 1);
    const next = { offsets, widths, width, travel, rtl, maxIndex: Math.max(0, end < 0 ? slides.length - 1 : end) };
    setGeometry(next);
    setItemsCount(slides.length);
    return next;
  }, [setGeometry, setItemsCount]);
  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (viewport.current) observer.observe(viewport.current);
    if (track.current) for (const child of track.current.children) observer.observe(child);
    return () => observer.disconnect();
  }, [measure, count, className]);
  // Inert removes offscreen links and fields from keyboard and accessibility
  // navigation. External updates that hide focused content keep focus here.
  useLayoutEffect(() => {
    const inactive = track.current?.querySelectorAll('[inert]') ?? [];
    for (const slide of inactive) if (slide.contains(document.activeElement)) viewport.current?.focus({ preventScroll: true });
  }, [index, geometry]);
  return <div ref={viewport} role="group" data-slot="carousel-viewport" tabIndex={0} aria-label="Slides. Use Left and Right arrow keys to browse." className="overflow-hidden rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" onKeyDown={event => {
    if (event.target !== event.currentTarget || !count) return;
    // Input can arrive in the same frame as a resize, before ResizeObserver.
    // Resolve that command against the current layout, not yesterday's end.
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    const current = measure();
    if (!current) return;
    const direction = current.rtl ? -1 : 1;
    const target = event.key === 'ArrowRight' ? index + direction : event.key === 'ArrowLeft' ? index - direction : event.key === 'Home' ? 0 : current.maxIndex;
    if (target === undefined) return;
    event.preventDefault();
    setIndex(target);
  }}>
    <motion.div initial={false} animate={{ transform: `translateX(${(geometry.rtl ? 1 : -1) * position}px)` }} transition={reduced ? { duration: 0 } : transition ?? motionTiming.layout}>
      <motion.div ref={track} data-slot="carousel-track" drag={disableDrag || geometry.maxIndex === 0 ? false : 'x'} dragConstraints={{ left: 0, right: 0 }} dragElastic={reduced ? 0 : 1} dragMomentum={false} dragTransition={{ bounceStiffness: 500, bounceDamping: 45 }} style={{ x: dragX, touchAction: 'pan-y pinch-zoom' }} onDragStart={() => viewport.current?.focus({ preventScroll: true })} onDragEnd={(_, info) => {
        const distance = info.offset.x * (geometry.rtl ? -1 : 1);
        const velocity = info.velocity.x * (geometry.rtl ? -1 : 1);
        if (Math.abs(distance) > Math.min(60, geometry.width * 0.15) || (Math.abs(distance) > 8 && Math.abs(velocity) > 500)) setIndex(index + (distance < 0 ? 1 : -1));
      }} onDragStartCapture={event => event.preventDefault()} className={cn('relative flex items-stretch', !disableDrag && count > 1 && 'cursor-grab active:cursor-grabbing', className)}>
        {items.map((child, i) => {
          const start = geometry.offsets[i] ?? 0;
          const visible = geometry.width === 0 ? i === 0 : start >= position - 1 && start + geometry.widths[i] <= position + geometry.width + 1;
          return <SlideContext.Provider key={(child as { key?: string }).key ?? i} value={{ position: i, count, visible }}>{child}</SlideContext.Provider>;
        })}
      </motion.div>
    </motion.div>
  </div>;
}

export type CarouselItemProps = { children: ReactNode; className?: string; label?: string };
function CarouselItem({ children, className, label }: CarouselItemProps) {
  const { position, count, visible } = useContext(SlideContext);
  return <div role="group" aria-roledescription="slide" aria-label={label ?? `${position + 1} of ${count}`} aria-hidden={!visible || undefined} inert={!visible || undefined} data-slot="carousel-slide" className={cn('w-full min-w-0 shrink-0 grow-0 overflow-hidden', className)}>{children}</div>;
}

export { Carousel, CarouselContent, CarouselNavigation, CarouselIndicator, CarouselItem, useCarousel };
