import * as React from "react"
import { cn } from "../lib/utils"
import { Button } from "./button"

export type StateAction = { label: string; onClick: () => void }
export type EmptyStateProps = React.ComponentProps<"div"> & {
  title?: string
  description?: React.ReactNode
  icon?: React.ReactNode
  primaryAction?: StateAction | React.ReactNode
}

export function EmptyState({ title = "nothing here yet", description, icon, primaryAction, className, ...props }: EmptyStateProps) {
  return <div data-slot="empty-state" className={cn("flex min-w-0 flex-col items-center gap-3 px-6 py-12 text-center", className)} {...props}>
    {icon && <div aria-hidden="true" className="text-muted-foreground [&_svg]:size-6">{icon}</div>}
    <div className="max-w-sm">
      <h3 className="text-sm font-medium">{title}</h3>
      {description && <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</div>}
    </div>
    {primaryAction && (typeof primaryAction === "object" && "label" in primaryAction && "onClick" in primaryAction
      ? <Button size="sm" variant="outline" onClick={primaryAction.onClick}>{primaryAction.label}</Button>
      : primaryAction as React.ReactNode)}
  </div>
}
