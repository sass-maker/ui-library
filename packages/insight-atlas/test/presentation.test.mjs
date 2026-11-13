import assert from "node:assert/strict";
import { test } from "node:test";
import { activityMonthWindow } from "../src/period.ts";
import { formationPoint, formationRouteIds } from "../src/graph-formation.ts";
import { truncate } from "../src/dom-utils.ts";

test("report periods include quiet months rather than selecting only active months", () => {
  const source = {
    dateRange: {
      start: Date.parse("2025-11-10") / 1000,
      end: Date.parse("2026-02-03") / 1000,
    },
    activityByMonth: [
      { label: "2025-11", value: 4 },
      { label: "2026-02", value: 2 },
    ],
  };
  assert.deepEqual(activityMonthWindow(source, null), ["2025-11", "2025-12", "2026-01", "2026-02"]);
  assert.deepEqual(activityMonthWindow(source, 3), ["2025-12", "2026-01", "2026-02"]);
});

test("formation retains an unmatched route and stable bounded station positions", () => {
  const conversation = {
    id: "illustrative-station",
    title: "Illustrative station",
    date: 1,
    routeIds: [],
  };
  assert.deepEqual(formationRouteIds(conversation), ["other"]);
  const point = formationPoint(conversation, 7);
  assert.deepEqual(point, formationPoint(conversation, 7));
  assert.ok(point.x >= 0.035 && point.x <= 0.965);
  assert.ok(point.y >= 0.06 && point.y <= 0.94);
});

test("labels collapse whitespace before truncation", () => {
  assert.equal(truncate("  a   b  c  ", 20), "a b c");
  assert.equal(truncate("abcdefghij", 5), "abcd…");
});
