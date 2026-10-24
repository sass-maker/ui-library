"use client";

import { type ComponentProps } from "react";
import { Search, X } from "lucide-react";
import { Input } from "../components/input";
import { cn } from "../lib/utils";

export type SearchFieldProps = Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
};

export function SearchField({ label, value, onValueChange, className, ...props }: SearchFieldProps) {
  return <div className={cn("relative min-w-0", className)}>
    <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input {...props} type="search" aria-label={label} value={value}
      onChange={event => onValueChange(event.target.value)}
      className="h-10 pl-9 pr-10 [&::-webkit-search-cancel-button]:appearance-none" />
    {value && <button type="button" aria-label={`Clear ${label.toLowerCase()}`}
      className="absolute right-1 top-1 flex size-8 [@media(pointer:coarse)]:right-0 [@media(pointer:coarse)]:top-0 [@media(pointer:coarse)]:size-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      onClick={event => { onValueChange(""); event.currentTarget.parentElement?.querySelector("input")?.focus(); }}>
      <X aria-hidden className="size-3.5" />
    </button>}
  </div>;
}
