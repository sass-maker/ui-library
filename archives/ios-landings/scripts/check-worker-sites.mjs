// Verify every worker-site target (or the ids given): config matches the
// registry, the site's own Worker tests pass, and Wrangler can bundle it.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WORKER_SITES, WORKER_SITE_IDS, verifyWranglerConfig } from "./worker-sites.mjs";

const args = process.argv.slice(2);
const fromBuilt = args.includes("--from-built");
const selected = args.filter((arg) => arg !== "--from-built");
const ids = selected.length ? selected : WORKER_SITE_IDS;

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const id of ids) {
  const site = WORKER_SITES[id];
  if (!site) {
    console.error(`Unknown worker site "${id}". Known: ${WORKER_SITE_IDS.join(", ")}.`);
    process.exit(1);
  }
  const config = join(site.dir, "wrangler.jsonc");
  verifyWranglerConfig(id, readFileSync(config, "utf8"));
  console.log(`\n=== ${id} (Worker ${site.worker}) ===`);
  run("node", ["--test", ...site.tests.map((file) => join(site.dir, file))]);
  if (site.build) run("node", [site.build, ...(fromBuilt ? ["--from-built"] : [])]);
  if (site.check) run("node", [site.check]);
  run("pnpm", ["exec", "wrangler", "deploy", "--dry-run", "--config", config, ...(site.assets ? ["--assets", site.assets] : [])]);
}
