// Deploy exactly one worker-site target to its existing Worker. Requires an
// explicit id; checks run first and a failed check never publishes.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WORKER_SITES, WORKER_SITE_IDS, verifyWranglerConfig } from "./worker-sites.mjs";

const args = process.argv.slice(2);
if (args.length !== 1 || args[0].startsWith("--") || !WORKER_SITES[args[0]]) {
  console.error(`Usage: node scripts/deploy-worker-site.mjs <${WORKER_SITE_IDS.join("|")}>`);
  process.exit(1);
}
const id = args[0];
const site = WORKER_SITES[id];
const config = join(site.dir, "wrangler.jsonc");
verifyWranglerConfig(id, readFileSync(config, "utf8"));

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const sha = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
if (sha.status !== 0) process.exit(sha.status ?? 1);

run("node", ["scripts/check-worker-sites.mjs", id]);
run("pnpm", ["exec", "wrangler", "deploy", "--config", config, "--tag", sha.stdout.trim()]);
console.log(`\nDeployed ${id} → Worker ${site.worker}`);
