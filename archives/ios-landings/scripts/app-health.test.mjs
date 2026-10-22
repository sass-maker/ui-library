import assert from "node:assert/strict";
import test from "node:test";

import { appHealthConfigFor } from "../src/lib/app-health.mjs";

const products = [
  "anchor",
  "calorie",
  "kith",
  "setline",
  "browserdaddy",
  "contextdaddy",
  "performancedaddy",
  "motion",
];

test("each configured landing has a distinct App Health browser identity", () => {
  const configs = products.map((product) => appHealthConfigFor(product));
  assert.ok(configs.every(Boolean));
  assert.equal(new Set(configs.map((config) => config.projectId)).size, products.length);
  assert.equal(new Set(configs.map((config) => config.publicKey)).size, products.length);
  for (const config of configs) {
    assert.match(config.projectId, /^app-/);
    assert.match(config.publicKey, /^ahk_pub_/);
  }
});

test("unconfigured factory products do not inherit another product's tracker", () => {
  assert.equal(appHealthConfigFor("storagedaddy"), null);
  assert.equal(appHealthConfigFor("unknown"), null);
});
