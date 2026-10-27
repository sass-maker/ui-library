import { loadTemplateContent } from '../lib/template-content';
import { templateMarkdown } from '../lib/template-markdown';
import { links, site } from "../site.config";

export const prerender = true;

export async function GET() {
  const files = import.meta.glob("../../products/*/content.json");
  const product = import.meta.env.PRODUCT || "kith";
  if (files[`../../products/${product}/content.json`]) {
    const body = templateMarkdown(await loadTemplateContent({ includeFooter: false }));
    return new Response(`# ${site.name}\n\n> ${site.seoDescription ?? site.lede}\n\n${body}\nCanonical: ${site.url}/\nLast updated: ${site.lastUpdated}\n`, { headers: { "content-type": "text/markdown; charset=utf-8" } });
  }
  const gallery = site.gallery.filter((shot) => !site.chapters.some((chapter) => chapter.image === shot.src));
  const lines = [
    `# ${site.name}: ${site.headline.join(' ')}`, '',
    `> ${site.seoDescription ?? site.lede}`, '',
    `Canonical: ${site.url}/`, `Last updated: ${site.lastUpdated}`, '',
    site.kicker, '', site.lede, '', site.status, '', site.platforms.join(' · '), '',
    site.hero.caption, '',
    ...(site.sceneArtwork || site.story?.scene ? [`## ${site.chaptersTitle}`, '', site.chaptersLede, '', site.sceneArtwork?.caption ?? 'Illustrative artwork · real product screens below', ''] : []),
    ...(gallery.length ? [`## ${(site.galleryTitle ?? ['No mockups.', 'The real product.']).join(' ')}`, '', site.betaNote, '', ...gallery.flatMap((shot) => [shot.alt, ''])] : []),
    site.tension.statement, '', `## ${site.tension.title}`, '', site.tension.copy, '',
    site.chaptersKicker, '', `## ${site.chaptersTitle}`, '', site.chaptersLede, '',
    ...site.chapters.flatMap((chapter) => [chapter.name, '', `### ${chapter.title}`, '', chapter.copy, '']),
    site.fit.kicker, '', `## ${site.fit.title}`, '', `A fit: ${site.fit.yes}`, '', `Not a fit: ${site.fit.no}`, '',
    site.privacy.kicker, '', `## ${site.privacy.title}`, '', site.privacy.copy, '',
    `[Read the privacy policy](${links.privacy})`, '',
    '## A few honest answers', '', ...site.faqs.flatMap((faq) => [`### ${faq.question}`, '', faq.answer, '']),
    `> ${site.founder.quote}`, '', site.founder.credit, '', site.founder.note, '',
    '## Related', '', ...Object.entries(links).map(([name, url]) => `- [${name}](${url})`), ''
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
