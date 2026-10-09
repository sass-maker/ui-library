import * as React from "react";
import { MenuIcon, XIcon } from "lucide-react";
import type { NavLink } from "./site-header";

/**
 * Phone navigation built on the native Popover API: zero JavaScript, light
 * dismiss, Escape to close, and focus returns to the trigger.
 */
export function MobileNav({ brand, links, actions }: { brand: string; links: NavLink[]; actions?: React.ReactNode }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <div className="md:hidden">
      <button
        type="button"
        popoverTarget={`nav-${id}`}
        aria-label="Open menu"
        className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
      >
        <MenuIcon className="size-5" />
      </button>
      <div
        id={`nav-${id}`}
        popover="auto"
        className="fixed inset-0 m-0 h-dvh w-full max-w-none overflow-y-auto bg-background p-0 text-foreground backdrop:bg-transparent [&:popover-open]:animate-in [&:popover-open]:fade-in-0"
      >
        <div className="flex h-16 items-center justify-between border-b border-hairline px-4">
          <span className="text-[0.9375rem] font-semibold">{brand}</span>
          <button
            type="button"
            popoverTarget={`nav-${id}`}
            popoverTargetAction="hide"
            aria-label="Close menu"
            className="inline-flex size-10 items-center justify-center rounded-lg hover:bg-accent"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <nav aria-label="Primary" className="px-4 py-6">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href} className="border-b border-hairline">
                <a href={l.href} className="font-display ui-case flex py-4 text-[1.75rem]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          {actions && <div className="mt-8 flex flex-col gap-3 [&>*]:w-full">{actions}</div>}
        </nav>
      </div>
    </div>
  );
}
