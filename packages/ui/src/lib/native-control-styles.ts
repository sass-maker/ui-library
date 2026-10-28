import { cn } from "./utils"
import { buttonVariants } from "./button-styles"
import type { VariantProps } from "class-variance-authority"

export type NativeControlTag = "button" | "a" | "input" | "textarea" | "select" | "details" | "summary" | "dialog" | "progress" | "table" | "thead" | "tbody" | "tfoot" | "tr" | "th" | "td" | "caption"
export type NativeControlStyleOptions = VariantProps<typeof buttonVariants> & { className?: string; type?: string }

const fieldStyles = cn(
        "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base font-normal shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [@media(pointer:coarse)]:text-base [@media(pointer:coarse)]:min-h-11 dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"
)
const focusStyles = "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
const disabledStyles = "disabled:cursor-not-allowed disabled:opacity-50"

export const nativeTableStyles = {
  table: "w-full caption-bottom text-sm",
  thead: "[&_tr]:border-b",
  tbody: "[&_tr:last-child]:border-0",
  tfoot: "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
  tr: "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
  th: "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
  td: "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
  caption: "mt-4 text-sm text-muted-foreground",
} as const

/** Library-owned native geometry; variant/size match Button for actions. */
export function nativeControlStyles(tag: NativeControlTag, { className, type, variant, size }: NativeControlStyleOptions = {}) {
  let base: string
  if (tag === "button" || tag === "a") return cn(buttonVariants({ variant: variant ?? (tag === "a" ? "link" : "default"), size }), className)
  if (tag in nativeTableStyles) return cn(nativeTableStyles[tag as keyof typeof nativeTableStyles], className)
  switch (tag) {
    case "input":
      base = type === "checkbox" || type === "radio"
        ? cn("size-4 shrink-0 cursor-pointer accent-primary align-middle", focusStyles, disabledStyles)
        : type === "hidden" ? "" : fieldStyles
      break
    case "select":
      base = cn("h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base text-foreground shadow-xs md:text-sm [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:text-base dark:bg-input/30", focusStyles, disabledStyles, "aria-invalid:border-destructive")
      break
    case "textarea":
      base = "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base font-normal shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
      break
    case "details": base = "rounded-md border border-border bg-background text-foreground"; break
    case "summary": base = cn("cursor-pointer rounded-md px-3 py-2 text-sm font-medium select-none marker:text-muted-foreground", focusStyles); break
    case "dialog": base = "fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-auto rounded-lg border border-border bg-background p-6 text-foreground shadow-lg backdrop:bg-black/50"; break
    case "progress": base = "h-2 w-full overflow-hidden rounded-full border-0 bg-secondary accent-primary [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary"; break
    default: throw new TypeError(`Unsupported native control: ${tag}`)
  }
  return cn(base, className)
}
