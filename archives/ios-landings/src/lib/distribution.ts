import { site } from "../site.config";

export function verifiedTestFlightUrl(): string | undefined {
  const url = import.meta.env.PUBLIC_TESTFLIGHT_URL?.trim();
  return url?.startsWith("https://testflight.apple.com/") ? url : undefined;
}

export function verifiedAppStoreUrl(): string | undefined {
  const url = site.appStoreUrl?.trim();
  return url?.startsWith("https://apps.apple.com/") ? url : undefined;
}

export function verifiedWebAppUrl(): string | undefined {
  const url = site.appUrl?.trim();
  if (!url) return undefined;
  if (url.startsWith("/app")) return url.endsWith("/") || url === "/app" ? (url.endsWith("/") ? url : `${url}/`) : undefined;
  if (url.startsWith("https://") && URL.canParse(url)) return url;
  return undefined;
}

export function verifiedMacDownloadUrl(): string | undefined {
  const configured = site.macDownloadUrl?.trim();
  if (!configured) return undefined;
  try {
    const download = new URL(configured);
    const product = new URL(site.url);
    if (
      download.protocol === "https:" &&
      download.origin === product.origin &&
      (download.pathname.toLowerCase().endsWith(".dmg") ||
        (site.device === "desktop" && download.pathname === "/download"))
    ) {
      return download.toString();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function primaryCta(): {
  href: string;
  label: string;
  kind: "app-store" | "testflight" | "status" | "web-app" | "successor" | "mac-download";
} {
  if (site.device === "desktop") {
    const download = verifiedMacDownloadUrl();
    return download
      ? { href: download, label: site.macDownloadLabel ?? "Download for Mac", kind: "mac-download" }
      : { href: "/release/", label: "See release status", kind: "status" };
  }
  const app = verifiedWebAppUrl();
  if (site.availability === "successor" && app) {
    return { href: app, label: site.appCtaLabel ?? "Continue with the maintained product", kind: "successor" };
  }
  if (site.availability === "web-app" && app) {
    return { href: app, label: site.appCtaLabel ?? "Open the app", kind: "web-app" };
  }
  const store = verifiedAppStoreUrl();
  if (site.availability === "app-store" && store) {
    return { href: store, label: "View on the App Store", kind: "app-store" };
  }
  const beta = verifiedTestFlightUrl();
  if (beta) return { href: beta, label: "Join the TestFlight beta", kind: "testflight" };
  return { href: "/testflight/", label: "See TestFlight status", kind: "status" };
}

/** Official Apple badge only. Never invent a badge or host a knock-off. */
export const appStoreBadge = {
  src: "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg",
  alt: "Download on the App Store"
};
