#!/usr/bin/env bash
# Retired 2026-10-10: Calorie's home is now built in the calorie repo from
# landing/ (SaaS Maker UI library; `pnpm landing:build` there). This snapshot
# sync would overwrite marketing/index.html, so it refuses to run.
set -euo pipefail
echo "sync-calorie-marketing is retired: edit calorie/landing and run pnpm landing:build in the calorie repo" >&2
exit 1

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${1:-$ROOT/../calorie/marketing}"

if [[ ! -d "$ROOT/../calorie" ]]; then
  echo "calorie checkout not found next to ios-landings" >&2
  exit 1
fi

(cd "$ROOT" && PRODUCT=calorie pnpm exec astro build)
mkdir -p "$DEST"
# marketing/ mixes the generated snapshot with manual additions (draft
# sources, Cloudflare headers, telemetry) — exclude them from --delete.
rsync -a --delete \
  --exclude='/articles/' \
  --exclude='/_headers' \
  --exclude='/app-health-log.js' \
  "$ROOT/dist/calorie/" "$DEST/"
echo "Synced Calorie landing into $DEST"
