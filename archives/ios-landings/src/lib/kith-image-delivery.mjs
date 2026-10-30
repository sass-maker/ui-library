/** Kith's decorative library backgrounds need native lazy/responsive delivery.
 * Keep the wrappers (including their motion and crop) exactly where they are.
 */
export function prepareKithImages(html) {
  const crops = {
    "/images/story/kith-hero-v3.webp": "82% 50%",
    "/images/story/coastal-walk-v2.webp": "40% center",
    "/images/story/kith-closing-v3.webp": "12% 60%"
  };
  return html.replace(/<div\b([^>]*?) style="background-image:url\(([^)]+)\)"([^>]*)><\/div>/g,
    (tag, before, src, after) => {
      if (!crops[src]) return tag;
      const closing = src.endsWith("kith-closing-v3.webp");
      return `<div${before}${after}><img src="${src}" alt="" loading="lazy" decoding="async"${closing ? ' class="kith-closing-art"' : ""} style="display:block;width:100%;height:100%;object-fit:cover;${closing ? "" : `object-position:${crops[src]};`}"></div>`;
    }).replace("</head>", '<style>.kith-closing-art{object-position:12% 60%}@media(min-width:768px){.kith-closing-art{object-position:center 60%}}</style></head>');
}

export async function kithImageVariant(options, getImage) {
  const book = options.src.src.includes("kith-hero-v3");
  return getImage(book ? { ...options, quality: 60 } : options);
}

export function finishKithImages(html) {
  const rendered = html.replace(/<img\b[^>]*>/g, tag => {
    if (!/\bdecoding=/.test(tag)) tag = tag.replace("<img", '<img decoding="async"');
    // These landscape images cover tall sections. Size for the covered image,
    // rather than the narrow viewport, to keep the existing mobile crop sharp.
    if (tag.includes('/images/story/coastal-walk-v2.webp')) tag = tag.replace(/sizes="[^"]*"/, 'sizes="760px"');
    if (tag.includes('/images/story/kith-closing-v3.webp')) tag = tag.replace(/sizes="[^"]*"/, 'sizes="(max-width: 767px) 930px, 100vw"');
    return tag;
  });
  const phone = (rendered.match(/<img\b[^>]*>/g) ?? []).find(tag =>
    tag.includes('src="/images/screens/constellation.webp"')
      && /\bloading="eager"/i.test(tag) && /\bfetchpriority="high"/i.test(tag));
  const sourceSet = phone?.match(/\bsrcset="([^"]+)"/i)?.[1];
  const sizes = phone?.match(/\bsizes="([^"]+)"/i)?.[1];
  if (!sourceSet || !sizes) return rendered;
  // The phone is the mobile LCP. Let the preload scanner start its exact
  // responsive resource before the large inline stylesheet and body arrive.
  // The viewport must be known first, or mobile preloads the desktop variant.
  const preload = `<link rel="preload" as="image" href="/images/screens/constellation.webp" imagesrcset="${sourceSet}" imagesizes="${sizes}" fetchpriority="high">`;
  return rendered.replace(/<meta\b[^>]*\bname=["']viewport["'][^>]*>/i, tag => `${tag}${preload}`);
}
