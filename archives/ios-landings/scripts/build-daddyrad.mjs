import { spawnSync } from "node:child_process";
import { mkdtemp, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { compose, factoryDir, outputDir } from "../sites/daddyrad/compose.mjs";
import { PRODUCTS } from "../sites/daddyrad/products.mjs";

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== "--from-built")) throw new Error("Usage: node scripts/build-daddyrad.mjs [--from-built]");
if (!args.length) {
  for (const { productId } of PRODUCTS) {
    const result = spawnSync("pnpm", ["exec", "astro", "build"], { cwd: factoryDir, stdio: "inherit", env: { ...process.env, PRODUCT: productId } });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
const staging = await mkdtemp(join(factoryDir, "dist/.daddyrad-build-"));
try {
  const { routes } = await compose({ output: staging });
  // This is the script's own ignored generated output, never source/public.
  await rm(outputDir, { recursive: true, force: true });
  await rename(staging, outputDir);
  console.log(`Built DaddyRad: ${PRODUCTS.length} product sections, ${routes.length} public pages in ${outputDir}`);
} finally {
  await rm(staging, { recursive: true, force: true });
}
