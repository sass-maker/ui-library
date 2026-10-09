import * as React from "react";
import {
  ActivityIcon,
  BellIcon,
  ChartColumnIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  ListFilterIcon,
  MousePointerClickIcon,
  PlusIcon,
  ScrollTextIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppShell, PageHeader, StatCard, AreaChart, UptimeStrip, DotMap } from "@/components/blocks/app";
import { StatusPill } from "@/components/blocks/proof";

const hours = ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00", "Now"];
const views = [22, 18, 14, 12, 15, 28, 46, 71, 88, 96, 104, 92, 85, 99, 112, 108, 96, 84, 77, 69, 58, 44, 36, 31];
const events = [4, 3, 2, 2, 3, 6, 10, 16, 19, 22, 25, 21, 18, 23, 27, 25, 21, 18, 16, 14, 12, 9, 7, 6];

const topEvents = [
  { name: "signup.completed", count: 142, change: "+18%", status: "success" as const },
  { name: "waitlist.join", count: 61, change: "+6%", status: "success" as const },
  { name: "checkout.started", count: 34, change: "−4%", status: "neutral" as const },
  { name: "payment.failed", count: 9, change: "+3", status: "danger" as const },
  { name: "export.downloaded", count: 17, change: "+2", status: "neutral" as const },
];

const pages = [
  { path: "/", views: 611, share: 47 },
  { path: "/pricing", views: 248, share: 19 },
  { path: "/docs/install", views: 196, share: 15 },
  { path: "/blog/launch", views: 142, share: 11 },
  { path: "/changelog", views: 116, share: 8 },
];

const sources = [
  { name: "Direct", share: 41 },
  { name: "news.ycombinator.com", share: 23 },
  { name: "google.com", share: 18 },
  { name: "x.com", share: 11 },
  { name: "github.com", share: 7 },
];

const endpoints = [
  { route: "GET /api/health", p95: "42 ms", up: "100%", tone: "success" as const, label: "healthy" },
  { route: "POST /api/signup", p95: "180 ms", up: "99.9%", tone: "success" as const, label: "healthy" },
  { route: "POST /api/checkout", p95: "1.4 s", up: "98.7%", tone: "warning" as const, label: "slow" },
  { route: "POST /webhooks/stripe", p95: "—", up: "96.2%", tone: "danger" as const, label: "failing" },
];

type Day = "up" | "degraded" | "down";
const uptime = (bad: Record<number, Day>): Day[] => Array.from({ length: 90 }, (_, i) => bad[i] ?? "up");
const endpointsUptime = [
  { route: "GET /api/health", days: uptime({}), summary: "100% · p95 42 ms" },
  { route: "POST /api/signup", days: uptime({ 61: "degraded" }), summary: "99.9% · p95 180 ms" },
  { route: "POST /api/checkout", days: uptime({ 23: "degraded", 70: "degraded", 88: "degraded" }), summary: "98.7% · p95 1.4 s" },
  { route: "POST /webhooks/stripe", days: uptime({ 40: "down", 87: "degraded", 89: "down" }), summary: "96.2% · failing now" },
];
const sessions = [
  { x: 22, y: 33, size: 1.4 }, { x: 26, y: 38 }, { x: 18, y: 30 }, { x: 48, y: 25, size: 1.2 }, { x: 51, y: 22 },
  { x: 53, y: 30 }, { x: 71, y: 43, size: 1.3 }, { x: 80, y: 33 }, { x: 86, y: 70 }, { x: 31, y: 72 }, { x: 57, y: 60 }, { x: 77, y: 52 },
];

function Panel({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-border bg-card shadow-xs ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3.5">
        <h2 className="text-sm font-medium">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function BarList({ items }: { items: { name: string; share: number }[] }) {
  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((s) => (
        <li key={s.name} className="flex flex-col gap-1.5 text-sm">
          <span className="flex items-baseline justify-between gap-3">
            <span className="truncate">{s.name}</span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{s.share}%</span>
          </span>
          <span className="h-1.5 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-brand" style={{ width: `${s.share}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function AppHealthPage() {
  return (
    <AppShell
      brand={{
        name: "App Health",
        mark: (
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ActivityIcon className="size-4" />
          </span>
        ),
      }}
      nav={[
        {
          items: [
            { label: "Overview", href: "#", icon: <LayoutDashboardIcon />, active: true },
            { label: "Pages", href: "#", icon: <GlobeIcon /> },
            { label: "Events", href: "#", icon: <MousePointerClickIcon />, count: 263 },
            { label: "Sessions", href: "#", icon: <ChartColumnIcon />, count: 12 },
          ],
        },
        {
          title: "Reliability",
          items: [
            { label: "Endpoints", href: "#", icon: <ShieldCheckIcon /> },
            { label: "Logs", href: "#", icon: <ScrollTextIcon /> },
            { label: "Alerts", href: "#", icon: <BellIcon />, count: 1 },
          ],
        },
        { title: "Project", items: [{ label: "Settings", href: "#", icon: <SettingsIcon /> }] },
      ]}
      user={{ name: "Sarthak Agrawal", detail: "acme.app · owner" }}
    >
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            acme.app <StatusPill tone="success">collecting</StatusPill>
          </span>
        }
        description="Illustrative data · last 24 hours"
        actions={
          <>
            <div className="relative hidden sm:block">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search events" className="h-8 w-52 pl-8" />
            </div>
            <Button variant="outline" size="icon-sm" className="sm:hidden" aria-label="Search events">
              <SearchIcon />
            </Button>
            <Button variant="outline" size="sm">
              <ListFilterIcon /> Last 24h
            </Button>
            <Button size="sm">
              <PlusIcon /> Track event
            </Button>
          </>
        }
        tabs={[
          { label: "Overview", href: "#", active: true },
          { label: "Audience", href: "#" },
          { label: "Events", href: "#" },
          { label: "Health", href: "#" },
        ]}
      />

      <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xs md:p-8">
          <img src="/demo/app-health/art.webp" alt="" className="absolute inset-y-0 right-0 h-full w-full object-cover object-right opacity-90 [mask-image:linear-gradient(to_right,transparent_20%,black_70%)] md:w-3/4" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow mb-3">Today on acme.app</p>
              <p className="font-display text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] leading-[1.1]">
                Traffic is up 12%. Signups are healthy. <em>One webhook is failing.</em>
              </p>
              <p className="mt-3 text-sm text-muted-foreground">POST /webhooks/stripe has returned errors since 14:20; 9 deliveries failed. Checkout is slow but succeeding.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm">Open logs</Button>
              <Button size="sm" variant="brand">Investigate webhook</Button>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Page views" value="1,313" delta={{ value: "12%", direction: "up" }} trend={views} />
          <StatCard label="Named events" value="263" delta={{ value: "8%", direction: "up" }} trend={events} />
          <StatCard label="Active sessions" value="12" delta={{ value: "0", direction: "flat" }} hint="Browser sessions in the last 45 s" />
          <StatCard label="Failed webhooks" value="9" delta={{ value: "3", direction: "up", good: false }} hint="POST /webhooks/stripe since 14:20" />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel
            title="Traffic"
            className="xl:col-span-2"
            action={
              <div className="flex gap-1 rounded-md bg-muted p-0.5 text-xs">
                <span className="rounded bg-card px-2 py-1 font-medium shadow-xs">24h</span>
                <span className="px-2 py-1 text-muted-foreground">7d</span>
                <span className="px-2 py-1 text-muted-foreground">30d</span>
              </div>
            }
          >
            <AreaChart
              series={[
                { name: "Page views", values: views },
                { name: "Named events", values: events },
              ]}
              labels={hours}
              height={250}
            />
          </Panel>
          <Panel title="Live sessions" action={<span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground"><span className="size-1.5 animate-pulse rounded-full bg-brand" />12 now</span>}>
            <DotMap points={sessions} />
            <div className="mt-5 border-t border-hairline pt-4">
              <p className="mb-3 text-xs text-muted-foreground">Devices</p>
              <div className="flex h-2 overflow-hidden rounded-full">
                <span className="bg-chart-1" style={{ width: "58%" }} />
                <span className="bg-chart-2" style={{ width: "36%" }} />
                <span className="bg-chart-3" style={{ width: "6%" }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-1" />Desktop 58%</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-2" />Mobile 36%</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-3" />Tablet 6%</span>
              </div>
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Endpoint health · 90 days" action={<StatusPill tone="danger">1 failing</StatusPill>}>
            <div className="flex flex-col gap-5">
              {endpointsUptime.map((e) => (
                <UptimeStrip key={e.route} label={e.route} days={e.days} summary={e.summary} />
              ))}
            </div>
          </Panel>
          <Panel title="Top events" action={<Button variant="ghost" size="sm">View all</Button>}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topEvents.map((e) => (
                  <TableRow key={e.name}>
                    <TableCell>
                      <span className="flex items-center gap-2 font-mono text-[0.8125rem]">
                        <span className={`size-1.5 rounded-full ${e.status === "danger" ? "bg-destructive" : e.status === "success" ? "bg-success" : "bg-muted-foreground/50"}`} />
                        {e.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {e.count}
                      <span className="block font-mono text-[0.6875rem] text-muted-foreground sm:hidden">{e.change}</span>
                    </TableCell>
                    <TableCell className="hidden text-right font-mono text-xs text-muted-foreground sm:table-cell">{e.change}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title="Top pages" className="xl:col-span-2">
            <ul className="flex flex-col gap-1">
              {pages.map((p) => (
                <li key={p.path} className="grid grid-cols-[minmax(6rem,10rem)_1fr_3rem] items-center gap-4 rounded-md px-2 py-2 text-sm hover:bg-accent">
                  <span className="truncate font-mono text-[0.8125rem]">{p.path}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${p.share * 2}%` }} />
                  </span>
                  <span className="text-right tabular-nums text-muted-foreground">{p.views}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Referral sources">
            <BarList items={sources} />
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
