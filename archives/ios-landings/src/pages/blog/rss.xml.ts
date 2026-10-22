import { getPublishedPosts, blogPath, escapeXml as xml } from "../../lib/blog";
import { site } from "../../site.config";
export async function GET() {
  const posts = await getPublishedPosts();
  const items = posts.map(p => `<item><title>${xml(p.data.title)}</title><link>${xml(site.url + blogPath(p))}</link><guid isPermaLink="true">${xml(site.url + blogPath(p))}</guid><description>${xml(p.data.description)}</description><pubDate>${new Date(p.data.published + "T00:00:00Z").toUTCString()}</pubDate></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(site.name)} journal</title><link>${xml(site.url)}/blog/</link><description>Product notes from ${xml(site.name)}</description><language>en</language>${items}</channel></rss>`, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
