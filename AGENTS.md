# Fleet UI library — agent instructions

- This repo is Fleet's single web UI library: shadcn/ui primitives
  (`src/components/ui`), theme presets and tokens (`src/styles/globals.css`),
  and blocks (`src/components/blocks`). It replaces the `ios-landings` factory
  once its sites are ported.
- Products differ by tokens (`data-theme` preset plus `--brand` overrides),
  imagery and block choice. Do not fork a block's styling per product; add a
  variant or a token instead.
- Blocks are server-rendered React with zero client JavaScript by default
  (native `details`, the Popover API, GET forms). Add a hydrated island only
  when behavior truly needs it.
- Demo pages in `src/demos` use each product's real copy and imagery. Never
  invent metrics, testimonials, counts or availability.
- Pin exact dependency versions. Run `pnpm check` and `pnpm registry:build`
  after changes. Never run `npx biome`; never `rm -rf` (use `/usr/bin/trash`).
