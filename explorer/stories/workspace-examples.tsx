import { motion } from "motion/react";
import { useReducedMotion } from "@saas-maker/ui/lib/use-reduced-motion";
import { motionTiming } from "@saas-maker/ui/lib/motion";
import { useEffect, useMemo, useRef, useState, useId, type Dispatch, type FormEvent, type RefObject, type SetStateAction, type ReactNode } from "react";
import { Check, PencilLine, ArrowRight, ArrowUpRight, BookOpen, FolderOpen, Inbox, LayoutDashboard, Settings2, Upload, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@saas-maker/ui/atoms/button";
import { ResponsiveImage } from "@saas-maker/ui/atoms/responsive-image";
import { AppShell } from "@saas-maker/ui/blocks/app";
import { SearchPalette, SearchTrigger } from "@saas-maker/ui/blocks/search-palette";
import { MultiStepForm } from "@saas-maker/ui/recipes/multi-step-form";
import { AssetLibrary } from "@saas-maker/ui/organisms/asset-library";
import { WorkspaceSettings } from "@saas-maker/ui/organisms/workspace-settings";
import { NotificationInbox } from "@saas-maker/ui/organisms/notification-inbox";
import { ProjectOverview } from "@saas-maker/ui/organisms/project-overview";
import { sampleFiles, samplePreferences, sampleMessages, sampleTasks } from "./composition-fixtures";
import { Badge } from "@saas-maker/ui/atoms/badge";
import { Label } from "@saas-maker/ui/atoms/label";
import { Textarea } from "@saas-maker/ui/atoms/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@saas-maker/ui/molecules/dialog";
import * as Carousel from "@saas-maker/ui/recipes/carousel";
import type { LibraryFile } from "@saas-maker/ui/molecules/file-card";
import type { InboxMessage } from "@saas-maker/ui/organisms/notification-inbox";
import type { ActivityEntry } from "@saas-maker/ui/molecules/activity-item";
import type { ProjectTask } from "@saas-maker/ui/organisms/project-overview";
import type { MetricCardProps } from "@saas-maker/ui/molecules/metric-card";

type ReviewStatus = "approved" | "changes" | "pending";
type ReviewItem = { file: LibraryFile; src: string; alt: string; width: number; height: number; fit: "cover" | "contain"; status: ReviewStatus };
type ReviewUndo = { taskId: string; complete: boolean; messageIds: string[]; activityIds: string[] };

/** The release artwork under review. Artwork is cropped to the card; the app screen stays whole. */
const reviewTargets: readonly { id: string; alt: string; width: number; height: number; fit: "cover" | "contain" }[] = [
  { id: "coast", alt: "Kith’s illustrated coastal walk: two people on a path above the sea", width: 760, height: 790, fit: "cover" },
  { id: "memory", alt: "Kith artwork of a memory book, a coastal photograph and a cup of coffee", width: 760, height: 507, fit: "cover" },
  { id: "sky", alt: "Kith’s constellation screen, with people shown as warm lanterns", width: 603, height: 1311, fit: "contain" },
];
const reviewStatusLabel: Record<ReviewStatus, string> = { approved: "Approved", changes: "Changes requested", pending: "Awaiting review" };
/** A review note carries its file in the message ID, so “changes requested” is derived from the inbox. */
const reviewMessagePrefix = (fileId: string) => `review-${fileId}-`;

function reviewActivity(kind: ActivityEntry["kind"], action: string, subject: string): ActivityEntry {
  return { id: `review-activity-${crypto.randomUUID()}`, kind, actor: "You", action, subject, time: "Just now", dateTime: new Date().toISOString() };
}

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <Badge variant={status === "approved" ? "secondary" : "outline"} className={status === "changes" ? "border-brand-ink/40 text-brand-ink" : status === "pending" ? "text-muted-foreground" : undefined}>
    {status === "approved" && <Check aria-hidden />}{reviewStatusLabel[status]}
  </Badge>;
}

function ReviewCard({ item, onApprove, onRequestChanges }: {
  item: ReviewItem;
  onApprove: (file: LibraryFile) => void;
  onRequestChanges: (file: LibraryFile, opener: HTMLButtonElement) => void;
}) {
  const titleId = useId();
  const { file, status } = item;
  const approved = status === "approved";
  return <article aria-labelledby={titleId} className="@container/review-card flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
    <ResponsiveImage src={item.src} alt={item.alt} width={item.width} height={item.height} focalPoint={file.previewFocalPoint} style={{ aspectRatio: "4 / 3" }}
      className={item.fit === "contain" ? "bg-surface" : undefined} imageClassName={item.fit === "contain" ? "object-contain py-3" : undefined} />
    <div className="flex flex-1 flex-col gap-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2"><h4 id={titleId} className="min-w-0 break-words text-sm font-medium leading-snug">{file.name}</h4><ReviewStatusBadge status={status} /></div>
      <p className="text-xs text-muted-foreground">{file.collection} · {file.size}</p>
      <div className="mt-auto grid grid-cols-1 gap-2 pt-2 @min-[360px]/review-card:grid-cols-[auto_1fr]">
        <Button variant={approved ? "secondary" : "default"} aria-disabled={approved || undefined} aria-label={`${approved ? "Approved" : "Approve"} ${file.name}`} className="min-h-11 min-w-0 w-full whitespace-normal aria-disabled:cursor-default" onClick={() => { if (!approved) onApprove(file); }}><Check />{approved ? "Approved" : "Approve"}</Button>
        <Button variant="outline" aria-label={`Request changes to ${file.name}`} className="min-h-11 min-w-0 w-full whitespace-normal" onClick={event => onRequestChanges(file, event.currentTarget)}><PencilLine />Request changes</Button>
      </div>
    </div>
  </article>;
}

function ReleaseReviewFocus({ items, notice, canUndo, noticeRef, onApprove, onRequestChanges, onUndo }: {
  items: readonly ReviewItem[];
  notice: string;
  canUndo: boolean;
  noticeRef: RefObject<HTMLParagraphElement | null>;
  onApprove: (file: LibraryFile) => void;
  onRequestChanges: (file: LibraryFile, opener: HTMLButtonElement) => void;
  onUndo: () => void;
}) {
  const headingId = useId();
  const open = items.filter(item => item.status !== "approved").length;
  return <section aria-labelledby={headingId} className="@container">
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <h3 id={headingId} className="font-display text-xl leading-tight">Waiting for your review</h3>
      <p className="text-sm text-muted-foreground">{items.length === 0 ? "No release artwork is in this workspace." : open === 0 ? "Every image is approved." : `${open} of ${items.length} images still need a decision.`}</p>
    </div>
    {items.length > 0 && <Carousel.Carousel label="Artwork waiting for review">
      {/* Each slide's right padding is the gap; the viewport bleeds by the same amount so the last card meets the edge. */}
      <Carousel.CarouselContent viewportClassName="-mr-3 rounded-none">
        {items.map(item => <Carousel.CarouselItem key={item.file.id} label={item.file.name} className="w-[85%] pr-3 @min-[700px]:w-1/3"><ReviewCard item={item} onApprove={onApprove} onRequestChanges={onRequestChanges} /></Carousel.CarouselItem>)}
      </Carousel.CarouselContent>
      <div className="mt-3 flex min-h-11 @min-[700px]:min-h-0 flex-wrap items-center justify-between gap-3">
        <p ref={noticeRef} tabIndex={-1} role="status" className="min-w-0 flex-1 text-sm text-muted-foreground outline-none">{notice}</p>
        <div className="ml-auto flex items-center gap-3">{canUndo && <Button variant="outline" className="min-h-11" onClick={onUndo}><Undo2 />Undo</Button>}<Carousel.CarouselNavigation className="static inset-auto w-auto translate-y-0 gap-2 p-0 @min-[700px]:hidden" /></div>
      </div>
    </Carousel.Carousel>}
    {items.length === 0 && <p ref={noticeRef} tabIndex={-1} role="status" className="text-sm text-muted-foreground outline-none">{notice}</p>}
  </section>;
}

function ReviewNoteDialog({ open, file, note, invalid, onNoteChange, onSubmit, onClose, onRestoreFocus }: {
  open: boolean;
  file: LibraryFile | null;
  note: string;
  invalid: boolean;
  onNoteChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
  onRestoreFocus: () => void;
}) {
  const id = useId();
  const field = useRef<HTMLTextAreaElement>(null);
  return <Dialog open={open} onOpenChange={next => { if (!next) onClose(); }}>
    <DialogContent onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus(); }}>
      <form noValidate className="grid gap-5" onSubmit={event => { onSubmit(event); if (!note.trim()) field.current?.focus(); }}>
        <DialogHeader><DialogTitle className="font-display">Request changes</DialogTitle><DialogDescription>Describe what should change in {file?.name ?? "this image"}. The note is added to this example’s inbox.</DialogDescription></DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-note`}>What should change?</Label>
          <Textarea ref={field} id={`${id}-note`} required rows={4} value={note} onChange={event => onNoteChange(event.target.value)} aria-invalid={invalid || undefined} aria-describedby={`${id}-hint`} className="min-h-28" />
          <p id={`${id}-hint`} className={invalid ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>{invalid ? "Add a note before saving." : "Saved in this browser only. Nothing is sent."}</p>
        </div>
        <DialogFooter><Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Cancel</Button><Button type="submit" className="min-h-11">Save note</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

/** Local release review: approve or request changes on the artwork, with one reversible step. */
function useReleaseReview(files: readonly LibraryFile[], messages: InboxMessage[], setMessages: Dispatch<SetStateAction<InboxMessage[]>>) {
  const [tasks, setTasks] = useState<ProjectTask[]>(sampleTasks);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [undo, setUndo] = useState<ReviewUndo | null>(null);
  const [notice, setNotice] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requested, setRequested] = useState<LibraryFile | null>(null);
  const [note, setNote] = useState("");
  const [noteInvalid, setNoteInvalid] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);

  const visibleTasks = tasks.filter(task => files.some(file => file.id === task.id));
  const items = reviewTargets.flatMap((target): ReviewItem[] => {
    const file = files.find(candidate => candidate.id === target.id);
    const task = tasks.find(candidate => candidate.id === target.id);
    if (!file?.preview || file.kind !== "image" || !task) return [];
    const changes = messages.some(message => message.id.startsWith(reviewMessagePrefix(file.id)));
    return [{ file, src: file.preview, alt: target.alt, width: target.width, height: target.height, fit: file.previewFit ?? target.fit, status: task.complete ? "approved" : changes ? "changes" : "pending" }];
  });
  const approved = items.filter(item => item.status === "approved").length;
  const changes = items.filter(item => item.status === "changes").length;
  const unread = messages.filter(message => !message.read).length;
  const metrics: MetricCardProps[] = [
    { label: "Approved", value: `${approved}/${items.length}`, detail: "Release images" },
    { label: "Needs changes", value: String(changes), detail: "Images to revise" },
    { label: "Unread", value: String(unread), detail: "Inbox messages" },
  ];

  const remember = (next: ReviewUndo, message: string) => { setUndo(next); setNotice(message); };
  const approve = (file: LibraryFile) => {
    const task = tasks.find(candidate => candidate.id === file.id);
    if (!task || task.complete) return;
    const entry = reviewActivity("completed", "approved", file.name);
    setTasks(current => current.map(candidate => candidate.id === file.id ? { ...candidate, complete: true } : candidate));
    setActivity(current => [entry, ...current]);
    remember({ taskId: file.id, complete: task.complete, messageIds: [], activityIds: [entry.id] }, `Approved ${file.name}.`);
  };
  const openRequest = (file: LibraryFile, button: HTMLButtonElement) => {
    opener.current = button;
    setRequested(file); setNote(""); setNoteInvalid(false); setDialogOpen(true);
  };
  const closeRequest = () => { setDialogOpen(false); setNoteInvalid(false); };
  const saveRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = note.trim();
    if (!requested) return;
    if (!text) { setNoteInvalid(true); return; }
    const file = requested;
    const task = tasks.find(candidate => candidate.id === file.id);
    const message: InboxMessage = { id: `${reviewMessagePrefix(file.id)}${crypto.randomUUID()}`, sender: "You", initials: "YO", subject: `Changes requested: ${file.name}`, preview: text.replace(/\s+/g, " "), body: `${text}

Note on ${file.name} from the release review.`, time: "Just now", read: true };
    const entry = reviewActivity("comment", "requested changes to", file.name);
    setTasks(current => current.map(candidate => candidate.id === file.id ? { ...candidate, complete: false } : candidate));
    setMessages(current => [message, ...current]);
    setActivity(current => [entry, ...current]);
    remember({ taskId: file.id, complete: task?.complete ?? false, messageIds: [message.id], activityIds: [entry.id] }, `Changes requested for ${file.name}. Your note is in the inbox.`);
    closeRequest();
  };
  /** Reverses only the last review step; other read states and files are untouched. */
  const undoLast = () => {
    if (!undo) return;
    setTasks(current => current.map(task => task.id === undo.taskId ? { ...task, complete: undo.complete } : task));
    if (undo.messageIds.length) setMessages(current => current.filter(message => !undo.messageIds.includes(message.id)));
    setActivity(current => current.filter(entry => !undo.activityIds.includes(entry.id)));
    setUndo(null);
    setNotice("Review step undone.");
    noticeRef.current?.focus({ preventScroll: true });
  };
  const onTaskChange = (id: string, complete: boolean) => {
    setTasks(current => current.map(task => task.id === id ? { ...task, complete } : task));
    if (undo?.taskId === id) { setUndo(null); setNotice(""); }
  };
  const reset = () => {
    closeRequest();
    setTasks(sampleTasks); setActivity([]); setUndo(null); setNotice("");
  };

  const focus = <>
    <ReleaseReviewFocus items={items} notice={notice} canUndo={undo !== null} noticeRef={noticeRef} onApprove={approve} onRequestChanges={openRequest} onUndo={undoLast} />
    <ReviewNoteDialog open={dialogOpen} file={requested} note={note} invalid={noteInvalid}
      onNoteChange={value => { setNote(value); if (value.trim()) setNoteInvalid(false); }}
      onSubmit={saveRequest} onClose={closeRequest} onRestoreFocus={() => opener.current?.focus({ preventScroll: true })} />
  </>;
  return { tasks: visibleTasks, metrics, activity, onTaskChange, focus, reset };
}

export function AssetLibraryExample({ library }: { library?: [LibraryFile[], Dispatch<SetStateAction<LibraryFile[]>>] } = {}) {
  const localLibrary = useState(sampleFiles);
  const [files, setFiles] = library ?? localLibrary;
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


export function ProjectOverviewExample({ variant = "card", inbox, files = sampleFiles }: { variant?: "card" | "plain"; inbox?: [InboxMessage[], Dispatch<SetStateAction<InboxMessage[]>>]; files?: readonly LibraryFile[] } = {}) {
  const localInbox = useState(sampleMessages);
  const [messages, setMessages] = inbox ?? localInbox;
  const review = useReleaseReview(files, messages, setMessages);
  return <ProjectOverview variant={variant} name="Kith’s October release" eyebrow="Kith / October release" badge={null} description="Review the artwork and leave a clear next step for the release."
    focus={review.focus} metrics={review.metrics} tasks={review.tasks} activity={review.activity} onTaskChange={review.onTaskChange} />;
}

/** A connected, local workspace built from the organisms shown separately. */
export function CompleteWorkspaceExample({ sourceAction, initialName = samplePreferences.name }: { sourceAction?: ReactNode; initialName?: string } = {}) {
  const reduced = useReducedMotion();
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
  const review = useReleaseReview(files, messages, setMessages);
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
    setFiles(sampleFiles); setRemoved([]); setMessages(sampleMessages); review.reset();
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
      user={{ name: "Your local workspace", detail: "No sign-in needed" }}>
      <header className="hidden flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-5 lg:flex lg:px-8"><div className="flex items-center gap-2 text-xs text-muted-foreground"><BookOpen aria-hidden className="size-3.5" /><span>Kith</span><span aria-hidden>/</span><span>{section.label}</span></div><SearchTrigger label="Jump to a section" className="min-h-11" /></header>
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-7 sm:px-8 lg:px-10 lg:pt-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><h1 ref={heading} tabIndex={-1} className="font-display text-3xl leading-tight outline-none sm:text-4xl">{section.label === "Overview" ? "Kith’s October release." : section.label}</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{section.description}</p></div>{view === "overview" && <Button variant="outline" onClick={() => navigate("assets")}>Browse release assets<ArrowRight /></Button>}</div>
        <motion.div data-slot="workspace-panel" hidden={view !== "overview"} initial={false} animate={{ opacity: reduced || view === "overview" ? 1 : 0, y: reduced || view === "overview" ? 0 : 6 }} transition={reduced ? { duration: 0 } : motionTiming.content}>
          <ProjectOverview variant="plain" showHeader={false} name="Release readiness" description="Review the release artwork." focus={review.focus} metrics={review.metrics} tasks={review.tasks} activity={review.activity} onTaskChange={review.onTaskChange} />
          <div className="mt-8 grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-[1.1fr_1fr]">
            <ResponsiveImage src="./demo/kith/book-stage.webp" alt="Kith’s illustrated memory book, part of the release artwork" width={760} height={507} loading="eager" className="h-full min-h-52 w-full min-w-0" />
            <div className="flex flex-col items-start justify-center p-6 sm:p-8"><p className="eyebrow">The next chapter / Kith</p><h2 className="mt-4 font-display text-2xl leading-snug sm:text-3xl">Kith’s next chapter,<br />in context.</h2><p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">Preview the artwork and real app screens together before the next handoff.</p><Button variant="link" className="mt-4 px-0" asChild><a target="_top" href="./?path=/story/start-here-media--complete-page">Open the product story<ArrowUpRight /></a></Button></div>
          </div>

        </motion.div>
        <motion.div data-slot="workspace-panel" hidden={view !== "assets"} initial={false} animate={{ opacity: reduced || view === "assets" ? 1 : 0, y: reduced || view === "assets" ? 0 : 6 }} transition={reduced ? { duration: 0 } : motionTiming.content}>
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
        </motion.div>
        <motion.div data-slot="workspace-panel" hidden={view !== "inbox"} initial={false} animate={{ opacity: reduced || view === "inbox" ? 1 : 0, y: reduced || view === "inbox" ? 0 : 6 }} transition={reduced ? { duration: 0 } : motionTiming.content}><NotificationInbox showHeader={false} messages={messages} onReadChange={(ids, read) => setMessages(current => current.map(message => ids.includes(message.id) ? { ...message, read } : message))} /></motion.div>
        <motion.div data-slot="workspace-panel" hidden={view !== "settings"} initial={false} animate={{ opacity: reduced || view === "settings" ? 1 : 0, y: reduced || view === "settings" ? 0 : 6 }} transition={reduced ? { duration: 0 } : motionTiming.content}><WorkspaceSettings showHeader={false} value={preferences} onValuesChange={setPreferences} onSave={async values => { await new Promise(resolve => setTimeout(resolve, 700)); if (rejectSave) throw new Error("The example save was interrupted. Your edits are still here. Try again when you’re ready."); setName(values.name); }} /></motion.div>
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
      <section aria-label="Workspace setup" className="mx-auto min-w-0 w-full max-w-[420px]"><MultiStepForm anchor="start" plans={[{ id: "personal", name: "Personal library", note: "A quiet place for your own work", price: "Local demo" }, { id: "studio", name: "Review together", note: "Explore the shared studio example", price: "Local demo" }]} onCreate={async () => { await new Promise(resolve => setTimeout(resolve, 650)); if (reject) throw new Error("Example interrupted"); }} onComplete={value => setCreatedName(value.name)} completeLabel="Open workspace" /><label className="mt-6 flex min-h-11 cursor-pointer items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={reject} onChange={event => setReject(event.target.checked)} />Simulate a connection failure</label><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Try going back, interrupting creation, or retrying. Your choices stay in place.</p></section>
    </main>
  </div>;
}
