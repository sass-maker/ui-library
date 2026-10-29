import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { WORKER_SITES, WORKER_SITE_IDS, verifyWranglerConfig } from "./worker-sites.mjs";
import { PRODUCT_IDS } from "./pages.mjs";

function attempt(script, args, fail) {
  const fixture = mkdtempSync(join(tmpdir(), "worker-site-deploy-test-"));
  const log = join(fixture, "commands.jsonl");
  const stub = `#!${process.execPath}\nrequire('node:fs').appendFileSync(${JSON.stringify(log)}, JSON.stringify([require('node:path').basename(process.argv[1]), ...process.argv.slice(2)]) + '\\n');\nif (process.argv.includes(${JSON.stringify(fail ?? "never-match")})) process.exit(1);\n`;
  writeFileSync(join(fixture, "pnpm"), stub, { mode: 0o755 });
  writeFileSync(join(fixture, "node"), stub, { mode: 0o755 });
  writeFileSync(join(fixture, "git"), `#!${process.execPath}\nconsole.log('synthetic-source');\n`, { mode: 0o755 });
  try {
    const result = spawnSync(process.execPath, [resolve(script), ...args], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${fixture}:${process.env.PATH}` }
    });
    let calls = [];
    try { calls = readFileSync(log, "utf8").trim().split("\n").map(JSON.parse); } catch {}
    return { ...result, calls };
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}

test("every worker site's wrangler config matches its registered Worker and routes", () => {
  for (const id of WORKER_SITE_IDS) {
    const config = verifyWranglerConfig(id, readFileSync(join(WORKER_SITES[id].dir, "wrangler.jsonc"), "utf8"));
    assert.equal(config.assets.directory, "./public");
    assert.equal(config.assets.run_worker_first, true);
  }
});

test("worker sites are never Pages products", () => {
  for (const id of WORKER_SITE_IDS) assert.ok(!PRODUCT_IDS.includes(id), id);
  const result = attempt("scripts/deploy.mjs", ["daddyrad", "--existing-only"]);
  assert.notEqual(result.status, 0);
  assert.deepEqual(result.calls, []);
});

test("worker-site deploy requires exactly one known id before any provider call", () => {
  for (const args of [[], ["--all"], ["daddyrad", "kith"], ["kith"], ["storagedaddy"]]) {
    const result = attempt("scripts/deploy-worker-site.mjs", args);
    assert.notEqual(result.status, 0, args.join(" "));
    assert.deepEqual(result.calls, []);
  }
});

test("daddyrad checks build and validate the exact composed assets before Wrangler dry-run", () => {
  const result = attempt("scripts/check-worker-sites.mjs", ["daddyrad"]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, [
    ["node", "--test", "sites/daddyrad/compose.test.mjs", "sites/daddyrad/worker.test.mjs", "sites/daddyrad/app-health-events.test.mjs"],
    ["node", "scripts/build-daddyrad.mjs"],
    ["node", "scripts/check-daddyrad.mjs"],
    ["pnpm", "exec", "wrangler", "deploy", "--dry-run", "--config", "sites/daddyrad/wrangler.jsonc", "--assets", "dist/daddyrad"],
  ]);
});

test("daddyrad deploy runs its checks before tagging only the existing Worker", () => {
  const result = attempt("scripts/deploy-worker-site.mjs", ["daddyrad"]);
  assert.equal(result.status, 0, result.stderr);
  const config = "sites/daddyrad/wrangler.jsonc";
  assert.deepEqual(result.calls, [
    ["node", "scripts/check-worker-sites.mjs", "daddyrad"],
    ["pnpm", "exec", "wrangler", "deploy", "--config", config, "--assets", "dist/daddyrad", "--tag", "synthetic-source"]
  ]);
});

test("a failed composed-site check prevents publication", () => {
  const result = attempt("scripts/deploy-worker-site.mjs", ["daddyrad"], "scripts/check-worker-sites.mjs");
  assert.notEqual(result.status, 0);
  assert.deepEqual(result.calls, [["node", "scripts/check-worker-sites.mjs", "daddyrad"]]);
});
