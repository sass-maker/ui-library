import * as React from "react"
import { cn } from "../lib/utils"
import { Skeleton, SkeletonContainer, SkeletonText, SkeletonImage } from "../components/skeleton"
import { Card, CardHeader, CardContent } from "../components/card"
import { DataTableSkeleton } from "../components/data-table"

type SkeletonProps = { className?: string; announce?: boolean }

export function CardSkeleton({ image = false, lines = 3, className, announce = true }: SkeletonProps & { image?: boolean; lines?: number }) {
  return <SkeletonContainer announce={announce} className={className} data-slot="card-skeleton">
    <Card>
      <CardHeader><Skeleton className="h-4 w-2/3" /><Skeleton className="h-5 w-4/5" /></CardHeader>
      <CardContent className="flex flex-col gap-4">{image && <SkeletonImage announce={false} />}<SkeletonText announce={false} lines={lines} /></CardContent>
    </Card>
  </SkeletonContainer>
}

export function CardGridSkeleton({ count = 3, image = false, className, announce = true }: SkeletonProps & { count?: number; image?: boolean }) {
  return <SkeletonContainer announce={announce} data-slot="card-grid-skeleton" className={cn("grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
    {Array.from({ length: Math.max(0, count) }, (_, i) => <CardSkeleton key={i} image={image} announce={false} />)}
  </SkeletonContainer>
}

export function StatTileSkeleton({ className, announce = true }: SkeletonProps) {
  return <SkeletonContainer announce={announce} data-slot="stat-tile-skeleton" className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-xs", className)}>
    <Skeleton className="h-[1.21875rem] w-24" /><Skeleton className="h-12 w-28" /><Skeleton className="h-4 w-32" />
  </SkeletonContainer>
}

export function RecordDetailSkeleton({ fields = 5, className, announce = true }: SkeletonProps & { fields?: number }) {
  return <SkeletonContainer announce={announce} data-slot="record-detail-skeleton" className={cn("flex w-full max-w-[22rem] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card", className)}>
    <div className="px-5 pb-4 pt-5"><Skeleton className="h-8 w-3/4" /><Skeleton className="mt-1 h-5 w-1/2" /></div>
    <div className="flex flex-col gap-6 px-5 pb-8">
      <div className="grid grid-cols-[fit-content(45%)_minmax(0,1fr)] gap-x-4 text-sm">
        {Array.from({ length: Math.max(0, fields) }, (_, i) => <div key={i} className="col-span-2 grid grid-cols-subgrid items-baseline border-b border-hairline py-2 last:border-0"><Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-full" /></div>)}
      </div>
      <SkeletonText lines={3} announce={false} />
    </div>
  </SkeletonContainer>
}

export function QuoteListSkeleton({ rows = 6, lines = 2, label = "quotes", className, announce = true }: SkeletonProps & { rows?: number; lines?: number; label?: string }) {
  return <SkeletonContainer announce={announce} aria-label={label} data-slot="quote-list-skeleton" className={cn("rounded-lg border border-border bg-card", className)}>
    {Array.from({ length: Math.max(0, rows) }, (_, i) => <div key={i} className="border-b border-hairline px-4 py-3 last:border-b-0">
      <div className="max-w-[75ch]">{Array.from({ length: Math.max(1, lines) }, (_, j) => <div key={j} className="flex h-[1.5234375rem] items-center"><Skeleton className={cn("h-3.5 w-full", j === lines - 1 && "w-2/3")} /></div>)}</div>
      <div className="mt-1.5 flex h-4 items-center"><Skeleton className="h-3 w-1/3" /></div>
    </div>)}
  </SkeletonContainer>
}

export function ConsolePageSkeleton({ columns = [{ id: "name", header: "name" }, { id: "type", header: "type" }, { id: "status", header: "status" }], rows = 8, className, announce = true }: SkeletonProps & Pick<React.ComponentProps<typeof DataTableSkeleton>, "columns" | "rows">) {
  return <SkeletonContainer announce={announce} data-slot="console-page-skeleton" className={cn("flex min-w-0 flex-col gap-6", className)}>
    <div className="flex h-5 items-center"><Skeleton className="h-3.5 w-40" /></div>
    <div className="flex min-h-9 flex-wrap gap-2"><Skeleton className="h-9 w-48 max-w-full" /><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /></div>
    <DataTableSkeleton columns={columns} rows={rows} announce={false} />
  </SkeletonContainer>
}
