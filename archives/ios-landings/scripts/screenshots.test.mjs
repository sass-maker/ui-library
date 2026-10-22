import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { screenshotMetadata } from "../src/lib/screenshot-metadata.mjs";

test("real assets own portrait, desktop and dialog geometry", async () => {
  assert.deepEqual(await screenshotMetadata("anchor", "/images/screens/today.webp"), { width: 402, height: 874, frame: "phone" });
  assert.deepEqual(await screenshotMetadata("anchor", "/images/screens/session.webp"), { width: 400, height: 278, frame: "desktop" });
  assert.deepEqual(await screenshotMetadata("anchor", "/images/screens/resume-capture.webp"), { width: 344, height: 400, frame: "desktop" });
  assert.deepEqual(await screenshotMetadata("storagedaddy", "/images/storage-explorer.png"), { width: 1405, height: 768, frame: "desktop" });
});

test("missing or escaping screenshot sources fail the build", async () => {
  await assert.rejects(screenshotMetadata("anchor", "/images/missing.png"));
  await assert.rejects(screenshotMetadata("../anchor", "/images/screens/today.webp"));
  await assert.rejects(screenshotMetadata("anchor", "/images/../../../../package.json"));
  await assert.rejects(screenshotMetadata("anchor", "https://example.com/image.png"));
});

test("device modifiers cannot inherit page-section padding", async () => {
  const component = await readFile("src/components/Phone.astro", "utf8");
  assert.ok(component.includes("`device--${size}`"));
  for (const file of ["src/styles/device.css", "src/styles/landing.css"]) {
    const css = await readFile(file, "utf8");
    assert.doesNotMatch(css, /\.device\.(hero|gallery|chapter|echo)\b/);
  }
});
