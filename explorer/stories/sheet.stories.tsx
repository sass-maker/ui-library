import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@saas-maker/ui/atoms/select";
import { SettingRow } from "@saas-maker/ui/molecules/setting-row";

const meta = { id: "overlays-sheet", title: "Molecules/Overlays/Sheet", component: C.Sheet, parameters: {"docs": {"description": {"component": "A side panel for supporting work that keeps the surrounding product context clear.\n\nImport from `@saas-maker/ui/molecules/sheet`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() {
  const variantId = useId();
  const [variant, setVariant] = useState<"default" | "outline" | "secondary" | "ghost">("default");
  const [disabled, setDisabled] = useState(false);
  return <div className="story-stack max-w-lg"><header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs text-muted-foreground">A shared action</p><h2 className="mt-2 text-lg font-medium">Button properties</h2></div>
    <C.Sheet><C.SheetTrigger asChild><Button variant="outline">Open inspector</Button></C.SheetTrigger><C.SheetContent><C.SheetHeader><C.SheetTitle>Button inspector</C.SheetTitle><C.SheetDescription>Change the actual preview while keeping the surrounding page in view.</C.SheetDescription></C.SheetHeader>
      <div className="grid gap-7 px-6"><div><label htmlFor={variantId} className="mb-2 block text-sm font-medium">Variant</label><Select value={variant} onValueChange={value => setVariant(value as typeof variant)}><SelectTrigger id={variantId} className="w-full"><SelectValue /></SelectTrigger><SelectContent>{["default", "outline", "secondary", "ghost"].map(value => <SelectItem key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</SelectItem>)}</SelectContent></Select></div>
        <SettingRow label="Disabled" description="Prevent the action while a prerequisite is missing." checked={disabled} onCheckedChange={setDisabled} />
        <section className="border-t border-border pt-6"><p className="text-xs text-muted-foreground">Live preview</p><Button variant={variant} disabled={disabled} className="mt-4">Continue<ArrowRight /></Button></section>
        <p className="text-xs leading-relaxed text-muted-foreground">Properties stay in this example. Close the inspector and the page preview keeps your choices.</p>
      </div><C.SheetFooter><C.SheetClose asChild><Button>Done</Button></C.SheetClose></C.SheetFooter></C.SheetContent></C.Sheet></header>
    <div className="flex min-h-36 items-center justify-center rounded-xl border border-border bg-surface"><Button variant={variant} disabled={disabled}>Continue<ArrowRight /></Button></div><p className="story-caption" role="status">{variant.charAt(0).toUpperCase() + variant.slice(1)} variant · {disabled ? "Disabled" : "Enabled"}</p></div>;
} };
