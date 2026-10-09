import * as React from "react";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";

export type NavLink = { label: string; href: string };

type SiteHeaderProps = {
  brand: { name: string; href?: string; mark?: React.ReactNode; tag?: string };
  links?: NavLink[];
  /** Right-side actions, usually one or two Buttons. */
  actions?: React.ReactNode;
  /** "floating" draws a rounded bar inset from the edges. */
  variant?: "bar" | "floating";
  className?: string;
};

export function SiteHeader({ brand, links = [], actions, variant = "bar", className }: SiteHeaderProps) {
  const inner = (
    <div className="flex h-16 items-center gap-6">
      <a href={brand.href ?? "/"} className="flex shrink-0 items-center gap-2.5 rounded-md text-foreground">
        {brand.mark}
        <span className="text-[0.9375rem] font-semibold tracking-[-0.01em]">{brand.name}</span>
        {brand.tag && (
          <span className="hidden rounded-full border border-border px-2 py-0.5 font-mono text-[0.6875rem] text-muted-foreground sm:inline">
            {brand.tag}
          </span>
        )}
      </a>
      {links.length > 0 && (
        <nav aria-label="Primary" className="hidden flex-1 justify-center md:flex">
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <div className="hidden items-center gap-2 sm:flex">{actions}</div>
        {links.length > 0 && <MobileNav brand={brand.name} links={links} actions={actions} />}
      </div>
    </div>
  );

  if (variant === "floating") {
    return (
      <header className={cn("sticky top-3 z-40 px-3", className)}>
        <div className="mx-auto max-w-6xl rounded-2xl border border-border bg-background/75 px-4 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/65 sm:px-5">
          {inner}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-hairline bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70",
        className,
      )}
    >
      <div className="container-page">{inner}</div>
    </header>
  );
}
