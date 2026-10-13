// Controlled local fixtures only. Build and preview the site before running.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const { renderStudioFooterHtml } = await import('../../packages/ui/footer-html.js');
  const dist = path.resolve(__dirname, '../dist');
  const baseline = fs.readFileSync(path.join(dist, 'demo/from-app/index.html'), 'utf8');
  const styles = [...baseline.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map(m => m[0]).join('');
  const sending = [...baseline.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].find(m => m[1].includes('function projectKey(form)'))?.[1];
  if (!sending) throw Error('Missing built Base footer initializer');
  const states = { 'sign-in': ['compact', 'Sign in', 'Continue'], empty: ['compact', 'No items yet', 'Add an item'], suppressed: ['suppressed', 'No items yet', 'Add an item'] };
  for (const [state, [mode, title, action]] of Object.entries(states)) {
    const footer = renderStudioFooterHtml({ product: 'UI Library', url: 'https://example.invalid', mode, legal: '© UI Library', catalogId: 'fixture', groups: [] });
    const dir = path.join(dist, '__footer-interiors', state);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><html lang="en" data-theme="base" data-mode="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">${styles}</head><body><main class="container-page py-10"><h1 class="font-display text-3xl">${title}</h1><p class="my-6 text-muted-foreground">Controlled local fixture; action is inert.</p><button type="button" class="rounded-full bg-brand px-6 py-3 text-brand-foreground">${action}</button></main>${footer}<script>${sending}</script></body></html>`);
  }
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/usr/bin/chromium', headless: true });
  try {
    const page = await browser.newPage();
    const external = [];
    await page.route('**/*', route => {
      if (new URL(route.request().url()).hostname === '127.0.0.1') return route.continue();
      external.push(route.request().url()); return route.abort();
    });
    await page.addInitScript(() => {
      window.footerListeners = [];
      const add = window.addEventListener;
      window.addEventListener = function(type, ...args) { window.footerListeners.push(type); return add.call(this, type, ...args); };
    });
    const output = process.env.SCREENSHOT_DIR || path.resolve(__dirname, '../../work/footer-renders');
    fs.mkdirSync(output, { recursive: true });
    for (const [state, [mode, , action]] of Object.entries(states)) for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`http://127.0.0.1:4321/__footer-interiors/${state}/`);
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        footers: document.querySelectorAll('footer').length,
        identity: document.querySelector('footer')?.textContent,
        controls: document.querySelectorAll('footer form, footer button, footer a, footer dialog, footer img, footer nav').length,
        actions: [...document.querySelectorAll('main button')].map(b => ({ text: b.textContent, width: b.getBoundingClientRect().width, height: b.getBoundingClientRect().height })),
        sending: window.footerListeners.includes('submit'),
      }));
      if (result.overflow || result.footers !== (mode === 'compact' ? 1 : 0) || result.controls || result.sending || result.actions.length !== 1 || result.actions[0].text !== action || result.actions[0].height < 44 || (mode === 'compact' && result.identity !== 'UI Library© UI Library') || external.length) throw Error(JSON.stringify({state, width, result, external}));
      await page.screenshot({ path: path.join(output, `${state}-${width}.png`), fullPage: true });
      console.log('PASS', state, width, JSON.stringify(result));
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
