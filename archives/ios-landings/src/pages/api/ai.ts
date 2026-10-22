import { links, site } from "../../site.config";
import { getPublishedPosts, blogPath } from "../../lib/blog";

export const prerender = true;

export async function GET() {
  const posts = await getPublishedPosts();
  return new Response(JSON.stringify({
    name: site.name,
    version: "1",
    url: site.url,
    llms: `${site.url}/llms.txt`,
    llmsFull: null,
    sitemap: `${site.url}/sitemap.xml`,
    markdown: { suffix: ".md", negotiation: false },
    openapi: `${site.url}/openapi.json`,
    surfaces: [
      { id: "home", url: "/", md: "/index.md", kind: "static" },
      { id: "privacy", url: "/privacy/", md: "/privacy/index.md", kind: "static" },
      { id: "support", url: "/support/", md: "/support/index.md", kind: "static" },
      { id: "terms", url: "/terms/", md: "/terms/index.md", kind: "static" },
      { id: "accessibility", url: "/accessibility/", md: "/accessibility/index.md", kind: "static" },
      site.device === "desktop"
        ? { id: "release", url: "/release/", md: "/release/index.md", kind: "static" }
        : { id: "testflight", url: "/testflight/", md: "/testflight/index.md", kind: "static" },
      ...(import.meta.env.PRODUCT === "setline"
        ? [{ id: "changelog", url: "/changelog", md: "/changelog.md", kind: "static" }]
        : []),
      ...(posts.length ? [{ id: "blog", url: "/blog/", md: "/blog/index.md", kind: "static" }] : []),
      ...posts.map(p => ({ id: `blog-${p.id.split("/")[1]}`, url: blogPath(p), md: `${blogPath(p)}index.md`, kind: "article" }))
    ],
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
