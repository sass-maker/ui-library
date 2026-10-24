import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { ArrowUpRight } from "lucide-react";
import * as C from "@saas-maker/ui/components/dropdown-menu";

const meta = { id: "overlays-dropdown-menu", title: "Molecules/Navigation/Dropdown menu", component: C.DropdownMenu, parameters: {"docs": {"description": {"component": "A focused menu of related actions with keyboard navigation, disabled items and clear selection states.\n\nImport from `@saas-maker/ui/components/dropdown-menu`. Preview theme, color mode, motion preference, and device width from the toolbar. Example data stays in this explorer."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const Playground: Story = { render: function Render() {
  const [collection, setCollection] = useState("Active");
  const [pinned, setPinned] = useState(false);
  const [notice, setNotice] = useState("");
  return <section className="story-stack max-w-lg"><div className="flex flex-wrap items-start justify-between gap-5 rounded-xl border border-border bg-background p-6"><div><p className="text-xs text-muted-foreground">Shared foundation</p><h2 className="mt-2 text-lg font-medium">UI Library</h2><p className="mt-3 text-sm text-muted-foreground">{collection} collection{pinned ? " · Pinned" : ""}</p></div>
    <C.DropdownMenu><C.DropdownMenuTrigger asChild><Button variant="outline">Project actions</Button></C.DropdownMenuTrigger><C.DropdownMenuContent align="end" className="w-56"><C.DropdownMenuLabel inset className="text-xs text-muted-foreground">UI Library</C.DropdownMenuLabel><C.DropdownMenuSeparator />
      <C.DropdownMenuItem inset asChild><a href="https://github.com/sass-maker/ui-library" target="_blank" rel="noreferrer">Open source<ArrowUpRight className="ml-auto size-4" /></a></C.DropdownMenuItem>
      <C.DropdownMenuItem inset onSelect={async () => { try { await navigator.clipboard.writeText("https://github.com/sass-maker/ui-library"); setNotice("Project link copied."); } catch { setNotice("The link couldn’t be copied. Open the source to copy its address."); } }}>Copy link</C.DropdownMenuItem>
      <C.DropdownMenuSeparator /><C.DropdownMenuCheckboxItem checked={pinned} onCheckedChange={setPinned}>Pin in quick access</C.DropdownMenuCheckboxItem>
      <C.DropdownMenuSub><C.DropdownMenuSubTrigger inset>Move to</C.DropdownMenuSubTrigger><C.DropdownMenuSubContent><C.DropdownMenuRadioGroup value={collection} onValueChange={value => { setCollection(value); setNotice(`Moved to ${value}.`); }}>{["Active", "Review"].map(value => <C.DropdownMenuRadioItem key={value} value={value}>{value}</C.DropdownMenuRadioItem>)}</C.DropdownMenuRadioGroup></C.DropdownMenuSubContent></C.DropdownMenuSub>
      <C.DropdownMenuSeparator /><C.DropdownMenuItem inset disabled>Delete shared library</C.DropdownMenuItem>
    </C.DropdownMenuContent></C.DropdownMenu></div><p className="story-caption min-h-6" role="status">{notice || "Pin or move the local example, copy its link, or open the actual source."}</p></section>;
} };
