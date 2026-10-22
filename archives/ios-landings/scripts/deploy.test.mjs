import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

function attempt(args, projects = ["kith"], failBuild = false) {
  const fixture = mkdtempSync(join(tmpdir(), "landing-deploy-test-"));
  const log = join(fixture, "commands.jsonl");
  const stub = `#!${process.execPath}
import fs from 'node:fs';
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify(args) + '\\n');
if (args.join(' ') === 'exec wrangler pages project list --json') {
  console.log(${JSON.stringify(JSON.stringify(projects.map(name => ({name}))))});
}
if (args.join(' ') === 'exec astro build' && ${failBuild}) process.exit(17);
`;
  writeFileSync(join(fixture, "pnpm"), stub, { mode: 0o755 });
  // No actual Git command, cloud call, or credential access is needed.
  writeFileSync(join(fixture, "git"), `#!${process.execPath}\nconsole.log('synthetic-source');\n`, { mode: 0o755 });
  try {
    const result = spawnSync(process.execPath, [resolve("scripts/deploy.mjs"), ...args], {
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

test("existing-only publishes just the selected product without provisioning or attaching domains", () => {
  const result = attempt(["kith", "--existing-only"]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, [
    ["exec", "wrangler", "pages", "project", "list", "--json"],
    ["exec", "astro", "build"],
    ["exec", "wrangler", "pages", "deploy", "dist/kith", "--project-name", "kith", "--branch", "main", "--commit-hash", "synthetic-source", "--commit-message", "Local working-tree deployment based on synthetic-source: synthetic-source", "--commit-dirty", "true"]
  ]);
});

test("missing existing target aborts before any product build or deployment", () => {
  const result = attempt(["kith", "setline", "--existing-only"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Existing Pages project required: setline/);
  assert.equal(result.calls.length, 1);
});

test("failed build never publishes", () => {
  const result = attempt(["kith", "--existing-only"], ["kith"], true);
  assert.equal(result.status, 17);
  assert.equal(result.calls.length, 2);
});

test("content-only requires explicit targets and rejects unsupported flags", () => {
  for (const args of [["--existing-only"], ["kith", "--existing-only", "--all"], ["kith", "--existing-onyl"], ["calorie", "--existing-only"]]) {
    const result = attempt(args);
    assert.notEqual(result.status, 0, args.join(" "));
    assert.deepEqual(result.calls, []);
  }
});

test("StorageDaddy stays build-only without changing its existing download infrastructure", () => {
  for (const product of ["storagedaddy"]) {
    const result = attempt([product, "--existing-only"]);
    assert.notEqual(result.status, 0);
    assert.deepEqual(result.calls, [], "must reject before provider calls or builds");
  }
});

test("new Daddy deployments are individually scoped to approved projects", () => {
  for (const product of ["browserdaddy", "performancedaddy", "contextdaddy"]) {
    const result = attempt([product, "--existing-only"], [`${product}-landing`]);
    assert.equal(result.status, 0, result.stderr);
    const upload = result.calls.find(call => call[3] === "deploy");
    assert.equal(upload[4], `dist/${product}`);
    assert.equal(upload[6], `${product}-landing`);
    assert.equal(result.calls.length, 3);
  }
});
