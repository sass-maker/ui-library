# Preserve-C refinement: independent technical audit

**17/20 under the current Fleet v2 rubric.** The photographic refinement passes focused accessibility and responsive checks after correcting notebook contrast and photo clearance. This report evaluates the updated implementation; it does not claim owner acceptance of the revised visuals.

| Dimension | Score | Evidence and deduction |
| --- | ---: | --- |
| Purpose | 4/4 | Accurate private iPhone app identity, credible real-screen proof and honest internal TestFlight next action. Separate purpose comprehension remains independent Assessment A evidence. |
| Accessibility | 5/6 | Measured contrast, semantic structure, keyboard disclosure, source focus/target rules, enlarged text and complete Reduced Motion pass. External newsletter accessibility and exhaustive WCAG coverage remain unqualified. |
| Behavior | 3/4 | Primary status path, local routes, native FAQ states and normal-scroll screenshot decoding pass. External newsletter submission/success/error behavior remains unknown. |
| Responsive | 3/3 | Required widths and six additional widths pass the recorded reflow/clearance checks. This is not a guarantee for every possible browser or viewport. |
| Performance | 2/3 | Static production-built composition, economical motion, WebP/lazy assets and no new landing JavaScript/dependency. One-size 535KB bookcloth and unmeasured public loading cost retain a deduction. |
| **Total** | **17/20** | **Good; no open P0/P1.** |

This is an independent rescore using `design-workflow/references/quality-rubric.md`, not a proportional conversion or attempt to preserve the earlier score. The earlier **18/20** five-by-four Impeccable assessment is retained as historical JSON fields; `rubric_dimensions` and `rubric_total` are authoritative for Fleet v2. No additional tests or detector invocation were run for this rescore.

Open issues: **P0 0 · P1 0 · P2 1 · P3 0**. The P2 is a previously documented optional texture-delivery improvement, not a new regression.

## Scope and evidence

Reviewed Kith's `coastal-walk-v2.webp` and `memory-table-v2.webp` config references, thinner print mat and four-degree rotation, 24%-opacity paper, notebook text without solid patches, responsive scene stacking and the corresponding source/build output.

Independent measurements cover **320, 375, 384, 390, 768, 900, 1024, 1200 and 1440px**, each with normal and 200% root text size, and normal/Reduced Motion: **36 states**. `independent-measurements.json` records the results. The final left-inset and 96px top-clearance corrections are independently remeasured at 1200/1440px and both text sizes in `final-contrast-measurements.json`; these four records supersede the pre-correction data retained in `before-final-left-inset-measurements.json`.

The text enlargement diagnostic changes the root font size; it is not presented as equivalent to browser zoom. It found **zero horizontal overflow, zero clipped heading/paragraph/link/summary/figure-caption text ranges, and zero photo/screenshot overlap** across the measured states. For corner-print layouts the minimum measured horizontal clearance is 3.59px at 390px with enlarged text. At narrower widths the print occupies its own normal-flow row, so vertical separation provides clearance.

The parent's final `browser-evidence.json` separately records **9 passing responsive views, 12 passing interaction/route checks, zero failures and zero page errors**. All three chapter screenshots decoded through normal scrolling. Keyboard skip/disclosure paths and local availability/privacy/support/terms/accessibility/blog routes pass. Parent-run `pnpm check` passed its 23 tests and 12 builds.

## Contrast

Desktop notebook contrast was measured by mapping DOM text-character rectangles onto the actual WebP with its final `object-fit:cover` and `object-position:left top`. Values below are the lowest median background contrast within each glyph's central rectangle. This is focused implementation evidence, not a WCAG certification or an exhaustive per-glyph raster analysis.

| Width | Text size | Heading | Paragraph | Link |
| --- | ---: | ---: | ---: | ---: |
| 1200 | 100% | 7.64:1 | 10.72:1 | 11.08:1 |
| 1440 | 100% | 7.98:1 | 11.02:1 | 11.39:1 |
| 1200 | 200% | 7.55:1 | 11.07:1 | 11.03:1 |
| 1440 | 200% | 7.91:1 | 11.20:1 | 11.08:1 |

Below 1200px, the live notebook copy stacks above the complete image on semantic ivory paper, with **14.21:1** ink contrast. The photograph cannot reduce that contrast. The enlarged desktop text stays within the reserved left paper column; additional lower clearance keeps its link above the notebook's cloth edge.

The 24%-opacity hero texture, composited over the actual ivory token, has whole-image minimum contrast **13.11:1** for indigo, **6.62:1** for muted text, and **5.81:1** for the rust brand. Photo labels remain on opaque paper: indigo **14.21:1**, muted labels **7.17:1**. The unchanged dynamic action helper preserves **6.29:1** normal/hover button text.

## Corrected findings

**[P1] Notebook contrast at intermediate widths/enlarged text — resolved.** Initially, the exposed image spine and cloth edge reduced notebook copy/link contrast at 768px and intermediate enlarged desktop states. The final implementation stacks the scene through 1199px and uses a restrained desktop left inset plus protected left copy column and lower clearance. Final measured text exceeds the applicable 3:1 large-heading and 4.5:1 body/link thresholds without solid text patches. Suggested command for this category: `$impeccable adapt`.

**[P2] Print covering real screenshot at narrow/intermediate widths — resolved.** Initial capture geometry showed substantial overlap at 320, 900 and 1024px. The print now occupies normal flow through 389px and uses a smaller offset composition from 900–1199px. All 36 measured states show no overlap; original app screenshot pixels and full-size links remain available. Suggested command for this category: `$impeccable adapt`.

## Remaining finding

**[P2] One-size decorative bookcloth.** `src/pages/index.astro` still serves the 535,264-byte 1024×1536 bookcloth above the fold on narrow screens. Its closing reuse benefits from cache, and the asset is compressed WebP; this is a possible bandwidth reduction rather than measured slow-load evidence. Consider a smaller rendition with `srcset`/`sizes`. Suggested command: `$impeccable optimize`.

Active Kith story ingredients total **858,888 bytes** before HTTP overhead. No production dependency or landing JavaScript was added. Local timing/resource durations are intentionally not reported as public production performance scores.

## Motion and integrity

All 18 Reduced Motion states retain visible print, real screen, full notebook image and closing sheet with animation names `none` and transforms `none`. The opening remains a bounded 650–750ms material sequence. The notebook scroll treatment has a complete static fallback. The final normal-flow small-screen scene remains a complete image rather than a heavily cropped backdrop.

The friends photograph and notebook materials remain explicitly illustrative. No testimonials, App Store availability, public TestFlight invitation or native product capabilities were invented. All text and actions remain live HTML. Authentic app captures, natural proportions and the shared factory's desktop/artwork distinctions remain intact.

**Detector provenance:** No new detector invocation was made. The historical single run is retained at `../detector.json` with raw output `[]`. It is a historical advisory result, not a mechanical scan of this refinement. Current claims come from focused source/build review and the recorded measurements.

External newsletter, analytics and portfolio integrations were deliberately blocked during local browser work; their live behavior is unqualified. This audit does not certify WCAG compliance or imply owner approval of the new images.

Recommended optional actions: `$impeccable optimize` for responsive texture sources, then `$impeccable polish` for final alignment. You can ask me to run these one at a time, all at once, or in any order you prefer. Re-run `$impeccable audit` after fixes to see your score improve.
