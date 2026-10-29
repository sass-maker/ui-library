export const ORIGIN = "https://daddyrad.com";

// Marketing and release services have different owners. Never infer a download
// URL from a marketing mount or move an app's update feed into this site.
export const PRODUCTS = [
  { productId: "storagedaddy", name: "StorageDaddy", mount: "/storage", canonicalOrigin: ORIGIN, nativeReleaseOrigin: "https://storage.daddyrad.com" },
  { productId: "performancedaddy", name: "PerformanceDaddy", mount: "/performance", canonicalOrigin: ORIGIN, nativeReleaseOrigin: "https://performance.daddyrad.com" },
  { productId: "browserdaddy", name: "BrowserDaddy", mount: "/browser", canonicalOrigin: ORIGIN, nativeReleaseOrigin: "https://browser.daddyrad.com" },
  { productId: "contextdaddy", name: "ContextDaddy", mount: "/context", canonicalOrigin: ORIGIN, nativeReleaseOrigin: "https://context.daddyrad.com" },
];

export function productForPath(path) {
  return PRODUCTS.find(({ mount }) => path === mount || path.startsWith(`${mount}/`));
}

export function mountedPath(product, path) {
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error(`Not a product path: ${path}`);
  return product.mount + path;
}

export function releasePath(path) {
  return path === "/download" || path.startsWith("/download/") || path === "/updates" || path.startsWith("/updates/");
}
