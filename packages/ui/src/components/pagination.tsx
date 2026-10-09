import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "../lib/utils"
import { buttonVariants } from "./button"

/** Page numbers to show around the current page, with null for a gap. */
export function pageWindow(page: number, pageCount: number, siblings = 1): (number | null)[] {
  if (pageCount <= 5 + siblings * 2) return Array.from({ length: pageCount }, (_, i) => i)
  const start = Math.max(1, page - siblings)
  const end = Math.min(pageCount - 2, page + siblings)
  const out: (number | null)[] = [0]
  if (start > 1) out.push(null)
  for (let i = start; i <= end; i++) out.push(i)
  if (end < pageCount - 2) out.push(null)
  out.push(pageCount - 1)
  return out
}

type PaginationProps = {
  /** Zero-based current page. */
  page: number
  pageCount: number
  /** Called with the zero-based target page. Omit when using `href`. */
  onPageChange?: (page: number) => void
  /** Link mode: build each page's URL (zero-based page in, URL out). */
  href?: (page: number) => string
  /** Shows "1–25 of 1,374" when both are given. */
  rowCount?: number
  pageSize?: number
  className?: string
}

/**
 * Prev / page numbers / next. Buttons when `onPageChange` is given, links
 * when `href` is given (server-rendered lists). Page numbers hide on phones.
 */
function Pagination({ page, pageCount, onPageChange, href, rowCount, pageSize, className }: PaginationProps) {
  const count = Math.max(1, pageCount)
  const go = (p: number) => onPageChange?.(Math.min(count - 1, Math.max(0, p)))
  const item = (target: number, label: React.ReactNode, opts: { current?: boolean; disabled?: boolean; aria?: string; className?: string } = {}) => {
    const cls = cn(
      buttonVariants({ variant: opts.current ? "outline" : "ghost", size: "icon-sm" }),
      "w-auto min-w-8 px-2 font-mono text-xs tabular-nums",
      opts.current && "pointer-events-none",
      opts.className
    )
    if (href && !opts.disabled) {
      return (
        <a href={href(target)} aria-label={opts.aria} aria-current={opts.current ? "page" : undefined} className={cls}>
          {label}
        </a>
      )
    }
    return (
      <button type="button" onClick={() => go(target)} disabled={opts.disabled} aria-label={opts.aria} aria-current={opts.current ? "page" : undefined} className={cls}>
        {label}
      </button>
    )
  }
  const from = rowCount !== undefined && pageSize ? Math.min(rowCount, page * pageSize + 1) : undefined
  const to = rowCount !== undefined && pageSize ? Math.min(rowCount, (page + 1) * pageSize) : undefined

  return (
    <nav aria-label="Pagination" data-slot="pagination" className={cn("flex items-center justify-between gap-3", className)}>
      <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite">
        {from !== undefined && to !== undefined ? (
          <>
            {from.toLocaleString()}–{to.toLocaleString()} of {rowCount!.toLocaleString()}
          </>
        ) : (
          <>
            page {page + 1} of {count}
          </>
        )}
      </p>
      <div className="flex items-center gap-1">
        {item(page - 1, <ChevronLeftIcon />, { disabled: page <= 0, aria: "Previous page" })}
        <span className="hidden items-center gap-1 sm:flex">
          {pageWindow(page, count).map((p, i) =>
            p === null ? (
              <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground" aria-hidden>
                …
              </span>
            ) : (
              <React.Fragment key={p}>{item(p, p + 1, { current: p === page, aria: `Page ${p + 1}` })}</React.Fragment>
            )
          )}
        </span>
        <span className="px-1 font-mono text-xs text-muted-foreground tabular-nums sm:hidden">
          {page + 1} / {count}
        </span>
        {item(page + 1, <ChevronRightIcon />, { disabled: page >= count - 1, aria: "Next page" })}
      </div>
    </nav>
  )
}

export { Pagination }
