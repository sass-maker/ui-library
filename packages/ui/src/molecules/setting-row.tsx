"use client";

import { useId } from "react";
import { Switch } from "../components/switch";
import { cn } from "../lib/utils";

export type SettingRowProps = {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export function SettingRow({ label, description, checked, onCheckedChange, disabled, className }: SettingRowProps) {
  const id = useId();
  return <label htmlFor={id} className={cn("flex min-h-11 cursor-pointer items-start justify-between gap-6 py-5", disabled && "cursor-default opacity-60", className)}>
    <span className="min-w-0">
      <span id={`${id}-label`} className="block text-sm font-medium leading-relaxed">{label}</span>
      <span id={`${id}-hint`} className="mt-1 block max-w-lg text-[0.8125rem] leading-relaxed text-muted-foreground">{description}</span>
    </span>
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled}
      aria-labelledby={`${id}-label`} aria-describedby={`${id}-hint`} className="mt-0.5 shrink-0" />
  </label>;
}
