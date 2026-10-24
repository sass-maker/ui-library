"use client";

import { useId, type ComponentProps } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle } from "lucide-react";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { motionTiming } from "../lib/motion";
import { cn } from "../lib/utils";

export type InputFieldProps = ComponentProps<typeof Input> & {
  label: string;
  description?: string;
  error?: string;
  optional?: boolean;
  containerClassName?: string;
};

export function InputField({ label, description, error, optional, id, containerClassName, ...props }: InputFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const reduced = useReducedMotion();
  const describedBy = [props["aria-describedby"], description ? `${fieldId}-hint` : "", error ? `${fieldId}-error` : ""].filter(Boolean).join(" ") || undefined;
  return <div className={cn("grid gap-2", containerClassName)}>
    <div className="flex items-baseline justify-between gap-4">
      <Label htmlFor={fieldId}>{label}</Label>
      {optional && <span className="text-xs text-muted-foreground">Optional</span>}
    </div>
    <Input {...props} id={fieldId} aria-describedby={describedBy} aria-invalid={error ? true : props["aria-invalid"]} />
    {description && <p id={`${fieldId}-hint`} className="text-[0.8125rem] leading-relaxed text-muted-foreground">{description}</p>}
    <AnimatePresence initial={false}>
      {error && <motion.p key="error" id={`${fieldId}-error`} role="alert"
        initial={{ opacity: 0, height: reduced ? undefined : 0 }}
        animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: reduced ? undefined : 0 }}
        transition={motionTiming.feedback} className="flex items-start gap-1.5 overflow-hidden text-[0.8125rem] leading-relaxed text-destructive">
        <AlertCircle aria-hidden className="mt-0.5 size-3.5 shrink-0" />{error}
      </motion.p>}
    </AnimatePresence>
  </div>;
}
