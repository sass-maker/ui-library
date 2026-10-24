"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Settings2 } from "lucide-react";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { InputField } from "../molecules/input-field";
import { SettingRow } from "../molecules/setting-row";
import { TransitionPanel } from "../recipes/transition-panel";
import { motionTiming } from "../lib/motion";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { cn } from "../lib/utils";

export type WorkspacePreferences = {
  name: string;
  email: string;
  releaseNotifications: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
};
type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "invalid" } | { kind: "error"; message: string };

function samePreferences(left: WorkspacePreferences, right: WorkspacePreferences) {
  return left.name === right.name && left.email === right.email && left.releaseNotifications === right.releaseNotifications && left.weeklyDigest === right.weeklyDigest && left.securityAlerts === right.securityAlerts;
}

function validatePreferences(values: WorkspacePreferences) {
  return {
    name: values.name.trim() ? undefined : "Enter a workspace name.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) ? undefined : "Enter a valid email address.",
  };
}

export type WorkspaceSettingsProps = {
  onSave: (values: WorkspacePreferences) => Promise<void>;
  showHeader?: boolean;
  className?: string;
} & (
  | { initial: WorkspacePreferences; value?: never; onValuesChange?: never }
  | { initial?: never; value: WorkspacePreferences; onValuesChange: (values: WorkspacePreferences) => void }
);

export function WorkspaceSettings(props: WorkspaceSettingsProps) {
  const { onSave, showHeader = true, className } = props;
  const scope = useId();
  const reduced = useReducedMotion();
  const [localValues, setLocalValues] = useState(props.value ?? props.initial);
  const values = props.value ?? localValues;
  const setValues = (next: WorkspacePreferences) => {
    if (props.onValuesChange) props.onValuesChange(next);
    else setLocalValues(next);
  };
  const [saved, setSaved] = useState(values);
  const [tab, setTab] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const fieldErrors = showErrors ? validatePreferences(values) : { name: undefined, email: undefined };
  const focusInvalid = useRef(false);
  const latestValues = useRef(values);
  latestValues.current = values;
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const dirty = !samePreferences(values, saved);
  const invalid = save.kind === "invalid" && !!(fieldErrors.name || fieldErrors.email);
  const busy = save.kind === "saving";
  const submitButton = useRef<HTMLButtonElement>(null);
  const saveStatus = useRef<HTMLDivElement>(null);
  const returnFocus = useRef(false);
  const submitOrigin = useRef<Element | null>(null);
  useEffect(() => {
    if (!returnFocus.current || (save.kind !== "saved" && save.kind !== "error")) return;
    returnFocus.current = false;
    if (!submitButton.current?.getClientRects().length) return;
    if (document.activeElement !== document.body && document.activeElement !== submitButton.current && document.activeElement !== submitOrigin.current) return;
    (save.kind === "error" ? submitButton.current : saveStatus.current)?.focus({ preventScroll: true });
  }, [save.kind]);
  const update = <K extends keyof WorkspacePreferences>(key: K, value: WorkspacePreferences[K]) => {
    setValues({ ...values, [key]: value });
    if (save.kind !== "saving") setSave({ kind: "idle" });
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !dirty) return;
    const errors = validatePreferences(values);
    setShowErrors(true);
    if (errors.name || errors.email) { focusInvalid.current = true; setTab(0); setSave({ kind: "invalid" }); return; }
    const original = values;
    const submitted = { ...values, name: values.name.trim(), email: values.email.trim() };
    // Safari pointer clicks can submit without focusing the button. Treat the
    // unchanged origin as ours, but never pull focus back after the user moves.
    submitOrigin.current = document.activeElement;
    returnFocus.current = event.currentTarget.contains(document.activeElement) || (event.nativeEvent as SubmitEvent).submitter === submitButton.current;
    setSave({ kind: "saving" });
    try {
      await onSave(submitted);
      if (!mounted.current) return;
      if (samePreferences(latestValues.current, original)) setValues(submitted);
      setSaved(submitted);
      setShowErrors(false);
      setSave({ kind: "saved" });
    } catch (error) {
      if (!mounted.current) return;
      setSave({ kind: "error", message: error instanceof Error ? error.message : "Your changes couldn’t be saved. Please try again." });
    }
  };
  return <section className={cn("@container overflow-hidden rounded-2xl border border-border bg-card text-card-foreground", className)} aria-label="Workspace settings">
    <header className={cn("border-b border-border px-5 py-6 sm:px-8", !showHeader && "sr-only")}><div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><Settings2 aria-hidden className="size-3.5" />Workspace / Settings</div>
      <div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-2xl leading-tight tracking-tight">Workspace settings</h2>{dirty && <Badge variant="outline">Unsaved changes</Badge>}</div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Manage workspace details and email preferences.</p>
    </header>
    <form onSubmit={submit} noValidate>
      <div className="px-5 sm:px-8"><div className="flex gap-6 border-b border-border" role="group" aria-label="Settings section">
        {["General", "Notifications"].map((label, index) => <button key={label} type="button"  id={`${scope}-tab-${index}`} aria-controls={`${scope}-panel`} aria-pressed={tab === index}
          className={cn("relative py-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", tab === index ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
          onClick={() => setTab(index)}>{label}{tab === index && <motion.span layoutId={reduced ? undefined : `${scope}-tab`} className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" transition={motionTiming.layout} />}</button>)}
      </div></div>
      <div id={`${scope}-panel`} role="region" aria-labelledby={`${scope}-tab-${tab}`} className="px-5 py-7 sm:px-8">
        <TransitionPanel activeIndex={tab}>
          <div className="grid gap-8 @min-[640px]:grid-cols-[1fr_1.4fr]">
            <div><h3 className="text-sm font-medium">Workspace details</h3><p className="mt-2 max-w-xs text-[0.8125rem] leading-relaxed text-muted-foreground">Give your team a familiar home. These details appear in invitations and workspace menus.</p></div>
            <fieldset disabled={busy} className="min-w-0 space-y-6">
              <InputField ref={element => { if (element && focusInvalid.current && fieldErrors.name) { element.focus(); focusInvalid.current = false; } }} label="Workspace name" error={fieldErrors.name} name="workspaceName" autoComplete="organization" required maxLength={80} value={values.name} onChange={event => update("name", event.target.value)} description="Use a name your team will recognize." />
              <InputField ref={element => { if (element && focusInvalid.current && !fieldErrors.name && fieldErrors.email) { element.focus(); focusInvalid.current = false; } }} label="Contact email" error={fieldErrors.email} name="email" type="email" autoComplete="email" required value={values.email} onChange={event => update("email", event.target.value)} description="Where we’ll send account and billing messages." />
            </fieldset>
          </div>
          <div className="grid gap-5 @min-[640px]:grid-cols-[1fr_1.4fr]">
            <div><h3 className="text-sm font-medium">Email preferences</h3><p className="mt-2 max-w-xs text-[0.8125rem] leading-relaxed text-muted-foreground">Choose what reaches your inbox. You can change your mind at any time.</p></div>
            <div className="divide-y divide-border">
              <SettingRow label="Release notifications" description="A short note when something new is ready." checked={values.releaseNotifications} onCheckedChange={value => update("releaseNotifications", value)} disabled={busy} className="pt-0" />
              <SettingRow label="Weekly digest" description="One thoughtful summary of your team’s activity." checked={values.weeklyDigest} onCheckedChange={value => update("weeklyDigest", value)} disabled={busy} />
              <SettingRow label="Security alerts" description="Important changes to access, devices, and account security." checked={values.securityAlerts} onCheckedChange={value => update("securityAlerts", value)} disabled={busy} className="pb-0" />
            </div>
          </div>
        </TransitionPanel>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-surface/40 px-5 py-4 sm:px-8">
        <div ref={saveStatus} tabIndex={-1} className="min-w-0 text-[0.8125rem] leading-relaxed outline-none" role="status" aria-live="polite">
          <AnimatePresence initial={false} mode="wait"><motion.span key={save.kind} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={motionTiming.feedback} className={cn("flex items-center gap-2", save.kind === "error" || invalid ? "text-destructive" : "text-muted-foreground")}>
            {save.kind === "saved" && !dirty ? <><Check aria-hidden className="size-4" />All changes saved.</> : save.kind === "error" ? save.message : invalid ? "Check the highlighted details." : busy ? "Saving your changes…" : dirty ? "Your changes are ready to save." : "You’re all up to date."}
          </motion.span></AnimatePresence>
        </div>
        <div className="ml-auto flex gap-2"><Button type="button" variant="ghost" disabled={!dirty || busy} onClick={() => { setValues(saved); setShowErrors(false); setSave({ kind: "idle" }); saveStatus.current?.focus({ preventScroll: true }); }}>Discard</Button>
          <Button ref={submitButton} type="submit" aria-busy={busy} aria-disabled={busy || undefined} disabled={!dirty && !busy}>{busy && <Loader2 aria-hidden className="motion-safe:animate-spin" />}{busy ? "Saving…" : save.kind === "error" ? "Try again" : "Save changes"}</Button>
        </div>
      </footer>
    </form>
  </section>;
}
