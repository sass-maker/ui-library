import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { optimizeImageTags } from "../src/lib/image-delivery.mjs";
import { prepareKithImages, kithImageVariant, finishKithImages } from "../src/lib/kith-image-delivery.mjs";

test("Kith preloads the primary phone's responsive resource before styles without changing its rendering", () => {
  const candidates = "/_astro/phone-248.webp 248w, /_astro/phone-496.webp 496w, /_astro/phone-603.webp 603w";
  const sizes = "(max-width: 767px) 248px, 360px";
  const body = `<body><div class="glow" style="background-image:url(/images/screens/constellation.webp)"></div><img src="/images/screens/constellation.webp" srcset="${candidates}" sizes="${sizes}" loading="eager" fetchpriority="high" decoding="async" width="603" height="1311"><img src="/images/screens/constellation.webp" loading="lazy" decoding="async"></body>`;
  const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1">';
  const output = finishKithImages(`<head><meta charset="utf-8">${viewport}<style>body{color:inherit}</style></head>${body}`);
  const preload = output.match(/<link\b[^>]*rel="preload"[^>]*>/)?.[0];
  assert.ok(preload, "the measured phone LCP should begin with the document");
  assert.ok(preload.includes('as="image"'));
  assert.ok(preload.includes(`imagesrcset="${candidates}"`));
  assert.ok(preload.includes(`imagesizes="${sizes}"`));
  assert.ok(preload.includes('fetchpriority="high"'));
  assert.ok(output.indexOf(preload) < output.indexOf("<style>"));
  assert.ok(output.indexOf('<meta charset="utf-8">') < output.indexOf(preload));
  assert.ok(output.indexOf(viewport) < output.indexOf(preload), "responsive preload selection needs the mobile viewport first");
  assert.equal(output.slice(output.indexOf("<body>")), body);
  assert.equal((output.match(/rel="preload"/g) ?? []).length, 1);
});

test("Kith does not preload a below-fold screenshot or unrelated image", () => {
  const html = '<head><meta charset="utf-8"></head><body><img src="/images/screens/constellation.webp" loading="lazy" decoding="async"><img src="/images/story/kith-hero-v3.webp" loading="eager" decoding="async"></body>';
  assert.equal(finishKithImages(html), html);
});

test("Kith defers decorative backgrounds while preserving their crop and motion wrappers", async () => {
  const html = '<head></head><main><section><div class="motion-parallax size-full bg-cover bg-[center_30%]" style="background-image:url(/images/story/kith-hero-v3.webp)"></div></section><section><div aria-hidden="true" class="motion-drift absolute inset-0" style="background-image:url(/images/story/kith-closing-v3.webp)"></div></section></main>';
  const output = await optimizeImageTags(prepareKithImages(html), src => ({ src, width: 1024, height: 1536 }), options => kithImageVariant(options, async variant => ({ src: `/optimized/${variant.quality}-${variant.width}.webp` })));
  assert.ok(!output.includes("background-image:url"));
  assert.match(output, /class="motion-parallax size-full bg-cover bg-\[center_30%\]"/);
  assert.match(output, /<img[^>]*height="1536"[^>]*width="1024"[^>]*loading="lazy" decoding="async"[^>]*object-position:82% 50%/);
  assert.match(output, /60-768.webp 768w/);
  assert.match(output, /80-768.webp 768w/);
  assert.match(output, /@media\(min-width:768px\).*object-position:center 60%/);
});

test("responsive delivery preserves markup, reserves geometry and prioritizes the hero", async () => {
  const assets = {
    "/icon.png": { width: 1254, height: 1254 },
    "/screen.jpg": { width: 1320, height: 2868 }
  };
  const transforms = [];
  const html = '<header><img src="/icon.png" width="22" height="22"></header><main><section><img src="/screen.jpg" class="hero" loading="eager"></section><section><img src="/screen.jpg" loading="eager" fetchpriority="high"><img src="https://example.com/photo.png"></section></main>';
  const output = await optimizeImageTags(html, src => assets[src], async options => {
    transforms.push(options);
    return { src: `/optimized/${options.width}.webp` };
  });
  assert.match(output, /sizes="22px"/);
  assert.match(output, /22\.webp 22w, \/optimized\/44\.webp 44w, \/optimized\/66\.webp 66w/);
  assert.match(output, /loading="eager" fetchpriority="high"[^>]*height="2868"[^>]*width="1320"[^>]*src="\/screen.jpg" class="hero"/);
  assert.match(output, /<section><img loading="lazy"[^>]*src="\/screen.jpg"/);
  assert.ok(output.includes('<img src="https://example.com/photo.png">'));
  assert.ok(transforms.every(options => options.format === "webp" && options.width <= options.src.width));
});

test("Clarity queues immediately and injects once after either interaction or timeout", async () => {
  const source = await readFile(new URL("../src/components/SiteHead.astro", import.meta.url), "utf8");
  const loader = source.match(/\(function\(c, l, a, r, i\)[\s\S]*?window\.clarity\("set", "project_id", productId\);/)[0];
  for (const trigger of ["pointerdown", "keydown", "touchstart", "scroll", "timer"]) {
    const listeners = new Map();
    const inserted = [];
    let timer;
    const window = {
      addEventListener(event, fn, options) {
        assert.deepEqual(JSON.parse(JSON.stringify(options)), { passive: true, once: true });
        listeners.set(event, fn);
      },
      removeEventListener: event => listeners.delete(event)
    };
    runInNewContext(loader, {
      window, clarityProjectId: "original-id", productId: "anchor",
      document: {
        createElement: () => ({}),
        getElementsByTagName: () => [{ parentNode: { insertBefore: script => inserted.push(script) } }]
      },
      setTimeout(fn, delay) { assert.equal(delay, 90000); timer = fn; return 1; },
      clearTimeout() {}
    });
    assert.equal(inserted.length, 0);
    assert.deepEqual(Array.from(window.clarity.q[0]), ["set", "project_id", "anchor"]);
    (trigger === "timer" ? timer : listeners.get(trigger))();
    timer();
    assert.equal(inserted.length, 1);
    assert.equal(inserted[0].src, "https://www.clarity.ms/tag/original-id");
    assert.equal(listeners.size, 0);
  }
});
import "./setline-backdrop-delivery.test.mjs";
