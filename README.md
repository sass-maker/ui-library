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


## Atomic architecture

The explorer follows the same dependency direction as the source:

- **Atoms** — 21 primitives: inputs, actions, type-level labels, feedback and media.
  Import from `@saas-maker/ui/atoms/button` (and the other named atom exports).
- **Molecules** — 78 focused compositions and effects, including labeled fields,
  search, file cards, settings rows and existing interaction recipes.
  New compositions live under `@saas-maker/ui/molecules/*`; existing
  `components/*` and `recipes/*` imports keep working.
- **Organisms** — 27 complete sections and patterns. New exported workspace
  organisms are `asset-library`, `workspace-settings`, `notification-inbox`
  and `project-overview`. Applications own data and persistence callbacks.
- **Templates** place these sections into a complete Gallery, Workbench or
  Console page.

`pnpm check:architecture` rejects upward dependencies. The explorer includes
a working composition walkthrough, every recipe both isolated and in context,
editable molecule controls, and explicit loading, empty and failure examples.

Shared transitions are exported from `@saas-maker/ui/lib/motion`: 140 ms
feedback, 220 ms content and a 280 ms layout spring without bounce.
Scroll motion starts with `initMotion()` from `@saas-maker/motion`; its returned
cleanup function removes observers, stops animations and restores inline styles.
Repeated initialization and live OS reduced-motion changes are supported.
React components use the shared reduced-motion hook; application save/upload
callbacks remain responsible for real completion.

Anchored surfaces share a 150 ms entrance and 100 ms exit. Dialogs use
220/140 ms, drawers use 260/180 ms, and command search opens immediately.
Overlays constrain long content to the available viewport; menus and form
controls have roomier targets on coarse pointers. Dropdown and context menus
default to non-modal interaction; pass `modal={true}` when outside interaction
must be blocked. Dialogs retain modal focus containment.

`ContextMenuTrigger` is focusable by default: Shift+F10 or the Context Menu key
opens it from the keyboard. Pass `tabIndex={-1}` when an enclosing interface
manages its focus order. `SearchTrigger` shows its label by default; use
`mobileCompact` for a compact phone header and `compact` for an icon at every width.

`MorphingPopover` keeps its measured anchor and content stationary while the
decorative surface moves. Use `className` for layout and foreground text, and
`surfaceClassName` for background, border and shadow styling. When upgrading a
previously styled morph, move those paint utilities to `surfaceClassName`. Pointer
opens animate; interaction during entrance finishes the surface and forwards the
original event, including the first press. Keyboard, programmatic and externally
controlled opens render immediately.

`ShimmerButton` uses the theme’s primary surface and foreground by default.
An explicit `background` retains the original white-text convention;
`className` and `shimmerColor` can customize that pairing.

`TagInput` uses `className` for the outer label/field group and
`fieldClassName` for the editable field surface. Use `className="w-full"`
to align it with other form fields while retaining the standalone default.

`KanbanBoard` fills its container, retaining 260px minimum lanes by default in a local
horizontal scroll area. `className` styles the grid, including custom columns,
height and gaps; custom column templates supply their own track minimums.
`--kanban-lane-min` can tune responsive density without replacing the template.
`wrapperClassName` styles the outer container. Touch users can
pan from card bodies and drag from the visible handle.

`RecordDetail` chooses a desktop panel or phone sheet from `desktopQuery`. A parent
that coordinates responsive selection can set `presentation="panel"` or `"sheet"`
explicitly. Use `focusHeading={false}` for an initially visible desktop summary;
a selection can enable heading focus, while sheets always manage modal focus.

`pnpm registry:sync` builds registry items and the explorer catalog from actual source imports;
`pnpm registry:check` catches stale copied dependencies before publication.

## Explore the library

The deployed [Fleet UI explorer](https://sass-maker.github.io/ui-library/) runs
Storybook with live source, composition examples, theme and light/dark controls,
responsive viewports, reduced motion, and accessibility inspection. The catalog
adds a complete data workspace: filter modules, collect imports, inspect their
registry dependency pins and open the matching examples. Catalog imports are
compiled and example IDs are checked against the built explorer.

```sh
pnpm storybook        # http://localhost:6006
pnpm storybook:check  # explorer and component types
pnpm storybook:build  # static explorer
pnpm check:explorer --built
BASE_URL=http://localhost:6006 pnpm check:browser:explorer
```

Import interaction patterns from `@saas-maker/ui/recipes/*`, visual treatments
from `@saas-maker/ui/effects/*`, and primitives from `@saas-maker/ui/components/*`.
Import `@saas-maker/ui/styles.css` once; theme.css includes the effect keyframes.
Each module has a working example and import path in the explorer. Uploads and
async forms require application-owned callbacks; examples do not send files or
create accounts. Motion is optional and honors reduced-motion preferences.

Selective MIT adaptations come from shadcn/ui, Xevrion UI Lab, Motion Primitives
and Magic UI. Pinned source provenance is in `packages/ui/upstream.json` and
copyright/permission notices in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
Transitions.dev is a design reference only; its restricted collection is not
redistributed. The retained iOS factory keeps its independent dependencies.

The `UI library and explorer` workflow checks pull requests and deploys the
static explorer to GitHub Pages on main. To restore a verified revision, rerun
its successful main workflow. This first publication can be withdrawn by
disabling Pages; product consumers keep their pinned Git tags.

## Connected workspace

Start here → Workspace composes the same organisms into a complete local app.
Search sections with ⌘K/Ctrl+K, retain drafts across navigation and browser Back,
preview local images, remove/undo files, read feedback and retry failed settings
saves. The first-run example connects the setup form to that same workspace,
carrying the chosen name through the handoff. Each source toolbar copies a standalone example. No file or account data
is sent to a server.

`AppShell` accepts `onNavigate` for client routers and `mobileActions` for header
controls. `AssetLibrary` accepts `showHeader={false}` inside an existing page
header. Workspace organisms reflow to their available container width. Shared
buttons expand to 44px on coarse pointers, and fields retain 16px text on touch
tablets.

## Media-led compositions

Start here → Media in the explorer contains a complete Kith page and a copyable
source example. It uses existing artwork and actual app screens, with truthful
internal-beta status. The silent movie is an edited screen sequence, not a live
interaction recording.

- `@saas-maker/ui/atoms/responsive-image`: native picture sources, dimensions,
  mobile/wide focal points and a visible image failure state.
- `@saas-maker/ui/atoms/video`: no movie fetch until play; native controls,
  captions, error/retry, and pause offscreen, on hidden tabs or on a live
  reduced-motion change. Deliberate playback remains available.
- `@saas-maker/ui/molecules/media-backdrop`: decorative artwork with optional silent
  video. `layout="cover"` (default) crops artwork behind the foreground and a
  readability gradient. `layout="stacked"` shows the complete picture above
  separate copy; video and transport controls overlay only the artwork. Pass
  `posterSize={{ width, height }}` with the actual image dimensions to reserve
  its space before loading. Playback pauses when the artwork leaves view and
  stays paused on re-entry until deliberate play. `poster`, `sources`,
  `focalPoint`, `className` and `contentClassName` remain supported.
- `@saas-maker/ui/molecules/media-frame`: consistent caption and credit.
- `@saas-maker/ui/organisms/media-sequence`: keyboard-accessible product chapters.

Molecules → Motion → Carousel includes a copyable Kith artwork gallery,
a responsive collection with live removal/restoration, an RTL example, and a
controlled-selection example that can freeze the parent’s selected artwork.
Navigation and slide selectors have 44px targets. Focus the frame for arrow,
Home and End navigation; controls keep focus as slides change. Offscreen
slides are inert, geometry follows actual widths and gaps on resize, and
reduced motion follows the live preference. The gallery never auto-advances.
Swipe release settles from the actual pointer position; an ignored selection
request returns to the parent’s current frame.
`Carousel` accepts a descriptive `label`, controlled `index`/`onIndexChange`,
or `initialIndex`; `CarouselItem` accepts an optional slide `label`.

The two local movie formats, English descriptions and source hashes live in
`site/public/visual/kith-sequence*`. The optional regeneration script is
`node explorer/scripts/build-media-sample.mjs` and requires an installed ffmpeg.
Standard checks and consumer builds use the committed media.

## Retained native-app landing factory

The complete former iOS Landings repository lives in
[`archives/ios-landings`](archives/ios-landings/README.md), including product
content, artwork, source, tests, historical evidence and deploy scripts. Its
original history is retained in this repository. It is an absorbed component
of UI Library, with no independent product roadmap.

The factory keeps its own pnpm workspace and unchanged lockfile/UI pins.
Install it separately with `pnpm --dir archives/ios-landings install --frozen-lockfile`.
Fleet agents use `fleet-workspace install --repo <checkout>/archives/ios-landings`.

```sh
pnpm landings:dev
pnpm landings:check
PRODUCT=anchor pnpm landings:check:one
```

Production commands retain existing targets and require release approval:
`pnpm landings:deploy kith --existing-only` and
`pnpm landings:deploy:daddyrad`. The move itself does not deploy sites,
change domains, or publish native apps. The archived factory's build-only
Journal/Habits configurations and product-specific release restrictions remain
in force.

Imported from `Significant-Hobbies/ios-landings` at
`5eb30350ca537f8a9ebed792343c1783946842a4` on 2026-10-22.

## Web product (Astro)

The v0.1.33 candidate adds native select, disclosure, dialog and progress controls,
plus an imperative DOM adapter using the same shared styles. AppShell can opt into
a controlled desktop rail and modal mobile navigation. See the
[native control contract](packages/ui/NATIVE_CONTROLS.md) for supported tags,
native refs and CSS source requirements.

Registry upgrades of the `app` block now install at
`src/components/fleet/blocks/app.tsx`. Earlier copies may remain at
`components/app.tsx`; update imports and reconcile local customizations before
replacing the earlier copy.

Install from the GitHub repo (public), not npm. Write the specs into `package.json`
and run `pnpm install`; templates needs ui and motion beside it.

```sh
G="github:sass-maker/ui-library#v0.1.33"
pnpm pkg set "dependencies.@saas-maker/ui=$G&path:/packages/ui" \
  "dependencies.@saas-maker/motion=$G&path:/packages/motion" \
  "dependencies.@saas-maker/templates=$G&path:/packages/templates"
pnpm install
```

`package.json` should then read:

```json
"@saas-maker/motion": "github:sass-maker/ui-library#v0.1.33&path:/packages/motion",
"@saas-maker/templates": "github:sass-maker/ui-library#v0.1.33&path:/packages/templates",
"@saas-maker/ui": "github:sass-maker/ui-library#v0.1.33&path:/packages/ui"
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

Products can keep their own personality. The explorer’s **Foundations → Tokens →
Product personality** example changes presets and density on the same working
form, with copyable setup and a product action wrapper.

- Set `data-theme` and `data-mode` on `<html>` so the landing, application and
  portalled dialogs/menus inherit one identity. Product CSS loaded after the
  theme can override semantic color roles, font roles and `--radius`. Keep
  foreground/background token pairs together and verify their contrast.
  Embedded previews can set both attributes on their boundary; each preset
  resets its default roles so a parent product's fonts and accents cannot leak.
- Use existing `variant`, `size`, `className` and `data-slot` hooks for repeatable
  visual choices. `Button` exports `buttonVariants`; `asChild` preserves native
  links when an action navigates. A product wrapper should forward the shared
  component’s props and merge the caller’s className last with `cn`.
- Compose children, named template slots, organism callbacks and supplied media
  rather than copying a component. Keep product content and one-off wrappers in
  the product; add a shared variant when several products need the same pattern.
- Retain shared keyboard, focus, touch-target and reduced-motion behavior while
  changing appearance. The font-pairing bench applies one pairing to both the
  landing and a working asset library.

The image spread is reusable as `GalleryEditorial` from
`@saas-maker/ui/blocks/gallery`. It accepts title, lede, actions, primary image,
related image/story, captions and footer. It reflows by its container width, so
it works inside an application panel as well as a landing page. Images accept
`focalPoint` for deliberate cropping. `FileCard` also accepts `previewFit`,
`previewFocalPoint` and caller-supplied `previewText`; `AssetLibrary` presents
that excerpt in the preview dialog without fetching document contents.

`ProjectOverview` supports a plain embedded surface, an optional header and a
product-specific `focus` slot above its compact metric strip. `MetricCard` also
exposes `variant="inline"` for shared surfaces. Inbox and settings organisms
accept `showHeader={false}` when the application already owns the page title.
The explorer’s workspace connects artwork decisions to its checklist, inbox,
activity and a single-step undo; counts are derived from local state.

The explorer’s **Foundations → Tokens → Font Pairings** compares four curated
web pairings on the same Kith landing and interactive asset library. Copy the
page font configuration or CSS role variables directly:

| Direction | Display / accent | Interface |
| --- | --- | --- |
| Editorial | Instrument Sans / Instrument Serif italic | Instrument Sans |
| Calm product | Newsreader / Newsreader italic | Manrope |
| Expressive | Bricolage Grotesque, upright | Geist |
| Technical | IBM Plex Sans, upright | IBM Plex Sans; Geist Mono for identifiers |

These fonts are free and open source under SIL OFL 1.1. Their licenses ship in
`packages/ui/src/fonts/licenses/`; `sources.json` records pinned package versions,
asset sizes and hashes. New variable font files are copied unmodified from
Fontsource 5.3.0. Manrope and Bricolage are upright only; use the supplied real
serif italic or an upright accent. Fontsource packages are build-time asset
sources, with no additional runtime JavaScript. The **Font Impact** bench compares
all ten families at equal sizes and lets you inspect system fallbacks and numerals.

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

Pages that style their own content but keep `SiteHeader` and `StudioFooter` can import `@saas-maker/ui/source-shell.css` (header, mobile nav, footer only) as their one utilities entry instead of a whole template entry.

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

### Dark default and tokensFromApp

As of the **0.1.20 release candidate**, omitted `page.mode` means `"dark"`
for base, paper, hearth, signal, gallery and ink. Typography stays with the
preset; neutral near-black surfaces and readable accents compose with both
Gallery and Workbench. Product accents still come from tokens.

**Migration from 0.1.19:** add `"mode": "light"` to intentional light showcases.
Replace light-only `--brand-soft` and dark `--brand-ink` overrides when moving
a page to dark. Existing demos remain available; the light identity showcases
opt in explicitly. New examples: `/demo/dark-gallery/`, `/demo/dark-workbench/`
and `/demo/from-app/`.

A landing should use the same background, type and components as its app.
Copy the app's resolved CSS palette into `page.fromApp` instead of choosing a
second landing palette:

```json
{
  "page": {
    "title": "Your product",
    "fromApp": {
      "background": "#111111", "foreground": "#f5f5f5",
      "card": "#191919", "surface": "#202020", "muted": "#202020",
      "mutedForeground": "#b0b0b0", "border": "#363636",
      "brand": "#4a7cf2", "brandForeground": "#111111",
      "destructive": "#ff8585", "radius": "12px",
      "fonts": { "sans": "geist", "display": "figtree", "mono": "geist-mono" }
    }
  }
}
```

All color roles and radius are required; fonts and each font role are optional.
Colors accept solid `#rgb`/`#rrggbb`, `rgb()` and `oklch()` values. Resolve
`var()`, dynamic colors and transparency in the app first. Radius accepts px,
rem or `0`. Font names are `figtree`, `newsreader`, `instrument-serif`,
`fraunces`, `geist`, `instrument-sans`, `manrope`, `bricolage-grotesque`, `ibm-plex-sans`, `geist-mono` and `system`; no unbundled font can be named.
Sans also maps long-form text; display also maps heading accents. App fonts
win over `page.fonts`. Explicit `page.tokens` win last.

`tokensFromApp` (exported from `@saas-maker/templates/tokensFromApp`) maps the
app roles plus dependent button, popover, focus and sidebar variables.
`Base.astro` applies it automatically, defaults to dark, and accepts explicit
`page.mode: "light"`. Content builds and direct Base usage reject unknown keys,
invalid values, foreground or muted text below 4.5:1 on background/card,
brand below 3:1 on background, or brand text below 4.5:1. Contrast includes
explicit overrides for those roles; use solid colors there too.

For **CSS apps**, copy resolved `--background`, `--foreground`, `--card`,
`--surface`, `--muted`, `--muted-foreground`, `--border`, `--brand`,
`--brand-foreground`, `--destructive`, `--radius` and their font families.
Map the kebab-case role names to the camelCase JSON keys above. Reuse the same
library components so buttons, cards and footers inherit the same roles.

For **Swift apps**, copy the sRGB values from the app's `SMPalette` (or asset
catalog dark appearance) as hex/rgb values; a Swift radius in points maps to
web px. Map bundled Apple names (`Geist`, `Figtree`, `Geist Mono`, `Newsreader`,
`Fraunces`, `Instrument Serif`) to the names above. Swift includes generated
`.base.dark`, `.paper.dark`, `.hearth.dark`, `.signal.dark`, `.gallery.dark`,
`.ink.dark` and `.workbench.dark` palettes, plus a helper:

```swift
let palette = SMPalette.fromApp(
    background: Color("Background"), foreground: Color("Foreground"),
    card: Color("Card"), border: Color("Border"), brand: Color("Brand"),
    brandForeground: Color("BrandForeground"), surface: Color("Surface"),
    muted: Color("Muted"), mutedForeground: Color("MutedForeground"),
    destructive: Color("Destructive"), radius: 12,
    sansFont: "Geist", displayFont: "Figtree", monoFont: "Geist Mono"
)
ContentView().smTheme(palette)
```

The helper defaults to dark. Swift's environment default is `.base.dark`;
explicit light presets remain available. SwiftUI dynamic colors cannot be
measured at compile time; the copied web palette is validated by the content
build. This candidate also replaces fixed showcase/terminal colors with
semantic roles and regenerates the shared JSON, Swift and static-footer assets.
Release notes follow this repo's README and release-commit convention.

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
`newsreader`, `instrument-serif`, `fraunces`, `geist`, `instrument-sans`, `manrope`,
`bricolage-grotesque`, or `ibm-plex-sans`. `accentStyle` is
`italic` or `normal`; write `*phrase*` for an accent. Manrope and Bricolage
accents resolve to upright; other italic faces are real bundled Latin assets.
Font synthesis is disabled for overridden accents.
Newsreader uses its fixed display/text optical sizes. `text` overrides both
`--font-sans` and `--font-text`; omitted roles retain theme defaults.
`display` overrides `--font-display` and its supported weight; `accent` sets
`--font-accent`. Only a bundled display face is preloaded. Other faces load
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
surface, subdued text, and hairlines; `default` retains the theme. All presets support `mode: "dark"` (the default). Explicit token overrides win over font and surface
presets. Demos: `/demo/identity-split/`, `/demo/identity-workbench/`,
`/demo/identity-form/`, `/demo/identity-masthead/`, `/demo/identity-surface/`, and
`/demo/identity-closing/`.

For native-app landings such as Anchor and Calorie, `display` and `text` also
accept `"ui-rounded"` (the `accent` role retains its bundled-face options):

```json
{ "fonts": { "display": "ui-rounded", "text": "ui-rounded" } }
```

This maps to `ui-rounded, "SF Pro Rounded", Nunito, Figtree, system-ui,
sans-serif`, so Apple devices use their native rounded face. Nunito and Figtree
are fallbacks when available; this option adds no font dependency or font
preload. Explicit `page.tokens` and `fromApp` font precedence still apply.

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

### App interior footer modes

`StudioFooter` and the framework-free `renderStudioFooterHtml` accept
`mode="compact"` for sign-in or empty interiors: only product identity and
optional legal text remain, using existing theme tokens. `mode="suppressed"`
renders no footer. The custom element accepts the same `mode` attribute or
config property. Both modes omit subscription, feedback, Ask AI, artwork,
wordmark and studio navigation; the page owns its relevant primary action.
Omitting `mode` (or setting `full`) preserves the existing studio/gallery output.
These modes do not resolve consumer Google/FedCM initialization.

For template suppression, keep using `footer={null}`, `footer={false}` or
content `footer: false`; use Base `footerScript={false}` when no footer behavior
is needed. Base also skips sending setup when no footer forms are rendered.
Consumer adoption and final owner/device/production acceptance remain separate.

Controlled responsive check after building and starting a local site preview:
`node site/scripts/footer-interior-check.cjs` (390/768/1440; inert primary actions,
external requests blocked). Requires Playwright Core and Chromium; set
`PLAYWRIGHT_MODULE` and `CHROME` for installed paths. `SCREENSHOT_DIR` sets
the evidence destination.

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

`DataTable` columns can set `group` to render consecutive columns under a
shared header. Sorting, visibility and row data continue to use each leaf
column's `id`.

For narrow containers, an ungrouped `DataTable` can give its identifying
column a `compactCell(row)` renderer and mark supporting columns
`collapseInCompact: true`. Below 40rem of available table width, the
identifying cell stacks the important details. **Columns → Show all columns**
restores the full table; horizontal overflow then has a cue above the header.
Selection, sorting, export and row details keep the same data and handlers.

## Loading states

Show a same-shape placeholder within 300 ms; delay it about 150 ms to avoid
flashing on fast responses. Reserve image ratios, table columns and row heights.
Keep the shell visible, avoid full-page spinners, and show cached data on revisit.
Every collection needs an empty state and every failure needs a retry action.
Skeleton containers announce “loading” once; bones are hidden from assistive
technology and pulse stops under reduced motion.

```tsx
"use client";
import { useResource } from "@saas-maker/ui/lib/use-resource";
import { ResourceBoundary } from "@saas-maker/ui/blocks/resource-boundary";
import { CardSkeleton } from "@saas-maker/ui/blocks/skeletons";

async function fetchItems(signal: AbortSignal) {
  const response = await fetch("/api/items", { signal });
  if (!response.ok) throw Object.assign(new Error("could not load items"), {
    status: response.status, // retries network/5xx, never 4xx
  });
  return response.json() as Promise<{ id: string; name: string }[]>;
}
export function Items() {
  const resource = useResource("items", fetchItems, { staleTime: 30_000 });
  return <ResourceBoundary resource={resource} skeleton={<CardSkeleton />}>
    {(items) => <ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>}
  </ResourceBoundary>;
}
```

Use `SkeletonText`, `SkeletonAvatar`, `SkeletonBlock`/`SkeletonImage` from
`components/skeleton`; shaped layouts (`CardSkeleton`, `CardGridSkeleton`,
`StatTileSkeleton`, `QuoteListSkeleton`, `RecordDetailSkeleton`,
`ConsolePageSkeleton`) from `blocks/skeletons`. `DataTableSkeleton` lives beside
`DataTable` in `components/data-table`; reuse the loaded table's column widths
and row count. `EmptyState` and `ErrorState` also work independently.
`useResource` shares a key-based in-memory cache and deduplicates requests;
include account, filters and locale in keys. Use separate resource clients for
server requests and recreate account-scoped clients on sign-out. Pass `initialData` for
server-rendered values. Session storage is opt-in: use it only for safe data.

```tsx
import { createResourceClient, invalidate, prefetch } from "@saas-maker/ui/lib/use-resource";
const client = createResourceClient(); // one per account or server request
// Inside a client leaf:
const resource = useResource("public-items", fetchItems, {
  client, staleTime: 30_000, cacheTime: 300_000,
  persist: { ttl: 60_000 }, // optional sessionStorage; only safe public data
  revalidateOnFocus: true, revalidateOnReconnect: true,
});
// Default shared client; use client.prefetch/client.invalidate for isolated caches:
await prefetch("items", fetchItems);
invalidate("items");
```

### Streaming and partial hydration

The site pins Astro 7.3.5 and React 19.3.0. Its static build demonstrates a
`client:load` island, not a deployed server island. In an Astro product with an
adapter, defer an **Astro** data component and put the matching skeleton in its
fallback slot (the surrounding shell renders immediately):

```astro
---
import ItemPanel from "../components/ItemPanel.astro";
import { CardSkeleton } from "@saas-maker/ui/blocks/skeletons";
---
<ItemPanel server:defer>
  <CardSkeleton slot="fallback" />
</ItemPanel>
```

Use `client:visible` for below-fold React leaves, or `client:idle` for
noncritical interactive leaves; neither directive defers the initial server
HTML. Keep immediately needed controls on `client:load`. For client navigation
prefetch, call `prefetch("items", fetchItems)` from `lib/use-resource` on a
link's focus/pointer-enter, using the same key as the destination island.

In a Next App Router product, put a matching skeleton in `app/items/loading.tsx`
for the route, or place `<Suspense fallback={<CardSkeleton />}>` around an async
Server Component nearer the fetch. Fetch within that component so the boundary
can stream independently. Keep `useResource` in `"use client"` leaves; seed
those leaves with `initialData` when the server already fetched the data.
Next is a consumer recipe, not an installed or tested framework in this repo.

See [the loading demo](/demo/loading/) and [loading guide](/docs/loading/).
Framework references: [Astro server islands](https://docs.astro.build/en/guides/server-islands/),
[Astro directives](https://docs.astro.build/en/reference/directives-reference/),
[Next streaming](https://nextjs.org/docs/app/getting-started/fetching-data).

## Mac / iOS app

```swift
.package(url: "https://github.com/sass-maker/ui-library", from: "0.1.28")
// ...
ContentView().smTheme(.gallery.dark.brand(Color("Brand")))
```

The Swift package bundles the original six web families (Figtree, Newsreader,
Geist, Geist Mono, Instrument Serif, Fraunces; SIL OFL, licenses in
`swift/Sources/SaaSMakerUI/Fonts/Licenses`) and follows the theme's lowercase
voice for headings and buttons.

`SMButtonStyle(.outline, size: .compact)` opts into small operational controls:
14pt display type, 12pt horizontal inset and 32pt minimum height (links retain
4pt inset). These match the shared web small-control rhythm. The default
`.regular` size and `.smBrand` / `.smSolid` / `.smOutline` / `.smLink` shortcuts
retain their original metrics and behavior. Keep primary actions regular; on
touch devices, give compact labels a minimum 44pt target. Colors, fonts,
capsules and press behavior still come from the same shared palette and motion.

The `Native compact button` PR workflow builds/tests on macOS 14 (the supported
minimum) and macOS 15. `SM_SNAPSHOT_DIR` emits genuine SwiftUI PNG examples at
390 and 768 points, including disabled and larger-text controls. Its artifacts
carry build/test logs and renders; native owner/device review is separate.
No library tag is published by this workflow. Consumers can temporarily pin a
reviewed exact branch commit until the owner approves a release tag.

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

## Static site / no framework

Install the pinned UI package with the same GitHub spec style:

```sh
pnpm pkg set 'dependencies.@saas-maker/ui=github:sass-maker/ui-library#v0.1.33&path:/packages/ui'
pnpm install
cp node_modules/@saas-maker/ui/footer.* public/
```

The committed `footer.js` and `footer.css` need no React, Tailwind, CDN imports,
or consumer build step. Serve these files at your static asset path:

```html
<link rel="stylesheet" href="/footer.css">
<script type="module" src="/footer.js"></script>
<studio-footer product="Reader" url="https://reader.significanthobbies.com"
  catalog-id="reader" capture="newsletter" variant="studio">
  <script type="application/json">
    {"summary":"Your saved links.","groups":[]}
  </script>
</studio-footer>
```

Attributes use kebab case; JSON and `.config` use the React prop names.
JSON is merged with `.config`, then attributes take precedence. Supported scalar
attributes: `product`, `url`, `summary`, `catalog-id`, `feedback-key`,
`subscribe-key`, `capture` (`newsletter`, `waitlist`, `false`), `variant`
(`studio`, `gallery`), `art-mode` (`panel`, `scene`), `wordmark`
(`poster`, `stack`, `fill`), `privacy-url`, `legal`, `class-name`, and `ref`.
JSON or `.config` supplies `groups`, `art`, `studio`, and the other props.
`summary`, `legal`, and `mark` accept escaped text rather than React nodes;
there is no raw HTML interpolation. All other markup and copy comes from the
unchanged React footer source. The system-font defaults use the same theme
roles; define `--font-display` / `--font-text` on your page to use your fonts.
`data-theme` and `data-mode="dark"` use the web theme palettes.

`projects` accepts the public projects list and uses `studioFromProjects`, with
`catalogId` as the current project and `studioLimit` defaulting to three.
`studio-from-projects="true"` (or `studioFromProjects: true`) fetches
`https://sassmaker.com/projects.json` in the browser; a URL value selects your
own feed. Explicit `studio` takes precedence; empty or failed sources use
`defaultStudio`. Links use `ref=<catalogId>` unless `ref` overrides it.
The Node helper is synchronous: fetch a feed yourself and pass `projects`.

For a Cloudflare Worker string template, prerender the exact same footer and
wrap it in the element. It is visible before JavaScript loads; the element
attaches behavior to the existing footer without replacing it:

```js
import { renderStudioFooterHtml } from "@saas-maker/ui/footer-html";
export default {
  fetch() {
    const footer = renderStudioFooterHtml({
      product: "Reader", url: "https://reader.significanthobbies.com",
      catalogId: "reader", summary: "Your saved links.", groups: [],
    });
    return new Response(`<!doctype html><html><head>
      <link rel="stylesheet" href="/footer.css">
      <script type="module" src="/footer.js"></script>
      </head><body><studio-footer>${footer}</studio-footer></body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } });
  },
};
```

Serve the copied assets through your existing static asset route. No project
key means preview mode; catalog lookups use the same retry/cache rules and
Unreachable message as `Base.astro`. `subscribeKey` falls back to `feedbackKey`.
The default consent privacy link is `https://sassmaker.com/privacy`.

**Do not use both `footer.js` and the `Base.astro` footer script.** Use
`footerScript={false}` if embedding this element in Base. Element handlers
stop handled events before Base's window listeners as a defensive guard;
other page scripts keep their own scope. Multiple element instances scope
forms, dialogs, anchors and key caches independently (markup retains the
React component's fixed field IDs, so prefer one footer per page).

Rebuild with `pnpm footer:build`; `pnpm test` includes React/static parity.
The parity test sorts attributes and drops React comment nodes only. It preserves
text whitespace, entity spelling, attribute casing, void-element syntax, child
order, classes, and inline styles. Text-only ReactNode props are the sole
intentional prop limitation; raw React elements cannot be passed to JSON.


### Visual materials and browser checks

The [visual source shelf](https://sass-maker.github.io/ui-library/?path=/story/start-here-visual-sources--source-shelf)
contains curated original sources, formats and reuse notes. Consume the same
machine-readable data with `@saas-maker/ui/visual-sources.json`. It is a source
directory, not an asset redistribution pack. Preserve exact item provenance
when importing an asset; library source-code terms and artwork terms can differ.
Original dependency-free CSS studies are exported from
`@saas-maker/ui/lib/visual-materials`.

After `pnpm storybook:build`, install test engines with
`pnpm exec playwright install chromium firefox webkit`, then run
`pnpm test:browser`. Interaction checks cover all three engines at phone and
desktop widths. `pnpm test:visual` compares forms, compositions, recovery states
and the source shelf at 390, 820 and 1440px in paper/light and ink/dark.
These are browser-engine and viewport checks; they do not establish physical
phone or installed Safari qualification.

CI compares committed Linux baselines and never updates them on pull requests.
To propose a visual change, dispatch the explorer workflow on the candidate
branch with `updateVisuals: true`, inspect the `browser-review` artifact, and
commit only the reviewed `baselines/linux` images. macOS candidates remain
local because font rasterization differs by OS. Keep Playwright pinned so its
browser builds and comparisons stay reproducible.

Candidate generation runs the visual suite and never deploys. Pull requests
and normal main builds run the complete interaction and screenshot suite;
only successful normal main builds can publish the explorer.
