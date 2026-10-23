import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ArrowDown, ArrowRight, Box, Component, Layers3, Check } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { Input } from "@saas-maker/ui/atoms/input";
import { Label } from "@saas-maker/ui/atoms/label";
import { InputField } from "@saas-maker/ui/molecules/input-field";
import { WorkspaceSettings } from "@saas-maker/ui/organisms/workspace-settings";
import { samplePreferences } from "./composition-fixtures";

const meta = { title: "Start here/Composition", parameters: { docs: { description: { component: "Atomic architecture is a dependency direction. Atoms know nothing about molecules. Molecules combine atoms for one job. Organisms compose them into a complete interaction. Templates place organisms in a page." } } } } satisfies Meta;
export default meta;
export const FromAtomToOrganism: StoryObj = { render: function Render() {
  const [name,setName]=useState("Kith Studio");
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-10">
    <p className="eyebrow mb-5">How the system fits together</p><h1 className="font-display max-w-3xl text-4xl sm:text-5xl">Small pieces.<br /><em>A complete experience.</em></h1>
    <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">The same input, label, and feedback appear at every scale. Each layer adds a clear responsibility, without changing the visual language underneath.</p>
    <div className="mt-10 grid gap-5 md:grid-cols-2">
      <section className="rounded-xl border border-border bg-card p-6"><div className="mb-7 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Box aria-hidden className="size-4" />01 / Atom</div><div className="grid gap-4"><Label htmlFor="composition-atom">Workspace name</Label><Input id="composition-atom" value={name} onChange={event=>setName(event.target.value)} /><Button className="w-fit" onClick={()=>setName("Kith Studio")}>Reset name</Button></div><code className="mt-7 block break-all text-[0.6875rem] text-muted-foreground">@saas-maker/ui/atoms/input</code><p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">Visual geometry, focus, disabled state, and native input behavior. No product rules.</p></section>
      <section className="rounded-xl border border-border bg-card p-6"><div className="mb-7 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Component aria-hidden className="size-4" />02 / Molecule</div><InputField label="Workspace name" value={name} onChange={event=>setName(event.target.value)} description="The same value, composed with a label and useful guidance." error={name.trim() ? undefined : "Your workspace needs a name."} /><code className="mt-7 block break-all text-[0.6875rem] text-muted-foreground">@saas-maker/ui/molecules/input-field</code><p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">One job, made from atoms. Label association, hint, validation, and a gentle error reveal.</p></section>
    </div>
    <div className="my-6 flex items-center justify-center gap-3 text-xs text-muted-foreground"><ArrowDown aria-hidden className="size-4" />Compose the same pieces into a complete section</div>
    <div className="mb-5 flex items-center gap-2 text-xs font-medium text-muted-foreground"><Layers3 aria-hidden className="size-4" />03 / Organism</div>
    <WorkspaceSettings initial={samplePreferences} onSave={async()=>{await new Promise(resolve=>setTimeout(resolve,700));}} />
    <code className="mt-5 block text-[0.6875rem] text-muted-foreground">@saas-maker/ui/organisms/workspace-settings</code>
    <p className="mt-3 max-w-2xl text-[0.8125rem] leading-relaxed text-muted-foreground">Owns the interaction: editable data, section switching, pending state, errors, retry, and saved feedback. The application supplies the save callback. This example uses a local delay.</p>
  </main>;
} };
