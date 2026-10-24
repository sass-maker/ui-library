import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, FolderOpen, Inbox, LayoutDashboard, Settings2, Upload, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { ResponsiveImage } from "@saas-maker/ui/atoms/responsive-image";
import { AppShell } from "@saas-maker/ui/blocks/app";
import { SearchPalette, SearchTrigger } from "@saas-maker/ui/blocks/search-palette";
import { MultiStepForm } from "@saas-maker/ui/recipes/multi-step-form";
import { AssetLibrary } from "@saas-maker/ui/organisms/asset-library";
import { WorkspaceSettings } from "@saas-maker/ui/organisms/workspace-settings";
import { NotificationInbox } from "@saas-maker/ui/organisms/notification-inbox";
import { ProjectOverview } from "@saas-maker/ui/organisms/project-overview";
import { sampleFiles, samplePreferences, sampleMessages, sampleMetrics, sampleTasks, sampleActivity } from "./composition-fixtures";


export function AssetLibraryExample() {
  const [files, setFiles] = useState(sampleFiles);
  const input = useRef<HTMLInputElement>(null);
  return <div className="w-full space-y-4">
    <AssetLibrary state={{ kind: "ready", files }} onRemove={ids => setFiles(current => current.filter(file => !ids.includes(file.id)))}
      action={<><Button onClick={() => input.current?.click()}><Upload />Add files</Button><input ref={input} type="file" multiple className="sr-only" aria-label="Add local files" onChange={event => {
        const additions = Array.from(event.target.files ?? []).map((file, index) => ({ id: `local-${file.name}-${Date.now()}-${index}`, name: file.name, kind: "document" as const, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, updated: "Just now", collection: "Local files" }));
        setFiles(current => [...current, ...additions]); event.target.value = "";
      }} /></>} />
    <p className="story-caption flex flex-wrap items-center justify-between gap-3"><span>Explore collections, search, switch views, select files, and open a preview. Added files stay local.</span><Button variant="ghost" size="sm" onClick={() => setFiles(sampleFiles)}><RotateCcw />Reset example</Button></p>
  </div>;
}


export function ProjectOverviewExample() {
  const [tasks, setTasks] = useState(sampleTasks);
  return <ProjectOverview name="Kith · October release" description="Track the component review, handoff checklist, and team feedback." metrics={sampleMetrics} tasks={tasks} activity={sampleActivity}
    onTaskChange={(id, complete) => setTasks(current => current.map(task => task.id === id ? { ...task, complete } : task))} />;
}

/** A connected, local workspace built from the organisms shown separately. */
export function CompleteWorkspaceExample({ sourceAction, initialName = samplePreferences.name }: { sourceAction?: ReactNode; initialName?: string } = {}) {
  const sections = [
    { id: "overview", label: "Overview", Icon: LayoutDashboard, description: "Review the artwork, close the feedback loop, and keep the release moving." },
    { id: "assets", label: "Assets", Icon: FolderOpen, description: "Browse artwork, preview a file, and keep your release library in order." },
    { id: "inbox", label: "Inbox", Icon: Inbox, description: "Read the feedback behind the next round of refinements." },
    { id: "settings", label: "Settings", Icon: Settings2, description: "A familiar workspace, with the preferences that suit you." },
  ];
  const [view, setView] = useState(() => {
    const id = typeof location === "undefined" ? "" : location.hash.replace("#workspace-", "");
    return sections.some(section => section.id === id) ? id : "overview";
  });
  const navigate = (id: string) => {
    if (!sections.some(section => section.id === id)) return;
    if (location.hash !== `#workspace-${id}`) history.pushState(null, "", `#workspace-${id}`);
    setView(id);
  };
  useEffect(() => {
    const follow = () => { const id = location.hash.replace("#workspace-", ""); setView(sections.some(section => section.id === id) ? id : "overview"); };
    addEventListener("hashchange", follow);
    return () => removeEventListener("hashchange", follow);
  }, []);
  const [files, setFiles] = useState(sampleFiles);
  const [removed, setRemoved] = useState<typeof sampleFiles>([]);
  const removalOrder = useRef(new Map<string, number>());
  const [messages, setMessages] = useState(sampleMessages);
  const [tasks, setTasks] = useState(sampleTasks);
  const [preferences, setPreferences] = useState({ ...samplePreferences, name: initialName });
  const [name, setName] = useState(initialName);
  const [rejectSave, setRejectSave] = useState(false);
  const [notice, setNotice] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);
  const objectUrls = useRef(new Set<string>());
  const firstView = useRef(true);
  useEffect(() => () => { for (const url of objectUrls.current) URL.revokeObjectURL(url); }, []);
  useEffect(() => {
    if (firstView.current) { firstView.current = false; return; }
    const frame = requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); });
    return () => cancelAnimationFrame(frame);
  }, [view]);
  const unread = messages.filter(message => !message.read).length;
  const section = sections.find(item => item.id === view)!;
  const sources = useMemo(() => [{ id: "workspace", label: "Workspace", search: (query: string) => [
    { id: "overview", title: "Overview", subtitle: "Release checklist and recent activity" },
    { id: "assets", title: "Assets", subtitle: "Artwork, files and previews" },
    { id: "inbox", title: "Inbox", subtitle: "Messages and unread feedback" },
    { id: "settings", title: "Settings", subtitle: "Workspace name, email and notification preferences" },
  ].filter(item => `${item.title} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase())) }], []);
  const removeFiles = (ids: string[]) => {
    const batch = files.filter(file => ids.includes(file.id));
    removalOrder.current = new Map(files.map((file, index) => [file.id, index]));
    setRemoved(batch);
    setFiles(current => current.filter(file => !ids.includes(file.id)));
    setNotice(`${batch.length} ${batch.length === 1 ? "file removed" : "files removed"}. You can undo this change.`);
  };
  const undoRemoval = () => {
    setFiles(current => [...current, ...removed.filter(file => !current.some(item => item.id === file.id))]
      .sort((left, right) => (removalOrder.current.get(left.id) ?? Infinity) - (removalOrder.current.get(right.id) ?? Infinity)));
    setNotice(`${removed.length} ${removed.length === 1 ? "file restored" : "files restored"}.`);
    setRemoved([]);
    noticeRef.current?.focus({ preventScroll: true });
  };
  const reset = () => {
    for (const url of objectUrls.current) URL.revokeObjectURL(url);
    objectUrls.current.clear();
    setFiles(sampleFiles); setRemoved([]); setMessages(sampleMessages); setTasks(sampleTasks);
    setNotice("Example files, messages and checklist restored. Workspace preferences are kept.");
  };
  return <div className="min-h-dvh">
    <aside aria-label="Example controls" className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
      <span>Kith Studio · local demo</span><div className="flex shrink-0 items-center gap-3">
      <details className="relative"><summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><Settings2 aria-hidden className="size-3.5" /><span>Controls</span></summary><div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg"><label className="flex min-h-11 cursor-pointer items-center gap-2"><input type="checkbox" checked={rejectSave} onChange={event => setRejectSave(event.target.checked)} />Simulate save failure</label><Button size="sm" variant="ghost" onClick={reset}><RotateCcw />Reset example data</Button></div></details>{sourceAction}</div>
    </aside>
    <AppShell brand={{ name, mark: <BookOpen aria-hidden className="size-5 stroke-[1.5] text-brand" /> }}
      nav={[{ title: "October release", items: sections.map(({ id, label, Icon }) => ({ label, href: `#workspace-${id}`, icon: <Icon aria-hidden />, active: view === id, count: id === "inbox" ? unread : id === "assets" ? files.length : undefined })) }]}
      onNavigate={href => navigate(href.replace("#workspace-", ""))}
      mobileActions={<SearchTrigger label="Jump to a section" className="size-11 border-transparent p-0 sm:w-11 [&>span]:hidden [&>kbd]:hidden" />}
      secondary={<div className="rounded-xl border border-sidebar-border p-4"><p className="text-xs font-medium">The story behind the work</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">See these same assets in a finished product page.</p><a target="_top" href="./?path=/story/start-here-media--complete-page" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-sm text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore Kith<ArrowUpRight aria-hidden className="size-3.5" /></a></div>}
      user={{ name: "Your local workspace", detail: "No sign-in or upload required" }}>
      <header className="hidden flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-5 lg:flex lg:px-8"><div className="flex items-center gap-2 text-xs text-muted-foreground"><BookOpen aria-hidden className="size-3.5" /><span>Kith</span><span aria-hidden>/</span><span>{section.label}</span></div><SearchTrigger label="Jump to a section" className="min-h-11" /></header>
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 lg:px-10 lg:pt-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div>{view === "overview" && <p className="eyebrow mb-3">Kith / release workspace</p>}<h1 ref={heading} tabIndex={-1} className="font-display text-3xl leading-tight outline-none sm:text-4xl">{section.label === "Overview" ? "Kith’s October release." : section.label}</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{section.description}</p></div>{view === "overview" && <Button variant="outline" onClick={() => navigate("assets")}>Browse release assets<ArrowRight /></Button>}</div>
        <div hidden={view !== "overview"}>
          <ProjectOverview name="Release readiness" description="An illustrative review workspace. Check off a task and follow the progress through the release." metrics={sampleMetrics} tasks={tasks} activity={sampleActivity} onTaskChange={(id, complete) => setTasks(current => current.map(task => task.id === id ? { ...task, complete } : task))} />
          <div className="mt-8 grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[1.1fr_1fr]">
            <ResponsiveImage src="./demo/kith/coastal-walk-v2.webp" alt="Kith’s illustrated coastal walk, part of the release artwork" width={760} height={460} loading="eager" className="h-full min-h-52" />
            <div className="flex flex-col items-start justify-center p-6 sm:p-8"><p className="eyebrow">The next chapter / Kith</p><h2 className="mt-4 font-display text-2xl leading-snug sm:text-3xl">Kith’s next chapter,<br />in context.</h2><p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">Preview the artwork and real app screens together before the next handoff.</p><Button variant="link" className="mt-4 px-0" asChild><a target="_top" href="./?path=/story/start-here-media--complete-page">Open the product story<ArrowUpRight /></a></Button></div>
          </div>

        </div>
        <div hidden={view !== "assets"}>
          <AssetLibrary showHeader={false} title="Release assets" description="The Kith artwork, screens and documents behind this release." state={{ kind: "ready", files }} onRemove={removeFiles}
            action={<><Button className="min-h-11" onClick={() => upload.current?.click()}><Upload />Add local files</Button><input ref={upload} type="file" multiple className="sr-only" aria-label="Add local files" onChange={event => {
              const additions = Array.from(event.target.files ?? []).map(file => {
                const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
                if (preview) objectUrls.current.add(preview);
                return { id: `local-${crypto.randomUUID()}`, name: file.name, kind: preview ? "image" as const : "document" as const, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, updated: "Just now", collection: "Local files", preview };
              });
              setFiles(current => [...current, ...additions]); setNotice(`${additions.length} local ${additions.length === 1 ? "file added" : "files added"}. No file contents leave this browser.`); event.target.value = "";
            }} /></>} />
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Preview, select, remove and restore. Images added from your device get a local preview. Nothing is uploaded.</p>
        </div>
        <div hidden={view !== "inbox"}><NotificationInbox messages={messages} onReadChange={(ids, read) => setMessages(current => current.map(message => ids.includes(message.id) ? { ...message, read } : message))} /></div>
        <div hidden={view !== "settings"}><WorkspaceSettings value={preferences} onValuesChange={setPreferences} onSave={async values => { await new Promise(resolve => setTimeout(resolve, 700)); if (rejectSave) throw new Error("The example save was interrupted. Your edits are still here. Try again when you’re ready."); setName(values.name); }} /></div>
        <div ref={noticeRef} tabIndex={-1} className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm outline-none" role="status" aria-live="polite"><span className="text-muted-foreground">{notice}</span>{removed.length > 0 && <Button variant="outline" size="sm" onClick={undoRemoval}><Undo2 />Undo removal</Button>}</div>
      </div>
    </AppShell>
    <SearchPalette sources={sources} placeholder="Find a workspace section…" emptyHint="Try “artwork”, “feedback” or “preferences”." onSelect={result => navigate(result.id)} />
  </div>;
}

export function WorkspaceFirstRun({ sourceAction }: { sourceAction?: ReactNode } = {}) {
  const [createdName, setCreatedName] = useState<string | null>(null);
  const [reject, setReject] = useState(false);
  const workspace = useRef<HTMLDivElement>(null);
  useEffect(() => { if (createdName) { window.scrollTo({ top: 0 }); workspace.current?.querySelector("h1")?.focus({ preventScroll: true }); } }, [createdName]);
  if (createdName) return <div ref={workspace}><p className="sr-only" role="status">Welcome to {createdName}. Your local example workspace is ready.</p><CompleteWorkspaceExample initialName={createdName} sourceAction={sourceAction} /></div>;
  return <div className="min-h-dvh bg-background">
    <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 sm:px-10"><span className="flex items-center gap-2.5 text-sm font-semibold"><BookOpen aria-hidden className="size-5 text-brand" />Kith Studio</span><div className="flex items-center gap-3 text-xs text-muted-foreground"><span>First run · local example</span>{sourceAction}</div></header>
    <main className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-5 py-7 sm:px-10 sm:py-14 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20 lg:py-20">
      <section className="min-w-0"><p className="eyebrow">A considered beginning</p><h1 className="mt-5 max-w-lg font-display text-4xl leading-[1.08] sm:text-5xl">Make room for<br /><em>the next chapter.</em></h1><p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">Bring Kith’s release artwork, notes and feedback into one workspace. Start with a name. The rest can take shape as you go.</p><ResponsiveImage src="./demo/kith/memory-table-v2.webp" alt="Kith’s illustrated memory book with a photograph and cup of coffee" width={760} height={570} className="mt-8 hidden rounded-2xl lg:block" imageClassName="object-contain" /><p className="mt-5 max-w-md text-xs leading-relaxed text-muted-foreground">An interactive library example with illustrative data. Creating a workspace here makes no account, starts no subscription, and sends nothing to a server.</p></section>
      <section aria-label="Workspace setup" className="mx-auto min-w-0 w-full max-w-[420px]"><MultiStepForm plans={[{ id: "personal", name: "Personal library", note: "A quiet place for your own work", price: "Local demo" }, { id: "studio", name: "Review together", note: "Explore the shared studio example", price: "Local demo" }]} onCreate={async () => { await new Promise(resolve => setTimeout(resolve, 650)); if (reject) throw new Error("Example interrupted"); }} onComplete={value => setCreatedName(value.name)} completeLabel="Open workspace" /><label className="mt-6 flex min-h-11 cursor-pointer items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={reject} onChange={event => setReject(event.target.checked)} />Simulate a connection failure</label><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Try going back, interrupting creation, or retrying. Your choices stay in place.</p></section>
    </main>
  </div>;
}
