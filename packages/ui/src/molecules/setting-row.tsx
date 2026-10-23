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
  return <div className={cn("flex items-start justify-between gap-6 py-5", disabled && "opacity-60", className)}>
    <div className="min-w-0">
      <label htmlFor={id} className="cursor-pointer text-sm font-medium leading-relaxed">{label}</label>
      <p id={`${id}-hint`} className="mt-1 max-w-lg text-[0.8125rem] leading-relaxed text-muted-foreground">{description}</p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled}
      aria-describedby={`${id}-hint`} className="mt-0.5 shrink-0" />
  </div>;
}
