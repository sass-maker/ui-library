"use client";

import { useRef } from "react";
import { FileText, ImageIcon, MoreHorizontal } from "lucide-react";
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
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const Icon = file.kind === "image" ? ImageIcon : FileText;
  const list = view === "list";
  return <article data-selected={selected} className={cn("group/file relative min-w-0 overflow-hidden rounded-xl border bg-card text-card-foreground transition-[border-color,box-shadow] duration-150", selected ? "border-brand ring-1 ring-brand/20" : "border-border hover:border-foreground/25", list && "flex items-center gap-4 rounded-lg p-3")}>
    <div className={cn("relative overflow-hidden bg-surface", list ? "size-12 shrink-0 rounded-md" : "aspect-[4/3] border-b border-border")}>
      <button type="button" onClick={event => onOpen(event.currentTarget)} aria-label={`Preview ${file.name}`} className="absolute inset-0 flex size-full items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        {file.preview ? <img src={file.preview} alt="" className={cn("size-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/file:scale-[1.025]", file.kind === "image" && "object-top")} loading="lazy" /> : <Icon aria-hidden className={cn("text-muted-foreground/60", list ? "size-6" : "size-12 stroke-1")} />}
      </button>
      {!list && <div className={cn("absolute left-3 top-3 rounded-md bg-card/95 p-1.5 shadow-sm transition-opacity", selected ? "opacity-100" : "sm:opacity-0 sm:group-hover/file:opacity-100 sm:group-focus-within/file:opacity-100")}>
        <Checkbox aria-label={`Select ${file.name}`} checked={selected} onCheckedChange={value => onSelectedChange(value === true)} className="block" />
      </div>}
    </div>
    {list && <Checkbox aria-label={`Select ${file.name}`} checked={selected} onCheckedChange={value => onSelectedChange(value === true)} />}
    <div className={cn("min-w-0 flex-1", !list && "px-4 py-3.5 pr-12")}>
      <button type="button" onClick={event => onOpen(event.currentTarget)} className="block max-w-full truncate rounded-sm text-left text-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring" title={file.name}>{file.name}</button>
      <p className="mt-1 truncate text-xs leading-relaxed text-muted-foreground">{file.size} <span aria-hidden>·</span> {file.updated}</p>
    </div>
    <DropdownMenu><DropdownMenuTrigger asChild><Button ref={menuTrigger} variant="ghost" size="icon-sm" aria-label={`Actions for ${file.name}`} className={cn("shrink-0", !list && "absolute bottom-4 right-2 bg-card")}><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => { if (menuTrigger.current) onOpen(menuTrigger.current); }}>Open preview</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelectedChange(!selected)}>{selected ? "Deselect file" : "Select file"}</DropdownMenuItem>
        {onRemove && <DropdownMenuItem variant="destructive" onSelect={onRemove}>Remove file</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  </article>;
}
