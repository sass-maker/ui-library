"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { VideoSource } from "../components/video";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";

export type MediaBackdropProps = {
  /** Decorative artwork. Put meaningful image descriptions in the foreground. */
  poster: string;
  sources?: VideoSource[];
  children: ReactNode;
  label: string;
  /** A product may opt in; motion and data-saving preferences still take priority. */
  autoPlay?: boolean;
  focalPoint?: string;
  className?: string;
  contentClassName?: string;
};

/** A readable foreground over original artwork, with optional silent background video. */
export function MediaBackdrop(props: MediaBackdropProps) {
  return <BackdropPlayback key={`${props.poster}\n${props.sources?.map(source => source.src).join("\n")}`} {...props} />;
}

function BackdropPlayback({ poster, sources = [], children, label, autoPlay = false, focalPoint = "50% 50%", className, contentClassName }: MediaBackdropProps) {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const autoAttempted = useRef(false);
  const failures = useRef(new Set<string>());
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [saveData, setSaveData] = useState(true);
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    const update = () => setSaveData(connection?.saveData === true);
    update();
    connection?.addEventListener("change", update);
    return () => connection?.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (!entry.isIntersecting) video.current?.pause();
    });
    observer.observe(element);
    const hidden = () => { if (document.hidden) video.current?.pause(); };
    document.addEventListener("visibilitychange", hidden);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", hidden); video.current?.pause(); };
  }, []);
  useEffect(() => {
    if (reduced || saveData) video.current?.pause();
  }, [reduced, saveData]);
  useEffect(() => {
    if (!autoPlay || !sources.length || autoAttempted.current || !visible || reduced || saveData || document.hidden) return;
    autoAttempted.current = true;
    setActivated(true);
  }, [autoPlay, sources.length, visible, reduced, saveData]);
  useEffect(() => {
    if (!activated) return;
    const element = video.current;
    if (!element) return;
    element.load();
    void element.play().catch(() => { /* Keep the poster and a usable play control. */ });
  }, [activated, attempt]);

  const toggle = () => {
    autoAttempted.current = true;
    if (playing) { video.current?.pause(); return; }
    failures.current.clear();
    setFailed(false);
    if (!activated) setActivated(true);
    else if (failed) setAttempt(value => value + 1);
    else void video.current?.play().catch(() => {});
  };
  return <section ref={root} data-mode="dark" aria-label={label} data-media-backdrop={failed ? "error" : playing ? "playing" : "still"}
    className={cn("relative isolate flex min-h-[30rem] flex-col justify-end overflow-hidden rounded-2xl bg-neutral-950 text-white [--foreground:white] [--muted-foreground:rgb(255_255_255/0.85)] [--accent-ink:white]", className)}>
    <img src={poster} alt="" aria-hidden fetchPriority="high" className="absolute inset-0 size-full object-cover" style={{ objectPosition: focalPoint }} />
    {sources.length > 0 && <video key={attempt} ref={video} aria-hidden tabIndex={-1} muted loop playsInline preload="none" poster={poster}
      className={cn("pointer-events-none absolute inset-0 size-full object-cover", !reduced && "transition-opacity duration-300", playing && !failed ? "opacity-100" : "opacity-0")}
      style={{ objectPosition: focalPoint }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false); }}>
      {activated && sources.map(source => <source key={source.src} {...source} onError={() => { failures.current.add(source.src); if (failures.current.size === sources.length) { setFailed(true); setPlaying(false); } }} />)}
    </video>}
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/10" />
    <div className={cn("relative p-6 sm:p-10 lg:p-14", contentClassName)}>{children}</div>
    {sources.length > 0 && <div className="relative flex flex-wrap items-center gap-3 px-6 pb-6 sm:px-10 sm:pb-8 lg:px-14">
      <button type="button" onClick={toggle} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/35 bg-black/55 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm outline-none transition-colors hover:bg-black/75 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950">
        {failed ? <RotateCcw aria-hidden className="size-3.5" /> : playing ? <Pause aria-hidden className="size-3.5" /> : <Play aria-hidden className="size-3.5" />}
        {failed ? "Retry background video" : playing ? "Pause background video" : "Play background video"}
      </button>
      {failed && <p role="status" className="text-xs text-white">Video unavailable. The artwork stays visible.</p>}
    </div>}
  </section>;
}
