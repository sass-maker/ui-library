import { spawnSync } from "node:child_process";

const PRODUCT_IDS = [
  "kith",
  "setline",
  "anchor",
  "motion",
  "calorie",
  "journal",
  "habits",
  "storagedaddy",
  "performancedaddy",
  "browserdaddy",
  "contextdaddy"
];

for (const product of PRODUCT_IDS) {
  const result = spawnSync("pnpm", ["exec", "astro", "build"], {
    stdio: "inherit",
    env: { ...process.env, PRODUCT: product }
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
