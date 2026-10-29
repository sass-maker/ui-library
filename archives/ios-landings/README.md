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

`scripts/worker-sites.mjs` registers sites that keep their own Worker, routes,
security headers and 404 handling. DaddyRad preserves its root landing and
composes four dedicated factory product sections under `/storage/`,
`/performance/`, `/browser/` and `/context/`. The mount registry separates
canonical marketing URLs from native release origins. Downloads and update
feeds remain on each app's own Worker.

```bash
pnpm run build:daddyrad    # four product builds, then compose dist/daddyrad
pnpm run preview:daddyrad  # local Worker-module preview on 127.0.0.1:4322
pnpm run check:daddyrad    # builds, public-route checks, Worker tests and Wrangler dry-run
pnpm run deploy:daddyrad   # checks, then publish only the existing daddyrad Worker
```

The output contains an aggregate sitemap and Markdown catalog. The Worker
negotiates Markdown through that registry and permits each page's inline scripts
through generated CSP hashes. The deploy command passes `dist/daddyrad` to
Wrangler; the checked-in root and production Wrangler settings are unchanged.
`pnpm check` reuses that run's product builds before checking the composed site.
Local previews execute the Worker module with a filesystem ASSETS adapter;
Wrangler's dry-run separately validates the production bundle.

## Rules

- One focused product per page. DaddyRad has one root and four product sections;
  other factory products retain their separate domains.
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
