# SaaS Maker UI

Shared UI for Fleet products: web packages plus a Swift package, generated from
one theme.

| Package | What it is |
| --- | --- |
| `@saas-maker/ui` | shadcn/ui components, theme presets, page blocks |
| `@saas-maker/motion` | scroll motion presets (Motion library) |
| `@saas-maker/templates` | Gallery and Workbench landing templates, base layout |
| `@saas-maker/tokens` | theme tokens as JSON (generated) |
| `SaaSMakerUI` (Swift) | palette, type, components and motion for Mac/iOS |

## Web product (Astro)

```sh
# installed from the private repo, not npm (templates needs ui + motion beside it)
G="github:sass-maker/ui-library#v0.1.1"
pnpm add "$G&path:/packages/ui" "$G&path:/packages/motion" "$G&path:/packages/templates"
```

No extra Astro config is needed; the stylesheet scans the packages for classes.

Add `src/content/<slug>.json` (see `site/src/content/kith.json` and
`codevetter.json`) and render it with `GalleryPage` or `WorkbenchPage` inside
`Base.astro`. Write `*phrase*` for the accent phrase.

## Mac / iOS app

```swift
.package(url: "https://github.com/sass-maker/ui-library", from: "0.1.1")
// ...
ContentView().smTheme(.gallery.brand(Color("Brand")))
```

The Swift package bundles the same fonts as the web theme (Figtree, Newsreader,
Geist, Geist Mono, Instrument Serif, Fraunces; SIL OFL, licenses in
`swift/Sources/SaaSMakerUI/Fonts/Licenses`) and follows the theme's lowercase
voice for headings and buttons.

## Develop

```sh
pnpm install
pnpm dev            # library site with demos
pnpm check          # typecheck packages + build site
pnpm tokens:build   # regenerate tokens.json and the Swift tokens
swift build && swift test
```
