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
import { cn } from "../lib/utils";

export type WorkspacePreferences = {
  name: string;
  email: string;
  releaseNotifications: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
};
type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string };

export function WorkspaceSettings({ initial, onSave, className }: {
  initial: WorkspacePreferences;
  onSave: (values: WorkspacePreferences) => Promise<void>;
  className?: string;
}) {
  const scope = useId();
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [tab, setTab] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const dirty = values.name !== saved.name || values.email !== saved.email || values.releaseNotifications !== saved.releaseNotifications || values.weeklyDigest !== saved.weeklyDigest || values.securityAlerts !== saved.securityAlerts;
  const busy = save.kind === "saving";
  const update = <K extends keyof WorkspacePreferences>(key: K, value: WorkspacePreferences[K]) => {
    setValues(previous => ({ ...previous, [key]: value }));
    if (save.kind !== "saving") setSave({ kind: "idle" });
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !dirty) return;
    const errors = {
      name: values.name.trim() ? undefined : "Enter a workspace name.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? undefined : "Enter a valid email address.",
    };
    setFieldErrors(errors);
    if (errors.name || errors.email) { setTab(0); setSave({ kind: "error", message: "Check the highlighted details." }); return; }
    const submitted = { ...values, name: values.name.trim(), email: values.email.trim() };
    setSave({ kind: "saving" });
    try {
      await onSave(submitted);
      if (!mounted.current) return;
      setValues(submitted);
      setSaved(submitted);
      setSave({ kind: "saved" });
    } catch (error) {
      if (!mounted.current) return;
      setSave({ kind: "error", message: error instanceof Error ? error.message : "Your changes couldn’t be saved. Please try again." });
    }
  };
  return <section className={cn("overflow-hidden rounded-2xl border border-border bg-card text-card-foreground", className)} aria-label="Workspace settings">
    <header className="border-b border-border px-5 py-6 sm:px-8"><div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><Settings2 aria-hidden className="size-3.5" />Workspace / Settings</div>
      <div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-semibold tracking-tight">Workspace settings</h2>{dirty && <Badge variant="outline">Unsaved changes</Badge>}</div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Manage workspace details and email preferences.</p>
    </header>
    <form onSubmit={submit}>
      <div className="px-5 sm:px-8"><div className="flex gap-6 border-b border-border" role="group" aria-label="Settings section">
        {["General", "Notifications"].map((label, index) => <button key={label} type="button"  id={`${scope}-tab-${index}`} aria-controls={`${scope}-panel`} aria-pressed={tab === index}
          className={cn("relative py-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", tab === index ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
          onClick={() => setTab(index)}>{label}{tab === index && <motion.span layoutId={`${scope}-tab`} className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" transition={motionTiming.layout} />}</button>)}
      </div></div>
      <div id={`${scope}-panel`} role="region" aria-labelledby={`${scope}-tab-${tab}`} className="px-5 py-7 sm:px-8">
        <TransitionPanel activeIndex={tab}>
          <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
            <div><h3 className="text-sm font-medium">Workspace details</h3><p className="mt-2 max-w-xs text-[0.8125rem] leading-relaxed text-muted-foreground">Give your team a familiar home. These details appear in invitations and workspace menus.</p></div>
            <fieldset disabled={busy} className="min-w-0 space-y-6">
              <InputField label="Workspace name" error={fieldErrors.name} name="workspaceName" autoComplete="organization" required maxLength={80} value={values.name} onChange={event => update("name", event.target.value)} description="Use a name your team will recognize." />
              <InputField label="Contact email" error={fieldErrors.email} name="email" type="email" autoComplete="email" required value={values.email} onChange={event => update("email", event.target.value)} description="Where we’ll send account and billing messages." />
            </fieldset>
          </div>
          <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
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
        <div className="min-w-0 text-[0.8125rem] leading-relaxed" role="status" aria-live="polite">
          <AnimatePresence initial={false} mode="wait"><motion.span key={save.kind} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={motionTiming.feedback} className={cn("flex items-center gap-2", save.kind === "error" ? "text-destructive" : "text-muted-foreground")}>
            {save.kind === "saved" ? <><Check aria-hidden className="size-4" />All changes saved.</> : save.kind === "error" ? save.message : busy ? "Saving your changes…" : dirty ? "Your changes are ready to save." : "You’re all up to date."}
          </motion.span></AnimatePresence>
        </div>
        <div className="ml-auto flex gap-2"><Button type="button" variant="ghost" disabled={!dirty || busy} onClick={() => { setValues(saved); setSave({ kind: "idle" }); }}>Discard</Button>
          <Button type="submit" aria-busy={busy} disabled={!dirty || busy}>{busy && <Loader2 aria-hidden className="motion-safe:animate-spin" />}{busy ? "Saving…" : save.kind === "error" ? "Try again" : "Save changes"}</Button>
        </div>
      </footer>
    </form>
  </section>;
}
