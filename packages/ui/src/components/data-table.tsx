"use client"

import * as React from "react"
import {
  columnVisibilityFeature,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type SortingState,
  type ColumnVisibilityState,
} from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, Columns3Icon } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Pagination } from "./pagination"
import { Skeleton } from "./skeleton"

/**
 * DataTable: sortable, paginated, column-toggleable table on TanStack Table
 * v9 (headless). Consumers describe columns with a small `DataColumn` shape,
 * so product code never imports TanStack types.
 *
 * - Sticky header inside a height-limited scroll container (the table
 *   scrolls; the page never scrolls sideways).
 * - Rows are one tab stop: ArrowUp/Down, Home/End move, Enter or Space opens.
 * - `status` drives loading (skeleton rows) and error states; `empty` is
 *   shown when there are no rows.
 * - Client mode sorts and pages `data`; set `manual` for server-paged data.
 * - `selection` adds a checkbox column with controlled state (ids), an
 *   optional cap (`max`, e.g. 3 for a compare view) and `onLimit` when a
 *   viewer tries to pass it. Checkboxes never open the row.
 */

export type DataValue = string | number | boolean | null | undefined

export type DataColumn<T> = {
  id: string
  header: string
  /** Raw value: used for sorting and export. */
  value: (row: T) => DataValue
  /** Custom cell; defaults to the formatted value. */
  cell?: (row: T) => React.ReactNode
  align?: "left" | "right"
  /** Default true. */
  sortable?: boolean
  /** Default true. Set false for the identifying column. */
  hideable?: boolean
  /** Hidden until the viewer turns it on. */
  hidden?: boolean
  /** Start descending on first click (scores, counts). Defaults to true for right-aligned columns. */
  sortDescFirst?: boolean
  /** Minimum width, e.g. "12rem". */
  minWidth?: string
  className?: string
}

export type DataSort = { id: string; desc: boolean }[]

export type DataTableView<T> = {
  /** Every row in current sort order (all pages). */
  rows: T[]
  /** Columns currently shown. */
  columns: DataColumn<T>[]
}

export type DataSelection<T> = {
  /** Selected row ids, in the order they were picked. */
  selected: string[]
  onChange: (ids: string[]) => void
  /** Most rows that can be selected. Without it the header checkbox selects the page. */
  max?: number
  /** Called instead of selecting when `max` is reached. */
  onLimit?: (row: T) => void
  /** Accessible name of a row's checkbox, e.g. the place name. Defaults to the row id. */
  rowLabel?: (row: T) => string
}

type DataTableProps<T> = {
  data: T[]
  columns: DataColumn<T>[]
  getRowId: (row: T) => string
  /** Accessible name for the table. */
  label: string
  onRowClick?: (row: T) => void
  /** Highlights the row whose detail is open. */
  selectedId?: string | null
  /** Checkbox column for picking rows (compare, bulk actions). */
  selection?: DataSelection<T>
  status?: "ready" | "loading" | "error"
  error?: React.ReactNode
  onRetry?: () => void
  empty?: React.ReactNode
  pageSize?: number
  /** Controlled sort (for URL sync). */
  sort?: DataSort
  onSortChange?: (sort: DataSort) => void
  defaultSort?: DataSort
  /** Server mode: `data` is one page; the table only renders it. */
  manual?: { rowCount: number; page: number; onPageChange: (page: number) => void }
  /** Left side of the bar above the table; receives the sorted view. */
  toolbar?: (view: DataTableView<T>) => React.ReactNode
  /** Height of the scroll area. */
  maxHeight?: string
  className?: string
}

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnVisibilityFeature,
})

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true })

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b)
  return collator.compare(String(a), String(b))
}

function display(v: DataValue): React.ReactNode {
  if (v == null || v === "") return <span className="text-muted-foreground/60">—</span>
  if (typeof v === "number") return v.toLocaleString()
  if (typeof v === "boolean") return v ? "yes" : "no"
  return v
}

function DataTable<T extends RowData>({
  data,
  columns,
  getRowId,
  label,
  onRowClick,
  selectedId,
  selection,
  status = "ready",
  error,
  onRetry,
  empty,
  pageSize = 50,
  sort,
  onSortChange,
  defaultSort = [],
  manual,
  toolbar,
  maxHeight = "min(68dvh, 46rem)",
  className,
}: DataTableProps<T>) {
  const [innerSort, setInnerSort] = React.useState<SortingState>(defaultSort)
  const sorting = (sort ?? innerSort) as SortingState
  const setSorting = React.useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      if (onSortChange) onSortChange(next.map(({ id, desc }) => ({ id, desc })))
      if (!sort) setInnerSort(next)
    },
    [sorting, sort, onSortChange]
  )
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>(() =>
    Object.fromEntries(columns.filter((c) => c.hidden).map((c) => [c.id, false]))
  )

  const defs = React.useMemo<ColumnDef<typeof features, T>[]>(
    () =>
      columns.map((c) => ({
        id: c.id,
        accessorFn: (row: T) => c.value(row) ?? undefined,
        header: c.header,
        enableSorting: c.sortable !== false,
        enableHiding: c.hideable !== false,
        sortDescFirst: c.sortDescFirst ?? c.align === "right",
        sortUndefined: "last" as const,
        sortFn: (a, b, id) => compare(a.getValue(id), b.getValue(id)),
      })),
    [columns]
  )

  const table = useTable({
    features,
    data,
    columns: defs,
    getRowId: (row: T) => getRowId(row),
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    initialState: { pagination: { pageIndex: 0, pageSize } },
    enableMultiSort: false,
    manualSorting: !!manual,
    manualPagination: !!manual,
    rowCount: manual?.rowCount,
  })

  // Back to page one when the data or sort changes (filters, new query).
  React.useEffect(() => {
    if (!manual) table.setPageIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sorting])

  const byId = React.useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns])
  const visibleColumns = table.getVisibleLeafColumns().map((c) => byId.get(c.id)!).filter(Boolean)
  const pageRows = table.getRowModel().rows
  const sortedRows = manual ? data : table.getSortedRowModel().rows.map((r) => r.original)
  const pageIndex = manual ? manual.page : table.state.pagination.pageIndex
  const pageCount = manual ? Math.max(1, Math.ceil(manual.rowCount / pageSize)) : Math.max(1, table.getPageCount())
  const rowCount = manual ? manual.rowCount : data.length

  // Roving focus across rows.
  const [focusIndex, setFocusIndex] = React.useState(0)
  const bodyRef = React.useRef<HTMLTableSectionElement>(null)
  React.useEffect(() => setFocusIndex(0), [pageIndex, data])
  const focusRow = (i: number) => {
    const n = Math.max(0, Math.min(pageRows.length - 1, i))
    setFocusIndex(n)
    bodyRef.current?.querySelectorAll<HTMLTableRowElement>("tr[data-row]")[n]?.focus()
  }
  const onRowKey = (e: React.KeyboardEvent, i: number, row: T) => {
    if (e.key === "ArrowDown") focusRow(i + 1)
    else if (e.key === "ArrowUp") focusRow(i - 1)
    else if (e.key === "Home") focusRow(0)
    else if (e.key === "End") focusRow(pageRows.length - 1)
    else if ((e.key === "Enter" || e.key === " ") && onRowClick) onRowClick(row)
    else return
    e.preventDefault()
  }

  const picked = React.useMemo(() => new Set(selection?.selected ?? []), [selection?.selected])
  const atLimit = selection?.max != null && picked.size >= selection.max
  const togglePick = (row: T, id: string) => {
    if (!selection) return
    if (picked.has(id)) return selection.onChange(selection.selected.filter((s) => s !== id))
    if (atLimit) return selection.onLimit?.(row)
    selection.onChange([...selection.selected, id])
  }
  const pageIds = pageRows.map((r) => r.id)
  const pagePicked = pageIds.filter((id) => picked.has(id)).length
  const togglePage = () => {
    if (!selection) return
    if (pagePicked === pageIds.length) selection.onChange(selection.selected.filter((id) => !pageIds.includes(id)))
    else selection.onChange([...selection.selected, ...pageIds.filter((id) => !picked.has(id))])
  }

  const hideable = table.getAllLeafColumns().filter((c) => c.getCanHide())
  const colCount = Math.max(1, visibleColumns.length) + (selection ? 1 : 0)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [pageIndex, sorting])

  return (
    <div data-slot="data-table" className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">{toolbar?.({ rows: sortedRows, columns: visibleColumns })}</div>
        {hideable.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Columns3Icon />
                columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 w-52">
              <DropdownMenuLabel className="ui-case text-xs font-medium text-muted-foreground">show columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hideable.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {byId.get(col.id)?.header ?? col.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div
        ref={scrollRef}
        className="relative overflow-auto rounded-lg border border-border bg-card"
        style={{ maxHeight }}
        // The scroll area is focusable only when it can hold focus usefully (no rows to tab to).
        tabIndex={pageRows.length && onRowClick ? undefined : 0}
        role="region"
        aria-label={label}
      >
        <table className="w-full border-separate border-spacing-0 text-sm" aria-busy={status === "loading" || undefined}>
          <caption className="sr-only">
            {label}
            {onRowClick ? ". Use arrow keys to move between rows and Enter to open one." : ""}
            {selection ? ` Tab from a row to its checkbox to select it${selection.max != null ? `, up to ${selection.max}` : ""}.` : ""}
          </caption>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {selection && (
                  <th scope="col" className="sticky top-0 z-10 h-10 w-10 border-b border-border bg-card pl-4 pr-1 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground">
                    {selection.max == null ? (
                      <Checkbox
                        aria-label="Select all rows on this page"
                        checked={pagePicked === 0 ? false : pagePicked === pageIds.length ? true : "indeterminate"}
                        onCheckedChange={togglePage}
                        disabled={status !== "ready" || pageIds.length === 0}
                        className="align-middle"
                      />
                    ) : (
                      <>
                        <span className="tabular-nums" aria-hidden>
                          {picked.size}/{selection.max}
                        </span>
                        <span className="sr-only">{`${picked.size} of ${selection.max} selected`}</span>
                      </>
                    )}
                  </th>
                )}
                {group.headers.map((header) => {
                  const col = byId.get(header.column.id)
                  const dir = header.column.getIsSorted()
                  const right = col?.align === "right"
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : undefined}
                      className={cn(
                        "sticky top-0 z-10 h-10 border-b border-border bg-card px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground first:pl-4 last:pr-4",
                        right && "text-right"
                      )}
                      style={{ minWidth: col?.minWidth }}
                    >
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "ui-case -mx-1.5 inline-flex h-7 items-center gap-1 rounded-md px-1.5 transition-colors hover:bg-accent hover:text-foreground",
                            dir && "text-foreground",
                            right && "flex-row-reverse"
                          )}
                        >
                          {col?.header}
                          {dir === "asc" ? (
                            <ArrowUpIcon className="size-3.5" aria-hidden />
                          ) : dir === "desc" ? (
                            <ArrowDownIcon className="size-3.5" aria-hidden />
                          ) : (
                            <ChevronsUpDownIcon className="size-3.5 opacity-40" aria-hidden />
                          )}
                        </button>
                      ) : (
                        <span className="ui-case">{col?.header}</span>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody ref={bodyRef}>
            {status === "loading" &&
              Array.from({ length: 8 }, (_, i) => (
                <tr key={i}>
                  {Array.from({ length: colCount }, (_, j) => (
                    <td key={j} className="border-b border-hairline px-3 py-3 first:pl-4 last:pr-4">
                      <Skeleton className={cn("h-3.5", selection && j === 0 ? "w-4" : j === (selection ? 1 : 0) ? "w-32" : "w-14")} />
                    </td>
                  ))}
                </tr>
              ))}
            {status === "error" && (
              <tr>
                <td colSpan={colCount} className="px-4 py-16 text-center">
                  <p className="text-sm text-foreground">{error ?? "This view could not load."}</p>
                  {onRetry && (
                    <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
                      try again
                    </Button>
                  )}
                </td>
              </tr>
            )}
            {status === "ready" && pageRows.length === 0 && (
              <tr>
                <td colSpan={colCount} className="px-4 py-16 text-center text-sm text-muted-foreground">
                  {empty ?? "Nothing matches."}
                </td>
              </tr>
            )}
            {status === "ready" &&
              pageRows.map((row, i) => {
                const selected = selectedId != null && row.id === selectedId
                const isPicked = picked.has(row.id)
                const blocked = !isPicked && atLimit
                return (
                  <tr
                    key={row.id}
                    data-row
                    data-state={selected ? "selected" : undefined}
                    data-picked={isPicked || undefined}
                    aria-current={selected || undefined}
                    tabIndex={onRowClick ? (i === focusIndex ? 0 : -1) : undefined}
                    onClick={onRowClick ? () => (setFocusIndex(i), onRowClick(row.original)) : undefined}
                    onKeyDown={onRowClick ? (e) => onRowKey(e, i, row.original) : undefined}
                    onFocus={() => setFocusIndex(i)}
                    className={cn(
                      "group/row outline-none",
                      onRowClick && "cursor-pointer",
                      "[&>td]:transition-colors hover:[&>td]:bg-accent/60 focus-visible:[&>td]:bg-accent data-[picked]:[&>td]:bg-brand-soft/30 data-[state=selected]:[&>td]:bg-brand-soft/60",
                      "focus-visible:[&>td:first-child]:shadow-[inset_2px_0_0_var(--ring)]"
                    )}
                  >
                    {selection && (
                      // Clicks here pick the row; they never open it.
                      <td
                        className="w-10 border-b border-hairline py-2.5 pl-4 pr-1 align-middle"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isPicked}
                          onCheckedChange={() => togglePick(row.original, row.id)}
                          aria-label={`Select ${selection.rowLabel?.(row.original) ?? row.id}`}
                          aria-disabled={blocked || undefined}
                          title={blocked ? `Up to ${selection.max} rows` : undefined}
                          tabIndex={onRowClick ? (i === focusIndex ? 0 : -1) : undefined}
                          className={cn("align-middle", blocked && "opacity-40")}
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td
                        key={col.id}
                        className={cn(
                          "border-b border-hairline px-3 py-2.5 align-middle whitespace-nowrap first:pl-4 last:pr-4",
                          col.align === "right" && "text-right tabular-nums",
                          col.className
                        )}
                        style={{ minWidth: col.minWidth }}
                      >
                        {col.cell ? col.cell(row.original) : display(col.value(row.original))}
                      </td>
                    ))}
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {status === "ready" && rowCount > pageSize && (
        <Pagination
          page={pageIndex}
          pageCount={pageCount}
          rowCount={rowCount}
          pageSize={pageSize}
          onPageChange={(p) => (manual ? manual.onPageChange(p) : table.setPageIndex(p))}
        />
      )}
    </div>
  )
}

export { DataTable }
