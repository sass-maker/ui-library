# Shared landing factory uplift — direction selection

Status: proposals only; owner selection pending. No production UI has changed.

## Scope and product truth

The owner selected the shared factory, with Kith as the first showcase on 2 October 2026. Each product remains a separate site with its own brand, evidence and lifecycle. Native apps are outside this repo.

Kith helps iPhone users who care about a small set of relationships retain meaningful context through explicitly chosen closeness, standing notes and a dated memory log. Sources: `products/kith/site.config.ts`, `PRODUCT.md` and `PROJECT_STATUS.md`.

Proof: existing native constellation, person and onboarding captures. Next action: beta status; current source says internal TestFlight only. No invented testimonials, usage totals, distribution links or product capabilities.

Canonical Site Health Kith purpose agrees on audience and memory mechanism, but its outcome includes “notice who needs attention” and its next action describes owner validation rather than public acquisition. The more specific current landing source owns the proposals. This planning pass does not modify the canonical catalog.

## A — The Ties We Keep

- Purpose, audience and screen job: help a thoughtful iPhone user understand private relationship memory, see the real product and inspect beta availability.
- Visual thesis: an expressive, tactile campaign built around the small objects and moments that connect people.
- Layout: asymmetrical illustrated opening, generous copy beside a real phone; subsequent scenes alternate full-width art, focused evidence and compact explanatory passages.
- Typography: warm rounded humanist sans display, clear sans body, compact readable labels.
- Color roles: product-owned paper and field surfaces, cocoa text, terracotta action, apricot and gold illustration. Other products retain their palettes and use subject-specific artwork.
- Interaction thesis: a ribbon draws through the narrative with supported CSS scroll animation; cut-paper layers settle into place once; buttons have crisp feedback. Complete static and reduced-motion versions.
- Signature: a physical ribbon connecting people, a shared coffee, a note and a flower. Expressive illustration remains separate from product evidence.
- Risk: excessive texture or illustration can obscure the product. Keep the real screen large and the primary action early; ship compressed art and restrained motion.
- Factory translation: app-native object illustrations and evidence stages; desktop apps use wide captures or their approved artwork instead of phone hardware.

## B — A World of Your People

- Purpose, audience and screen job: same Kith evaluation scenario, translated into an immersive product-led stage.
- Visual thesis: the constellation becomes a spatial environment, with an actual phone as its bright center.
- Layout: centered opening and dominant product stage; a bright next chapter breaks the dark scene into an asymmetrical three-part explanation.
- Typography: broad, rounded sans display with quieter, generously spaced body text; no tiny atmospheric labels.
- Color roles: a deliberate plum/copper marketing scene for Kith, warm amber highlights, cream proof plane and high-contrast action. This is an intentional campaign background, not a mechanical inversion of the app or the factory's other products.
- Interaction thesis: restrained depth and scroll progression make the chosen-closeness metaphor legible; motion is decorative, bounded and removed for reduced motion.
- Signature: sculptural warm lanterns surrounding authentic constellation evidence; no inferred social graph or attention score.
- Risk: cinematic atmosphere could make a simple tool feel complex or harm loading. Favor layered pre-rendered art and CSS; no WebGL is required for the concept.
- Factory translation: a product stage shaped by each app's actual mechanism, with a distinct scene per product rather than universal decorative spheres.

## C — The Living Memory Book

- Purpose, audience and screen job: same Kith evaluation scenario, approached through recognizable human moments.
- Visual thesis: a physical memory journal translated into an art-directed digital composition.
- Layout: a strongly aligned headline, asymmetric photo/keepsake collage and upright real phone; subsequent ruled spreads pair evidence with short annotations and intimate photo details.
- Typography: confident grotesk sans headlines, plain body copy and restrained handwritten annotation in decorative art only.
- Color roles: coral bookcloth, ivory writing surfaces, indigo annotations and product-owned action colors; each app owns its materials and colors.
- Interaction thesis: pages and fragments reveal in a paced sequence; subtle layer changes reinforce the physical journal metaphor. No mandatory drag interaction or scroll hijacking.
- Signature: an everyday moment paired with the exact detail worth remembering, while authentic screens explain how the app stores it.
- Risk: generated lifestyle imagery could be mistaken for customers or testimonials. Label illustrative imagery where necessary; never imply endorsement or upload personal photos.
- Factory translation: curated photographic or illustrated subject matter for consumer apps; device, workflow and app-owned art for desktop tools.

## Shared build requirements after selection

Preserve the working Astro stack and healthy project-native navigation, CTA gates, FAQ disclosures, newsletter consent and legal surfaces. Keep runtime dependencies unchanged unless a specific justified need emerges. Artwork files belong to the product's public tree; reusable composition belongs to the shared engine. Retired Journal and Habits remain source history only.

Inspect production-equivalent pages at 390, 768 and 1440 pixels, check full-screen access and image aspect ratios, preserve keyboard focus and 44-pixel targets, and verify the reduced-motion composition. Run the smallest relevant checks first, then `pnpm check` after shared-engine changes. Finish with independent comprehension/craft review and the Fleet design-workflow receipt validation. Commit, push and deploy are outside the current authorization.

Generated previews use the built-in imagegen tool and the actual Kith constellation capture as a reference. They are north-star proposals, not literal screenshot specifications; live typography, controls, responsive layout and precise product pixels will be implemented in code and checked in a browser.
