# Daddy landing deployment evidence

Owner authorized BrowserDaddy and PerformanceDaddy website deployment, with
BrowserDaddy app artwork only. No private browsing captures, native release,
commit, push, or StorageDaddy infrastructure cutover occurred.

## Publication

- BrowserDaddy: https://a682c0a0.browserdaddy-landing.pages.dev
- PerformanceDaddy: https://e2e93644.performancedaddy-landing.pages.dev
- Source: dirty working tree based on `3ea6f6624e766932f2f932425c44238e036c17ed`.
  The base commit is not an exact artifact identity.
- BrowserDaddy rebuilt output digest: `61190b88db86d1b8e2c0282abc28a34f003809140660a5d5749fcb6e9af19d86` (28 files).
- PerformanceDaddy rebuilt output digest: `b8300cc597cd772ebeb551d046205fde32f55e4e86f3db69569e742f8cee34f6` (33 files).
  Digests hash sorted relative paths, NUL, file bytes, NUL with SHA-256.
  These describe local rebuilt output; live home and OpenAPI bytes were compared
  exactly, not every deployed asset or compiled Functions bundle.
- Live BrowserDaddy home SHA-256: `7265be0db9ee085d983fd62c4aa3da37c64806ba0eead52e1c73eb0b719848c1`.
- Live PerformanceDaddy home SHA-256: `ec4dcfb6816462dcaad170662e0dfc6a1ad29e9d09bc2742816034bd30c92cba`.

## Verification

- `pnpm check`: 20 tests and all 11 product builds/site checks passed.
- Final `pnpm exec astro check`: zero errors, warnings or hints.
- Both local on-page SEO audits: 15 passes, zero failures/warnings.
- Local link graphs: BrowserDaddy 6 sitemap pages; PerformanceDaddy 8;
  zero broken internal links or orphan candidates.
- Provider HTTPS: home, release, privacy, robots, sitemap, Markdown, llms.txt,
  API catalog, generated OpenAPI and public IndexNow verification key return 200.
- Markdown negotiation returns text/markdown; HEAD is bodyless; missing HTML
  and API routes return real 404s. No fabricated rate-limit contract remains.
- BrowserDaddy artwork-only visual review: 37/40, technical audit 18/20,
  comprehension 88/100; no P0/P1. Captures at 390/768/1440 in design/editorial.

## Initial launch blocker — resolved

Initial CLI DNS access returned 403. After owner sign-in and approval, both
proxied CNAMEs were created through Cloudflare's dashboard:

- `browserdaddy` -> `browserdaddy-landing.pages.dev`
- `performancedaddy` -> `performancedaddy-landing.pages.dev`

Both public DNS names resolve through 1.1.1.1 and both custom hosts return
HTTPS 200 with valid certificates and no noindex response header. Chrome loads
both canonical landings. Local OS DNS retained negative answers during testing;
HTTP audits used the independently resolved public edge address without
disabling TLS or changing system DNS settings.

## Final custom-domain qualification

- Final deployment IDs: BrowserDaddy `561f8c99`, PerformanceDaddy `53cd718c`.
  These supersede the initial IDs above; static content is unchanged.
- Added a narrow production-provider-host redirect in middleware because
  Cloudflare Pages Functions do not apply `_redirects` to handled routes:
  https://developers.cloudflare.com/pages/configuration/redirects/
- Production pages.dev aliases return 301 to their canonical hosts, preserving
  paths and query strings. HTTP canonical hosts redirect to HTTPS. Hash preview
  URLs remain available and noindex.
- Final 21 regression tests pass; zero Astro diagnostics; all eleven artifact
  checks pass. Only the two authorized Daddy sites were redeployed.
- Live on-page/site SEO: 19 checks passed per site, no failures/warnings.
- Live Fleet agent-index audit: 100% / S-tier per site. This measures readable
  discovery surfaces, not actual AI recommendations or indexing outcomes.
- Live link graph: all 6 BrowserDaddy and 8 PerformanceDaddy sitemap pages
  crawled; zero broken links, redirects or orphan candidates in the crawl.
- Google accepted both sitemap submissions at `2026-09-19T18:47:21.483Z`.
- IndexNow accepted BrowserDaddy's 6 and PerformanceDaddy's 8 URLs with HTTP 202.
  Actual search indexing remains an external outcome, not a release guarantee.
- Catalog and generated dossiers now identify both public landings as live,
  with native development-preview availability explicitly retained.
- Native app releases remain out of scope. Browser click automation timed out
  on the release CTA; link destinations and release pages were verified via
  HTTP, not claimed as successful automated clicks.
