# Assessment B: technical audit

Independent source and built-output audit of the owner-selected Living Memory Book system. Assessment A's visual critique was not repeated. This assessment is local; it does not certify WCAG compliance, qualify external newsletter/analytics services, or claim a production performance score.

## Implementation integrity verdict

**Pass.** The engine composes product-owned colors and optional material assets around authentic app evidence. Phone, desktop and app-artwork paths stay distinct. Kith's fictional photography is labeled illustrative artwork. Semantic live copy remains separate from raster materials. Honest beta/release actions, full-size capture access and native FAQ disclosure survive the redesign. No runtime dependency or lockfile changes were introduced.

The mechanical detector ran **once**, against `src/pages/index.astro`, `src/components/Phone.astro`, `src/styles/landing.css`, and `src/styles/global.css`. Raw output is `detector.json`: `[]`. There are no detector advisories or false positives to interpret. Later corrections are assessed through source and focused measurement, without another detector run.

## Audit health score

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Accessibility | 3/4 | Measured contrast, semantic landmarks, keyboard disclosure, focus styles and complete Reduced Motion states are sound. Focused local evidence does not certify all WCAG criteria or external forms. |
| Performance | 3/4 | Static Astro composition, optimized WebP ingredients, lazy below-fold imagery and bounded CSS motion. A large decorative texture still serves one size on mobile. |
| Responsive design | 4/4 | Normal layout and 200% text enlargement fit 320/390/768/1440 measurements after correction. Device and artwork branches preserve proportions. |
| Theming | 4/4 | Product tokens retained; explicit optional story ink; dark privacy surfaces preserve light readable text. |
| Implementation integrity | 4/4 | Product-specific assets, honest availability, intact device distinctions, empty detector output and no added landing JavaScript. |
| **Total** | **18/20** | **Excellent; one optional performance tuning opportunity.** |

Open issues: P0 **0**, P1 **0**, P2 **1**, P3 **0**. Both verified P1 issues were corrected and checked. Current parent browser evidence verifies all 12 keyboard/motion/route interactions with no page errors. The final parent browser evidence has **9 passing responsive views, 12 passing interactions, zero failures and zero page errors**.

## Findings

### Corrected [P1]: enlarged text clipped at mobile widths

- **Location:** `src/styles/landing.css` hero, tension, chapter, fit and founder grid rules; scene-copy heading and narrow-screen display sizes. `src/styles/global.css:39` hides horizontal overflow.
- **Category:** Accessibility / responsive design.
- **Verified impact:** An independent browser diagnostic sets the root text size to 200% (a text-enlargement diagnostic, not a claim of browser zoom equivalence). At 390px the scene heading extends to x=480, tension statement to x=475, and fit heading/body to x=499. The viewport cuts meaningful text. At 320px further headline/action text clips. 768 and 1440px diagnostics show no clipped text.
- **Standard:** WCAG 1.4.4 Resize Text; also undermines the intended reflow behavior.
- **Correction and verification:** Grid children now use `min-width:0`; headings, paragraphs and quotations allow oversized words to wrap; scene headings are constrained to available inline size. Repeated independent diagnostics at **320, 390, 768 and 1440px** with **200% root text size** found **zero horizontal overflow and zero clipped heading/paragraph/link/summary text ranges**.
- **Suggested command:** `$impeccable adapt`.

### [P2] Decorative bookcloth serves a single large source on mobile

- **Location:** `src/pages/index.astro` bookcloth and closing-cloth images; `products/kith/public/images/story/book-stage.webp`.
- **Category:** Performance.
- **Verified impact:** The 1024×1536 WebP is 535,264 bytes and is requested above the fold even when the stage is approximately 300px wide. Its closing reuse benefits from cache, but smaller-screen clients still receive the full initial texture.
- **Recommendation:** Consider a product-owned smaller WebP rendition with `srcset`/`sizes`, retaining the full source for high-density large stages. Keep the illustrative coffee photo at its existing economical 61,616 bytes. This is a tuning opportunity, not measured slow-load evidence.
- **Suggested command:** `$impeccable optimize`.

## Corrected during audit

**Tablet-photo geometry polish:** The first parent browser capture flagged photo/screen bounds contact at 768px. Independent settled measurement found only **0.636px** of rotated rectangle contact and no obscured app text; Reduced Motion had approximately 12px clearance. The tablet photo has since moved from `left:-20px` to `left:-34px`. Independent measurement of the refreshed local build shows **14.42px settled photo/screen clearance**, and final parent browser evidence has no overlap failure. This is strict-clearance polish, rather than another significant accessibility issue.

**[P1] Notebook paragraph/link contrast.** At 768px, glyph-region background samples behind the paragraph reached approximately 1.20:1 and the link 2.21:1. At 1440px they reached 2.25:1 and 2.32:1, below 4.5:1. The notebook photograph includes a dark spine and coral cloth under those text positions. The parent corrected `.scene-copy > p` and `.scene-copy .text-link` to use solid semantic paper backgrounds at every breakpoint. The resulting foreground/background pair is **14.21:1**, independent of the photograph. The mobile translucent override was removed. This correction is verified in current source and local built output.

A transient duplicate `tokens.paper` asset entry was also identified and corrected to `story.paper`; source now retains the proper color token and separates the optional texture.

## Measurements and positive findings

- Kith story indigo `#20243d` against ivory `#fff6ea`: **14.21:1**. Indigo against field: **12.39:1**.
- Muted labels `#4e5269` against ivory: **7.17:1**; against field: **6.26:1**. This includes paper-backed photo and scene labels.
- Across every pixel of the actual paper texture, indigo contrast is at least **9.99:1**, muted text at least **5.04:1**.
- The existing dynamic action-color helper selects rust `#9a3f2a` with ivory text, yielding **6.29:1** in normal and hover states. Decorative campaign colors do not overwrite action contrast.
- Built-product muted colors, composited where necessary, remain above 4.5:1 on paper, field and blush. Dark products override the privacy field's inverse light-theme pairing; a naive ink-on-dark/ink measurement is not applicable to that branch.
- Hero and screenshot images have intrinsic dimensions. Below-fold screen/scene/privacy images use lazy loading and asynchronous decode. Production story assets total **850,108 bytes** before HTTP overhead.
- Native `details`/`summary`, semantic `h1`→`h2`→`h3`, labeled navigation, `main` landmark, skip link and `:focus-visible` preserve the keyboard path. Main actions are at least 48px high; navigation/screenshot/FAQ affordances have 44px minimum height. The keyboard-only skip link is 38px high, exceeds WCAG's 24px minimum target requirement, and is not treated as a material issue.
- Reduced Motion provides complete visible still states, resets material transforms and smooth scrolling, and retains focus/disclosure feedback. No global near-zero-duration animation hack was added.
- Opening motion is bounded to 650–750ms. Scroll-driven decorative image motion has a complete static fallback. No layout-property animation, landing script, scroll hijacking, or new production dependency is introduced.
- `Phone.astro` obtains actual capture metadata, uses uncropped natural proportions, distinguishes desktop/artwork frames and offers explicitly labeled full-size links in a new tab. BrowserDaddy's artwork path never becomes a private browsing screenshot or iPhone frame.

## Recommended actions

1. **[P2] `$impeccable optimize`:** Consider smaller decorative bookcloth sources for narrow devices.
2. **`$impeccable polish`:** Confirm final screenshot/link/label alignment after the corrective changes.

You can ask me to run these one at a time, all at once, or in any order you prefer.

Re-run `$impeccable audit` after fixes to see your score improve.
