"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "../lib/utils";
import { useReducedMotion } from "../lib/use-reduced-motion";

export type VideoSource = { src: string; type: string };
export type VideoProps = {
  title: string;
  poster: string;
  sources: VideoSource[];
  width?: number;
  height?: number;
  className?: string;
  /** Speech or meaningful sounds need captions and an adjacent transcript. */
  captions?: { src: string; language: string; label: string };
};

/** Deliberate playback: no movie request until play, native controls thereafter. */
export function Video(props: VideoProps) {
  return <VideoPlayback key={props.sources.map(source => `${source.type}:${source.src}`).join("\n")} {...props} />;
}

function VideoPlayback({ title, poster, sources, width = 1280, height = 800, className, captions }: VideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [activated, setActivated] = useState(false);
  const [failed, setFailed] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const failedSources = useRef(new Set<string>());
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) video.pause(); });
    observer.observe(video);
    const hidden = () => { if (document.hidden) video.pause(); };
    document.addEventListener("visibilitychange", hidden);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", hidden); video.pause(); };
  }, [attempt]);
  useEffect(() => { if (reduced) ref.current?.pause(); }, [reduced]);
  useEffect(() => { if (failed && document.activeElement === ref.current) trigger.current?.focus({ preventScroll: true }); }, [failed]);
  useEffect(() => {
    if (!activated) return;
    const video = ref.current;
    if (!video) return;
    video.focus({ preventScroll: true });
    video.load();
    // A browser may reject programmatic playback; native controls remain usable.
    void video.play().catch(() => {});
  }, [activated, attempt]);

  return <div className={cn("relative isolate overflow-hidden rounded-xl border border-border bg-muted", className)} style={{ aspectRatio: `${width} / ${height}` }} data-video-state={failed ? "error" : buffering ? "loading" : activated ? "active" : "poster"}>
    <video key={attempt} ref={ref} aria-label={title} aria-hidden={!activated} poster={poster} width={width} height={height} controls={activated && !failed} preload="none" playsInline muted tabIndex={activated && !failed ? 0 : -1}
      className="block size-full object-contain" onError={() => setFailed(true)} onWaiting={() => setBuffering(true)} onCanPlay={() => setBuffering(false)} onPlaying={() => setBuffering(false)} onPause={() => setBuffering(false)}>
      {activated && sources.map(source => <source key={source.src} {...source} onError={() => { failedSources.current.add(source.src); if (failedSources.current.size === sources.length) setFailed(true); }} />)}
      {activated && captions && <track kind="captions" src={captions.src} srcLang={captions.language} label={captions.label} default />}
    </video>
    {buffering && !failed && <span role="status" className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/75 px-3 py-1.5 text-xs text-white">Loading video…</span>}
    {(!activated || failed) && <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/65 via-transparent to-transparent p-5 sm:p-7">
      <button ref={trigger} type="button" onClick={() => { failedSources.current.clear(); setFailed(false); setBuffering(true); setActivated(true); if (activated) setAttempt(value => value + 1); }}
        className="inline-flex min-h-11 touch-manipulation select-none items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950 outline-none active:bg-neutral-200 focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        {failed ? <RotateCcw aria-hidden className="size-4" /> : <Play aria-hidden className="size-4 fill-current" />}{failed ? `Retry ${title}` : `Play ${title}`}
      </button>
      {failed && <span role="status" className="ml-4 max-w-48 text-sm text-white">The video couldn’t load. Try again.</span>}
    </div>}
  </div>;
}
