import { primaryCta, verifiedMacDownloadUrl } from "../../lib/distribution";
import { clarityProjectIdFor } from "../../lib/clarity";
import { productId, site } from "../../site.config";

const sections = ["privacy", "support", "terms", "accessibility", "testflight", "release"] as const;
type Section = (typeof sections)[number];

export const prerender = true;

export function getStaticPaths() {
  return sections.map((section) => ({ params: { section } }));
}

export function GET({ params }: { params: { section: string } }) {
  if (!sections.includes(params.section as Section)) {
    return new Response("Not found\n", { status: 404 });
  }

  const section = params.section as Section;
  const page = site.legal[section === "release" ? "testflight" : section];
  const lines = [
    `# ${site.name}: ${section === "release" ? "Release status" : page.title}`,
    "",
    `> ${section === "release" ? site.status : page.lede}`,
    "",
    `Canonical: ${site.url}/${section}/`,
    `Last updated: ${site.lastUpdated}`,
    ""
  ];

  if (section === "release") {
    const download = verifiedMacDownloadUrl();
    const cta = download ? { href: download, label: site.macDownloadLabel ?? "Download for Mac" } : site.device !== "desktop" ? primaryCta() : undefined;
    lines.push(`## ${download ? "Available for Mac" : "Availability"}`, "", site.betaNote, "");
    if (cta) lines.push(`[${cta.label}](${new URL(cta.href, site.url).href})`, "");
    lines.push("## What is included", "", site.legal.testflight.testing, "", "## What is not included", "", site.legal.testflight.notIncluded, "");
  }

  if (section === "testflight") {
    const testflight = site.legal.testflight;
    lines.push(
      "## Current access",
      "",
      site.betaNote,
      "",
      "## What to test",
      "",
      testflight.testing,
      "",
      "## Not included",
      "",
      testflight.notIncluded,
      ""
    );
  }

  if (section === "privacy" && clarityProjectIdFor(productId)) {
    lines.push(
      "## Marketing-site analytics",
      "",
      "This static marketing site uses Microsoft Clarity to understand aggregate page use, heatmaps, and session replays. Clarity may process interaction and device data under Microsoft's privacy terms; sensitive page content is masked. This tracking is limited to the website and is not included in the native app.",
      ""
    );
  }

  for (const entry of section === "release" ? [] : page.sections) {
    lines.push(`## ${entry.title}`, "", entry.body, "");
    for (const paragraph of entry.paragraphs ?? []) lines.push(paragraph, "");
    for (const link of entry.links ?? []) lines.push(`- [${link.label}](${new URL(link.href, site.url).href})`);
    if (entry.links?.length) lines.push("");
  }

  if (section === "privacy" && productId === "setline") {
    lines.push(
      "## Newsletter service privacy",
      "",
      "The shared form is operated by SaaS Maker. See the [SaaS Maker privacy policy](https://sassmaker.com/privacy) for details.",
      ""
    );
  }

  lines.push(
    "## Product boundaries",
    "",
    ...site.boundaries.map((boundary) => `- ${boundary}`),
    "",
    `Canonical HTML: ${site.url}/${section}/`,
    ""
  );

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      link: `<${site.url}/${section}/>; rel="canonical"`
    }
  });
}
