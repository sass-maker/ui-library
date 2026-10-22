# Design: The Living Memory Book

Owner selected direction C on 2 October 2026. Tracking: https://github.com/Significant-Hobbies/ios-landings/issues/30. The approved study is `artifacts/design/uplift/c-memory.png`; it establishes material and composition, while real app captures and semantic HTML supply production truth.

## World

One product per domain, a shared engine with product-owned identity. The system is a physical collection of useful context: paper spreads, a prominent product artifact, carefully placed images, margin notes and confident sans typography. Kith uses coral bookcloth, ivory paper, warm photographic moments and indigo writing. Other apps retain their palettes and subject matter. Mac tools use wide captures or their own approved artwork; they do not borrow Kith's personal photography or phone hardware.

Shared navigation, actions, footer and legal/release pages are owned by `global.css`. Homepage composition and material motion belong to `landing.css`. Product copy, colors and optional `story` assets live in `products/<id>/site.config.ts`; raster ingredients live in that product's public tree. No per-product page fork or stylesheet is needed.

## First viewport and layout

On desktop, a clear product promise and action occupy the left of an asymmetric spread. The exact original product screen sits upright on a large material stage to the right; a small photographic keepsake overlaps the stage's margin without covering text or the app. The primary action and availability precede decorative annotations in reading order.

At tablet widths the same two-part structure tightens. On phones the promise and action arrive first, followed immediately by the product stage. Photography becomes a small corner detail. Full-width scene, alternating evidence spreads, a quiet reading passage and a decisive closing give the scroll varied density. The notebook scene stacks live copy above its complete image on phones, preserving believable object scale. Captions stay outside screenshots. Original screen aspect ratios and full-size access are preserved.

## Color and materials

The factory retains `site.tokens` as the semantic color source. Optional story ink is an explicit product-owned campaign color, never a global overwrite of other product identities. Paper, field, text, soft text, accent and action contrast have separate roles. Dark products keep their dark tokens; marketing imagery never mechanically inverts an app's screens.

Texture comes from high-resolution product-owned raster ingredients, not synthetic CSS noise. Physical coral cloth, ivory sheets, soft afternoon shadows and image fragments carry Kith's depth. The owner rejected the first stock-like café photograph and disconnected material collage. Kith now uses an unposed coastal-walk snapshot and the same coastal setting inside its notebook scene; a landscape print, restrained rotation and quiet paper texture connect them. Avoid posed smiling faces, giant coffee cups, competing lighting, thick photograph mats and opaque text patches over photography. Illustrative photos are identified as artwork and never imply customers or testimonials.

Every current configuration now has its own material world. Optional `sceneArtwork` supplies one optimized landscape asset for the established semantic story scene and, for screenshot-led products, a decorative artifact backdrop. Setline uses authored workout cards, lime cloth and cast iron; Anchor uses a charcoal day folio and movable blocks; Motion uses tactile arcade movement; Calorie uses an ordinary meal and journal. StorageDaddy uses archive inspection and a tangible space map, PerformanceDaddy indexed software-evidence papers and a magnifying lens, BrowserDaddy a tab index and separate attention compass, and ContextDaddy bounded files with a separate preview overlay. Existing approved mascots retain their clean hero presentation instead of being pasted over photography.

These subjects illustrate the product's work; they do not depict native functionality, customer data or results. Foreground app captures and honest actions stay first. Each scene has a calm text zone on desktop; compact layouts show the copy above the complete picture. Dark scenes are generated in the product's own palette. No filter inversion or per-product stylesheet is required. Exact prompts, retained originals and production sizes live under `artifacts/design/product-artwork/`.

The native product's `DESIGN.md` is the identity authority: `../kith`,
`../setline`, `../anchor`, `../motion`, `../calorie`, `../storagedaddy`,
`../performancedaddy`, `../browserdaddy` and `../contextdaddy`. This factory owns the landing composition
and does not replace native design authorities. Anchor's current neutral Theme.swift palette
supersedes the older cobalt factory tokens. Spacious web storytelling and compact
native task controls share product vocabulary and identity, with platform
differences explained in the current paired continuity report. Current native
render and first-value gaps remain explicit; landing scores cannot qualify them.

## Typography and shape

Display and body use the installed system sans stacks, with confident 650–760 display weight and tracking no tighter than -0.04em. Desktop hero type stays at or below 6rem; body copy uses generous line height and readable measures. Small labels use sentence case and readable contrast. Editorial margin notes may use a system cursive fallback, but facts, controls and body copy remain plain sans text.

Navigation is open and direct. Actions have a rounded physical-ticket form, minimum 48px height, visible focus and explicit hover/active feedback. Photo borders resemble paper; screens retain the existing real-device component. FAQ uses the existing native `details`/`summary` behavior. Legal pages extend the reading grammar without decorative photo interruptions.

## Authored motion

The opening is one bounded material sequence: the photographic keepsake settles onto the spread while the product artifact arrives. It completes within 800ms and never delays reading or actions. Where CSS view timelines are supported, the wide notebook scene gently opens through scroll; the fallback is the complete still scene. Image and action feedback are brief. There is no looping float, sheen, scroll hijacking or new landing JavaScript.

Reduced Motion retains every layer in its final position, disables material choreography and scroll transforms, and preserves functional focus/disclosure feedback. No effect hides content in the default unanimated state.

## Complete path and constraints

Product evaluation leads to truthful beta/release/download gates, plain-language privacy and support. Consent and analytics identifiers remain unchanged. Blog routes keep their existing reader-focused layout and do not import homepage styles. Retired Journal and Habits are retained source history and never deployment targets.

No invented App Store badges, native availability, testimonials, customer counts or screenshots. No Kith artwork on unrelated products. No core text rasterized into scene imagery. No new runtime dependency solely for decoration.

## Selected Precise closing region

The 4 October 2026 Fleet-wide owner selection replaces only the closing footer
with Precise C; Living Memory Book remains the page system. The original native
CTA and compact Explore / Resources / Connect routes occupy the left. Editable
AI question handoff and the existing always-open email capture occupy the right,
using Geist UI and Geist Mono labels from first-party licensed footer fonts.
Native product colors supply the concrete canvas, ink, focus and action roles.
The signature fades into original per-product panoramic art, then one full-width
studio line is the final content. Public legal/support/release routes use the
same identity at a shallower reading density. App screenshots, install status
and native application UI are untouched.

Shared loader/font publication and integrated browser/CSP/mobile rendering are
separate release evidence. The receipt retains the original browser-policy
block; static builds never claim visual acceptance or native-app qualification.
