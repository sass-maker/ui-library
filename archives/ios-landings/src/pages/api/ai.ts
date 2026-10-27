import { links, site } from "../../site.config";
import { markdownRegistry } from "../../lib/markdown-registry";

export const prerender = true;

export async function GET() {
  const { routes } = await markdownRegistry();
  return new Response(JSON.stringify({
    name: site.name,
    version: "1",
    url: site.url,
    llms: `${site.url}/llms.txt`,
    llmsFull: `${site.url}/llms-full.txt`,
    sitemap: `${site.url}/sitemap.xml`,
    markdown: { suffix: ".md", negotiation: true },
    openapi: `${site.url}/openapi.json`,
    surfaces: routes.map((route) => ({
      id: route.path === "/" ? "home" : route.path.replace(/^\/|\/$/g, "").replaceAll("/", "-"),
      url: route.path, md: route.assetPath,
      kind: route.path.startsWith("/blog/") && route.path !== "/blog/" ? "article" : "static",
    })),
    auth: { public: true, notes: "Public discovery requires no account. Product account behavior is described in the privacy page and product boundaries." },
    product: {
      name: site.name,
      tagline: site.tagline,
      summary: site.summary,
      status: site.status,
      platforms: site.platforms,
      capabilities: site.capabilities,
      boundaries: site.boundaries,
      links
    }
  }, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
