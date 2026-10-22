import { site } from "../site.config";

export const prerender = true;

export function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: `${site.name} public API`,
      version: "1.0.0",
      description: `${site.name} — ${site.tagline}. Static read-only documents: the agent catalog, sitemap, llms.txt and explicit per-page Markdown alternates. The catalog version describes its document schema; requests do not negotiate API versions or Markdown via headers.`,
      contact: { name: site.name, url: site.url },
    },
    servers: [{ url: site.url }],
    tags: [{ name: "agent-surfaces", description: "Machine-readable public surfaces" }],
    paths: {
      "/api/ai": {
        get: {
          operationId: "getAgentCatalog",
          tags: ["agent-surfaces"],
          summary: "Agent catalog",
          description: "JSON inventory of public agent surfaces.",
          responses: {
            "200": {
              description: "Agent catalog",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      version: { type: "string" },
                      url: { type: "string", format: "uri" },
                      llms: { type: "string", format: "uri" },
                      sitemap: { type: "string", format: "uri" },
                      openapi: { type: "string", format: "uri" },
                      surfaces: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            url: { type: "string" },
                            md: { type: "string" },
                            kind: { type: "string" },
                          },
                          required: ["id", "url", "md", "kind"],
                        },
                      },
                    },
                    required: ["name", "version", "url", "surfaces"],
                  },
                },
              },
            },
          },
        },
      },
      "/llms.txt": {
        get: {
          operationId: "getLlmsTxt",
          tags: ["agent-surfaces"],
          summary: "llms.txt index",
          description: "Markdown index of agent surfaces and product context for LLM consumption.",
          responses: {
            "200": {
              description: "Markdown index",
              content: { "text/plain": { schema: { type: "string", description: "Markdown-formatted agent index" } } },
            },
          },
        },
      },
      "/sitemap.xml": {
        get: {
          operationId: "getSitemap",
          tags: ["agent-surfaces"],
          summary: "Sitemap",
          description: "XML sitemap listing all public pages.",
          responses: {
            "200": {
              description: "XML sitemap",
              content: { "application/xml": { schema: { type: "string", description: "XML sitemap document" } } },
            },
          },
        },
      },
      "/openapi.json": {
        get: {
          operationId: "getOpenApiSpec",
          tags: ["agent-surfaces"],
          summary: "OpenAPI specification",
          description: "This document — the OpenAPI 3.1 specification for the public API.",
          responses: {
            "200": {
              description: "OpenAPI 3.1 spec",
              content: { "application/json": { schema: { type: "object", description: "OpenAPI 3.1 specification document" } } },
            },
          },
        },
      },
    },
  };
  return new Response(JSON.stringify(spec, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
