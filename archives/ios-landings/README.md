# iOS landings

One approved Editorial template. Separate static sites. Significant Hobbies product marketing.

The shared design is ready for reuse; native signing and a product's release are
separate gates. Change product content and assets, not a copy of the page.
See [adding a product](docs/adding-a-product.md) and [writing blog posts](docs/blogs.md).

| Product | `PRODUCT=` | Host | Pages project | Primary action |
|---|---|---|---|---|
| Kith | `kith` | https://kith.significanthobbies.com | `kith` | TestFlight when verified |
| Setline | `setline` | https://setline.significanthobbies.com | `setline` | TestFlight when verified |
| Anchor | `anchor` | https://anchor.significanthobbies.com | `anchor-landing` | TestFlight when verified |
| Motion | `motion` | https://motion.significanthobbies.com | `motion` | TestFlight when verified |
| Calorie | `calorie` | https://calorie.significanthobbies.com | Calorie Worker | Internal beta status |
| Journal | `journal` | https://journal.significanthobbies.com | `journal` | Native app in preparation |
| Habits compatibility | `habits` | https://habits.significanthobbies.com | `habits` | Continue with Anchor |
| StorageDaddy | `storagedaddy` | Local factory preview | None here | Existing Mac download |
| PerformanceDaddy | `performancedaddy` | https://performancedaddy.significanthobbies.com | `performancedaddy-landing` | Release status |
| BrowserDaddy | `browserdaddy` | https://browserdaddy.significanthobbies.com | `browserdaddy-landing` | Development status |

| DaddyRad umbrella | Worker site `sites/daddyrad` | https://daddyrad.com | `daddyrad` Worker | Links to each Daddy app |

A product is a `site.config.ts` plus screenshots in
`products/<id>/public`. The shared engine lives in `src/`.

```bash
pnpm install
PRODUCT=kith pnpm dev
pnpm check          # typecheck, build every configured product, verify each dist/
```

Preview one built tree with `PRODUCT=<id> pnpm preview` after a build.

```bash
pnpm run deploy          # every product registered in scripts/pages.mjs
pnpm run deploy:kith     # one product
pnpm run deploy kith --existing-only # content update; no project/domain provisioning
```

Each command builds that product and uploads `dist/<id>` to its Cloudflare
Pages project. Calorie is not in this deploy because it remains on its Worker.

## Worker sites

`scripts/worker-sites.mjs` registers static sites that keep their own Worker
(routes, security headers, 404 and HEAD handling) instead of the Astro engine.
DaddyRad's umbrella landing lives in `sites/daddyrad/`, moved unchanged from
`Significant-Hobbies/daddyrad` at `bfdd8a8`. `pnpm check` runs its Worker
tests and a Wrangler dry-run; `pnpm check:worker-sites` runs only those.

```bash
pnpm run deploy:daddyrad   # checks, then wrangler deploy of the existing daddyrad Worker
```

The registry's `renderer` field is the seam for producing a site's assets from
a UI-library content file later; the Worker and its contracts stay the same.

## Rules

- One page design, one product per domain. Not a combined storefront.
- Privacy and support pages are first-class. App Store listings need both.
- No invented App Store badge or Smart App Banner.
- TestFlight links must be `https://testflight.apple.com/…`.
- Screenshots must be the real app.
- BrowserDaddy currently uses app artwork only, explicitly labelled as artwork;
  do not publish private browsing captures or imply the artwork is UI evidence.

Per-product Markdown journals share one index and article design. Drafts and
future posts are excluded from HTML, Markdown, RSS, sitemap and agent discovery.

Calorie’s native product landing stays on its existing Worker. Sync a public
snapshot into the Calorie repo with
`./scripts/sync-calorie-marketing.sh`. The live Worker is not switched
until an explicit Calorie deploy.

Significant Hobbies and Pace keep their own application surfaces.

Live keeps its existing Significant Hobbies landing. Journal reuses this engine.
Habits remains buildable source history that directs product interest to Anchor
and must not be deployed. Indulge was retired into Anchor on 2026-08-24 and
removed from the factory; no page or redirect site is retained. Its live Pages
project and domain were not touched.

## Design references

- [patterncraft.store](https://patterncraft.store/) — landing page pattern reference for future iOS landing iterations (from issue #11)

For routine content updates, use `--existing-only` with explicit product names.
It checks that every target already exists before publishing any product and
skips domain attachment. Unknown options, `--all`, and missing target names are
rejected in this mode. Run `node --test scripts/deploy.test.mjs` to verify the
deployment boundaries without cloud access. CI runs `pnpm check:one` for each
of the eleven configured products. Factory build coverage does not authorize deployment.

BrowserDaddy and PerformanceDaddy are live on their custom subdomains. Their
Google sitemaps and 14 IndexNow URLs were submitted on 2026-09-20. Neither
landing deployment publishes a native app download. StorageDaddy's existing
Worker and update/download routes are unchanged.
