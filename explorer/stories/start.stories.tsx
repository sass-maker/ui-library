import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ArrowUpRight, ArrowRight, Box, Component, Layers3, Code2, FolderOpen, Inbox, LayoutDashboard } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { Badge } from "@saas-maker/ui/atoms/badge";
import { TransitionPanel } from "@saas-maker/ui/recipes/transition-panel";
import { NotificationInbox } from "@saas-maker/ui/organisms/notification-inbox";
import { AssetLibraryExample, ProjectOverviewExample } from "./workspace-examples";
import { sampleMessages } from "./composition-fixtures";

const meta = { title: "Start here/Overview", tags: ["!autodocs"], parameters: { layout: "fullscreen", docs: { description: { component: "Explore the actual shared system, from a single control to a complete workspace." } } } } satisfies Meta;
export default meta;

function InboxExample() {
  const [messages, setMessages] = useState(sampleMessages);
  return <NotificationInbox messages={messages} onReadChange={(ids, read) => setMessages(current => current.map(message => ids.includes(message.id) ? { ...message, read } : message))} />;
}
export const Explore: StoryObj = { render: function Render() {
  const [view, setView] = useState(0);
  return <main className="mx-auto max-w-[1280px] px-5 py-6 sm:px-10 sm:py-10 lg:px-14">
    <header className="flex items-center justify-between border-b border-border pb-5"><span className="flex items-center gap-2 text-sm font-semibold"><Box aria-hidden className="size-4 text-brand" />Fleet UI</span><a href="https://github.com/sass-maker/ui-library" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-sm text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"><Code2 aria-hidden className="size-3.5" />Open source<ArrowUpRight aria-hidden className="size-3" /></a></header>
    <section className="grid gap-7 pb-9 pt-10 sm:pt-12 lg:grid-cols-[1.5fr_1fr] lg:items-end">
      <div><p className="eyebrow mb-5">The shared library</p><h1 className="font-display max-w-3xl text-4xl leading-[1.08] sm:text-6xl">A foundation for<br /><em>every interface.</em></h1></div>
      <div><p className="max-w-md text-base leading-relaxed text-muted-foreground">Start with an atom. Compose a molecule. Bring the whole experience together.</p><p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">Real interactions, considered states, and a shared rhythm—from a button press to a complete workspace.</p><Button variant="link" className="mt-4 h-auto p-0 text-sm" asChild><a target="_top" href="./?path=/story/start-here-composition--from-atom-to-organism">See how it fits together<ArrowRight /></a></Button></div>
    </section>
    <section aria-label="Live compositions" className="rounded-2xl border border-border bg-surface/40 p-3 sm:p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 px-1"><div className="flex flex-wrap gap-1" aria-label="Explore a complete example">{[{ label: "Overview", Icon: LayoutDashboard }, { label: "Asset library", Icon: FolderOpen }, { label: "Inbox", Icon: Inbox }].map(({ label, Icon },index) => <Button key={label} variant={view === index ? "secondary" : "ghost"} size="sm" aria-pressed={view === index} onClick={() => setView(index)}><Icon />{label}</Button>)}</div><span className="text-[0.6875rem] text-muted-foreground">Live example · try the interactions</span></div>
      <TransitionPanel activeIndex={view}>{[<ProjectOverviewExample />,<AssetLibraryExample />,<InboxExample />]}</TransitionPanel>
    </section>
    <p className="mt-3 text-[0.6875rem] leading-relaxed text-muted-foreground">Illustrative workspace data. File artwork comes from the existing Kith demos. These examples don’t send messages or upload files.</p>
    <section className="mt-12 grid gap-5 sm:grid-cols-3" aria-label="Atomic architecture">
      {[{ label: "01 / Atoms", Icon: Box, body: "The smallest useful pieces. Type, buttons, inputs, icons, and clear feedback.", path: "foundations-button--playground" }, { label: "02 / Molecules", Icon: Component, body: "Pieces with a purpose. Search fields, file cards, settings rows, and focused interactions.", path: "molecules-compositions-input-field--fields" }, { label: "03 / Organisms", Icon: Layers3, body: "Complete sections. Search a library, read an inbox, and save workspace settings.", path: "organisms-workspaces-workspace-settings--settings" }].map(({ label, Icon, body, path }) => <a key={label} href={`./?path=/story/${path}`} target="_top" className="group rounded-xl border border-border p-5 outline-none transition-colors hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring"><Icon aria-hidden className="mb-5 size-5 stroke-[1.5] text-muted-foreground" /><h2 className="flex items-center justify-between text-sm font-semibold">{label}<ArrowRight aria-hidden className="size-3.5 text-muted-foreground" /></h2><p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">{body}</p></a>)}
    </section>
    <section className="mt-8 grid gap-5 sm:grid-cols-2" aria-label="System walkthroughs">
      {[{ label: "A complete media-led page", body: "Explore Kith through original artwork, real app screens and a local playable screen sequence.", path: "start-here-media--complete-page" }, { label: "The typography bench", body: "Compare the same product copy, controls, and numerals in four typefaces and their system fallbacks.", path: "foundations-tokens--font-impact" }, { label: "The visual source shelf", body: "Find photography, footage, gradients, pixel art, illustrations, and motion with clear reuse terms.", path: "start-here-visual-sources--source-shelf" }, { label: "The state lab", body: "Inspect loading, empty, error, and recovery in the same working organism.", path: "start-here-states--state-lab" }, { label: "The composition bench", body: "Edit one shared draft through an atom, a molecule, and a complete settings flow.", path: "start-here-composition--from-atom-to-organism" }].map(({ label, body, path }) => <a key={label} href={`./?path=/story/${path}`} target="_top" className="group border-t border-border py-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"><h2 className="flex items-center justify-between text-base font-semibold">{label}<ArrowUpRight aria-hidden className="size-4 text-muted-foreground transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" /></h2><p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p></a>)}
    </section>
    <footer className="mt-5 flex flex-wrap justify-between gap-4 border-t border-border pt-5 text-[0.6875rem] leading-relaxed text-muted-foreground"><span>Change the theme, inspect the source, and try reduced motion in the toolbar.</span><a target="_top" href="./?path=/story/foundations-motion--rhythm" className="hover:text-foreground">Explore the shared motion rhythm ↗</a></footer>
  </main>;
} };
