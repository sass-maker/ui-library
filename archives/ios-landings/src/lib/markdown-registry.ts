import { GET as home } from '../pages/index.md';
import { GET as section } from '../pages/[section]/index.md';
import { GET as blog } from '../pages/blog/index.md';
import { GET as postMarkdown } from '../pages/blog/[slug]/index.md';
import { getPublishedPosts, blogPath } from './blog';
import { links, productId, site } from '../site.config';
import { createAgentSurfaceManifest } from './agent-surfaces/manifest.mjs';
import { createAgentSurfaceHandler } from './agent-surfaces/handler.mjs';

export const markdownIdentity = {
  name: site.name, url: site.url, summary: site.summary,
  openapi: `${site.url}/openapi.json`, contact: links.support, updatedAt: site.lastUpdated, trainingAllowed: true,
  excludedPaths: ['/admin', '/auth', '/dashboard', '/api'],
  notes: [
    '## When to use this', '',
    ...(site.agentFit ? [...site.agentFit.bestFit.map((entry) => `- Best fit: ${entry}`), ...site.agentFit.notAFit.map((entry) => `- Not a fit: ${entry}`)] : [
      `- Best fit: learning about ${site.name} — ${site.tagline}`,
      `- Best fit: checking ${site.name} availability, privacy, and support on the public landing`,
      '- Not a fit: accessing product functionality or user data through these public read-only pages',
      '- Not a fit: API integrations beyond the read-only agent surfaces listed here',
    ]), '',
    ...(site.agentCli?.length ? ['## CLI', '', ...site.agentCli.map((entry) => `- ${entry}`), ''] : []),
    '## Product boundaries', '', ...site.boundaries.map((entry) => `- ${entry}`),
    ...(productId === 'setline' ? ['', 'Agent email for directory verification: sarthakagrawal@agentmail.to'] : []),
  ],
};

export async function markdownRegistry() {
  const pages: Record<string, string> = { '/': await (await home()).text() };
  const routes = [{ path: '/', title: site.name, description: site.summary, assetPath: '/index.md', aliases: ['/index.md'], lastModified: site.lastUpdated }];
  for (const name of ['privacy', 'support', 'terms', 'accessibility', 'release', 'testflight']) {
    const page = name === 'release' ? { title: 'Release status', lede: site.status } : site.legal[name as keyof typeof site.legal];
    const path = `/${name}/`;
    pages[path] = await section({ params: { section: name } }).text();
    routes.push({ path, title: page.title, description: page.lede, assetPath: `/${name}/index.md`, aliases: [`/${name}/index.md`], lastModified: site.lastUpdated });
  }
  const posts = await getPublishedPosts();
  if (posts.length) {
    pages['/blog/'] = await (await blog()).text();
    routes.push({ path: '/blog/', title: `${site.name} journal`, description: 'Published product notes.', assetPath: '/blog/index.md', aliases: ['/blog/index.md'], lastModified: site.lastUpdated });
  }
  for (const post of posts) {
    const path = blogPath(post);
    pages[path] = await postMarkdown({ props: { post } }).text();
    routes.push({ path, title: post.data.title, description: post.data.description, assetPath: `${path}index.md`, aliases: [`${path}index.md`], lastModified: post.data.updated ?? post.data.published });
  }
  // Setline's retained public changelog is a source Markdown asset.
  if (productId === 'setline' || productId === 'motion') {
    const modules = import.meta.glob('../../products/*/public/changelog.md', { eager: true, query: '?raw', import: 'default' });
    const body = modules[`../../products/${productId}/public/changelog.md`];
    if (typeof body !== 'string') throw new Error(`${site.name} public changelog is missing`);
    pages['/changelog'] = body;
    routes.push({ path: '/changelog', title: `${site.name} changelog`, description: `Published ${site.name} changes.`, assetPath: '/changelog.md', aliases: ['/changelog.md'], lastModified: site.lastUpdated });
  }
  const manifest = createAgentSurfaceManifest({ ...markdownIdentity, pages });
  const handler = createAgentSurfaceHandler({ manifest, listMarkdownRoutes: () => routes });
  return { routes, manifest, handler };
}
