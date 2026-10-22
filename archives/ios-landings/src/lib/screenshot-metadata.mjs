import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { imageMetadata } from "astro/assets/utils";

const cache = new Map();

/** Build-time only: the asset, not a generic phone ratio, owns its dimensions. */
export async function screenshotMetadata(product, src, root = process.cwd()) {
  if (!/^[a-z][a-z0-9-]*$/.test(product) || !src.startsWith("/images/")) {
    throw new Error(`Invalid product screenshot: ${product} ${src}`);
  }
  const publicRoot = resolve(root, "products", product, "public");
  const path = resolve(publicRoot, `.${src}`);
  if (!path.startsWith(`${publicRoot}${sep}`)) throw new Error(`Screenshot escapes product: ${src}`);
  if (!cache.has(path)) cache.set(path, readFile(path).then((bytes) => imageMetadata(bytes, src)));
  const { width, height } = await cache.get(path);
  return { width, height, frame: height / width >= 1.65 ? "phone" : "desktop" };
}
