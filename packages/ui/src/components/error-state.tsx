import { cn } from "../lib/utils"
import { Button } from "./button"
import { EmptyState, type EmptyStateProps } from "./empty-state"

export type ErrorStateProps = EmptyStateProps & {
  onRetry?: () => void
  /** Supply a user-safe message; raw errors may contain private request details. */
  detail?: string
  offline?: boolean
}

export function ErrorState({ title, description, icon, primaryAction, onRetry, detail, offline = false, className, ...props }: ErrorStateProps) {
  return <div {...props} data-slot="error-state" role="alert" className={cn("min-w-0", className)}>
    <EmptyState title={title ?? (offline ? "You’re offline" : "Could not load this view")}
      description={description ?? (offline ? "Check your connection, then try again." : "Please try again in a moment.")}
      icon={icon} primaryAction={primaryAction ?? (onRetry ? <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button> : undefined)} />
    {detail && <details className="mx-auto -mt-6 max-w-sm px-6 pb-6 text-xs text-muted-foreground">
      <summary className="cursor-pointer">Details</summary>
      <p className="mt-2 whitespace-pre-wrap break-words">{detail}</p>
    </details>}
  </div>
}
