import { site } from "../site.config";
import { markdownRegistry } from "../lib/markdown-registry";

export const prerender = true;

export async function GET() {
  const { routes } = await markdownRegistry();
  const urls = routes.map((route) => `  <url><loc>${new URL(route.path, site.url).href}</loc><lastmod>${route.lastModified}</lastmod></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
