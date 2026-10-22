import { catalog, resolveProductId, type ProductId } from "./lib/catalog";
import type { SiteConfig } from "./lib/types";

const envProduct = (import.meta as ImportMeta & { env?: { PRODUCT?: string } }).env
  ?.PRODUCT;

export const productId = resolveProductId(envProduct);
export const site: SiteConfig = catalog[productId];

const repositories: Partial<Record<ProductId, string>> = {
  storagedaddy: "https://github.com/sarthakagrawal927/storagedaddy",
  performancedaddy: "https://github.com/sarthakagrawal927/performancedaddy",
  anchor: "https://github.com/Significant-Hobbies/anchor",
  kith: "https://github.com/Significant-Hobbies/kith",
  setline: "https://github.com/Significant-Hobbies/setline",
  calorie: "https://github.com/Significant-Hobbies/calorie",
  motion: "https://github.com/Significant-Hobbies/motion"
};

export const links = {
  home: `${site.url}/`,
  privacy: `${site.url}/privacy/`,
  support: `${site.url}/support/`,
  terms: `${site.url}/terms/`,
  accessibility: `${site.url}/accessibility/`,
  ...(site.device === "desktop" ? { release: `${site.url}/release/` } : { testflight: `${site.url}/testflight/` }),
  ...(site.macDownloadUrl ? { download: site.macDownloadUrl } : {}),
  ...(repositories[productId] ? { repository: repositories[productId] } : {})
};
