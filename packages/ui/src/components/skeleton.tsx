import * as React from "react"
import { cn } from "../lib/utils"

/** A decorative bone. Announce loading once on its surrounding container. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="skeleton" aria-hidden="true" className={cn("motion-safe:animate-pulse motion-reduce:animate-none rounded-md bg-accent", className)} {...props} />
}

type SkeletonContainerProps = React.ComponentProps<"div"> & { announce?: boolean }
function SkeletonContainer({ announce = true, children, ...props }: SkeletonContainerProps) {
  return <div {...props} role={announce ? "status" : undefined} aria-busy={announce || undefined}>
    {announce && <span className="sr-only">loading</span>}
    {children}
  </div>
}

function SkeletonText({ lines = 3, announce = true, className, ...props }: SkeletonContainerProps & { lines?: number }) {
  return <SkeletonContainer announce={announce} className={cn("flex flex-col gap-2", className)} {...props}>
    {Array.from({ length: Math.max(1, lines) }, (_, i) => <Skeleton key={i} className={cn("h-4 w-full", i === Math.max(1, lines) - 1 && "w-2/3")} />)}
  </SkeletonContainer>
}

function SkeletonAvatar({ size = 40, announce = true, className, ...props }: SkeletonContainerProps & { size?: number | string }) {
  return <SkeletonContainer announce={announce} className={cn("shrink-0", className)} {...props}>
    <Skeleton className="rounded-full" style={{ width: size, height: size }} />
  </SkeletonContainer>
}

function SkeletonBlock({ aspectRatio = "16 / 9", announce = true, className, style, ...props }: SkeletonContainerProps & { aspectRatio?: React.CSSProperties["aspectRatio"] }) {
  return <SkeletonContainer announce={announce} className={cn("relative w-full", className)} style={{ aspectRatio, ...style }} {...props}>
    <Skeleton className="absolute inset-0 h-full w-full" />
  </SkeletonContainer>
}
const SkeletonImage = SkeletonBlock

export { Skeleton, SkeletonContainer, SkeletonText, SkeletonAvatar, SkeletonBlock, SkeletonImage }
