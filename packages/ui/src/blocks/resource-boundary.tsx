"use client"

import * as React from "react"
import { useDelayedFlag } from "../lib/use-delayed-flag"
import { cn } from "../lib/utils"
import { EmptyState } from "../components/empty-state"
import { ErrorState } from "../components/error-state"

export type BoundaryResource<T> = {
  status: "loading" | "success" | "error" | "empty"
  data: T | undefined
  error: Error | undefined
  isRevalidating: boolean
  retry: () => Promise<void>
}

/** Reserve geometry in the skeleton; cached content stays mounted during updates. */
export function ResourceBoundary<T>({ resource, skeleton, empty, error, children, className, delay = 150 }: {
  resource: BoundaryResource<T>
  skeleton: React.ReactNode
  empty?: React.ReactNode
  error?: React.ReactNode
  children: React.ReactNode | ((data: T) => React.ReactNode)
  className?: string
  delay?: number
}) {
  const { status, data, isRevalidating, retry } = resource
  const showSkeleton = useDelayedFlag(status === "loading" && data === undefined, delay)
  let content: React.ReactNode
  if (status === "loading" && data === undefined) content = <div style={{ visibility: showSkeleton ? "visible" : "hidden" }} aria-hidden={!showSkeleton || undefined}>{skeleton}</div>
  else if (status === "error" && data === undefined) content = error ?? <ErrorState onRetry={() => { void retry() }} />
  else if (status === "empty") content = empty ?? <EmptyState />
  else content = typeof children === "function" ? (data !== undefined ? children(data) : null) : children
  return <div data-slot="resource-boundary" className={cn("relative min-w-0", className)} aria-busy={isRevalidating || status === "loading" || undefined}>
    {content}
    {isRevalidating && <span role="status" className="pointer-events-none absolute right-2 top-2 rounded bg-background/95 px-2 py-1 text-xs text-muted-foreground">updating</span>}
    {status === "error" && data !== undefined && <div role="alert" className="absolute bottom-2 right-2 rounded border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
      update failed. <button type="button" className="underline underline-offset-4" onClick={() => { void retry() }}>try again</button>
    </div>}
  </div>
}
