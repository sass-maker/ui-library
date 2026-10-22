import { site } from "../site.config";

/** The product's default page title, kept under 60 characters when the tagline is long. */
export function defaultTitle(): string {
  const productTitle = `${site.name} — ${site.tagline}`;
  return productTitle.length <= 60 ? productTitle : `${site.name} — ${site.headline.join(" ")}`;
}
