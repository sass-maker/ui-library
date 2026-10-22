// CF Pages Functions middleware for ios-landings multi-product deployments.
// Each product (kith, setline, anchor, motion, journal, habits) deploys
// to its own Pages project with its own domain. This middleware is generic —
// it derives the site URL from the request origin.
//
// - Handles Accept: text/markdown negotiation for pages with .md alternates.
// - Returns agent-friendly markdown 404s for unknown paths (including soft-404s).
// - Adds Vary: Accept to HTML responses with markdown alternates.
// - Returns JSON errors for unknown /api/* paths.

function wantsMarkdown(request: Request): boolean {
  const accept = (request.headers.get("accept") || "").toLowerCase();
  if (!accept.includes("text/markdown")) return false;
  if (!accept.includes("text/html")) return true;
  return accept.indexOf("text/markdown") < accept.indexOf("text/html");
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const withSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
}

function markdown404(pathname: string, method: string, origin: string): Response {
  const path = normalizePath(pathname);
  const body = `# 404 — Not Found

\`${path}\` does not exist on ${origin}.

## Where to look next

- [Home](${origin}/)
- [Sitemap](${origin}/sitemap.xml)
- [Agent index](${origin}/llms.txt)
- [Agent catalog (JSON)](${origin}/api/ai)
- [OpenAPI spec](${origin}/openapi.json)
`;
  return new Response(method === "HEAD" ? null : body, {
    status: 404,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function html404(method: string): Response {
  const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>404 — Not Found</title></head><body><h1>404 — Not Found</h1><p>The page you requested does not exist.</p></body></html>`;
  return new Response(method === "HEAD" ? null : body, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "vary": "Accept, Accept-Encoding",
    },
  });
}

function jsonError(status: number, code: string, message: string, path: string, method: string): Response {
  return new Response(
    method === "HEAD" ? null : JSON.stringify({ error: { code, message, path } }),
    {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      },
    },
  );
}

function withoutBody(request: Request, response: Response): Response {
  if (request.method !== "HEAD") return response;
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return context.next();
  }

  const url = new URL(request.url);
  // Pages Functions do not apply static _redirects rules to handled routes.
  // Keep hash previews available; redirect only these production aliases.
  const daddyCanonical: Record<string, string> = {
    "browserdaddy-landing.pages.dev": "browser.daddyrad.com",
    "performancedaddy-landing.pages.dev": "performance.daddyrad.com",
    "contextdaddy-landing.pages.dev": "context.daddyrad.com",
  };
  const canonicalHost = daddyCanonical[url.hostname] ?? null;
  if (canonicalHost && !request.headers.has("x-daddy-proxy")) {
    url.protocol = "https:";
    url.host = canonicalHost;
    return Response.redirect(url.toString(), 301);
  }
  const pathname = url.pathname;

  // JSON errors for unknown /api/* paths.
  if (pathname.startsWith("/api/") && pathname !== "/api/ai") {
    return jsonError(404, "not_found", `Unknown API path: ${pathname}`, pathname, request.method);
  }

  // Skip asset paths — let Pages handle directly.
  if (
    pathname.startsWith("/_astro/") ||
    pathname.startsWith("/_next/") ||
    (pathname.includes(".") && !pathname.endsWith(".md"))
  ) {
    return withoutBody(request, await context.next());
  }

  // Accept: text/markdown negotiation for HTML pages that have a .md alternate.
  if (wantsMarkdown(request) && !pathname.endsWith(".md") && !pathname.startsWith("/api/")) {
    const mdPath = pathname === "/" ? "/index.md" : `${pathname.replace(/\/+$/, "")}/index.md`;
    if (context.env.ASSETS) {
      const mdUrl = new URL(url);
      mdUrl.pathname = mdPath;
      const mdResponse = await context.env.ASSETS.fetch(new Request(mdUrl.toString(), request));
      if (mdResponse.status === 200) {
        const headers = new Headers(mdResponse.headers);
        headers.set("content-type", "text/markdown; charset=utf-8");
        headers.set("vary", "Accept, Accept-Encoding");
        headers.set("x-content-type-options", "nosniff");
        return new Response(request.method === "HEAD" ? null : mdResponse.body, {
          status: 200,
          headers,
        });
      }
    }
  }

  const response = await context.next();
  const contentType = response.headers.get("content-type") ?? "";

  // Astro prerenders this extensionless endpoint as a static asset, so Pages
  // otherwise serves it as application/octet-stream and browsers download it.
  if (pathname === "/api/ai" && response.status === 200) {
    const headers = new Headers(response.headers);
    headers.set("content-type", "application/json; charset=utf-8");
    headers.set("access-control-allow-origin", "*");
    return new Response(request.method === "HEAD" ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  // Agent-friendly 404 with markdown recovery body.
  if (response.status === 404 && !pathname.startsWith("/api/")) {
    if (wantsMarkdown(request)) {
      return markdown404(pathname, request.method, url.origin);
    }
    return html404(request.method);
  }

  // Soft-404 detection: 200 HTML for a path that has no corresponding static file.
  if (
    response.status === 200 &&
    contentType.includes("text/html") &&
    !pathname.startsWith("/api/") &&
    context.env.ASSETS
  ) {
    const htmlPath =
      pathname === "/" ? "/index.html" : pathname.endsWith("/") ? `${pathname}index.html` : `${pathname}/index.html`;
    const checkUrl = new URL(url);
    checkUrl.pathname = htmlPath;
    let checkResponse = await context.env.ASSETS.fetch(new Request(checkUrl.toString()));
    if (checkResponse.status >= 300 && checkResponse.status < 400) {
      const location = checkResponse.headers.get("location");
      if (location) {
        checkResponse = await context.env.ASSETS.fetch(new Request(new URL(location, checkUrl).toString()));
      }
    }
    if (checkResponse.status !== 200) {
      if (wantsMarkdown(request)) {
        return markdown404(pathname, request.method, url.origin);
      }
      return html404(request.method);
    }
  }

  if (response.status !== 200 || !contentType.includes("text/html")) {
    return withoutBody(request, response);
  }

  // Add Vary: Accept to HTML pages that might have markdown alternates.
  const headers = new Headers(response.headers);
  const existingVary = headers.get("vary");
  headers.set("vary", existingVary ? `${existingVary}, Accept` : "Accept, Accept-Encoding");
  return new Response(request.method === "HEAD" ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
