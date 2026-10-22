import { site } from "../site.config";

export const prerender = true;

export function GET() {
  const body = [
    "---",
    `title: ${JSON.stringify(`Page not found — ${site.name}`)}`,
    `canonical: ${site.url}/`,
    `product: ${JSON.stringify(site.name)}`,
    `last_updated: ${site.lastUpdated}`,
    "---",
    "",
    "# Page not found",
    "",
    `This address does not identify a public ${site.name} page.`,
    "",
    `Return to the product overview: ${site.url}/`,
    "",
    `Machine-readable product guide: ${site.url}/llms.txt`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "x-robots-tag": "noindex",
    },
  });
}
