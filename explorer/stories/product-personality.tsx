import { useId, useState, type ComponentProps } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { Input } from "@saas-maker/ui/atoms/input";
import { Label } from "@saas-maker/ui/atoms/label";
import { CopyButton } from "@saas-maker/ui/recipes/copy-button";
import { cn } from "@saas-maker/ui/lib/utils";

const personalities = [
  { id: "paper", name: "Editorial", description: "Warm paper, Newsreader headings, restrained corners." },
  { id: "signal", name: "Technical", description: "Cool surfaces, precise sans type, a sharper working rhythm." },
  { id: "hearth", name: "Warm", description: "Softer surfaces and a warmer accent for a more personal product." },
] as const;

// A product wrapper adds its own vocabulary while retaining Button's native
// props, asChild composition, keyboard behavior, focus and reduced motion.
function ProductAction({ density, className, ...props }: ComponentProps<typeof Button> & { density: "comfortable" | "compact" }) {
  return <Button variant="brand" {...props} className={cn(density === "comfortable" ? "min-h-11 px-5" : "h-9 px-3", className)} />;
}

export function ProductPersonalityBench({ mode = "light" }: { mode?: "light" | "dark" }) {
  const [selected, setSelected] = useState(0);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [name, setName] = useState("Kith · October release");
  const [saved, setSaved] = useState("");
  const id = useId();
  const profile = personalities[selected];
  const themeCode = `<html data-theme="${profile.id}" data-mode="${mode}">\n  <!-- One identity for the landing, app, and portalled overlays. -->\n</html>\n\n/* Optional product overrides, loaded after the shared theme. */\n[data-theme="${profile.id}"] {\n  /* --brand, --brand-foreground, --brand-soft, --brand-ink */\n  /* --font-display, --font-sans, --radius */\n}`;
  const componentCode = `import { Button } from "@saas-maker/ui/atoms/button";\nimport { cn } from "@saas-maker/ui/lib/utils";\n\nfunction ProductAction({ className, ...props }) {\n  return <Button\n    variant="brand"\n    {...props}\n    className={cn("${density === "comfortable" ? "min-h-11 px-5" : "h-9 px-3"}", className)}\n  />;\n}\n\n<ProductAction onClick={save}>Save workspace</ProductAction>\n<ProductAction asChild variant="outline">\n  <a href="/workspace">Open workspace</a>\n</ProductAction>`;

  return <main className="mx-auto w-full max-w-5xl">
    <header className="max-w-2xl"><p className="eyebrow mb-4">One system. Your product’s voice.</p><h1 className="font-display text-3xl leading-tight sm:text-5xl">Shared foundations.<br /><em>Room for personality.</em></h1><p className="mt-5 text-sm leading-relaxed text-muted-foreground">Change the identity and density of the same working form. The draft, save behavior, keyboard access, and focus treatment stay with the shared components.</p></header>
    <div role="group" aria-label="Product personality" className="mt-8 grid gap-3 sm:grid-cols-3">{personalities.map((item, index) => <button key={item.id} type="button" aria-pressed={selected === index} aria-controls={id} onClick={() => setSelected(index)} className={cn("min-h-11 rounded-xl border p-4 text-left outline-none transition-colors duration-150 hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring", selected === index ? "border-foreground/40 bg-card" : "border-border")}><span className="flex items-center justify-between gap-3 text-sm font-semibold">{item.name}{selected === index && <Check aria-hidden className="size-4" />}</span><span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{item.description}</span></button>)}</div>
    <div className="my-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Same components, state, and content in every preset.</p><div role="group" aria-label="Component density" className="flex gap-1">{(["comfortable", "compact"] as const).map(value => <Button key={value} variant={density === value ? "secondary" : "ghost"} size="sm" aria-pressed={density === value} onClick={() => setDensity(value)} className="min-h-11 capitalize">{value}</Button>)}</div></div>
    <section id={id} data-testid="product-personality-preview" data-theme={profile.id} data-mode={mode} aria-label="Product workspace preview" className="overflow-hidden rounded-xl border border-border bg-background text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="grid sm:grid-cols-[.8fr_1.2fr]"><header className="border-b border-border bg-surface p-6 sm:border-b-0 sm:border-r sm:p-8"><p className="text-xs font-medium text-brand-ink">Kith / Release workspace</p><h2 className="mt-5 font-display text-3xl leading-tight">Make room for<br /><em>the next chapter.</em></h2><p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">A shared place for the artwork, notes, and small decisions behind the release.</p><a href="./?path=/story/start-here-workspace--complete-workflow" target="_top" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore the complete workflow<ArrowUpRight aria-hidden className="size-4" /></a></header>
        <form className={cn("grid content-start p-6 sm:p-8", density === "comfortable" ? "gap-6" : "gap-4")} onSubmit={event => { event.preventDefault(); if (name.trim()) setSaved(name.trim()); }}>
          <div><h3 className="text-base font-semibold">Workspace details</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Give this release a name you can find again.</p></div>
          <div className="grid gap-2"><Label htmlFor={id + "-name"}>Workspace name</Label><Input id={id + "-name"} value={name} onChange={event => { setName(event.target.value); setSaved(""); }} required maxLength={100} className={density === "comfortable" ? "min-h-11" : undefined} /></div>
          <div className="flex flex-wrap items-center gap-3"><ProductAction density={density} type="submit">Save workspace</ProductAction><ProductAction density={density} type="button" variant="outline" onClick={() => { setName("Kith · October release"); setSaved(""); }}>Reset example</ProductAction></div>
          <p role="status" aria-live="polite" className="min-h-10 text-xs leading-relaxed text-muted-foreground">{saved ? `Saved “${saved}” in this example.` : "Changes stay in this example. Nothing is sent."}</p>
        </form>
      </div>
    </section>
    <section className="mt-8 grid gap-5 lg:grid-cols-2" aria-label="Extend the system">{[{ title: "Set a product identity", code: themeCode, label: "Copy product theme setup" }, { title: "Wrap a component without forking it", code: componentCode, label: "Copy product action wrapper" }].map(item => <div key={item.title} className="min-w-0 overflow-hidden rounded-xl border border-border bg-card"><header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3"><h2 className="text-sm font-medium">{item.title}</h2><CopyButton value={item.code} label={item.label} /></header><pre role="region" aria-label={item.title + " code"} tabIndex={0} className="overflow-x-auto p-4 text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><code>{item.code}</code></pre></div>)}</section>
    <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">Put the product theme on the document root so dialogs, menus, and other portals share it. Use semantic tokens for identity, variants for repeatable choices, className and data-slot hooks for local styling, and children or named slots for composition. Add a shared variant when several products need the same behavior; keep product content and wrappers with the product.</p>
  </main>;
}
