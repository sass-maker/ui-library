import assert from 'node:assert/strict';
import test from 'node:test';
import { absoluteMarkdownLinks } from '../src/lib/agent-surfaces/format.mjs';

test('blog links resolve from canonical HTML while code and actual Markdown documents survive', () => {
  const source = '[Homepage](/) [Privacy](/privacy) [Next](../next/) [Part](#part)\n[Guide](/guide.md) [Skill](/SKILL.md)\n`[sample](/private)`\n```md\n[example](/example)\n```\n[ref]: /support "Help"\n';
  const result = absoluteMarkdownLinks(source, 'https://example.com/blog/post/', { htmlPathsByMarkdown: { '/guide.md': '/guide/' } });
  assert.match(result, /\[Homepage\]\(https:\/\/example.com\/\)/);
  assert.match(result, /\[Privacy\]\(https:\/\/example.com\/privacy\)/);
  assert.match(result, /\[Next\]\(https:\/\/example.com\/blog\/next\/\)/);
  assert.match(result, /\[Part\]\(https:\/\/example.com\/blog\/post\/#part\)/);
  assert.match(result, /https:\/\/example.com\/guide\//);
  assert.match(result, /https:\/\/example.com\/SKILL.md/);
  assert.ok(result.includes('`[sample](/private)`'));
  assert.ok(result.includes('```md\n[example](/example)\n```'));
  assert.ok(result.includes('[ref]: https://example.com/support "Help"'));
});


test('template mirrors retain primary actions, evidence descriptions and repeated section text', async () => {
  const { readFile } = await import('node:fs/promises');
  const ts = (await import('typescript')).default;
  const source = await readFile(new URL('../src/lib/template-markdown.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022 } }).outputText;
  const { templateMarkdown } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
  const result = templateMarkdown({ hero: { title: 'Product', primary: { label: 'Beta status', href: '/testflight/' }, screen: { alt: 'Actual journal screen' }, note: 'Internal beta' }, sections: [{ title: 'Evidence', detail: { alt: 'Measured RAM and owner' } }], closing: { note: 'Internal beta', secondary: { label: 'Support', href: '/support/' } }, nav: [{ label: 'Navigation', href: '/' }] });
  assert.match(result, /\[Beta status\]\(\/testflight\/\)/);
  assert.match(result, /Actual journal screen/);
  assert.match(result, /Measured RAM and owner/);
  assert.match(result, /\[Support\]\(\/support\/\)/);
  assert.equal(result.match(/Internal beta/g).length, 2);
  assert.doesNotMatch(result, /Navigation/);
});
