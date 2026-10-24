import "./console.css";
import * as React from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { cn } from "@saas-maker/ui/utils";
import { Breadcrumbs } from "@saas-maker/ui/components/breadcrumb";
import { SearchTrigger } from "@saas-maker/ui/blocks/search-palette";

/**
 * Console: the app template for private data tools (collections in a
 * sidebar, a search trigger in the header, one content area). Distinct from
 * the Gallery and Workbench landing templates.
 *
 * Server-rendered with no client JavaScript of its own. Put the interactive
 * view (table, filters, palette) in `children` as a hydrated island; the
 * header search button opens any `SearchPalette` on the page. On phones the
 * sidebar becomes a native-popover drawer.
 */

export type ConsoleNavItem = {
  label: string;
  href: string;
  /** Record count, shown quietly. Only real counts. */
  count?: number;
  active?: boolean;
  icon?: React.ReactNode;
  /** Opens in a new tab (source sites, docs). */
  external?: boolean;
};

export type ConsolePageProps = {
  brand: { name: string; href?: string; target?: React.HTMLAttributeAnchorTarget; mark?: React.ReactNode };
  nav: { title?: string; items: ConsoleNavItem[] }[];
  breadcrumbs?: { label: string; href?: string }[];
  title: string;
  titleRef?: React.Ref<HTMLHeadingElement>;
  description?: React.ReactNode;
  /** Header search button; false hides it. */
  search?: { label: string } | false;
  /** Right side of the title row. */
  actions?: React.ReactNode;
  /** Bottom of the sidebar, e.g. data attribution. */
  sidebarFooter?: React.ReactNode;
  /** Optional client routing; native links remain server-renderable by default. */
  onNavigate?: (href: string) => void;
  children: React.ReactNode;
};

function NavList({ nav, onNavigate }: Pick<ConsolePageProps, "nav" | "onNavigate">) {
  return (
    <nav aria-label="Collections" className="flex flex-col gap-6">
      {nav.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-0.5">
          {group.title && <p className="ui-case px-2.5 pb-1 text-xs text-muted-foreground">{group.title}</p>}
          {group.items.map((it) => (
            <a
              key={it.href + it.label}
              href={it.href}
              aria-current={it.active ? "page" : undefined}
              onClick={onNavigate && !it.external ? event => {
                if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); onNavigate(it.href);
                event.currentTarget.closest<HTMLElement>("[popover]")?.hidePopover();
              } : undefined}
              {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={cn(
                "ui-case flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-sidebar-foreground/70 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring [@media(pointer:coarse)]:min-h-11 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
                it.active && "bg-sidebar-accent font-medium text-sidebar-foreground [&_svg]:text-foreground",
              )}
            >
              {it.icon}
              <span className="truncate">{it.label}</span>
              {it.count !== undefined && <span className="ml-auto font-mono text-xs tabular-nums text-muted-foreground">{it.count.toLocaleString()}</span>}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function ConsolePage({ brand, nav, breadcrumbs, title, titleRef, description, search = { label: "Search" }, actions, sidebarFooter, onNavigate, children }: ConsolePageProps) {
  const drawerId = React.useId();
  const brandLink = (
    <a href={brand.href ?? "/"} target={brand.target} rel={brand.target === "_blank" ? "noreferrer" : undefined} className="flex min-w-0 items-center gap-2.5">
      {brand.mark}
      <span className="ui-case truncate text-[0.9375rem] font-semibold tracking-[-0.01em]">{brand.name}</span>
    </a>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-14 items-center px-5">{brandLink}</div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <NavList nav={nav} onNavigate={onNavigate} />
        </div>
        {sidebarFooter && <div className="px-5 py-4 text-xs leading-relaxed text-muted-foreground">{sidebarFooter}</div>}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="flex h-14 items-center gap-3 px-4 md:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-2 lg:hidden">{brandLink}</div>
            {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="hidden min-w-0 flex-1 lg:block" />}
            {search && <SearchTrigger label={search.label} className="ml-auto" />}
            <button
              type="button"
              popoverTarget={drawerId}
              aria-label="Open collections"
              className="inline-flex size-11 shrink-0 touch-manipulation select-none items-center justify-center rounded-md outline-none hover:bg-accent active:bg-accent focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              <MenuIcon className="size-5" aria-hidden />
            </button>
          </div>
        </header>
        <div
          id={drawerId}
          data-slot="app-drawer"
          popover="auto"
          className="fixed inset-y-0 left-0 m-0 h-dvh w-72 max-w-[85vw] flex-col border-r border-sidebar-border bg-sidebar p-0 pb-[env(safe-area-inset-bottom)] text-foreground shadow-xl backdrop:bg-black/30 [&:popover-open]:flex"
        >
          <div className="flex h-14 min-w-0 items-center justify-between gap-3 border-b border-sidebar-border pl-5 pr-2">{brandLink}<button type="button" popoverTarget={drawerId} popoverTargetAction="hide" aria-label="Close collections" className="inline-flex size-11 shrink-0 items-center justify-center rounded-md outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring"><XIcon aria-hidden className="size-5" /></button></div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
            <NavList nav={nav} onNavigate={onNavigate} />
          </div>
          {sidebarFooter && <div className="px-5 py-4 text-xs leading-relaxed text-muted-foreground">{sidebarFooter}</div>}
        </div>

        <main id="main" className="flex min-w-0 flex-1 flex-col px-4 pb-10 pt-6 md:px-8 md:pt-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 ref={titleRef} tabIndex={-1} className="font-display text-[2rem] outline-none md:text-[2.5rem]">{title}</h1>
              {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
