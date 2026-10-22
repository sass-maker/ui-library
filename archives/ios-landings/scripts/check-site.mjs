import { access, readFile } from "node:fs/promises";
import { imageMetadata } from "astro/assets/utils";
import { appHealthConfigFor } from "../src/lib/app-health.mjs";

const product = process.env.PRODUCT ?? "kith";
const dist = `dist/${product}`;
const clarityProjectIds = {
  anchor: "y6bwr0anyd",
  browserdaddy: "ymdsbwwko3",
  calorie: "y6bultfwvf",
  contextdaddy: "yoig7ab0eb",
  kith: "y6bus3owf7",
  motion: "y6bvl31bna",
  performancedaddy: "ymdspsyir7",
  setline: "y6bunkz9vz"
};
const expectedClarityId = clarityProjectIds[product];
const expectedAppHealth = appHealthConfigFor(product);
// Products whose site config sets `heroCtaEvents`: hero data-cta names plus one inline tracker.
const heroCtaEvents = {
  calorie: ["cta_testflight", "cta_look_inside"]
};
const expectedHeroCtaEvents = heroCtaEvents[product] ?? [];

const requiredFiles = [
  `${dist}/index.html`,
  `${dist}/privacy/index.html`,
  `${dist}/support/index.html`,
  `${dist}/terms/index.html`,
  `${dist}/accessibility/index.html`,
  `${dist}/testflight/index.html`,
  `${dist}/404.html`,
  `${dist}/index.md`,
  `${dist}/privacy/index.md`,
  `${dist}/support/index.md`,
  `${dist}/terms/index.md`,
  `${dist}/accessibility/index.md`,
  `${dist}/testflight/index.md`,
  `${dist}/404.md`,
  `${dist}/llms.txt`,
  `${dist}/api/ai`,
  `${dist}/openapi.json`,
  `${dist}/robots.txt`,
  `${dist}/sitemap.xml`,
  `${dist}/blog/index.html`, `${dist}/blog/index.md`, `${dist}/blog/rss.xml`
];

await Promise.all(requiredFiles.map((file) => access(file)));

if (product === "setline") {
  await access(`${dist}/changelog/index.html`);
  await access(`${dist}/legal.css`);
  const changelog = await readFile(`${dist}/changelog/index.html`, "utf8");
  const changelogMarkdown = await readFile(`${dist}/changelog.md`, "utf8");
  const sitemap = await readFile(`${dist}/sitemap.xml`, "utf8");
  const agentCatalog = JSON.parse(await readFile(`${dist}/api/ai`, "utf8"));
  if (!changelog.includes('<link rel="canonical" href="https://setline.significanthobbies.com/changelog">')) {
    throw new Error("setline: changelog canonical URL is missing or mismatched.");
  }
  if (!changelog.includes('<link rel="stylesheet" href="/legal.css">')) {
    throw new Error("setline: changelog is missing its shared legal stylesheet.");
  }
  if (!changelogMarkdown.startsWith("# Setline changelog")) {
    throw new Error("setline: Markdown changelog mirror is missing.");
  }
  if (!sitemap.includes("https://setline.significanthobbies.com/changelog")) {
    throw new Error("setline: sitemap is missing the public changelog.");
  }
  if (!agentCatalog.surfaces.some((surface) =>
    surface.id === "changelog" && surface.url === "/changelog" && surface.md === "/changelog.md"
  )) {
    throw new Error("setline: agent catalog is missing the changelog surface.");
  }
}

const home = await readFile(`${dist}/index.html`, "utf8");
// Products with products/<id>/content.json render their home page through the
// SaaS Maker UI-library template and its StudioFooter; other routes keep the
// Precise closing.
const templateHome = await access(`products/${product}/content.json`).then(() => true, () => false);
const footerTheme = templateHome
  ? (await readFile(`${dist}/privacy/index.html`, "utf8")).match(/\bdata-scheme="(light|dark)"/)?.[1]
  : home.match(/\bdata-scheme="(light|dark)"/)?.[1];
if (!footerTheme) throw new Error(`${product}: explicit native footer theme is missing.`);
// The catalog identity a footer reports: Habits' maintained successor is Anchor.
const footerCatalogId = product === "habits" ? "anchor" : product;
if (templateHome) {
  const footers = [...home.matchAll(/<footer\b[^>]*data-fleet-footer="studio"[^>]*>/g)];
  if (footers.length !== 1 || !footers[0][0].includes(`data-catalog-id="${footerCatalogId}"`)) {
    throw new Error(`${product}: template home needs one StudioFooter with data-catalog-id="${footerCatalogId}".`);
  }
  const closing = home.slice(footers[0].index);
  for (const href of ["/", "/privacy/", "/support/", "/terms/", "/accessibility/"]) {
    if (!closing.includes(`href="${href}"`)) throw new Error(`${product}: template footer lost route ${href}.`);
  }
  if (home.includes("<fleet-footer-extension")) throw new Error(`${product}: template home must not also render the Precise closing.`);
  // FAQPage structured data must describe questions that are visible on the page.
  const ld = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? "{}");
  const questions = (ld["@graph"] ?? []).filter((node) => node["@type"] === "FAQPage").flatMap((node) => node.mainEntity.map((entry) => entry.name));
  const visible = home.replace(/<script[\s\S]*?<\/script>/g, "").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  for (const question of questions) {
    if (!visible.includes(question)) throw new Error(`${product}: FAQ structured data question is not on the page: ${question}`);
  }
  const targets = new Set([...home.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of home.matchAll(/href="\/?#([^"]+)"/g)) {
    if (!targets.has(match[1])) throw new Error(`${product}: in-page link #${match[1]} has no target.`);
  }
}

// Qualify authored closing semantics independently of hosted service availability.
// All marketing/reading routes need one native host; real controls remain owned
// by the shared loader and existing newsletter component, never fake factory UI.
for (const route of [...(templateHome ? [] : ["index.html"]), "privacy/index.html", "support/index.html", "terms/index.html", "accessibility/index.html", "testflight/index.html", "blog/index.html"]) {
  const page = await readFile(`${dist}/${route}`, "utf8");
  const hosts = [...page.matchAll(/<fleet-footer-extension\b([^>]*)>/g)];
  if (hosts.length !== 1) throw new Error(`${product}: ${route} needs exactly one authored closing host.`);
  const attrs = hosts[0][1];
  if (product === "habits" && (!attrs.includes('art-src="https://sassmaker.com/footer-art/anchor.webp"') || !attrs.includes('maintained successor'))) throw new Error(`${product}: historical identity must use qualified Anchor successor art and attribution.`);
  for (const fragment of [`product-name="`, `signature-name="`, `surface="${route === "index.html" ? "landing" : "app"}"`, `art-src="`, `font-base="https://sassmaker.com/fonts/fleet-footer-precise-v1/"`]) {
    if (!attrs.includes(fragment)) throw new Error(`${product}: ${route} missing closing contract ${fragment}.`);
  }
  const closing = page.slice(page.indexOf("<fleet-footer-extension"), page.indexOf("</fleet-footer-extension>") + 25);
  if (!closing.includes('slot="navigation"') || !closing.includes('data-fleet-footer-navigation')) throw new Error(`${product}: ${route} has no native route slot.`);
  for (const href of ["/privacy/", "/support/", "/terms/", "/accessibility/"]) {
    if (!closing.includes(`href="${href}"`)) throw new Error(`${product}: ${route} lost native closing link ${href}.`);
  }
  if (route === "index.html" && !closing.includes('slot="cta"')) throw new Error(`${product}: homepage lost its original closing CTA.`);
  if (closing.includes("<details")) throw new Error(`${product}: actual updates must remain open in the closing.`);
  const captureAttrs = closing.match(/<saas-maker-newsletter-capture\b([^>]*)>/)?.[1];
  if (captureAttrs && (!captureAttrs.includes('layout="compact"') || !/\bintegrated(?:="(?:true|)")?(?:\s|$)/.test(captureAttrs))) throw new Error(`${product}: existing capture is not in the Precise service region.`);
}

const ai = JSON.parse(await readFile(`${dist}/api/ai`, "utf8"));
const name = ai.product?.name;
if (!name) throw new Error(`${product}: AI product surface is missing a name.`);
if (!home.includes(name)) throw new Error(`${product}: landing does not name the product.`);
const hasInstallCta = templateHome
  ? /href="(?:\/testflight\/|https:\/\/apps\.apple\.com\/[^"]+|https:\/\/testflight\.apple\.com\/[^"]+|https:\/\/[a-z.]+\/download|https:\/\/[^"]+\.dmg|https:\/\/anchor\.significanthobbies\.com\/?)"/.test(home)
  : home.includes('class="button"') || home.includes('class="store-badge"');
const desktopProducts = ["storagedaddy", "performancedaddy", "browserdaddy", "contextdaddy"];
if (desktopProducts.includes(product)) {
  for (const path of ["release/index.html", "release/index.md"]) await access(`${dist}/${path}`);
  if ((!templateHome && !home.includes('data-device="desktop"')) || home.includes('class="device-island"')) {
    throw new Error(`${product}: desktop screenshots must not render phone hardware.`);
  }
  if (home.includes('href="/testflight/"') || home.includes("See iPhone and Watch")) {
    throw new Error(`${product}: Mac landing must use its release path, not mobile distribution.`);
  }
  const release = await readFile(`${dist}/release/index.html`, "utf8");
  for (const id of ["storagedaddy", "performancedaddy", "browserdaddy", "contextdaddy"]) {
    const host = { storagedaddy: "storage", performancedaddy: "performance", browserdaddy: "browser", contextdaddy: "context" }[id];
    if (product === id && !home.includes(`href="https://${host}.daddyrad.com/download"`)) {
      throw new Error(`${product}: preserve the existing download service.`);
    }
  }
  if (!ai.surfaces.some((surface) => surface.id === "release")) throw new Error(`${product}: missing agent release surface.`);
}
if (!hasInstallCta) {
  throw new Error(`${product}: landing is missing a gated install or journal CTA.`);
}

if (product === "anchor") {
  await access(`${dist}/downloads/Anchor-1.0.dmg`);
  if (!home.includes('href="https://anchor.significanthobbies.com/downloads/Anchor-1.0.dmg"')) {
    throw new Error("anchor: landing is missing the verified notarized Mac download.");
  }
}

for (const fragment of [
  `<link rel="canonical" href="${ai.url}/">`,
  'property="og:image"',
  'name="twitter:card" content="summary_large_image"'
]) {
  if (!home.includes(fragment)) {
    throw new Error(`${product}: landing metadata is missing: ${fragment}`);
  }
}

if (home.includes("testflight.apple.com")) {
  throw new Error(`${product}: a public TestFlight URL appeared without a verified build-time configuration.`);
}

if (!home.includes("WebSite")) {
  throw new Error(`${product}: landing is missing WebSite structured data.`);
}
if (product === "browserdaddy") {
  if (!home.includes("App artwork") || !home.includes("not a screenshot")) {
    throw new Error("browserdaddy: artwork must not masquerade as product screenshot proof");
  }
  for (const unsupported of ["Real product screen", "View full-size screenshot", "/Users/", "permissions.png"]) {
    if (home.includes(unsupported)) throw new Error(`browserdaddy: unexpected private or screenshot material: ${unsupported}`);
  }
}

if (templateHome) {
  if (!/<img\b[^>]*src="\/images\//.test(home)) throw new Error(`${product}: template home shows no product-owned image.`);
} else if (!home.includes('id="look-inside"') && !home.includes("id='look-inside'")) {
  throw new Error(`${product}: landing is missing the screenshot gallery.`);
}

if (home.includes("Download on the App Store") && !home.includes("https://apps.apple.com/")) {
  throw new Error(`${product}: App Store badge copy appeared without a verified apps.apple.com URL.`);
}

const executableScripts = [...home.matchAll(/<script\b([^>]*)>/gi)].filter((match) => {
  const attrs = match[1] ?? "";
  return !/type=["']application\/ld\+json["']/i.test(attrs);
});
const approvedFooterScripts = [
  "https://sassmaker.com/project-strip.js?v=precise-b0adaa67",
  "https://sassmaker.com/ai-chat-footer.js?v=precise-b0adaa67"
];
const newsletterCaptureScript = "https://sassmaker.com/newsletter-capture.js?v=precise-b0adaa67";
const newsletterProducts = new Set([
  "setline",
  "kith",
  "motion",
  "browserdaddy",
  "contextdaddy",
  "performancedaddy"
]);
const appHealthTracker = "https://health.sassmaker.com/tracker.js";
for (const src of templateHome ? [] : approvedFooterScripts) {
  const matches = executableScripts.filter((match) => {
    const attrs = match[1] ?? "";
    return attrs.includes(`src="${src}"`) || attrs.includes(`src='${src}'`);
  });
  if (matches.length !== 1) {
    throw new Error(`${product}: expected exactly one approved footer loader for ${src}.`);
  }
  if (!matches[0][1].includes(`data-theme="${footerTheme}"`)) throw new Error(`${product}: ${src} must explicitly match its native ${footerTheme} theme.`);
}

const unexpectedScripts = executableScripts.filter((match) => {
  const attrs = match[1] ?? "";
  const isApprovedFooter = approvedFooterScripts.some((src) =>
    attrs.includes(`src="${src}"`) || attrs.includes(`src='${src}'`)
  );
  const isAppHealth = attrs.includes(`src="${appHealthTracker}"`) ||
    attrs.includes(`src='${appHealthTracker}'`);
  // The template's bundled scroll-motion module (Base.astro).
  const isTemplateMotion = templateHome && /^\s*type="module" src="\/_astro\/Base\.astro_[^"]+\.js"\s*$/.test(attrs);
  if (isTemplateMotion) return false;
  const isNewsletterCapture = !templateHome && (newsletterProducts.has(product) || product === "anchor") && (
    attrs.includes(`src="${newsletterCaptureScript}"`) ||
    attrs.includes(`src='${newsletterCaptureScript}'`)
  );
  return !isApprovedFooter && !isAppHealth && !isNewsletterCapture;
});
const appHealthScripts = executableScripts.filter((match) => {
  const attrs = match[1] ?? "";
  return attrs.includes(`src="${appHealthTracker}"`) ||
    attrs.includes(`src='${appHealthTracker}'`);
});
if (expectedAppHealth) {
  if (appHealthScripts.length !== 1) {
    throw new Error(`${product}: expected exactly one App Health tracker.`);
  }
  for (const fragment of [
    `data-key="${expectedAppHealth.publicKey}"`,
    `data-project="${expectedAppHealth.projectId}"`,
    'data-identity="persistent"',
    'data-endpoint="https://ingest.sassmaker.com/v1/browser"',
    "data-vitals"
  ]) {
    if (!home.includes(fragment)) {
      throw new Error(`${product}: App Health output is missing ${fragment}.`);
    }
  }
  if (["anchor", "browserdaddy", "contextdaddy", "performancedaddy"].includes(product)) {
    const expectedCtaEvents = {
      anchor: ["mac_beta_download_clicked", "testflight_status_opened"],
      browserdaddy: ["mac_download_clicked", "release_status_opened"],
      contextdaddy: ["download_opened", "release_details_opened"],
      performancedaddy: ["mac_download_clicked", "source_opened"]
    }[product];
    for (const event of expectedCtaEvents) {
      if (!home.includes(event)) throw new Error(`${product}: CTA event ${event} is not tracked.`);
    }
    for (const fragment of [
      "event.preventDefault();",
      "tracker.flush()",
      "window.location.assign(link.href)",
      "navigationTimer = window.setTimeout(continueOnce, 3000)",
      "window.clearTimeout(navigationTimer)",
      "event.button === 0",
      "!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey",
    ]) {
      if (!home.includes(fragment)) throw new Error(`${product}: tracked navigation does not wait for its event receipt (${fragment}).`);
    }
    const privacy = await readFile(`${dist}/privacy/index.html`, "utf8");
    const privacyMarkdown = await readFile(`${dist}/privacy/index.md`, "utf8");
    for (const [surface, content] of [["HTML", privacy], ["Markdown", privacyMarkdown]]) {
      if (!content.includes("App Health") || !content.includes("page views") || !content.includes("Mac download")) {
        throw new Error(`${product}: ${surface} privacy page does not disclose App Health page views and download clicks.`);
      }
    }
  }
} else if (appHealthScripts.length !== 0) {
  throw new Error(`${product}: the static landing unexpectedly ships App Health.`);
}
const newsletterScripts = executableScripts.filter((match) => {
  const attrs = match[1] ?? "";
  return attrs.includes(`src="${newsletterCaptureScript}"`) ||
    attrs.includes(`src='${newsletterCaptureScript}'`);
});
const hasNewsletterElement = home.includes("<saas-maker-newsletter-capture");
const studioSubscribe = home.match(/<form\b[^>]*data-subscribe=""[^>]*>/)?.[0];
if (templateHome) {
  if (newsletterScripts.length !== 0 || hasNewsletterElement) {
    throw new Error(`${product}: template home must use the StudioFooter sign-up, not the hosted capture module.`);
  }
  if (newsletterProducts.has(product) || product === "anchor") {
    if (!studioSubscribe || !studioSubscribe.includes('data-kind="newsletter"') || !studioSubscribe.includes(`data-catalog="${footerCatalogId}"`)) {
      throw new Error(`${product}: StudioFooter newsletter sign-up for ${footerCatalogId} is missing.`);
    }
    for (const fragment of [
      'hasAttribute("data-subscribe")',
      "newsletter_signup_clicked",
      "consent?.checked && email?.validity.valid",
      ...(expectedAppHealth && product !== "anchor" && !desktopProducts.includes(product) ? ["testflight_status_opened"] : [])
    ]) {
      if (!home.includes(fragment)) throw new Error(`${product}: landing is missing ${fragment}.`);
    }
  } else if (studioSubscribe) {
    throw new Error(`${product}: the landing unexpectedly ships a newsletter sign-up.`);
  }
} else if (newsletterProducts.has(product)) {
  if (newsletterScripts.length !== 1 || !hasNewsletterElement) {
    throw new Error(`${product}: expected one shared newsletter capture element and loader.`);
  }
  for (const fragment of [
    `catalog-id="${product}"`,
    'kind="newsletter"',
    'source="footer"',
    `privacy-url="${ai.url}/privacy/"`,
    'data-clarity-mask="true"',
    "testflight_status_opened",
    ...(product === "setline" ? ["product_preview_opened"] : ["how_it_works_opened"]),
    "newsletter_signup_clicked",
    "consent?.checked && email?.validity.valid"
  ]) {
    if (!home.includes(fragment)) throw new Error(`${product}: landing is missing ${fragment}.`);
  }
  const privacy = await readFile(`${dist}/privacy/index.html`, "utf8");
  const privacyMarkdown = await readFile(`${dist}/privacy/index.md`, "utf8");
  for (const fragment of ["App Health", "Email updates", "explicit consent", "subscription records"]) {
    if (!privacy.includes(fragment)) throw new Error(`${product}: privacy page is missing ${fragment}.`);
    if (!privacyMarkdown.includes(fragment)) throw new Error(`${product}: Markdown privacy page is missing ${fragment}.`);
  }
} else if (product === "anchor") {
  if (newsletterScripts.length !== 1 || hasNewsletterElement) {
    throw new Error(`${product}: expected only the cache-qualified module for catalog auto-capture, without a native form.`);
  }
} else if (newsletterScripts.length !== 0 || hasNewsletterElement) {
  throw new Error(`${product}: the landing unexpectedly ships a newsletter capture form.`);
}
for (const event of expectedHeroCtaEvents) {
  if (!home.includes(`data-cta="${event}"`)) throw new Error(`${product}: hero is missing data-cta="${event}".`);
}
if (expectedHeroCtaEvents.length > 0 && !home.includes('closest("[data-cta]")')) {
  throw new Error(`${product}: landing is missing the hero CTA tracker.`);
}
if (expectedHeroCtaEvents.length === 0 && home.includes("data-cta=")) {
  throw new Error(`${product}: landing ships data-cta without a hero CTA tracker.`);
}
if (expectedClarityId) {
  const expectedInlineScripts = 1 + Number(Boolean(expectedAppHealth)) + Number(expectedHeroCtaEvents.length > 0) + Number(templateHome);
  if (unexpectedScripts.length !== expectedInlineScripts) {
    throw new Error(`${product}: expected ${expectedInlineScripts} inline analytics loaders.`);
  }
  for (const fragment of [
    `const clarityProjectId = "${expectedClarityId}"`,
    "https://www.clarity.ms/tag/",
    "setTimeout(go, 90000)",
    "passive: true, once: true",
    `const productId = "${product}"`,
    'window.clarity("set", "project_id", productId)'
  ]) {
    if (!home.includes(fragment)) {
      throw new Error(`${product}: Clarity output is missing ${fragment}.`);
    }
  }
  const privacy = await readFile(`${dist}/privacy/index.html`, "utf8");
  const privacyMarkdown = await readFile(`${dist}/privacy/index.md`, "utf8");
  if (!privacy.includes("Marketing-site analytics") || !privacy.includes("Microsoft Clarity")) {
    throw new Error(`${product}: privacy page does not disclose Clarity website analytics.`);
  }
  if (!privacyMarkdown.includes("Marketing-site analytics") || !privacyMarkdown.includes("Microsoft Clarity")) {
    throw new Error(`${product}: Markdown privacy page does not disclose Clarity website analytics.`);
  }
  if (product === "setline") {
    for (const fragment of ["Setline website analytics", "Email updates", "SaaS Maker privacy policy"]) {
      if (!privacy.includes(fragment)) throw new Error(`setline: privacy page is missing ${fragment}.`);
    }
    for (const fragment of ["App Health", "Email updates", "SaaS Maker privacy policy"]) {
      if (!privacyMarkdown.includes(fragment)) throw new Error(`setline: Markdown privacy page is missing ${fragment}.`);
    }
  }
} else if (unexpectedScripts.length !== Number(Boolean(expectedAppHealth)) + Number(expectedHeroCtaEvents.length > 0) + Number(templateHome) || home.includes("www.clarity.ms/tag")) {
  throw new Error(`${product}: the static landing unexpectedly ships client-side JavaScript.`);
}

const localHrefs = [...home.matchAll(/href="(\/[^"]*)"/g)]
  .map((match) => match[1].split("#")[0])
  .filter((href, index, all) => href && all.indexOf(href) === index)
  .filter((href) => href !== "/app" && href !== "/app/");

for (const href of localHrefs) {
  const outputPath = href === "/"
    ? `${dist}/index.html`
    : href.endsWith("/")
      ? `${dist}${href}index.html`
      : `${dist}${href}`;
  await access(outputPath);
}

// All shipped product images must resolve locally, including real desktop captures.
for (const match of home.matchAll(/<img\b[^>]*src="(\/[^"?#]+)"/g)) {
  await access(`${dist}${match[1]}`);
}

for (const match of home.matchAll(/<div class="device-screen">\s*(<img\b[^>]*>)/g)) {
  const attrs = match[1];
  const src = attrs.match(/src="([^"]+)"/)?.[1];
  const width = Number(attrs.match(/width="(\d+)"/)?.[1]);
  const height = Number(attrs.match(/height="(\d+)"/)?.[1]);
  if (!src?.startsWith("/images/")) throw new Error(`${product}: screenshot must use a local asset.`);
  const actual = await imageMetadata(await readFile(`${dist}${src}`), src);
  if (width !== actual.width || height !== actual.height) {
    throw new Error(`${product}: incorrect screenshot dimensions for ${src}: ${width}x${height}, actual ${actual.width}x${actual.height}.`);
  }
}
if (templateHome) {
  // Template screens must declare their real pixel size (phone screens default to 603x1311).
  for (const match of home.matchAll(/<img\b[^>]*src="(\/images\/[^"?#]+)"[^>]*>/g)) {
    const width = Number(match[0].match(/\bwidth="(\d+)"/)?.[1]);
    const height = Number(match[0].match(/\bheight="(\d+)"/)?.[1]);
    if (!width || !height || width <= 64) continue;
    const actual = await imageMetadata(await readFile(`${dist}${match[1]}`), match[1]);
    if (Math.abs(width / height - actual.width / actual.height) > 0.02) {
      throw new Error(`${product}: ${match[1]} declares ${width}x${height}, actual ${actual.width}x${actual.height}.`);
    }
  }
}
if (/<figure\b[^>]*class="[^"]*\bdevice (?:hero|gallery|chapter)\b/.test(home)) {
  throw new Error(`${product}: screenshot must not inherit a page-section class.`);
}

const markdown = await readFile(`${dist}/index.md`, "utf8");
if (!markdown.startsWith(`# ${name}`)) {
  throw new Error(`${product}: index.md does not start with the product name.`);
}

for (const surface of ai.surfaces) {
  if (!surface.url || !surface.md) {
    throw new Error(`${product}: agent catalog surface ${surface.id ?? "unknown"} is missing url or md.`);
  }
  const markdownPath = `${dist}${surface.md}`;
  const body = await readFile(markdownPath, "utf8");
  if (!body.includes(name)) {
    throw new Error(`${product}: ${surface.md} does not identify ${name}.`);
  }
}

const others = [
  "Kith",
  "Setline",
  "Anchor",
  "Motion",
  "Calorie",
  "Journal",
  "Habits",
  "Live"
].filter((label) => label !== name);
for (const other of others) {
  if (home.includes(`<title>${other} —`)) {
    throw new Error(`${product}: built homepage is titled as ${other}.`);
  }
}

const blog = await readFile(`${dist}/blog/index.html`, "utf8");
const feed = await readFile(`${dist}/blog/rss.xml`, "utf8");
const sitemap = await readFile(`${dist}/sitemap.xml`, "utf8");
if (product === "performancedaddy") {
  const article = await readFile(`${dist}/blog/background-apps/index.html`, "utf8");
  const articleMd = await readFile(`${dist}/blog/background-apps/index.md`, "utf8");
  for (const body of [blog, feed, sitemap]) {
    if (!body.includes("/blog/background-apps/")) throw new Error("Missing article discovery surface");
  }
  for (const fragment of ["BlogPosting", "In this note", 'href="/blog/"', "What is still running"]) {
    if (!article.includes(fragment)) throw new Error(`Missing article feature: ${fragment}`);
  }
  if (!articleMd.includes("PerformanceDaddy")) throw new Error("Missing article Markdown identity");
} else {
  if (blog.includes("/blog/background-apps/") || sitemap.includes("/blog/background-apps/")) {
    throw new Error(`${product}: cross-product blog leakage`);
  }
  try { await access(`${dist}/blog/background-apps/index.html`); throw new Error(`${product}: foreign article emitted`); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
}
if (!feed.includes("<item>") && !blog.includes('content="noindex,follow"')) {
  throw new Error(`${product}: empty journal should not be indexed`);
}
console.log(`Checked ${product}: ${requiredFiles.length} public surfaces and ${localHrefs.length} internal links.`);
