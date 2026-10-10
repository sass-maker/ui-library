# SaaS Maker UI

Shared UI for Fleet products: web packages plus a Swift package, generated from
one theme.

| Package | What it is |
| --- | --- |
| `@saas-maker/ui` | shadcn/ui components, theme presets, page blocks |
| `@saas-maker/motion` | scroll motion presets (Motion library) |
| `@saas-maker/templates` | Gallery and Workbench landing templates, Console app template, base layout |
| `@saas-maker/tokens` | theme tokens as JSON (generated) |
| `SaaSMakerUI` (Swift) | palette, type, components and motion for Mac/iOS |

## Web product (Astro)

Install from the GitHub repo (public), not npm. Write the specs into `package.json`
and run `pnpm install`; templates needs ui and motion beside it.

```sh
G="github:sass-maker/ui-library#v0.1.13"
pnpm pkg set "dependencies.@saas-maker/ui=$G&path:/packages/ui" \
  "dependencies.@saas-maker/motion=$G&path:/packages/motion" \
  "dependencies.@saas-maker/templates=$G&path:/packages/templates"
pnpm install
```

`package.json` should then read:

```json
"@saas-maker/motion": "github:sass-maker/ui-library#v0.1.13&path:/packages/motion",
"@saas-maker/templates": "github:sass-maker/ui-library#v0.1.13&path:/packages/templates",
"@saas-maker/ui": "github:sass-maker/ui-library#v0.1.13&path:/packages/ui"
```

Do not use `pnpm add` for these: pnpm 10.33 saves the spec as
`git+https://github.com/sass-maker/ui-library.git`, dropping `#tag&path:`
(with or without `--save-exact`), so the next fresh install gets the wrong
package. To upgrade, change the tag in all three lines and run `pnpm install`.

The templates are React components. Consumers must also install exact versions
of `@astrojs/react`, `react` and `react-dom`, and enable the Astro React integration
(even when rendering without hydration). The library site currently uses:

```sh
pnpm add --save-exact @astrojs/react@7.0.0 react@19.3.0 react-dom@19.3.0
```

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
export default defineConfig({ integrations: [react()] });
```

Fonts: the theme ships Latin-only, weight-clamped woff2 subsets (about 50 KB on a Gallery page, about 105 KB on a Workbench paper page; `@font-face` is lazy and `Base.astro` preloads only the display font). Characters outside Latin fall back to the system font; add your own `@font-face` for other scripts. Regenerate with `pnpm --filter @saas-maker/ui fonts:build`.

Styles: `Base.astro` imports only `@saas-maker/ui/theme.css` (tokens, fonts
and base styles). `GalleryPage`, `WorkbenchPage` and `ConsolePage` each import
their own scoped CSS automatically. Base + GalleryPage includes Gallery's
sources, without scanning unrelated templates. With your own
layout or hand-built template, choose an entry explicitly:

```css
@import "@saas-maker/templates/gallery.css"; /* or workbench.css, console.css */
```

For hand-built pages using the full library, the backward-compatible all path
is `@saas-maker/templates/styles.css`; UI-only pages can use
`@saas-maker/ui/styles.css` for all UI sources, or `@saas-maker/ui/theme.css`
plus Tailwind's utilities layer and their own narrow `@source` entries. The
scoped and full entry files already include that utilities layer. Your app's own files are scanned
automatically. Each package's sources are relative to its own stylesheet,
so this works with pnpm's isolated layout.

A page must have only one Tailwind entry that imports utilities: do not add a
second one alongside a template component's automatic CSS import. Keep your
own styles in plain CSS, or use `@reference` for `@apply`. To extend the sources on a hand-built page,
make an app stylesheet the only entry, explicitly import the template entry
CSS there, and add narrow `@source` lines for your direct UI block/component
imports and their dependencies; use the full `@saas-maker/ui/styles.css` entry
only on hand-built pages that need all UI sources.

Leave Astro's `build.inlineStylesheets` at its default (`"auto"`) so substantial
CSS stays in an external, cacheable file; do not force `"always"`.

Add `src/content/<slug>.json` and render it with `GalleryPage` or
`WorkbenchPage` inside `Base.astro`. Write `*phrase*` for the accent phrase.
Validate files with `productContent` from `@saas-maker/templates/schema`
(the library site loads them as an Astro content collection, so a typo fails
the build with the exact field).

| Template | For | Sections | Examples |
| --- | --- | --- | --- |
| Gallery | consumer apps | device or photo-cover hero; `showcase`, `spread`, `cover`, `grid`, `statement`, `faq`; closing art | `kith.json`, `live.json` |
| Workbench | dev tools, desktop apps | app window on a stage; `statement`, `spread` (cropped detail, code, diff), `faq`, `cta` (plus classic `steps`, `stats`, `features`) | `codevetter.json`, `reader.json` |

Brand tokens: `--brand`, `--brand-foreground`, `--brand-soft`, and
`--brand-ink` (brand as readable text; set it deeper for light brands).
The previous hand-built layouts stay at `/demo/*-classic/`.

## Using the templates in a product

The demo route is the whole integration:

```astro
---
import Base from "@saas-maker/templates/Base.astro";
import { GalleryPage } from "@saas-maker/templates/gallery-page";
import { baseProps } from "@saas-maker/templates/page";
import { galleryContent } from "@saas-maker/templates/schema";
import json from "../content/kith.json";
const content = galleryContent.parse(json); // fails the build with the exact field
---
<Base {...baseProps(content)}>
  <GalleryPage content={content} />
</Base>
```

`baseProps` maps the file's `page` settings to `Base.astro` props. Use
`workbenchContent` / `WorkbenchPage` for Workbench files, or load a folder of
files as an Astro content collection with `productContent` as its schema.

### Hero identity

Both templates accept `hero.layout`: `center` (default, existing layout),
`split` (copy left, media right; copy first on phones), `form` (split with a
single-field GET form), or `masthead` (editorial issue line and oversized title).
`hero.issue` and `hero.issueNote` are optional masthead labels. Media uses the
existing Gallery `screen`/`image` or Workbench `window`, or a plain
`hero.card: { src, alt, width, height }`. A card takes precedence over other
media. Mastheads can omit media; other layouts require it. Existing center
Gallery screens still require their backdrop. Buttons require `hero.primary`,
except in form layout; `hero.secondary` becomes a quiet text link beside the form.

`hero.form` requires `layout: "form"`. Gallery also accepts `closing.form` in
place of `closing.primary` (at least one is required; a form takes precedence):

```json
{
  "label": "search the source",
  "name": "q",
  "placeholder": "a component or template",
  "submit": "search",
  "action": "https://github.com/sass-maker/ui-library/search",
  "method": "get",
  "type": "text",
  "required": true,
  "hint": "Searches the public repository.",
  "error": "Enter a search term.",
  "prefill": "templates"
}
```

`label`, `name`, `submit`, `action` (absolute URL), and `required` are required.
`placeholder`, `method` (only `get`), `type` (`text`, `url`, `email`), `pattern`,
`hint`, `error`, and `prefill` are optional. Native HTML validation works without
JavaScript; a small inline script adds `aria-invalid` and an alert message.
The form navigates with a GET query parameter and adds no React hydration.

`page.fonts` independently sets `display`, `text`, and `accent` to `figtree`,
`newsreader`, `instrument-serif`, `fraunces`, or `geist`. `accentStyle` is
`italic` or `normal`; write `*phrase*` for an accent. All italic faces are real,
bundled Latin subsets; font synthesis is disabled for overridden accents.
Newsreader uses its fixed display/text optical sizes. `text` overrides both
`--font-sans` and `--font-text`; omitted roles retain theme defaults.
`display` overrides `--font-display` and its supported weight; `accent` sets
`--font-accent`. Only the chosen display face is preloaded. Other faces load
lazily when rendered; no font request is made just for declaring a face.

```json
{
  "fonts": { "display": "instrument-serif", "text": "figtree", "accentStyle": "italic" },
  "surface": { "backdrop": "gradient", "variant": "editorial-dark" }
}
```

`page.surface.backdrop` is `none`, `gradient`, `glow`, or `grid`; omitted keeps
today's surface. Treatments derive from `--brand`, `--brand-soft`, and
`--border`. Override `--surface-backdrop` directly in `page.tokens`, or customize
`--surface-backdrop-gradient`, `--surface-backdrop-glow`, or
`--surface-backdrop-grid`. `variant: "editorial-dark"` supplies a warm near-black
surface, subdued text, and hairlines; `default` retains the theme. Gallery also
supports `mode: "dark"`. Explicit token overrides win over font and surface
presets. Demos: `/demo/identity-split/`, `/demo/identity-workbench/`,
`/demo/identity-form/`, `/demo/identity-masthead/`, `/demo/identity-surface/`, and
`/demo/identity-closing/`.

### Head tags (SEO and analytics)

Content options under `page`, all optional:

| Field | Renders |
| --- | --- |
| `canonical` | `<link rel="canonical">` and `og:url` |
| `robots` | `<meta name="robots">`, e.g. `"noindex, nofollow"` |
| `og` | `og:*` and `twitter:*`: `title`/`description` (default: the page's), `image` (relative paths become absolute against `canonical`, else `url`), `imageAlt`, `imageWidth`, `imageHeight`, `type` (default `website`), `siteName`, `twitterCard` (default `summary_large_image` with an image), `twitterSite` |
| `jsonLd` | one object or a list, as `application/ld+json` (`<` escaped) |

`Base.astro` takes the same props directly. Anything else (Clarity, App
Health, markdown alternates, preloads) goes in the `head` slot, so a product
keeps its existing tags:

```astro
<Base {...baseProps(content)}>
  <Fragment slot="head">
    <link rel="alternate" type="text/markdown" href="/index.md" />
    <script is:inline src="/clarity.js" data-project="..."></script>
  </Fragment>
  <GalleryPage content={content} />
</Base>
```

### Your own header or footer

Set `footer.privacyUrl` to override the subscribe and feedback privacy link
(default `https://sassmaker.com/privacy`). `StudioFooter` and Swift
`SMStudioFooter` also accept `privacyUrl` directly.

Both templates render `SiteHeader` and `StudioFooter` by default. To keep a
product's own nav or footer without forking the template:

- In Astro, pass a named slot; it replaces that part:
  `<GalleryPage content={content}><MyNav slot="header" /><MyFooter slot="footer" /></GalleryPage>`.
- From React, pass `header` / `footer` props (`null` renders none).
- In the content file, `"header": false` and/or `"footer": false` drop them.
  `nav` is the header's link list; Gallery's `headerAction` is optional.

A page without `StudioFooter` loses the subscribe, feedback, Ask AI and studio
strip contract, and the Fleet footer audit only recognises
`<footer data-fleet-footer="studio" data-catalog-id="<id>">`, which
`StudioFooter` renders when `footer.catalogId` is set.

### Studio strip

The strip lists sibling products, leaves out the current one, and adds
`?ref=<catalogId>` to each link; "All projects" goes to
`https://sassmaker.com/projects`. Without `footer.studio` it uses a short
default list. To feed it from the catalog, read SaaS Maker's public projects
feed (`https://sassmaker.com/projects.json`, generated from
`saas-maker/catalog/generated/public.json`; the same source the old
portfolio project strip used) at build time:

```astro
---
import { studioFromProjects, studioProjectsFeed } from "@saas-maker/ui/blocks/footer";
const projects = await fetch(studioProjectsFeed).then((r) => (r.ok ? r.json() : [])).catch(() => []);
// First three non-current projects in catalog order; [] falls back to the default list.
if (content.footer) content.footer.studio = studioFromProjects(projects, { current: "kith" });
---
```

Or write `"studio": [{ "id": "live", "label": "Live", "href": "https://live.significanthobbies.com" }]`
in `footer`. `StudioFooter` takes the same list as its `studio` prop.

### Motion opt-out

`"motion": false` in `page` (or `motion={false}` on `Base`) drops the scroll
motion script. Pages are complete without it: motion only hides elements it is
about to animate, after the script runs. `footerScript={false}` drops the
small StudioFooter script too, for pages with their own footer and zero
JavaScript; keep it whenever `StudioFooter` is on the page, since its forms
post through it.

### Images, frames and status

- **Asset root.** Image fields (`mark`, `src`, `image`, `backdrop`, footer
  art, `page.icon`, `og.image`) may be relative: `"images/hero.webp"`
  resolves against `page.assetBase` (default `/`), so it is served from the
  product's own `public/images/`. Paths starting with `/`, a scheme or
  `data:` are used as written; the demos use `/demo/<id>/…`. A consumer can
  also pass `assetBase` to `GalleryPage` / `WorkbenchPage`, or call
  `withAssetBase(content, base)` from `@saas-maker/templates/page`.
- **Frames (Gallery).** `"frame": "phone" | "desktop" | "none"` at the top of
  the file (default `phone`); a screen's own `frame` wins. Desktop screens
  give their `width`/`height` (phone screens default to `screenSize`). Use
  `none` for captures that already include window chrome.
- **Status.** `hero.status`, e.g.
  `{ "label": "Internal TestFlight beta", "href": "/testflight/" }` or
  `{ "label": "Public beta", "href": "/release/" }`, shows an honest
  availability line beside the hero note. CTAs are plain links, so a product
  that decides them at build time (TestFlight vs App Store vs download) sets
  `content.hero.primary` before rendering.

## Data apps (Console)

For private data tools: `ConsolePage` (`@saas-maker/templates/console-page`)
is a static shell (collections sidebar, breadcrumbs, search trigger, one
content area); put the interactive view in it as a React island.

| Piece | Import |
| --- | --- |
| `DataTable` (sort, pages, column toggle, sticky header, row keyboard nav, loading/empty/error, row selection with `selection={{ selected, onChange, max }}` for compare flows; TanStack Table v9) | `components/data-table` |
| `FilterBar`, `FacetFilter` (multi-select with counts), `RangeFilter`, `DateRangeFilter`, `ActiveFilters`, `useUrlFilters` | `blocks/filter-bar` |
| `readFilters` / `writeFilters` (query string), `filterRows`, `facetCounts` | `lib/filters` |
| `SearchPalette` (⌘K, grouped sources; each source settles on its own and can set `loading`, `status` (quiet line in the group heading) or `disabled`; a result can be `disabled`) and `SearchTrigger` | `blocks/search-palette` |
| `RecordDetail` (side panel, sheet on phones), `KeyValueList` (labels keep their width, values wrap; `align="start"` for prose), `Provenance` (from, via + endpoint, collected, read at, snapshot) | `blocks/record-detail` |
| `QuoteList` (verbatim quotes or claims: speaker, never named unless verified; source, date, timestamp link, type; keyboard rows), `QuoteRow`, `formatTimestamp` | `blocks/quote-list` |
| `ExportMenu` (CSV/JSON of the current view), `toCSV` / `toJSON` | `blocks/export-menu`, `lib/export` |
| `Breadcrumbs`, `Pagination`, `Popover`, `Command`, `Slider` | `components/*` |

Demo: `/demo/data/` (Nomad Atlas places snapshot, Nomads.com data; pick up
to three rows to compare) and `/demo/data/claims/` (a verbatim sample of
High Signal Podcasts claims from its public API, read 9 Oct 2026).

## Mac / iOS app

```swift
.package(url: "https://github.com/sass-maker/ui-library", from: "0.1.13")
// ...
ContentView().smTheme(.gallery.brand(Color("Brand")))
```

The Swift package bundles the same fonts as the web theme (Figtree, Newsreader,
Geist, Geist Mono, Instrument Serif, Fraunces; SIL OFL, licenses in
`swift/Sources/SaaSMakerUI/Fonts/Licenses`) and follows the theme's lowercase
voice for headings and buttons.

Beyond the theme, the package assembles whole screens: `SMHero`, `SMShowcase`,
`SMCover`, `SMStatementRows` and `SMDevice` (Gallery), and `SMAppShell`,
`SMPage`, `SMStatCard`, `SMSparkline`, `SMAreaChart` and `SMUptimeStrip`
(dashboards, Swift Charts). `SMStudioFooter` is the native StudioFooter:
updates sign-up (`capture: .newsletter | .waitlist | .off`), a feedback sheet
with an optional screenshot, Ask AI and the studio strip, posting to SaaS Maker
with `projectKey:` or `catalogId:` (preview mode, sending nothing, without a
key; a failed catalog lookup says SaaS Maker could not be reached and retries on
the next send; feedback pages are `app://<bundle-id>/<screen>`). `SM_SNAPSHOT_DIR=/tmp/sm
swift test` renders sample screens to PNG for review.

## Develop

```sh
pnpm install
pnpm dev            # library site with demos
pnpm check          # typecheck packages + build site
pnpm check:browser  # keyboard, focus and footer checks in Chrome (needs the site preview running)
pnpm tokens:build   # regenerate tokens.json and the Swift tokens
swift build && swift test
```
