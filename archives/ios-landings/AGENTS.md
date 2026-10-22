# iOS landings — agent instructions

- Read `PROJECT_STATUS.md` before broad work.
- This repo is the marketing factory for focused Significant Hobbies apps.
  It is not the apps themselves.
- One Astro codebase. `PRODUCT=kith|setline|anchor|motion|calorie|journal|habits|contextdaddy`
  selects `products/<id>/site.config.ts` and `products/<id>/public`.
  Indulge was retired into Anchor on 2026-08-24 and removed from the factory;
  no Indulge page or redirect site is retained.
  `journal` and `habits` are retained for source history only — they are not in
  `scripts/pages.mjs` (`PRODUCT_PAGES`) and must not be deployed.
  `storagedaddy`, `performancedaddy` and `browserdaddy` are Mac-only factory products; use their
  desktop frames and `/release/` status, not iPhone frames or TestFlight CTAs.
  BrowserDaddy uses app artwork only, not private browsing screenshots.
  BrowserDaddy and PerformanceDaddy have explicitly scoped Pages targets.
  StorageDaddy has no deploy target here. Its existing Worker owns
  `/download` and `/updates/*`; a future landing cutover must preserve those routes.
- `sites/<id>/` holds Worker-site targets registered in `scripts/worker-sites.mjs`:
  prebuilt static sites that keep their own Worker, routes, headers and
  404/HEAD handling. `sites/daddyrad/` is the DaddyRad umbrella (`daddyrad.com`,
  `www` 301 to apex), moved verbatim from `Significant-Hobbies/daddyrad@bfdd8a8`.
  Do not restyle it or port it to Astro as part of factory work. It owns no
  download or update feed; each Daddy app's own Worker keeps `/download`,
  `/updates/*` and the `significanthobbies.com` 308s.
  Deploy only with `pnpm run deploy:daddyrad`; it is never part of `pnpm run deploy`.
- Calorie's public home is built in the calorie repo (`landing/`, UI library);
  `scripts/sync-calorie-marketing.sh` is retired and must not overwrite it.
- Calorie is a native-app landing. Its internal TestFlight build has no public
  invitation URL, so its CTA stays on the honest beta-status page.
- Build output is `dist/<id>`. Never merge the five sites into one
  homepage.
- Do not invent App Store badges, Smart App Banners, or TestFlight URLs.
  Only a live `apps.apple.com` or `testflight.apple.com` link is allowed.
- Product apps stay independently buildable in their own repos. Do not
  make those repos import this one at runtime.
- Run `pnpm check` after engine or product-config changes.
- Deploy only the product trees listed in `scripts/pages.mjs` with
  `pnpm run deploy`. Calorie stays on its existing Worker. Do not deploy unless
  explicitly asked.
