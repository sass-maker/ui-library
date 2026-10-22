import { site } from "../site.config";
import { getPublishedPosts, blogPath } from "../lib/blog";

const pages = [
  "",
  "privacy/",
  "support/",
  "terms/",
  "accessibility/",
  site.device === "desktop" ? "release/" : "testflight/",
  ...(import.meta.env.PRODUCT === "setline" ? ["changelog"] : [])
];

export const prerender = true;

export async function GET() {
  const posts = await getPublishedPosts();
  const urls = pages
    .map((path) => `  <url><loc>${site.url}/${path}</loc><lastmod>${site.lastUpdated}</lastmod></url>`)
    .join("\n") + (posts.length ? `\n<url><loc>${site.url}/blog/</loc></url>` + posts.map(p => `\n<url><loc>${site.url}${blogPath(p)}</loc><lastmod>${p.data.updated ?? p.data.published}</lastmod></url>`).join("") : "");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
