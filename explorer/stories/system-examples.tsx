import { useState } from "react";
import { ArrowDown, ArrowRight, Box, Component, Layers3, Check, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@saas-maker/ui/atoms/button";
import { Input } from "@saas-maker/ui/atoms/input";
import { Label } from "@saas-maker/ui/atoms/label";
import { Badge } from "@saas-maker/ui/atoms/badge";
import { InputField } from "@saas-maker/ui/molecules/input-field";
import { SegmentedControl } from "@saas-maker/ui/recipes/segmented-control";
import { TransitionPanel } from "@saas-maker/ui/recipes/transition-panel";
import { AssetLibrary } from "@saas-maker/ui/organisms/asset-library";
import { WorkspaceSettings } from "@saas-maker/ui/organisms/workspace-settings";
import { motionTiming } from "@saas-maker/ui/lib/motion";
import { useReducedMotion } from "@saas-maker/ui/lib/use-reduced-motion";
import { sampleFiles, samplePreferences } from "./composition-fixtures";

export function AtomicCompositionExample() {
  const [values, setValues] = useState(samplePreferences);
  const [savedName, setSavedName] = useState(samplePreferences.name);
  return <main className="system-page mx-auto w-full max-w-[1160px] px-4 py-7 sm:p-8 lg:p-14">
    <header className="system-intro mb-9 max-w-[760px] [&>.eyebrow]:mb-5 [&>p:last-child]:mt-6 [&>p:last-child]:max-w-[62ch] [&>p:last-child]:text-[0.9375rem] [&>p:last-child]:leading-[1.75] [&>p:last-child]:text-muted-foreground">
      <p className="eyebrow">The composition bench</p>
      <h1 className="font-display text-4xl leading-[1.08] tracking-[-.035em] text-balance sm:text-5xl lg:text-6xl">Small pieces.<br /><em>One working system.</em></h1>
      <p>Edit the workspace name in any layer. The same draft travels through the input, the composed field, and the complete settings section.</p>
    </header>
    <div className="composition-connection mb-5 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground [&>strong]:font-medium [&>strong]:text-foreground [&>strong]:[overflow-wrap:anywhere]" role="status"><span className="size-1.5 rounded-full bg-brand" aria-hidden /><span>Saved workspace</span><strong>{savedName}</strong></div>
    <div className="composition-pieces grid gap-5 sm:grid-cols-2">
      <section className="composition-piece flex min-w-0 flex-col rounded-[14px] border border-border bg-card">
        <div className="composition-label flex flex-wrap items-center gap-2.5 border-b border-border px-5 py-4 text-xs text-muted-foreground sm:px-6 sm:py-5 [&>[data-slot=badge]]:ml-auto"><Box aria-hidden size={16} /><span>01 / Atom</span><Badge variant="outline">Input</Badge></div>
        <div className="composition-demo grid content-start gap-2 p-5 sm:min-h-[168px] sm:p-6"><Label htmlFor="composition-atom">Workspace name</Label><Input id="composition-atom" value={values.name} maxLength={80} onChange={event => setValues(current => ({ ...current, name: event.target.value }))} /></div>
        <div className="composition-note mt-auto px-5 pb-5 text-[0.8125rem] leading-relaxed text-muted-foreground sm:px-6 sm:pb-6 [&>code]:text-[0.6875rem] [&>code]:[overflow-wrap:anywhere] [&>p]:mt-2.5"><code>@saas-maker/ui/atoms/input</code><p>The control owns geometry, keyboard editing, focus, and disabled states.</p></div>
      </section>
      <section className="composition-piece flex min-w-0 flex-col rounded-[14px] border border-border bg-card">
        <div className="composition-label flex flex-wrap items-center gap-2.5 border-b border-border px-5 py-4 text-xs text-muted-foreground sm:px-6 sm:py-5 [&>[data-slot=badge]]:ml-auto"><Component aria-hidden size={16} /><span>02 / Molecule</span><Badge variant="outline">InputField</Badge></div>
        <div className="composition-demo grid content-start gap-2 p-5 sm:min-h-[168px] sm:p-6"><InputField label="Workspace name" value={values.name} maxLength={80} onChange={event => setValues(current => ({ ...current, name: event.target.value }))} description="A label, an input, guidance, and validation." error={values.name.trim() ? undefined : "Your workspace needs a name."} /></div>
        <div className="composition-note mt-auto px-5 pb-5 text-[0.8125rem] leading-relaxed text-muted-foreground sm:px-6 sm:pb-6 [&>code]:text-[0.6875rem] [&>code]:[overflow-wrap:anywhere] [&>p]:mt-2.5"><code>@saas-maker/ui/molecules/input-field</code><p>The molecule adds label association, a description, and animated error feedback.</p></div>
      </section>
    </div>
    <div className="composition-bridge my-6 flex items-center justify-center gap-3 text-xs text-muted-foreground"><ArrowDown aria-hidden size={16} /><span>Shared draft → complete interaction</span></div>
    <div className="composition-organism-label mb-4 mt-6 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground"><Layers3 aria-hidden size={16} /><span>03 / Organism</span><span className="ml-auto text-xs text-muted-foreground">Try editing, saving, and discarding</span></div>
    <WorkspaceSettings value={values} onValuesChange={setValues} onSave={async next => { await new Promise(resolve => setTimeout(resolve, 700)); setSavedName(next.name); }} />
    <div className="composition-note mt-5 text-[0.8125rem] leading-relaxed text-muted-foreground [&>code]:text-[0.6875rem] [&>code]:[overflow-wrap:anywhere] [&>p]:mt-2.5 [&>p]:max-w-[72ch]"><code>@saas-maker/ui/organisms/workspace-settings</code><p>The organism owns validation, sections, pending state, recovery, and saved feedback. The application owns the draft and supplies the save callback. This example saves locally.</p></div>
    <footer className="system-links mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground [&>a]:inline-flex [&>a]:items-center [&>a]:gap-2 [&>a]:rounded-sm [&>a]:text-foreground [&>a]:underline-offset-4 [&>a:hover]:underline [&>a:focus-visible]:outline-2 [&>a:focus-visible]:outline-offset-4 [&>a:focus-visible]:outline-ring"><Button variant="ghost" size="sm" onClick={() => setValues(samplePreferences)}><RotateCcw />Reset shared draft</Button><a target="_top" href="?path=/story/start-here-states--state-lab">Explore the interaction states<ArrowRight aria-hidden size={14} /></a></footer>
  </main>;
}

export function StateLabExample() {
  const [state, setState] = useState("Ready");
  const [loaded, setLoaded] = useState(false);
  const choices = ["Ready", "Loading", "Empty", "Error"];
  const index = choices.indexOf(state);
  const stateDescriptions = [
    "Search, filter, select, change views, and open a preview. Every action uses the same composed controls.",
    "Placeholders preserve the card silhouette and reading rhythm. Finish loading when you’re ready to compare the real content.",
    "The empty state explains what belongs here and gives you a way forward. Add the example files to recover.",
    "The error keeps the workspace frame intact. Retry the example to recover without losing your place.",
  ];
  return <main className="system-page mx-auto w-full max-w-[1160px] px-4 py-7 sm:p-8 lg:p-14">
    <header className="system-intro mb-9 max-w-[760px] [&>.eyebrow]:mb-5 [&>p:last-child]:mt-6 [&>p:last-child]:max-w-[62ch] [&>p:last-child]:text-[0.9375rem] [&>p:last-child]:leading-[1.75] [&>p:last-child]:text-muted-foreground"><p className="eyebrow">The state lab</p><h1 className="font-display text-4xl leading-[1.08] tracking-[-.035em] text-balance sm:text-5xl lg:text-6xl">Care for the<br /><em>in-between moments.</em></h1><p>A complete example includes the wait, the empty start, and the retry. Inspect the same asset-library organism in every state.</p></header>
    <div className="state-lab-controls flex flex-wrap items-center justify-between gap-4"><div className="max-w-full overflow-x-auto pb-1"><SegmentedControl options={choices} value={state} onChange={next => { setState(next); setLoaded(false); }} label="Asset library state" /></div><Badge variant="outline">One organism · four states</Badge></div>
    <div className="state-lab-note min-h-[104px] max-w-[76ch] pb-6 pt-4 text-[0.8125rem] leading-relaxed text-muted-foreground sm:min-h-[88px]"><AnimatePresence initial={false} mode="wait"><motion.p key={state} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={motionTiming.feedback}>{stateDescriptions[index]}</motion.p></AnimatePresence></div>
    <TransitionPanel activeIndex={index}>{[
      <AssetLibrary state={{ kind: "ready", files: sampleFiles }} />,
      <AssetLibrary state={loaded ? { kind: "ready", files: sampleFiles } : { kind: "loading" }} action={<Button variant="outline" onClick={() => setLoaded(current => !current)}>{loaded ? <><RotateCcw />Replay loading</> : <><Check />Finish loading</>}</Button>} />,
      <AssetLibrary state={{ kind: "ready", files: loaded ? sampleFiles : [] }} action={<Button onClick={() => setLoaded(current => !current)}>{loaded ? "Clear example files" : "Add example files"}<ArrowRight /></Button>} />,
      <AssetLibrary state={loaded ? { kind: "ready", files: sampleFiles } : { kind: "error", message: "The example connection was interrupted. Your files are still safe.", onRetry: () => setLoaded(true) }} action={loaded ? <Button variant="outline" onClick={() => setLoaded(false)}><RotateCcw />Replay error</Button> : undefined} />,
    ]}</TransitionPanel>
    <footer className="system-links mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground [&>a]:inline-flex [&>a]:items-center [&>a]:gap-2 [&>a]:rounded-sm [&>a]:text-foreground [&>a]:underline-offset-4 [&>a:hover]:underline [&>a:focus-visible]:outline-2 [&>a:focus-visible]:outline-offset-4 [&>a:focus-visible]:outline-ring"><p>Local, illustrative data. Change themes or reduced motion in the toolbar.</p><a href="?path=/story/organisms-workspaces-asset-library--files" target="_top">Open the complete example<ArrowRight aria-hidden size={14} /></a></footer>
  </main>;
}

export function FoundationFormExample() {
  const [name, setName] = useState("Kith · the next chapter");
  const [outcome, setOutcome] = useState("Success");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string>();
  const reduced = useReducedMotion();
  const busy = state === "saving";
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!name.trim()) { setError("Give this project a name before saving."); return; }
    setError(undefined);
    setState("saving");
    await new Promise(resolve => setTimeout(resolve, 900));
    setState(outcome === "Success" ? "saved" : "error");
  };
  return <div className="foundation-form-example w-full max-w-[600px] [&>.story-caption]:mt-5">
    <div className="foundation-example-settings mb-6 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Example response</span><SegmentedControl options={["Success", "Error"]} value={outcome} onChange={setOutcome} label="Save response" /></div>
    <form onSubmit={submit} noValidate className="rounded-xl border border-border bg-background">
      <div className="border-b border-border px-6 py-5"><p className="eyebrow mb-2">Project details</p><h2 className="text-xl font-semibold tracking-tight">Give the next chapter a name.</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Try an empty name, a slow save, and a rejected request.</p></div>
      <div className="px-6 py-6"><InputField label="Project name" name="projectName" required value={name} disabled={busy} error={error} maxLength={80} onChange={event => { setName(event.target.value); setError(undefined); setState("idle"); }} description="Visible to everyone in this example workspace." /></div>
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-surface/40 px-6 py-4">
        <div className="max-w-64 text-[0.8125rem] leading-relaxed" role="status"><AnimatePresence initial={false} mode="wait"><motion.span key={state} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={motionTiming.feedback} className={state === "error" ? "flex items-start gap-2 text-destructive" : "flex items-center gap-2 text-muted-foreground"}>{state === "saved" ? <><Check aria-hidden size={15} />Saved in this example.</> : state === "error" ? <><AlertCircle aria-hidden size={16} className="mt-0.5 shrink-0" />Connection interrupted. Your name is still here.</> : busy ? "Saving your changes…" : "Changes stay local to this example."}</motion.span></AnimatePresence></div>
        <Button type="submit" variant="brand" aria-busy={busy} disabled={busy || state === "saved"} className="relative min-w-36 overflow-hidden"><AnimatePresence initial={false} mode="popLayout"><motion.span key={state} initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }} transition={motionTiming.feedback} className="inline-flex items-center justify-center gap-2">{busy ? <><Loader2 aria-hidden className="motion-safe:animate-spin" />Saving…</> : state === "saved" ? <><Check aria-hidden />Saved</> : state === "error" ? <><RotateCcw aria-hidden />Try again</> : <>Save project<ArrowRight aria-hidden /></>}</motion.span></AnimatePresence></Button>
      </footer>
    </form>
    <p className="story-caption text-[0.8125rem] leading-relaxed text-muted-foreground">Atoms provide the controls. InputField adds validation. The form coordinates draft, pending, error, retry, and success.</p>
  </div>;
}

