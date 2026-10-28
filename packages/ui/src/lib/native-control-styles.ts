import { cn } from "./utils"
import { buttonVariants } from "../components/button"
import { inputStyles } from "../components/input"
import { textareaStyles } from "../components/textarea"
import { nativeTableStyles, tableStyles } from "../components/table"
import type { VariantProps } from "class-variance-authority"

export { nativeTableStyles } from "../components/table"

export type NativeControlTag = "button" | "a" | "input" | "textarea" | "select" | "details" | "summary" | "dialog" | "progress" | "table" | "thead" | "tbody" | "tfoot" | "tr" | "th" | "td" | "caption"
export type NativeControlStyleOptions = VariantProps<typeof buttonVariants> & { className?: string; type?: string }

const focusStyles = "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
const disabledStyles = "disabled:cursor-not-allowed disabled:opacity-50"

/** Library-owned native geometry; variant/size match Button for actions. */
export function nativeControlStyles(tag: NativeControlTag, { className, type, variant, size }: NativeControlStyleOptions = {}) {
  let base: string
  if (tag === "button" || tag === "a") return cn(buttonVariants({ variant: variant ?? (tag === "a" ? "link" : "default"), size }), className)
  if (tag in nativeTableStyles) return tableStyles(tag as keyof typeof nativeTableStyles, className)
  switch (tag) {
    case "input": return inputStyles(type, className)
    case "select":
      base = cn("h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base text-foreground shadow-xs md:text-sm [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:text-base dark:bg-input/30", focusStyles, disabledStyles, "aria-invalid:border-destructive")
      break
    case "textarea": return textareaStyles(className)
    case "details": base = "rounded-md border border-border bg-background text-foreground"; break
    case "summary": base = cn("cursor-pointer rounded-md px-3 py-2 text-sm font-medium select-none marker:text-muted-foreground", focusStyles); break
    case "dialog": base = "fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-auto rounded-lg border border-border bg-background p-6 text-foreground shadow-lg backdrop:bg-black/50"; break
    case "progress": base = "h-2 w-full overflow-hidden rounded-full border-0 bg-secondary accent-primary [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary"; break
    default: throw new TypeError(`Unsupported native control: ${tag}`)
  }
  return cn(base, className)
}
