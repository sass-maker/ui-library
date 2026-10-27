import { site } from "../site.config";
export const prerender = true;
export function GET() {
  const agents = ["*", "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider"];
  const rules = agents.map((agent) => `User-agent: ${agent}\nAllow: /\nDisallow: /admin\nDisallow: /auth\nDisallow: /dashboard\nDisallow: /api/\nAllow: /api/ai$\nAllow: /api/md/`).join("\n\n");
  return new Response(`# Keep in sync with /llms.txt and /ai.txt.\n\n${rules}\n\nSitemap: ${site.url}/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
