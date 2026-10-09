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

Install from the private repo, not npm. Write the specs into `package.json`
and run `pnpm install`; templates needs ui and motion beside it.

```sh
G="github:sass-maker/ui-library#v0.1.8"
pnpm pkg set "dependencies.@saas-maker/ui=$G&path:/packages/ui" \
  "dependencies.@saas-maker/motion=$G&path:/packages/motion" \
  "dependencies.@saas-maker/templates=$G&path:/packages/templates"
pnpm install
```

`package.json` should then read:

```json
"@saas-maker/motion": "github:sass-maker/ui-library#v0.1.8&path:/packages/motion",
"@saas-maker/templates": "github:sass-maker/ui-library#v0.1.8&path:/packages/templates",
"@saas-maker/ui": "github:sass-maker/ui-library#v0.1.8&path:/packages/ui"
```

Do not use `pnpm add` for these: pnpm 10.33 saves the spec as
`git+https://github.com/sass-maker/ui-library.git`, dropping `#tag&path:`
(with or without `--save-exact`), so the next fresh install gets the wrong
package. To upgrade, change the tag in all three lines and run `pnpm install`.

Styles: `Base.astro` already imports `@saas-maker/templates/styles.css`, the
theme plus every class the ui and templates packages use. With your own
layout, import that one file instead (from a layout, or `@import` it at the
top of your app stylesheet):

```css
@import "@saas-maker/templates/styles.css";
```

Your app's own files are scanned automatically. Apps that use only
`@saas-maker/ui` import `@saas-maker/ui/styles.css`. Each package's
`@source` is relative to its own stylesheet, so this works under pnpm's
`node_modules/.pnpm` layout with no extra `@source` lines.

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

## Data apps (Console)

For private data tools: `ConsolePage` (`@saas-maker/templates/console-page`)
is a static shell (collections sidebar, breadcrumbs, search trigger, one
content area); put the interactive view in it as a React island.

| Piece | Import |
| --- | --- |
| `DataTable` (sort, pages, column toggle, sticky header, row keyboard nav, loading/empty/error, row selection with `selection={{ selected, onChange, max }}` for compare flows; TanStack Table v9) | `components/data-table` |
| `FilterBar`, `FacetFilter` (multi-select with counts), `RangeFilter`, `DateRangeFilter`, `ActiveFilters`, `useUrlFilters` | `blocks/filter-bar` |
| `readFilters` / `writeFilters` (query string), `filterRows`, `facetCounts` | `lib/filters` |
| `SearchPalette` (⌘K, grouped sources) and `SearchTrigger` | `blocks/search-palette` |
| `RecordDetail` (side panel, sheet on phones), `KeyValueList` (labels keep their width, values wrap; `align="start"` for prose), `Provenance` (from, via + endpoint, collected, read at, snapshot) | `blocks/record-detail` |
| `QuoteList` (verbatim quotes or claims: speaker, never named unless verified; source, date, timestamp link, type; keyboard rows), `QuoteRow`, `formatTimestamp` | `blocks/quote-list` |
| `ExportMenu` (CSV/JSON of the current view), `toCSV` / `toJSON` | `blocks/export-menu`, `lib/export` |
| `Breadcrumbs`, `Pagination`, `Popover`, `Command`, `Slider` | `components/*` |

Demo: `/demo/data/` (Nomad Atlas places snapshot, Nomads.com data; pick up
to three rows to compare) and `/demo/data/claims/` (a verbatim sample of
High Signal Podcasts claims from its public API, read 9 Oct 2026).

## Mac / iOS app

```swift
.package(url: "https://github.com/sass-maker/ui-library", from: "0.1.8")
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
key; feedback pages are `app://<bundle-id>/<screen>`). `SM_SNAPSHOT_DIR=/tmp/sm
swift test` renders sample screens to PNG for review.

## Develop

```sh
pnpm install
pnpm dev            # library site with demos
pnpm check          # typecheck packages + build site
pnpm tokens:build   # regenerate tokens.json and the Swift tokens
swift build && swift test
```
