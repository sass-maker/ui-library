# Product journals

Add `products/<product-id>/blog/<lowercase-slug>.md`. The selected `PRODUCT`
build includes only that product's published notes. No CMS or dependency needed.

```md
---
title: "A useful product note"
description: "A plain-language summary of what the reader will learn."
author: "Significant Hobbies"
published: "2026-09-19"
draft: true
tags: [Guides]
---

## Start here

Write useful, verifiable guidance. Do not imply unavailable features or releases.
```

Set `draft: false` deliberately when ready for inclusion. Omitted draft status
defaults to hidden. Publication dates after the current UTC date are hidden;
this is a static site, so a new build is required when that date arrives.
Optional `updated` must be a real date on or after `published`.

Optional cover metadata:

```yaml
cover:
  src: /images/article-cover.png
  alt: A meaningful description of the image
```

Place that image in the product's `public/images/`. Published covers must exist;
the build reads their actual dimensions. Do not use private user data in captures.
Keep inline Markdown images local, supply alt text, and inspect them in preview.

Every published note gets `/blog/<slug>/` and `/blog/<slug>/index.md`.
The journal index, RSS, sitemap and agent metadata use the same filtering rule.
Empty journals are noindex and are not advertised in navigation or the sitemap.

Run `pnpm check` before handoff. It checks every product, product isolation,
draft/future filtering, image handling and contrast. Building never deploys.

## Syncing product-repo article drafts

Product repos keep SEO drafts under `marketing/articles/<product-id>/` with
working sections (Outline, Internal-Link Suggestions, Source Notes) that must
not be published. Convert them with:

```bash
node scripts/sync-articles.mjs <product-id> <path-to-drafts-dir>
```

The script rewrites frontmatter into the journal schema (`meta_description`
becomes `description`, `published` is the sync date), drops every working
section, and writes `products/<product-id>/blog/<slug>.md` with `draft: false`.
Review the output, then run `pnpm check` before handoff.
