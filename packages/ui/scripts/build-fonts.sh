#!/usr/bin/env bash
# Regenerates src/fonts/*.woff2: Latin-only, weight-clamped subsets of the Fontsource
# variable fonts. Needs fonttools + brotli (uv run --with fonttools --with brotli).
# Page weight matters: a page fetches only the faces its theme uses (lazy @font-face).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=src/fonts; mkdir -p "$OUT"
U="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+20AC,U+2122,U+2190-2193,U+2197,U+2212,U+00D7"
F="kern,liga,calt,ccmp,locl,mark,mkmk,tnum,case"
# name source axes-limit
build() { # name src limits...
  local name=$1 src=$2; shift 2
  local tmp; tmp=$(mktemp -t font).ttf
  if [ $# -gt 0 ]; then fonttools varLib.instancer "$src" "$@" -o "$tmp" -q; else fonttools ttLib.woff2 decompress -o "$tmp" "$src" >/dev/null 2>&1 || cp "$src" "$tmp"; fi
  pyftsubset "$tmp" --unicodes="$U" --layout-features="$F" --flavor=woff2 --no-hinting --desubroutinize --output-file="$OUT/$name.woff2"
  rm -f "$tmp"
}
N=node_modules
build geist-latin-normal          $N/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2 wght=400:700
build geist-latin-italic          $N/@fontsource-variable/geist/files/geist-latin-wght-italic.woff2 wght=400:700
build geist-mono-latin-normal     $N/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2 wght=400:600
build geist-mono-latin-italic     $N/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-italic.woff2 wght=400:600
build figtree-latin-normal        $N/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2 wght=400:800
build figtree-latin-italic        $N/@fontsource-variable/figtree/files/figtree-latin-wght-italic.woff2 wght=400:800
# Newsreader has an optical-size axis that costs ~100 KB per file. Two fixed instances
# replace it: display (opsz 72) for headings, text (opsz 16) for running copy.
build newsreader-display-latin-normal $N/@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2 wght=400:600 opsz=72
build newsreader-display-latin-italic $N/@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2 wght=400:600 opsz=72
build newsreader-text-latin-normal    $N/@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2 wght=400:600 opsz=16
build newsreader-text-latin-italic    $N/@fontsource-variable/newsreader/files/newsreader-latin-opsz-italic.woff2 wght=400:600 opsz=16
# Hearth sets SOFT 100: pin it and drop the axis.
build fraunces-latin-normal       $N/@fontsource-variable/fraunces/files/fraunces-latin-soft-normal.woff2 wght=400:700 SOFT=100
build fraunces-latin-italic       $N/@fontsource-variable/fraunces/files/fraunces-latin-soft-italic.woff2 wght=400:700 SOFT=100
build instrument-serif-latin-normal $N/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2
build instrument-serif-latin-italic $N/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2
ls -l $OUT
