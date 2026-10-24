"use client";

import { useId, useRef } from "react";
import { FileText, ImageIcon, MoreHorizontal } from "lucide-react";
import { ResponsiveImage } from "../components/responsive-image";
import { Checkbox } from "../components/checkbox";
import { Button } from "../components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/dropdown-menu";
import { cn } from "../lib/utils";

export type LibraryFile = {
  id: string;
  name: string;
  kind: "image" | "document";
  size: string;
  updated: string;
  preview?: string;
  collection: string;
};

export type FileCardProps = {
  file: LibraryFile;
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  onOpen: (trigger: HTMLButtonElement) => void;
  onRemove?: () => void;
  view?: "grid" | "list";
};

export function FileCard({ file, selected, onSelectedChange, onOpen, onRemove, view = "grid" }: FileCardProps) {
  const checkboxId = useId();
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const afterMenuClose = useRef<(() => void) | null>(null);
  const Icon = file.kind === "image" ? ImageIcon : FileText;
  const list = view === "list";
  return <article data-selected={selected} className={cn("group/file relative min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground transition-[border-color,box-shadow] duration-150", selected ? "border-brand ring-1 ring-brand/20" : "border-border hover:border-foreground/25", list && "flex items-center gap-4 rounded-lg p-3")}>
    <div className={cn("relative overflow-hidden bg-surface", list ? "size-12 shrink-0 rounded-md" : "aspect-[4/3] border-b border-border")}>
      <button type="button" onClick={event => onOpen(event.currentTarget)} aria-label={`Preview ${file.name}`} className="absolute inset-0 flex size-full items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        {file.preview ? <ResponsiveImage src={file.preview} alt="" width={4} height={3} focalPoint="50% 0%" className="size-full" imageClassName="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/file:scale-[1.025]" /> : <Icon aria-hidden className={cn("text-muted-foreground/60", list ? "size-6" : "size-12 stroke-1")} />}
      </button>
      {!list && <label htmlFor={checkboxId} className={cn("absolute left-3 top-3 cursor-pointer rounded-md bg-card/95 p-3.5 shadow-sm transition-opacity [@media(hover:hover)_and_(pointer:fine)]:p-1.5", !selected && "[@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover/file:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-within/file:opacity-100")}>
        <Checkbox id={checkboxId} aria-label={`Select ${file.name}`} checked={selected} onCheckedChange={value => onSelectedChange(value === true)} className="block" />
      </label>}
    </div>
    {list && <label htmlFor={checkboxId} className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center"><Checkbox id={checkboxId} aria-label={`Select ${file.name}`} checked={selected} onCheckedChange={value => onSelectedChange(value === true)} /></label>}
    <div className={cn("min-w-0 flex-1", !list && "px-4 py-3.5 pr-12")}>
      <button type="button" onClick={event => onOpen(event.currentTarget)} className="block max-w-full truncate rounded-sm text-left text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring" title={file.name}>{file.name}</button>
      <p className="mt-1 truncate text-xs leading-relaxed text-muted-foreground">{file.size} <span aria-hidden>·</span> {file.updated}</p>
    </div>
    <DropdownMenu><DropdownMenuTrigger asChild><Button ref={menuTrigger} variant="ghost" size="icon-sm" aria-label={`Actions for ${file.name}`} className={cn("shrink-0", !list && "absolute bottom-4 right-2 bg-card")}><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" onCloseAutoFocus={event => {
        const action = afterMenuClose.current;
        if (!action) return;
        event.preventDefault(); afterMenuClose.current = null;
        // Release the menu's modal focus scope before opening another overlay
        // or removing its trigger, including during an animated close.
        action();
      }}><DropdownMenuItem onSelect={() => { afterMenuClose.current = () => { if (menuTrigger.current) onOpen(menuTrigger.current); }; }}>Open preview</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelectedChange(!selected)}>{selected ? "Deselect file" : "Select file"}</DropdownMenuItem>
        {onRemove && <DropdownMenuItem variant="destructive" onSelect={() => { afterMenuClose.current = onRemove; }}>Remove file</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  </article>;
}
