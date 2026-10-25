"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { VideoSource } from "../components/video";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";

export type MediaBackdropProps = {
  /** Decorative artwork. Put meaningful image descriptions in the foreground. */
  poster: string;
  sources?: VideoSource[];
  /** Cover crops behind the copy; stacked keeps the complete artwork above it. */
  layout?: "cover" | "stacked";
  /** Actual image dimensions reserve the stacked artwork before it loads. */
  posterSize?: { width: number; height: number };
  children: ReactNode;
  label: string;
  /** A product may opt in; motion and data-saving preferences still take priority. */
  autoPlay?: boolean;
  focalPoint?: string;
  className?: string;
  contentClassName?: string;
};

const layoutStyles: Record<NonNullable<MediaBackdropProps["layout"]>, {
  root: string; poster: string; video: string; gradient: string; content: string; controls: string;
}> = {
  cover: {
    root: "flex min-h-[30rem] flex-col justify-end",
    poster: "absolute inset-0 size-full object-cover",
    video: "absolute inset-0 size-full object-cover",
    gradient: "absolute inset-0",
    content: "relative",
    controls: "relative",
  },
  stacked: {
    root: "grid min-h-0 grid-cols-1 grid-rows-[auto_auto]",
    poster: "relative col-start-1 col-end-2 row-start-1 row-end-2 block h-auto w-full object-contain",
    video: "absolute inset-0 col-start-1 col-end-2 row-start-1 row-end-2 size-full object-contain",
    gradient: "hidden",
    content: "relative col-start-1 col-end-2 row-start-2 row-end-3",
    controls: "absolute inset-x-0 bottom-0 col-start-1 col-end-2 row-start-1 row-end-2",
  },
};

/** Original artwork and optional silent video, behind or above a readable foreground. */
export function MediaBackdrop(props: MediaBackdropProps) {
  return <BackdropPlayback key={`${props.poster}\n${props.sources?.map(source => source.src).join("\n")}`} {...props} />;
}

function BackdropPlayback({ poster, posterSize, layout = "cover", sources = [], children, label, autoPlay = false, focalPoint = "50% 50%", className, contentClassName }: MediaBackdropProps) {
  const artwork = useRef<HTMLImageElement>(null);
  const styles = layoutStyles[layout];
  const video = useRef<HTMLVideoElement>(null);
  const visibilityObserver = useRef<IntersectionObserver | null>(null);
  const playIntent = useRef(false);
  const autoAttempted = useRef(false);
  const failures = useRef(new Set<string>());
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [saveData, setSaveData] = useState(true);
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const stopPlayback = useCallback(() => {
    playIntent.current = false;
    video.current?.pause();
    setPlaying(false);
  }, []);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    const update = () => setSaveData(connection?.saveData === true);
    update();
    connection?.addEventListener("change", update);
    return () => connection?.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const element = artwork.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => {
      const entry = entries.at(-1);
      if (!entry) return;
      setVisible(entry.isIntersecting);
      if (!entry.isIntersecting) stopPlayback();
    });
    visibilityObserver.current = observer;
    observer.observe(element);
    const hidden = () => { if (document.hidden) stopPlayback(); };
    document.addEventListener("visibilitychange", hidden);
    return () => { observer.disconnect(); visibilityObserver.current = null; playIntent.current = false; document.removeEventListener("visibilitychange", hidden); video.current?.pause(); };
  }, [stopPlayback]);
  useEffect(() => {
    if (reduced || saveData) stopPlayback();
  }, [reduced, saveData, stopPlayback]);
  useEffect(() => {
    if (!autoPlay || !sources.length || autoAttempted.current || !visible || reduced || saveData || document.hidden) return;
    autoAttempted.current = true;
    playIntent.current = true;
    setActivated(true);
  }, [autoPlay, sources.length, visible, reduced, saveData]);
  useEffect(() => {
    if (!activated || !playIntent.current) return;
    const element = video.current;
    if (!element) return;
    element.load();
    void element.play().catch(() => { /* Keep the poster and a usable play control. */ });
  }, [activated, attempt]);

  const toggle = () => {
    autoAttempted.current = true;
    // Honor the rendered action while native media events are still queued.
    if (!failed && playing) { stopPlayback(); return; }
    const bounds = artwork.current?.getBoundingClientRect();
    if (document.hidden || !bounds || bounds.bottom <= 0 || bounds.top >= window.innerHeight || bounds.right <= 0 || bounds.left >= window.innerWidth) return;
    // Explicit play in view supersedes observations from the previous offscreen position.
    visibilityObserver.current?.takeRecords();
    playIntent.current = true;
    failures.current.clear();
    setFailed(false);
    if (!activated) setActivated(true);
    else if (failed) setAttempt(value => value + 1);
    else void video.current?.play().catch(() => {});
  };
  return <section data-mode="dark" aria-label={label} data-media-backdrop={failed ? "error" : playing ? "playing" : "still"}
    className={cn("relative isolate overflow-hidden rounded-2xl bg-neutral-950 text-white [--foreground:white] [--muted-foreground:rgb(255_255_255/0.85)] [--accent-ink:white]", styles.root, className)}>
    <img ref={artwork} src={poster} width={posterSize?.width} height={posterSize?.height} alt="" aria-hidden fetchPriority="high" className={styles.poster} style={{ objectPosition: focalPoint }} />
    {sources.length > 0 && <video key={attempt} ref={video} aria-hidden tabIndex={-1} muted loop playsInline preload="none" poster={poster}
      className={cn("pointer-events-none", styles.video, !reduced && "transition-opacity duration-300", playing && !failed ? "opacity-100" : "opacity-0")}
      style={{ objectPosition: focalPoint }} onPlay={event => {
        if (event.currentTarget !== video.current) return;
        if (!playIntent.current) { stopPlayback(); return; }
        setPlaying(!event.currentTarget.paused);
      }} onPause={event => {
        if (event.currentTarget !== video.current) return;
        if (event.currentTarget.paused) playIntent.current = false;
        setPlaying(!event.currentTarget.paused);
      }} onError={() => { setFailed(true); stopPlayback(); }}>
      {activated && sources.map(source => <source key={source.src} {...source} onError={() => { failures.current.add(source.src); if (failures.current.size === sources.length) { setFailed(true); stopPlayback(); } }} />)}
    </video>}
    <div aria-hidden className={cn("pointer-events-none bg-gradient-to-t from-black/90 via-black/65 to-black/10", styles.gradient)} />
    <div className={cn("p-6 sm:p-10 lg:p-14", styles.content, contentClassName)}>{children}</div>
    {sources.length > 0 && <div className={cn("flex flex-wrap items-center gap-3 px-6 pb-6 sm:px-10 sm:pb-8 lg:px-14", styles.controls)}>
      <button type="button" onClick={toggle} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/35 bg-black/55 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm outline-none transition-colors hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950">
        {failed ? <RotateCcw aria-hidden className="size-3.5" /> : playing ? <Pause aria-hidden className="size-3.5" /> : <Play aria-hidden className="size-3.5" />}
        {failed ? "Retry background video" : playing ? "Pause background video" : "Play background video"}
      </button>
      {failed && <p role="status" className="text-xs text-white">Video unavailable. The artwork stays visible.</p>}
    </div>}
  </section>;
}
