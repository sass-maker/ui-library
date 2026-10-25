"use client";
/** Interaction adapted from xevrion/ui-lab, MIT. See THIRD_PARTY_NOTICES.md.
 * Fleet: real async transport, validation, progress, cancellation/retry, and no fake uploads.
 */
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileText, RotateCcw, Upload, X } from "lucide-react";
import { Button } from "../components/button";
import { cn } from "../lib/utils";
import { useReducedMotion } from "../lib/use-reduced-motion";
import type { UploadHandler } from "./upload-types";

type Entry = { id: string; file: File; state: "selected" | "uploading" | "complete" | "error"; progress?: number };
export type FileDropzoneProps = {
  onFiles?: (files: File[]) => void;
  /** Omit for a file picker. Completion is shown only after this promise resolves. */
  onUpload?: UploadHandler;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
  label?: string;
  hint?: string;
  className?: string;
};
function accepts(file: File, accept?: string) {
  return !accept || accept.split(",").some(raw => {
    const rule = raw.trim().toLowerCase();
    if (!rule) return false;
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
  });
}
function size(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
}
export function FileDropzone({ onFiles, onUpload, accept, multiple = true, maxSize, disabled = false, label = "Drop files here or browse", hint, className }: FileDropzoneProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [over, setOver] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const jobs = useRef(new Map<string, AbortController>());
  const alive = useRef(true);
  const sequence = useRef(0);
  const id = useId();
  const reduced = useReducedMotion();
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; for (const controller of jobs.current.values()) controller.abort(); jobs.current.clear(); };
  }, []);
  const run = async (entry: Entry) => {
    if (!onUpload || disabled) return;
    jobs.current.get(entry.id)?.abort();
    const controller = new AbortController();
    jobs.current.set(entry.id, controller);
    const current = () => alive.current && !controller.signal.aborted && jobs.current.get(entry.id) === controller;
    const update = (patch: Partial<Entry>) => { if (current()) setEntries(rows => rows.map(row => row.id === entry.id ? { ...row, ...patch } : row)); };
    update({ state: "uploading", progress: undefined });
    try {
      await onUpload(entry.file, { signal: controller.signal, onProgress: percent => { if (Number.isFinite(percent)) update({ progress: Math.min(100, Math.max(0, percent)) }); } });
      if (current()) { update({ state: "complete", progress: 100 }); setMessage(`Uploaded ${entry.file.name}`); }
    } catch {
      if (current()) { update({ state: "error" }); setMessage(`Could not upload ${entry.file.name}. Retry is available.`); }
    } finally { if (jobs.current.get(entry.id) === controller) jobs.current.delete(entry.id); }
  };
  const add = (files: FileList | File[]) => {
    if (disabled) return;
    setOver(false);
    const selected = Array.from(files);
    const accepted = (multiple ? selected : selected.slice(0, 1)).filter(file => accepts(file, accept) && (maxSize === undefined || file.size <= maxSize));
    setError(accepted.length !== selected.length ? "Some files were not added. Check the allowed type, size, and number of files." : "");
    if (!accepted.length) return;
    const next = accepted.map(file => ({ id: `${id}-${++sequence.current}`, file, state: "selected" as const }));
    setEntries(rows => multiple ? [...rows, ...next] : next);
    if (!multiple) { for (const controller of jobs.current.values()) controller.abort(); jobs.current.clear(); }
    setMessage(`Added ${accepted.length} ${accepted.length === 1 ? "file" : "files"}`);
    onFiles?.(accepted);
    for (const entry of next) void run(entry);
  };
  const remove = (entry: Entry) => {
    jobs.current.get(entry.id)?.abort(); jobs.current.delete(entry.id);
    setEntries(rows => rows.filter(row => row.id !== entry.id));
    setMessage(`Removed ${entry.file.name}`); trigger.current?.focus();
  };
  return <div data-slot="file-dropzone" className={cn("flex w-full max-w-lg flex-col gap-3", className)}>
    <button ref={trigger} type="button" disabled={disabled} aria-describedby={`${id}-hint`} onClick={() => input.current?.click()}
      onDragEnter={event => { event.preventDefault(); if (!disabled) setOver(true); }}
      onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = disabled ? "none" : "copy"; }}
      onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false); }}
      onDrop={event => { event.preventDefault(); add(event.dataTransfer.files); }}
      className={cn("relative flex min-h-56 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center outline-none transition-[border-color,background-color] duration-150 focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", over ? "border-brand bg-brand-soft" : "border-border bg-card hover:border-muted-foreground")}>
      <Upload aria-hidden className={cn("size-7 text-foreground transition-transform duration-150 motion-reduce:transform-none", over && "-translate-y-1")} />
      <span className="text-sm font-medium">{over ? "Release to add files" : label}</span>
      <span id={`${id}-hint`} className="max-w-sm text-xs leading-relaxed text-muted-foreground">{hint ?? (onUpload ? "Uploads use the transport supplied by your application." : "Files are selected locally. No upload transport is connected.")}{maxSize !== undefined && <><span aria-hidden> </span><span className="mt-1 block">Maximum {size(maxSize)} per file.</span></>}</span>
    </button>
    <input ref={input} type="file" accept={accept} multiple={multiple} disabled={disabled} hidden onChange={event => { if (event.currentTarget.files) add(event.currentTarget.files); event.currentTarget.value = ""; }} />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <ul aria-label="Selected files" className="max-h-80 space-y-2 overflow-y-auto">
      <AnimatePresence initial={false}>{entries.map(entry => <motion.li key={entry.id} layout={!reduced} initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        {entry.state === "complete" ? <Check aria-hidden className="size-5 shrink-0 text-success" /> : <FileText aria-hidden className="size-5 shrink-0 text-muted-foreground" />}
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{entry.file.name}</p><p className="text-xs text-muted-foreground">{size(entry.file.size)} · {entry.state === "selected" ? "selected" : entry.state === "uploading" ? "uploading" : entry.state === "complete" ? "uploaded" : "upload failed"}</p>
          {entry.state === "uploading" && <progress aria-label={`Uploading ${entry.file.name}`} value={entry.progress} max={100} className="mt-2 block h-1 w-full accent-[var(--brand)]" />}
        </div>
        {entry.state === "error" && <Button size="icon" variant="ghost" disabled={disabled} aria-label={`Retry ${entry.file.name}`} onClick={() => void run(entry)}><RotateCcw /></Button>}
        <Button size="icon" variant="ghost" aria-label={`${entry.state === "uploading" ? "Cancel" : "Remove"} ${entry.file.name}`} onClick={() => remove(entry)}><X /></Button>
      </motion.li>)}</AnimatePresence>
    </ul>
    <span role="status" className="sr-only">{message}</span>
  </div>;
}
