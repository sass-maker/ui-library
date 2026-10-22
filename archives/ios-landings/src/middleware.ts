import { defineMiddleware } from "astro:middleware";
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { optimizeImageTags } from "./lib/image-delivery.mjs";
import { productId } from "./site.config";
import { prepareKithImages, kithImageVariant, finishKithImages } from "./lib/kith-image-delivery.mjs";

// Import local public assets through Astro so its existing image service owns
// compression, caching and emitted variants, including UI-library home pages.
const images = import.meta.glob<{ default: ImageMetadata }>(
  "../products/*/public/**/*.{png,jpg,jpeg,webp,avif}"
);

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  const body = await response.text();
  const html = await optimizeImageTags(productId === "kith" ? prepareKithImages(body) : body, async (src: string) => {
    const load = images[`../products/${productId}/public${src}`];
    return load ? (await load()).default : undefined;
  }, productId === "kith" ? (options: Parameters<typeof getImage>[0]) => kithImageVariant(options, getImage) : getImage);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(productId === "kith" ? finishKithImages(html) : html, { status: response.status, statusText: response.statusText, headers });
});
