# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Someone who found one Significant Hobbies personal app and needs to decide
whether it is for them, whether it is private, and how to open the web app,
join a TestFlight, or open the App Store listing.

The same page engine is reused for Kith, Setline, Anchor, Motion,
Calorie, StorageDaddy, PerformanceDaddy, BrowserDaddy and ContextDaddy.
Journal and Habits remain source history only and must not be deployed. Each
visitor sees one product. Mac-only products show uncropped desktop captures
or approved app artwork and release status.

## Product Purpose

Render a finished, Apple-compliant marketing site for one focused app
from a config file and real screenshots. Success is a visitor who
understands the job, sees the real screens, and can reach privacy,
support, and the gated install path.

## Positioning

One shared page engine, separate product sites. Domain, tokens, copy, and
screenshots come from `products/<id>/`. The Significant Hobbies Hub is a
separate read-only application surface, not another copy of this landing.

## Operating Context

Static Astro 7. `PRODUCT=` selects the config. Output is `dist/<id>`.
Product app repos stay independently buildable. Deploys are manual.

## Capabilities and Constraints

- Routes: `/`, `/privacy/`, `/support/`, `/terms/`, `/accessibility/`,
  `/testflight/`, `/index.md`, `/llms.txt`, `/api/ai`
- No invented App Store badge, Smart App Banner, or TestFlight URL
- Core marketing content is static. The closing footer uses the existing hosted
  assistant handoff, explicit opt-in newsletter and studio discovery components;
  no native app runtime or form backend is added by the factory.
- Screenshots must be the real app
- Product copy, legal text, and tokens live in each product config
- Per-product Markdown journals provide HTML, Markdown, RSS, sitemap and agent
  discovery. Drafts default to hidden; future dates are excluded at build time.
  The first PerformanceDaddy note is included in local output, not deployed.

## Brand Commitments

Each product keeps its own name, mark, palette, and voice. The engine
supplies structure, device framing, and Apple/SEO gates — not a single
house color.

## Evidence on Hand

Real device screenshots and marks under `products/<id>/public/`. No
customer testimonials. Do not invent reviews, user counts, or store
availability.

## Product Principles

- One product per domain
- Show the real phone before explaining it
- Privacy and support are first-class, not footer afterthoughts
- Product config, original screenshots and product-owned artwork are the inputs
- Optional product-owned story assets supply material, photography and margin
  notes; illustrative imagery never substitutes for actual product evidence
- Honest about beta status

## Accessibility & Inclusion

VoiceOver-readable structure, 44px targets, visible focus, and
`prefers-reduced-motion` that removes decorative tilt. Color is never
the only signal.

## Precise closing footer

The owner selected Precise C for all applicable Fleet browser footers. The
factory preserves native product actions and route destinations on the left,
with editable assistant handoff and each existing email-capture child on the
right. Updates remain open, retain required unchecked consent, and use their
existing configuration and service. No product lifecycle or release availability
is changed. Original product-specific artwork and a large native identity sit
below; the single studio line is last. Native operating applications and the
factory deployment allowlist remain unchanged.
