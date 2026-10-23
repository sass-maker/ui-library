"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CheckCheck, Inbox, Mail, MailOpen } from "lucide-react";
import { Button } from "../components/button";
import { Badge } from "../components/badge";
import { SearchField } from "../molecules/search-field";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { motionTiming } from "../lib/motion";
import { cn } from "../lib/utils";

export type InboxMessage = {
  id: string;
  sender: string;
  initials: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  read: boolean;
};

export function NotificationInbox({ messages, onReadChange, className }: {
  messages: readonly InboxMessage[];
  onReadChange: (ids: string[], read: boolean) => void;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const focusMessage = useCallback((element: HTMLHeadingElement | null) => { element?.focus({ preventScroll: true }); }, []);
  const rows = useRef(new Map<string, HTMLButtonElement>());
  const previous = useRef<string | null>(null);
  useEffect(() => { if (!selected && previous.current) rows.current.get(previous.current)?.focus({ preventScroll: true }); previous.current = selected; }, [selected]);
  const current = messages.find(message => message.id === selected);
  const unread = messages.filter(message => !message.read).length;
  const visible = messages.filter(message => (filter === "all" || !message.read) && `${message.sender} ${message.subject}`.toLowerCase().includes(query.toLowerCase()));
  return <section className={cn("overflow-hidden rounded-2xl border border-border bg-card text-card-foreground", className)} aria-label="Team inbox">
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-6 sm:px-7">
      <div><div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><Inbox aria-hidden className="size-3.5" />Workspace / Inbox</div><div className="flex items-center gap-3"><h2 className="text-2xl font-semibold tracking-tight">Inbox</h2>{unread > 0 && <Badge variant="secondary">{unread} unread</Badge>}</div></div>
      <Button variant="outline" size="sm" disabled={unread === 0} onClick={() => onReadChange(messages.filter(message => !message.read).map(message => message.id), true)}><CheckCheck />Mark all read</Button>
    </header>
    <div className="grid min-h-[460px] md:grid-cols-[minmax(280px,0.9fr)_1.1fr]">
      <div className={cn("min-w-0 border-border md:border-r", current && "hidden md:block")}>
        <div className="space-y-4 border-b border-border p-5"><SearchField label="Search messages" placeholder="Search messages…" value={query} onValueChange={setQuery} />
          <div className="flex gap-4 text-[0.8125rem]" aria-label="Message filter">{(["all", "unread"] as const).map(value => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={cn("rounded-sm py-1 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring", filter === value ? "text-foreground" : "text-muted-foreground")}>{value === "all" ? "All messages" : "Unread"}{value === "unread" && <span className="ml-1.5 tabular-nums text-muted-foreground">{unread}</span>}</button>)}</div>
        </div>
        <ul className="divide-y divide-border" aria-label="Messages"><AnimatePresence initial={false}>
          {visible.map(message => <motion.li key={message.id} layout={!reduced ? "position" : false} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={motionTiming.feedback}>
            <button ref={element => { if (element) rows.current.set(message.id, element); else rows.current.delete(message.id); }} type="button" aria-pressed={message.id === selected} onClick={() => { setSelected(message.id); if (!message.read) onReadChange([message.id], true); }} className={cn("group/message flex w-full gap-3 px-5 py-5 text-left outline-none transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring", message.id === selected && "bg-accent/60")}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs font-medium">{message.initials}</span>
              <span className="min-w-0 flex-1"><span className="flex items-baseline justify-between gap-2"><span className="truncate text-[0.8125rem] font-medium">{message.sender}</span><span className="shrink-0 text-[0.6875rem] text-muted-foreground">{message.time}</span></span>
                <span className="mt-1 flex items-center gap-2 text-sm font-medium">{!message.read && <span className="size-1.5 shrink-0 rounded-full bg-brand" aria-label="Unread" />}<span className="truncate">{message.subject}</span></span>
                <span className="mt-1.5 block truncate text-[0.8125rem] leading-relaxed text-muted-foreground">{message.preview}</span></span>
            </button>
          </motion.li>)}
        </AnimatePresence></ul>
        {visible.length === 0 && <div className="grid min-h-56 place-content-center gap-3 p-6 text-center"><Inbox aria-hidden className="mx-auto size-8 stroke-1 text-muted-foreground" /><p className="text-sm font-medium">{query ? "No messages found." : "You’re all caught up."}</p><p className="text-xs text-muted-foreground">{query ? "Try another name or subject." : "New messages will appear here."}</p></div>}
      </div>
      <div className={cn("min-w-0", !current && "hidden md:block")}>
        <AnimatePresence initial={false} mode="wait">
          {current ? <motion.article key={current.id} initial={{ opacity: 0, y: reduced ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={motionTiming.content} className="p-5 sm:p-7">
            <div className="mb-7 flex items-center justify-between gap-3"><Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelected(null)}><ArrowLeft />Inbox</Button><span className="hidden text-xs text-muted-foreground md:block">Message details</span>
              <Button variant="ghost" size="sm" onClick={() => onReadChange([current.id], !current.read)}>{current.read ? <Mail /> : <MailOpen />}{current.read ? "Mark unread" : "Mark read"}</Button></div>
            <h3 ref={focusMessage} tabIndex={-1} className="text-xl font-semibold leading-snug tracking-tight outline-none">{current.subject}</h3><p className="mt-3 text-xs text-muted-foreground">{current.sender} <span aria-hidden>·</span> {current.time}</p>
            <div className="mt-7 whitespace-pre-line text-sm leading-[1.75]">{current.body}</div>
          </motion.article> : <motion.div key="empty" className="flex min-h-[460px] flex-col items-center justify-center gap-3 p-8 text-center"><MailOpen aria-hidden className="mb-2 size-10 stroke-1 text-muted-foreground" /><h3 className="font-medium">Choose a message</h3><p className="max-w-60 text-sm leading-relaxed text-muted-foreground">Read updates and review feedback from your team.</p></motion.div>}
        </AnimatePresence>
      </div>
    </div>
  </section>;
}
