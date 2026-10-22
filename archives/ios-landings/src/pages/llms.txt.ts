import { links, site } from "../site.config";

export const prerender = true;

export function GET() {
  const body = [
    `# ${site.name}`,
    `> ${site.summary}`,
    "",
    "## When to use this",
    ...(site.agentFit
      ? [
          ...site.agentFit.bestFit.map((item) => `- Best fit: ${item}`),
          ...site.agentFit.notAFit.map((item) => `- Not a fit: ${item}`)
        ]
      : [
          `- Best fit: learning about ${site.name} — ${site.tagline}`,
          `- Best fit: checking ${site.name} availability, privacy, and support on the public landing`,
          "- Not a fit: accessing product functionality or user data (the app is native and private)",
          "- Not a fit: API integrations beyond the read-only agent surfaces listed here"
        ]),
    "",
    "## Primary",
    `- [Product overview](${links.home}index.md): Canonical Markdown summary of ${site.name}.`,
    `- [Privacy](${links.privacy}index.md): Current privacy policy in Markdown.`,
    `- [Support](${links.support}index.md): Support and feedback in Markdown.`,
    `- [Terms](${links.terms}index.md): Current terms in Markdown.`,
    `- [Accessibility](${links.accessibility}index.md): Accessibility support in Markdown.`,
    `- [Release status](${site.url}/${site.device === "desktop" ? "release" : "testflight"}/index.md): Current availability in Markdown.`,
    "",
    "## Developer docs",
    `- [OpenAPI spec](${site.url}/openapi.json): OpenAPI 3.1 specification for the public API`,
    `- [Agent catalog](${site.url}/api/ai): JSON inventory of public agent surfaces`,
    `- [Sitemap](${site.url}/sitemap.xml): XML sitemap of all public pages`,
    `- [This index](${site.url}/llms.txt)`,
    "",
    ...(site.agentCli ? ["## CLI", ...site.agentCli.map((item) => `- ${item}`), ""] : []),
    "## Machine surfaces",
    `- [Agent catalog](${site.url}/api/ai)`,
    `- [OpenAPI spec](${site.url}/openapi.json)`,
    `- [Sitemap](${site.url}/sitemap.xml)`,
    `- [This index](${site.url}/llms.txt)`,
    "",
    "## Product boundaries",
    ...site.boundaries.map((item) => `- ${item}`),
    ""
  ].join("\n");
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
