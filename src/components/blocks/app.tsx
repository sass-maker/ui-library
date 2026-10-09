import * as React from "react";
import { cn } from "@/lib/utils";

export type NavItem = { label: string; href: string; icon?: React.ReactNode; active?: boolean; count?: number };

/**
 * Internal-tool shell: sidebar on desktop, top bar with a native-popover
 * drawer on phones. Server-rendered, no client JavaScript.
 */
export function AppShell({
  brand,
  nav,
  secondary,
  user,
  children,
}: {
  brand: { name: string; mark?: React.ReactNode };
  nav: { title?: string; items: NavItem[] }[];
  secondary?: React.ReactNode;
  user?: { name: string; detail?: string };
  children: React.ReactNode;
}) {
  const navList = (
    <nav aria-label="App" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {nav.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-0.5">
          {group.title && <p className="px-2.5 pb-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">{group.title}</p>}
          {group.items.map((it) => (
            <a
              key={it.href + it.label}
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              className={cn(
                "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[0.8125rem] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground",
                it.active && "bg-sidebar-accent font-medium text-sidebar-foreground [&_svg]:text-brand",
              )}
            >
              {it.icon}
              <span className="truncate">{it.label}</span>
              {it.count !== undefined && <span className="ml-auto font-mono text-[0.6875rem] tabular-nums text-muted-foreground">{it.count}</span>}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
  const brandRow = (
    <div className="flex h-14 items-center gap-2.5 px-5">
      {brand.mark}
      <span className="text-sm font-semibold tracking-[-0.01em]">{brand.name}</span>
    </div>
  );
  const userRow = user && (
    <div className="flex items-center gap-2.5 border-t border-sidebar-border px-5 py-3.5">
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-soft text-[0.6875rem] font-semibold text-brand">
        {user.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)}
      </span>
      <span className="min-w-0 text-xs">
        <span className="block truncate font-medium text-foreground">{user.name}</span>
        {user.detail && <span className="block truncate text-muted-foreground">{user.detail}</span>}
      </span>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        {brandRow}
        {navList}
        {secondary && <div className="px-3 pb-3">{secondary}</div>}
        {userRow}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2.5">
            {brand.mark}
            <span className="text-sm font-semibold">{brand.name}</span>
          </div>
          <button type="button" popoverTarget="app-drawer" aria-label="Open navigation" className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <div
            id="app-drawer"
            popover="auto"
            className="fixed inset-y-0 left-0 m-0 h-dvh w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar p-0 text-foreground shadow-xl backdrop:bg-black/30 [&:popover-open]:flex"
          >
            {brandRow}
            {navList}
            {userRow}
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  tabs,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  tabs?: { label: string; href: string; active?: boolean }[];
}) {
  return (
    <header className="border-b border-border">
      <div className="flex flex-col gap-4 px-4 pb-5 pt-7 sm:flex-row sm:items-end sm:justify-between md:px-8">
        <div className="min-w-0">
          <h1 className="font-display text-[1.75rem]">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {tabs && (
        <nav aria-label="Sections" className="-mb-px flex gap-5 overflow-x-auto px-4 md:px-8">
          {tabs.map((t) => (
            <a
              key={t.href}
              href={t.href}
              aria-current={t.active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap border-b-2 border-transparent pb-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
                t.active && "border-foreground font-medium text-foreground",
              )}
            >
              {t.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

/** Points to an SVG polyline path in a 0..w × 0..h box. */
function toPath(values: number[], w: number, h: number, pad = 2) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
}

function smooth(points: readonly (readonly [number, number])[]) {
  return points.reduce((d, [x, y], i, a) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = a[i - 1];
    const cx = (px + x) / 2;
    return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");
}

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 120;
  const h = 32;
  const pts = toPath(values, w, h);
  const line = smooth(pts);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-8 w-full overflow-visible", className)} aria-hidden>
      <path d={`${line} L${w},${h} L0,${h} Z`} className="fill-brand/10" />
      <path d={line} className="fill-none stroke-brand" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  delta,
  trend,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; direction: "up" | "down" | "flat"; good?: boolean };
  trend?: number[];
  hint?: string;
}) {
  const good = delta?.good ?? delta?.direction === "up";
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.8125rem] text-muted-foreground">{label}</p>
        {delta && (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 font-mono text-[0.6875rem] tabular-nums",
              delta.direction === "flat" ? "bg-muted text-muted-foreground" : good ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
            )}
          >
            {delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "→"} {delta.value}
          </span>
        )}
      </div>
      <p className="font-display text-[2rem] tabular-nums">{value}</p>
      {trend && <Sparkline values={trend} />}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * Static area chart with gridlines. The plot scales with its container; axis
 * labels are HTML so they stay readable at phone width.
 */
export function AreaChart({
  series,
  labels,
  height = 220,
  className,
}: {
  series: { name: string; values: number[]; color?: string }[];
  labels: string[];
  height?: number;
  className?: string;
}) {
  const w = 800;
  const h = 200;
  const max = Math.max(...series.flatMap((s) => s.values)) * 1.15;
  const ticks = 4;
  const colorOf = (s: { color?: string }, i: number) => s.color ?? `var(--chart-${i + 1})`;
  return (
    <figure className={cn("w-full", className)}>
      <div className="relative ml-9" style={{ height }}>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
          {Array.from({ length: ticks + 1 }, (_, i) => (
            <div key={i} className={cn("relative border-t border-dashed border-border", i === ticks && "border-solid")}>
              <span className="absolute -left-9 -top-2 w-7 text-right font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
                {Math.round(max - (i / ticks) * max).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" role="img" aria-label={series.map((s) => s.name).join(" and ") + " over time"}>
          {series.map((s, si) => {
            const pts = s.values.map((v, i) => [(i / (s.values.length - 1)) * w, h - (v / max) * h] as const);
            const line = smooth(pts);
            return (
              <g key={s.name}>
                <defs>
                  <linearGradient id={`area-${si}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={colorOf(s, si)} stopOpacity={0.24} />
                    <stop offset="100%" stopColor={colorOf(s, si)} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#area-${si})`} />
                <path d={line} fill="none" stroke={colorOf(s, si)} strokeWidth={2} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="ml-9 mt-2 flex justify-between font-mono text-[0.6875rem] text-muted-foreground">
        {labels.map((l, i) => (
          <span key={l + i} className={cn(i % 2 === 1 && "hidden sm:inline")}>
            {l}
          </span>
        ))}
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {series.map((s, si) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: colorOf(s, si) }} />
            {s.name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function EmptyState({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
      {icon && <span className="inline-flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-5">{icon}</span>}
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/**
 * Status-page uptime strip: one bar per day, colored by health. Server-rendered.
 */
export function UptimeStrip({
  days,
  label,
  summary,
}: {
  /** One entry per day, oldest first. */
  days: ("up" | "degraded" | "down")[];
  label: string;
  summary?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-mono text-[0.8125rem]">{label}</span>
        {summary && <span className="font-mono text-xs tabular-nums text-muted-foreground">{summary}</span>}
      </div>
      <div className="flex h-7 gap-[2px]" role="img" aria-label={`${label}: ${summary ?? ""}`}>
        {days.map((d, i) => (
          <span
            key={i}
            className={cn(
              "flex-1 rounded-[2px]",
              d === "up" && "bg-success/80",
              d === "degraded" && "bg-warning",
              d === "down" && "bg-destructive",
              // keep 30 bars on phones
              i < days.length - 30 && "hidden sm:block",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Dotted world map with live points. Coordinates are percentages of the plate. */
export function DotMap({ points, className }: { points: { x: number; y: number; size?: number; label?: string }[]; className?: string }) {
  // A coarse land mask, row by row (40 columns × 18 rows); '#' is land.
  const rows = [
    "........................................",
    "......###.##........######...........##.",
    "....##########.....#########.#######.##.",
    "..#############...####.###############..",
    "...###########....##############.#####..",
    "....#########......##############.###...",
    ".....#######.......#########.#####......",
    "......#####........##########..###......",
    ".......###..........########...##.......",
    "........###..........######.....#.......",
    "........#####........#####......##......",
    ".........######......####........#.##...",
    "..........#####.......###.........####..",
    "..........####........##.........######.",
    "...........##.........#...........####..",
    "...........#.......................##...",
    "........................................",
    "........................................",
  ];
  return (
    <figure className={cn("relative", className)}>
      <svg viewBox="0 0 400 180" className="w-full" aria-hidden>
        {rows.flatMap((r, y) =>
          [...r].map((c, x) =>
            c === "#" ? <circle key={`${x}-${y}`} cx={x * 10 + 5} cy={y * 10 + 5} r={1.8} className="fill-muted-foreground/35" /> : null,
          ),
        )}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x * 4} cy={p.y * 1.8} r={(p.size ?? 1) * 9} className="fill-brand/15" />
            <circle cx={p.x * 4} cy={p.y * 1.8} r={(p.size ?? 1) * 3.2} className="fill-brand" />
          </g>
        ))}
      </svg>
    </figure>
  );
}
