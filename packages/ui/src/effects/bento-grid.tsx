/** Adapted from magicuidesign/magicui (efe76fc5755eca1142dd4f74c1d6f0ace2887e3c).
 * https://github.com/magicuidesign/magicui/blob/efe76fc5755eca1142dd4f74c1d6f0ace2887e3c/apps/www/registry/magicui/bento-grid.tsx
 * MIT; original copyright and permission notice in THIRD_PARTY_NOTICES.md.
 * Fleet changes: semantic tokens, framework-independent imports, and isolated demos.
 */
import { type ComponentPropsWithoutRef, type ReactNode } from "react"
import { ArrowRightIcon } from "lucide-react"

import { cn } from "../lib/utils"
import { Button } from "../components/button"

interface BentoGridProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<"div"> {
  name: string
  className: string
  background: ReactNode
  Icon: React.ElementType
  description: string
  href: string
  cta: string
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // light styles
      "border border-border bg-card shadow-sm",
      // dark styles
      
      className
    )}
    {...props}
  >
    <div>{background}</div>
    <div className="relative z-10 flex flex-1 flex-col justify-end gap-3 p-6">
      <Icon aria-hidden className="size-8 text-brand" />
      <h3 className="text-xl font-semibold text-foreground">{name}</h3>
      <p className="max-w-lg text-muted-foreground">{description}</p>
      <Button variant="link" asChild size="sm" className="mt-2 w-fit p-0">
        <a href={href}>{cta}<ArrowRightIcon aria-hidden className="ms-2 size-4" /></a>
      </Button>
    </div>
  </div>
)

export { BentoCard, BentoGrid }
