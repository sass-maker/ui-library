import { test } from "node:test";
import assert from "node:assert/strict";
import { deferSetlineClosingBackdrop } from "../src/lib/setline-backdrop-delivery.mjs";

test("Setline keeps its closing artwork and crop while deferring the native image", () => {
  const backdrop = '<div aria-hidden="true" class="motion-drift absolute inset-0 -z-10 bg-cover bg-[12%_60%] md:bg-[center_60%]" style="background-image:url(/images/story/setline-closing-v3.webp)"></div>';
  const page = `<html><head></head><body><h1>Workout</h1>${backdrop}<a href="/testflight/">Beta status</a></body></html>`;
  const result = deferSetlineClosingBackdrop(page);
  assert.ok(result.includes(backdrop.replace(' style="background-image:url(/images/story/setline-closing-v3.webp)"', "").replace("</div>", "")));
  assert.match(result, /<img[^>]+src="\/images\/story\/setline-closing-v3\.webp"[^>]+alt=""[^>]+loading="lazy"/);
  assert.doesNotMatch(result, /background-image:url/);
  assert.match(result, /object-fit:cover;object-position:12% 60%/);
  assert.match(result, /@media\(min-width:48rem\).*object-position:center 60%/);
  assert.ok(result.includes('<h1>Workout</h1>'));
  assert.ok(result.includes('<a href="/testflight/">Beta status</a>'));
});

test("unrelated pages stay byte-identical and a changed backdrop contract fails closed", () => {
  const legal = "<html><head></head><body>Privacy</body></html>";
  assert.equal(deferSetlineClosingBackdrop(legal), legal);
  assert.throws(() => deferSetlineClosingBackdrop('<div style="background:url(/images/story/setline-closing-v3.webp)"></div>'), /Expected one/);
});

