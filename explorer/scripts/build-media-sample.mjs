// Optional maintainer command: node explorer/scripts/build-media-sample.mjs
// Uses an installed ffmpeg; not a package dependency or part of normal builds.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../../", import.meta.url));
const output = path.join(root, "site/public/visual");
const images = ["onboarding", "constellation", "person"].map(name => `site/public/demo/kith/${name}.webp`);
const args = images.flatMap(image => ["-loop", "1", "-framerate", "24", "-t", "3", "-i", path.join(root, image)]);
const filters = images.map((_, i) => `[${i}:v]scale=254:552:force_original_aspect_ratio=decrease,pad=960:600:(ow-iw)/2:(oh-ih)/2:color=0xe8dccc,setsar=1,settb=AVTB,format=yuv420p[v${i}]`).join(";") + ";[v0][v1]xfade=transition=fade:duration=0.333333:offset=2.666667[a];[a][v2]xfade=transition=fade:duration=0.333333:offset=5.333334,format=yuv420p[out]";
for (const [extension, codec] of [["mp4", ["-c:v", "libx264", "-profile:v", "baseline", "-level", "3.0", "-crf", "25", "-movflags", "+faststart"]], ["webm", ["-c:v", "libvpx", "-b:v", "350k", "-crf", "16"]]]) {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args, "-filter_complex", filters, "-map", "[out]", "-an", ...codec, path.join(output, `kith-sequence.${extension}`)], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const hash = filename => createHash("sha256").update(readFileSync(path.join(root, filename))).digest("hex");
writeFileSync(path.join(output, "kith-sequence-source.json"), JSON.stringify({
  description: "Original silent edited sequence of existing Kith app screens, not a live interaction recording.",
  sourceRevision: "316ecb38c0da17dc19b509a58c45acb53dc2138f",
  sources: images.map(file => ({ file, sha256: hash(file), source: `https://github.com/sass-maker/ui-library/blob/316ecb38c0da17dc19b509a58c45acb53dc2138f/${file}` })),
  license: "Repository MIT license; SaaS Maker contributors. Not third-party studio artwork.",
  recipe: "Three3second stills with333ms crossfades, aspect-preserving phone screens on a warm neutral field,24fps, no sound; regenerate with this script.",
  outputs: ["mp4", "webm"].map(extension => { const file = `site/public/visual/kith-sequence.${extension}`; return { file, sha256: hash(file) }; }),
}, null, 2) + "\n");
