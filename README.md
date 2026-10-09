# Fleet UI

One UI library for every Fleet web surface: landings, product apps and
internal tools. Built on shadcn/ui (Radix + Tailwind v4) with five theme
presets (base, paper, ink, hearth, signal) and production blocks.

```sh
pnpm install
pnpm dev              # docs + demos at http://localhost:4321
pnpm build            # static site + shadcn registry in dist/r
```

Install into a product with the shadcn CLI:

```sh
pnpm dlx shadcn@latest add <ui-library-url>/r/theme.json
pnpm dlx shadcn@latest add <ui-library-url>/r/hero.json
```

Demos (`/demo/*`) rebuild real Fleet products with their real copy and
imagery so the library can be scored against the live sites.
