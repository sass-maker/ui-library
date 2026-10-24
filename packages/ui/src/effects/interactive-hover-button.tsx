/** Adapted from magicuidesign/magicui (efe76fc5755eca1142dd4f74c1d6f0ace2887e3c).
 * https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/interactive-hover-button.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: semantic tokens, framework-independent imports, and isolated demos.
 */
import { ArrowRight } from "lucide-react"

import { cn } from "../lib/utils"

export function InteractiveHoverButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group bg-background relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [@media(pointer:coarse)]:min-h-11",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        <div aria-hidden className="bg-primary h-2 w-2 rounded-full transition-transform duration-300 group-hover:scale-[100.8]"></div>
        <span className="inline-block transition-[transform,opacity] duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div aria-hidden className="text-primary-foreground pointer-events-none absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-[transform,opacity] duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{children}</span>
        <ArrowRight />
      </div>
    </button>
  )
}
