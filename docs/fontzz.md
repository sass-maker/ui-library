# Fontzz: typefaces for future projects

[Fontzz](https://fontzz.vercel.app) is a collection of 36 variable font families.
This is a saved typography resource and reusable agent prompt. The fonts are
not bundled, registered in the theme, or selected as a library default.

The collection describes each family as one WOFF2 file covering weights
100–900, free for personal and commercial use under SIL Open Font License 1.1.
All except Diode are described as having tabular figures by default. Check the
selected file's metadata, glyph coverage and license when adopting it.

## Family catalog

Each download uses `https://fontzz.vercel.app/fonts/<lowercase-name>.woff2`,
for example [halden.woff2](https://fontzz.vercel.app/fonts/halden.woff2).

| Family | Class | Character and useful role |
| --- | --- | --- |
| Halden | sans | Neutral, tightly spaced neo-grotesque for interfaces and product copy. |
| Rondel | sans | Geometric circles, small x-height and tall ascenders; poised display text. |
| Tessera | sans | Squared curves and a large x-height; technical interfaces. |
| Alder | sans | Open, narrow humanist forms with pen-angled cuts; warm readable text. |
| Mallow | sans | Rounded ends, single-story a, tailed l; friendly apps. |
| Strata | sans | Tall condensed grotesque; dense dashboards and narrow headlines. |
| Plaza | sans | Wide extended grotesque; brand marks and large hero type. |
| Tempo | sans | Forward slant and pen-cut ends; motion and energetic launches. |
| Pebble | sans | Soft squared forms, rounded ends, single-story a; playful dashboards. |
| Beacon | sans | Generous spacing, distinct l and I; legibility and reading. |
| Aurelia | sans | Flared stems, restrained carved-stone character; elegant headings. |
| Cove | sans | Rounded geometric circles, single-story a; calm friendly text. |
| Ledger | serif | Sturdy square slabs and even texture; documentation and reports. |
| Folio | serif | Bracketed serifs and calm contrast; essays and long reads. |
| Opaline | serif | High contrast, hairline serifs and ball terminals; luxury mastheads. |
| Cleft | serif | Triangular wedge serifs; confident headlines and labels. |
| Brioche | serif | Pillowy serifs and soft ends; warm friendly brands. |
| Anvil | serif | Geometric circles with heavy slabs; sturdy workshop character. |
| Frontier | serif | Condensed Clarendon with bracketed slabs; poster headings. |
| Quill | serif | Humanist semi-serif with upper entry serifs; warm text. |
| Vellum | serif | Old-style, small x-height and long bracketed serifs; book text. |
| Lustre | serif | Narrow high-contrast didone; fashion mastheads and posters. |
| Hearth | serif | Wide warm forms and short bracketed serifs; editorial brands. |
| Meridian | serif | Transitional, large x-height and even color; documents and long reads. |
| Vesper | sans | Strong vertical/fine horizontal contrast; editorial headings. |
| Topsy | sans | Reverse contrast; playful poster typography. |
| Orbit | sans | Extended squared forms; aerospace brands, specs and large numbers. |
| Diode | sans | Dot matrix that becomes blocks at heavy weights; expressive display, not tabular by default. |
| Marquee | sans | Art deco circles, high crossbars and small x-height; theatre-like display. |
| Gravure | sans | Wide engraver's gothic with subtle spurs; formal display. |
| Rewind | sans | Rounded condensed forms; chunky retro music and game typography. |
| Spire | sans | Ultra-compressed and tall; posters and compact scores. |
| Vector | sans | Condensed squares and angled cuts; gaming and hardware. |
| Signal | mono | Clear sans monospace with distinct slab details; code and tables. |
| Tally | mono | Slab monospace with typewriter warmth; notes, receipts and logs. |
| Fathom | mono | Geometric monospace with square dots and single-story a; code and terminals. |

## Reusable selection prompt

> Help me choose a typeface from the Fontzz family catalog in this document.
> First inspect this project's purpose, audience, existing design direction,
> typography roles, framework and served static directory. Suggest two or three
> suitable families, explain each in one line, recommend one, and ask which I
> want. Do not download, install or apply a font until I answer. Once I choose,
> install only that family using the project's existing font-loading mechanism,
> make it the intended default role, and verify the rendered result.

If the request is only to save Fontzz for future use, stop after saving the
resource. A previous shortlist or preference is not authorization to replace
an application's fonts. In the SaaS Maker discussion, Halden was preferred for
possible future use; no replacement was requested.

## Install after a project-specific choice

1. Work from the actual app root, not necessarily the monorepo root. Download
   only the selected WOFF2 into the served static directory. Astro, Vite and
   Next.js normally serve `public/`; verify the project's configuration.

   ```sh
   curl -fL --create-dirs -o public/fonts/FILE https://fontzz.vercel.app/fonts/FILE
   ```

   Replace `FILE` with the selected lowercase family name plus `.woff2`.
   Confirm the response is a valid font, rather than an HTML error. Preserve
   the selected font's copyright and OFL notice alongside the asset.

2. Register the family and update the existing typography token/default.
   Replace `NAME`, `FILE` and `STACK` in this plain CSS / Astro example:

   ```css
   @font-face {
     font-family: "NAME";
     src: url("/fonts/FILE") format("woff2");
     font-style: normal;
     font-weight: 100 900;
     font-display: swap;
   }
   body { font-family: "NAME", STACK; }
   ```

   Fallback stacks: sans `system-ui, sans-serif`; serif `ui-serif, serif`;
   mono `ui-monospace, monospace`. Prefer existing `--font-sans`, `--font-text`
   or `--sans` roles over a competing body override. Keep a deliberate code
   face separate. Recalculate or remove metric-adjusted fallbacks that belong
   to the previous font; do not reuse their numbers for a different family.

   - **Tailwind v3:** retain `@font-face`, import `defaultTheme` from
     `tailwindcss/defaultTheme`, and set `theme.extend.fontFamily.sans` to
     `["NAME", ...defaultTheme.fontFamily.sans]`. Extend replaces the stack;
     choose the serif or mono role when appropriate.
   - **Tailwind v4:** retain `@font-face` and set the intended theme role, e.g.
     `@theme { --font-sans: "NAME", system-ui, sans-serif; }`.
   - **Next.js:** use `next/font/local` with the local file and
     `weight: "100 900"`; apply its `className` to root `<html>`. Next handles
     registration/preloading; do not add another `@font-face`.

3. For non-Next setups, preload only the selected default face in the shared
   document head, matching its served URL exactly:

   ```html
   <link rel="preload" href="/fonts/FILE" as="font" type="font/woff2" crossorigin>
   ```

   JSX uses `crossOrigin="anonymous"`. Remove unused old preloads. Preloading
   reduces delay; it does not guarantee that fallback text never appears.

4. Run the relevant native check/build. Inspect phone, tablet and desktop
   rendering: headings, long labels, dense tables, numerals and used weights.
   Confirm the font loads and is actually used, with no clipped text or
   unwanted layout shifts. Keep landing and app typography coherent.

## Using this library

Fontzz names are not valid bundled `page.fonts` or `fromApp` options today.
A product can self-host a selected family and override the existing CSS font
roles. Adding a family to the shared bundled catalog is a separate change:
include its exact license, asset provenance/hash, registration, role metadata
and the relevant template/asset checks. Saving this reference does not change
those allowlists or download any fonts.
