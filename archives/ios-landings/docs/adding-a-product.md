# One template, many products

Reuse the owner-selected Living Memory Book system in this repository. Share
the engine and reliable controls; give each product its own content, materials
and evidence. Each build remains one product per domain.

## Product inputs

- `products/<id>/site.config.ts`: copy, semantic colors, availability, legal
  disclosures and links. Use `SiteConfig` from `src/lib/types.ts` for the contract.
- `products/<id>/public/`: the product's icon and actual screenshots.
- Optional `story` in the config: product-owned ink, material cover, illustrative
  photograph with caption, optional paper texture, a wide scene and a short margin note. These are
  ingredients, not a flattened image of the page. See Kith's `story` for a full
  example.
- Optional `sceneArtwork`: a single product-owned landscape image with `src`,
  descriptive `alt`, intrinsic `width`/`height` and an honest illustrative
  `caption`. It provides the wide story scene and a decorative hero setting for screenshot-led products
  without introducing Kith's cloth, photograph or margin note. See Setline for
  a light example and ContextDaddy for a dark example. Compose a clear left
  writing zone and meaningful subject on the right; keep main text in HTML.
  Optimize the image as WebP and retain its original and exact generation prompt.
  Omit both options when illustration would weaken the product's identity.
- `products/<id>/blog/*.md`: optional notes; see [blogs](blogs.md).

Use Kith as the light/phone example and PerformanceDaddy as the dark/Mac example.
Replace all borrowed identity, copy, links and assets before qualifying a product.
Do not reuse another product's privacy claims or analytics identity.

Captures already explained in a chapter are omitted from the separate gallery.
Use the gallery for additional proof, rather than repeating the same screens.
Artwork products pass `artwork` to the shared device component: no phone hardware
or screenshot labels are attached to illustrative app art.

## Register and check

1. Add the typed config import and catalog entry in `src/lib/catalog.ts`.
2. Add its ID to `scripts/build-all.mjs`, `scripts/check-all.mjs` and the CI
   product matrix so it cannot silently miss shared regression checks.
3. Leave `scripts/pages.mjs` unchanged: deployment registration is a separate,
   explicitly authorized operation.
4. Run the focused build, then the entire factory check:

```sh
PRODUCT=performancedaddy pnpm check:one
pnpm check
PRODUCT=performancedaddy pnpm preview
```

Substitute the new ID. No command above deploys.

## Visual and content contract

Keep the asymmetric promise/evidence spread, confident type, varied story
rhythm and captions outside screenshots. Product tokens choose light or dark.
Products own their imagery and visual materials; never reuse another app's
photographs merely to fill a slot. Generated scenes must be identified as
illustrative and cannot imply customers, testimonials or native capabilities.
Use `device: "desktop"` for Mac screenshots. Source dimensions are read from
the real assets; do not crop screenshots to fit a phone or manufacture proof.
Inspect home, release/beta, privacy, support and any article at 390/768/1440px.

Homepage composition lives in `src/pages/index.astro` and `src/styles/landing.css`.
Header, footer, buttons and legal pages share `src/layouts/SiteLayout.astro` and
`src/styles/global.css`. Journals use the shared `src/pages/blog/` routes and
`src/styles/blog.css`. Fix these once to update every product.

Keep availability honest: missing public downloads lead to release/beta status,
never a fabricated store link. A ready landing does not mean the native app is
signed, notarized, released, or downloadable.

## When to create a separate website

Keep this factory while products share the same evaluation path: promise,
credible product proof, fit, privacy and truthful availability. A different
palette or art direction does not require another repo. Create a separate
surface when the product needs materially different journeys, commerce,
interactive demos or editorial workflows that cannot remain clear in the
shared page contract. Extract shared primitives before copying the engine.
