import { cardStyles } from "../components/card"
import { cn } from "./utils"

export function chartPanelStyles(className?: string) {
  return cn(cardStyles(), "min-w-0 gap-0 p-5 sm:p-6", className)
}

export const chartHeaderStyles = "flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4 mb-5"
export const chartTitleStyles = "font-display text-lg font-semibold tracking-tight text-card-foreground"
export const chartDescriptionStyles = "max-w-[30ch] text-xs leading-relaxed text-muted-foreground"

export function chartAppearance() {
  return { background: "transparent", color: "var(--muted-foreground)", fontFamily: "var(--font-mono)", fontSize: "11px" }
}
