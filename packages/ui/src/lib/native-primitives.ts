import { cva } from "class-variance-authority"
import { cn } from "./utils"

export const nativeSelectionStyles = { primary: "aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-selected:bg-primary aria-selected:text-primary-foreground dark:aria-pressed:bg-primary dark:aria-selected:bg-primary aria-pressed:hover:bg-primary/88 aria-selected:hover:bg-primary/88 aria-pressed:hover:text-primary-foreground aria-selected:hover:text-primary-foreground" } as const

/** Canonical control geometry shared by React, Astro and native DOM adapters. */
export const buttonVariants = cva(
  "ui-case touch-manipulation select-none [-webkit-tap-highlight-color:transparent] [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11 inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out outline-none motion-safe:enabled:active:scale-[0.97] motion-safe:aria-disabled:active:scale-100 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/88",
        brand: "bg-brand text-brand-foreground shadow-xs hover:bg-brand/90",
        destructive:
          "bg-destructive text-background hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-[calc(var(--radius)*0.9)] px-6 text-[0.9375rem] has-[>svg]:px-5",
        content: "h-auto min-h-11 w-full whitespace-normal text-left",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
    // Inline links share the text column even when they include an arrow.
    // The icon-aware size padding otherwise wins over a caller's px-0.
    compoundVariants: [{ variant: "link", className: "px-0 has-[>svg]:px-0" }],
  }
)

const fieldStyles = cn(
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base font-normal shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [@media(pointer:coarse)]:text-base [@media(pointer:coarse)]:min-h-11 dark:bg-input/30",
  "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"
)

export function inputStyles(type?: string, className?: string) {
  const kind = type?.toLowerCase()
  return cn(kind === "checkbox" || kind === "radio"
    ? "size-4 shrink-0 cursor-pointer accent-primary align-middle outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
    : kind === "hidden" ? "" : fieldStyles, className)
}

export function textareaStyles(className?: string) {
  return cn("flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base font-normal shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40", className)
}

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


export function tableStyles(tag: keyof typeof nativeTableStyles, className?: string) {
  return cn(nativeTableStyles[tag], className)
}

export function cardStyles(className?: string) {
  return cn("flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", className)
}
