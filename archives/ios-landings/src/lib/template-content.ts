import { productContent, type ProductContent } from "@saas-maker/templates/schema";
import { studioFromProjects, studioProjectsFeed } from "@saas-maker/ui/blocks/footer";
import { getPublishedPosts } from "./blog";
import { primaryCta } from "./distribution";
import { links, productId, site } from "../site.config";

type Link = { label: string; href: string };

// Build-time only: the selected product's file is read during prerendering.
const contentFiles = import.meta.glob<unknown>("../../products/*/content.json", { eager: true, import: "default" });

/** Factory routes every product footer keeps, matching the Editorial footer. */
async function requiredFooterLinks(): Promise<Link[]> {
  const hasBlog = (await getPublishedPosts()).length > 0;
  return [
    { label: "Overview", href: "/" },
    site.device === "desktop" ? { label: "Release status", href: "/release/" } : { label: "TestFlight", href: "/testflight/" },
    ...(hasBlog ? [{ label: "Journal", href: "/blog/" }] : []),
    { label: "Privacy", href: "/privacy/" },
    { label: "Terms", href: "/terms/" },
    { label: "Accessibility", href: "/accessibility/" },
    { label: "Support", href: "/support/" },
    ...(links.repository ? [{ label: "Source code", href: links.repository }] : [])
  ];
}

function withMissing(list: Link[], required: Link[]): Link[] {
  return [...list, ...required.filter((link) => !list.some((existing) => existing.href === link.href))];
}

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * The home page's FAQPage structured data lists every `site.faqs` entry, so
 * each must be visible on the page: append the ones the content file lacks.
 */
function includeSiteFaqs(content: ProductContent) {
  const answers = site.faqs.map((faq) => ({ q: faq.question, a: faq.answer }));
  const missingFrom = (items: { q: string }[]) =>
    answers.filter((faq) => !items.some((item) => normalize(item.q) === normalize(faq.q)));
  if (content.template === "gallery") {
    const faq = content.sections.find((section) => section.kind === "faq");
    if (faq) faq.items.push(...missingFrom(faq.items));
    else content.sections.push({ kind: "faq", id: "questions", title: "A few *honest answers.*", items: answers });
    return;
  }
  const block = content.sections.flatMap((section) => section.blocks).find((candidate) => candidate.type === "faq");
  if (block) block.items.push(...missingFrom(block.items));
  else {
    const ctaIndex = content.sections.findIndex((section) => section.blocks.some((candidate) => candidate.type === "cta"));
    const section = { id: "faq", blocks: [{ type: "faq" as const, title: "A few *honest answers.*", items: answers }] };
    content.sections.splice(ctaIndex === -1 ? content.sections.length : ctaIndex, 0, section);
  }
}

/** Sibling products from SaaS Maker's public feed; [] keeps the library default strip. */
async function studioStrip(current: string) {
  try {
    const response = await fetch(studioProjectsFeed, { signal: AbortSignal.timeout(5000) });
    return response.ok ? studioFromProjects(await response.json(), { current }) : [];
  } catch {
    return [];
  }
}

/**
 * The product's UI-library content file (products/<id>/content.json), validated
 * against the library schema, with build-time factory facts applied: a verified
 * public TestFlight link when one is configured, the footer's legal and status
 * routes, and the studio strip from the SaaS Maker catalog feed.
 */
export async function loadTemplateContent(): Promise<ProductContent> {
  const raw = contentFiles[`../../products/${productId}/content.json`];
  if (!raw) throw new Error(`${productId}: products/${productId}/content.json is missing.`);
  const content = productContent.parse(raw);
  const cta = primaryCta();
  if (cta.kind === "testflight") {
    const swap = (link: Link | undefined) => (link?.href === "/testflight/" ? { ...link, href: cta.href, label: cta.label } : link);
    content.hero.primary = swap(content.hero.primary);
    if (content.template === "gallery") content.closing.primary = swap(content.closing.primary);
  }
  includeSiteFaqs(content);
  if (content.footer) {
    content.footer.privacyUrl = "/privacy/";
    const required = await requiredFooterLinks();
    if (content.template === "gallery") {
      content.footer.links = withMissing(content.footer.links, required);
    } else {
      const groups = content.footer.groups;
      const present = groups.flatMap((group) => group.links);
      const missing = required.filter((link) => !present.some((existing) => existing.href === link.href));
      if (missing.length > 0) groups[groups.length - 1].links.push(...missing);
    }
    if (!content.footer.studio) {
      const studio = await studioStrip(content.footer.catalogId ?? productId);
      if (studio.length > 0) content.footer.studio = studio;
    }
  }
  return content;
}
