# SaaS Maker UI — agent instructions

One design system for every Fleet product, web and Apple.

- `packages/ui` (`@saas-maker/ui`): shadcn/ui components, theme presets and
  tokens (`src/styles/globals.css`, the single source of truth), and blocks.
- `packages/motion` (`@saas-maker/motion`): quiet scroll motion on the Motion
  library, driven by `.motion-*` classes. No hydration.
- `packages/templates` (`@saas-maker/templates`): Gallery (consumer) and
  Workbench (dev tools) page templates, the base layout, and the content-file
  format. A product page is a JSON content file, not code.
- `packages/tokens`: `pnpm tokens:build` turns the web theme into
  `tokens.json` and `swift/Sources/SaaSMakerUI/Tokens.generated.swift`. Run it
  after any theme change and commit both outputs.
- `swift/` + root `Package.swift`: `SaaSMakerUI` for Mac and iOS (palette,
  type roles, components, motion). Apps add it by git URL.
- `site/`: the library site and demos (Kith, CodeVetter, Live, Reader, App
  Health). Keep every demo.

Rules:
- Not published to npm. Products install from the public GitHub repo at a tag.
- Products differ by tokens, imagery, content and block choice. Do not fork a
  block per product; add a variant or token.
- Quiet design: one idea per section, one focal visual, accent used sparingly.
- Demos use real product copy and imagery; never invent metrics, testimonials,
  counts or availability.
- Pin exact dependency versions. Run `pnpm check` (typecheck + site build) and
  `swift build` after changes. Never run `npx biome`; never `rm -rf` or
  `find -delete` (use `/usr/bin/trash`).
