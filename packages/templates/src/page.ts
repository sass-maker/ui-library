import type { ProductContent } from "./schema";

/**
 * Helpers that turn a content file into what Base.astro and the templates
 * need: product-relative image paths and the page's head props.
 */

// "/x", "https://x", "data:x", "#x" and "//x" are used as written.
const written = /^(?:[a-z][a-z\d+.-]*:|\/|#)/i;

/** A content image path resolved against the page's asset root (default "/"). */
export function resolveAsset(path: string, base = "/") {
  if (!path || written.test(path)) return path;
  return (base.endsWith("/") ? base : base + "/") + path.replace(/^\.\//, "");
}

// Every image field in the content format; lucide `icon` names are left alone.
const imageKeys = new Set(["src", "image", "backdrop", "mark"]);

function mapImages(value: unknown, base: string): unknown {
  if (Array.isArray(value)) return value.map((v) => mapImages(v, base));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, imageKeys.has(k) && typeof v === "string" ? resolveAsset(v, base) : mapImages(v, base)]),
  );
}

/**
 * The content with every relative image path resolved against `base`
 * (default: the file's page.assetBase, else "/"). The templates call this
 * themselves; it is safe to apply twice.
 */
export function withAssetBase<T extends ProductContent>(content: T, base = content.page.assetBase ?? "/"): T {
  const resolved = mapImages(content, base) as T;
  return { ...resolved, page: { ...resolved.page, surface: content.page.surface, icon: content.page.icon && resolveAsset(content.page.icon, base) } };
}

/**
 * Base.astro props for a content file: title, theme, tokens, icon, canonical,
 * robots, Open Graph (image made absolute against canonical or the product
 * url), JSON-LD and the motion switch.
 *
 *   <Base {...baseProps(content)}>…</Base>
 */
export function baseProps(content: ProductContent) {
  const { page } = withAssetBase(content);
  const site = page.canonical ?? content.url;
  const absolute = (path?: string) => {
    if (!path) return path;
    try {
      return new URL(path, site).toString();
    } catch {
      return path;
    }
  };
  return {
    title: page.title,
    description: page.description,
    theme: page.theme,
    mode: page.mode,
    fonts: page.fonts,
    surface: page.surface,
    tokens: page.tokens,
    icon: page.icon,
    canonical: page.canonical,
    robots: page.robots,
    og: page.og && { ...page.og, image: absolute(page.og.image) },
    jsonLd: page.jsonLd,
    motion: page.motion,
  };
}
