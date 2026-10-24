import { expect, test } from '@playwright/test';
import { noOverflow, openStory } from './helpers.mjs';

test('a shared draft validates, saves and discards across all layers', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openStory(page, 'start-here-composition--from-atom-to-organism');
  const fields = page.getByLabel('Workspace name', { exact: true });
  await fields.first().fill('The material workshop');
  await expect(fields.nth(1)).toHaveValue('The material workshop');
  await expect(fields.nth(2)).toHaveValue('The material workshop');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status').first()).toContainText('The material workshop');
  await fields.first().fill('Unsaved name');
  await page.getByRole('button', { name: 'Discard' }).click();
  await expect(fields.first()).toHaveValue('The material workshop');
  await fields.first().fill('');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(fields.nth(2)).toBeFocused();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test('interrupted state changes keep recovery and keyboard focus usable', async ({ page }) => {
  await openStory(page, 'start-here-states--state-lab');
  for (const state of ['Loading', 'Error', 'Empty', 'Loading', 'Error']) {
    await page.getByRole('radio', { name: state, exact: true }).click();
  }
  const retry = page.getByRole('button', { name: /try again/i });
  await retry.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Replay error' })).toBeVisible();
  await expect(page.locator('body')).not.toBeFocused();
  await page.getByRole('radio', { name: 'Empty', exact: true }).click();
  await page.getByRole('button', { name: 'Add example files' }).click();
  await expect(page.getByRole('button', { name: 'Clear example files' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear example files' }).click();
  await expect(page.getByRole('button', { name: 'Add example files' })).toBeVisible();
  await noOverflow(page);
});

test('sources filter, reset and export without loading third-party media', async ({ page, baseURL }) => {
  const external = [];
  page.on('request', request => { const url = new URL(request.url()); if (url.origin !== 'null' && url.origin !== new URL(baseURL).origin) external.push(request.url()); });
  await openStory(page, 'start-here-visual-sources--source-shelf');
  await page.getByRole('button', { name: 'Pixel art', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Kenney', exact: true })).toBeVisible();
  await page.getByLabel('Filter by reuse terms').selectOption('redistributable');
  await expect(page.getByTestId('source-results').locator('article')).toHaveCount(2);
  await page.getByRole('textbox', { name: 'Search visual sources' }).fill('no-such-material');
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.getByTestId('source-results').locator('article')).toHaveCount(35);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download source catalog' }).click();
  expect((await download).suggestedFilename()).toBe('fleet-visual-sources.json');
  await noOverflow(page);
  expect(external).toEqual([]);
});

test('materials follow live reduced-motion preference and keyboard selection', async ({ page }) => {
  await openStory(page, 'start-here-visual-sources--source-shelf');
  await page.getByRole('button', { name: 'Play motion', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause motion', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('button', { name: 'Reduced motion', exact: true })).toBeDisabled();
  const tidal = page.getByRole('button', { name: 'Tidal', exact: true });
  await tidal.focus();
  await page.keyboard.press('Enter');
  await expect(tidal).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Copy Tidal CSS' })).toBeVisible();
  await noOverflow(page);
});


test('font comparisons measure live layout and retain usable inputs with fallbacks', async ({ page }) => {
  await openStory(page, 'foundations-tokens--font-impact');
  await expect(page.getByTestId('font-measurement')).toHaveCount(4);
  await expect(page.getByTestId('font-measurement').first()).toContainText('body lines');
  for (const input of await page.getByRole('textbox', { name: 'Public repository' }).all()) {
    expect(await input.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(page.viewportSize().width < 768 ? 16 : 14);
  }
  await page.getByRole('button', { name: 'System fallbacks off' }).click();
  await expect(page.getByRole('button', { name: 'System fallbacks on' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('font-specimen').first()).toHaveCSS('font-family', /system-ui/);
  await page.getByRole('button', { name: 'Tabular numbers on' }).click();
  await expect(page.getByLabel('Figtree numeral comparison')).toHaveCSS('font-variant-numeric', 'proportional-nums');
  await noOverflow(page);
});

test('responsive artwork selects a crop and media chapters work from the keyboard', async ({ page }) => {
  await openStory(page, 'start-here-media--primitives');
  const image = page.getByAltText('Responsive Kith artwork');
  await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
  expect(await image.evaluate(element => element.currentSrc)).toContain(page.viewportSize().width <= 600 ? 'coastal-walk' : 'memory-table');
  const first = page.getByRole('tab', { name: 'Image', exact: true });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Failure', exact: true })).toBeFocused();
  await expect(page.getByRole('img', { name: 'Example artwork — image unavailable' })).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByAltText('Kith memory table')).toBeVisible();
  const initialWidth = page.viewportSize().width;
  await page.getByRole('tab', { name: 'Recovery', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByAltText('Responsive recovery artwork').scrollIntoViewIfNeeded();
  await expect(page.getByRole('img', { name: 'Responsive recovery artwork — image unavailable' })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByAltText('Responsive recovery artwork').scrollIntoViewIfNeeded();
  await expect(page.getByRole('img', { name: 'Responsive recovery artwork — image unavailable' })).toHaveCount(0);
  await expect.poll(() => page.getByAltText('Responsive recovery artwork').evaluate(element => element.complete && element.naturalWidth > 0)).toBe(true);
  await page.setViewportSize({ width: initialWidth, height: 900 });
  await noOverflow(page);
});

test('video is deliberate, plays real frames and respects live reduced motion', async ({ page }) => {
  const movies = [];
  page.on('request', request => { if (/kith-sequence\.(mp4|webm)/.test(request.url())) movies.push(request.url()); });
  await openStory(page, 'start-here-media--primitives');
  const video = page.locator('video');
  await expect(video).not.toHaveAttribute('src');
  expect(movies).toEqual([]);
  const play = page.getByRole('button', { name: 'Play Kith screen sequence', exact: true });
  await play.focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0.15);
  expect(movies.length).toBeGreaterThan(0);
  await expect(video).toHaveAttribute('controls', '');
  await expect(video).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate(element => element.paused)).toBe(true);
  await noOverflow(page);
});

test('video pauses offscreen and failed sources can recover without a reload', async ({ page }) => {
  await page.route(/kith-sequence\.(mp4|webm)/, route => route.abort());
  await openStory(page, 'start-here-media--primitives');
  await page.getByRole('button', { name: 'Play Kith screen sequence', exact: true }).click();
  const retry = page.getByRole('button', { name: 'Retry Kith screen sequence', exact: true });
  await expect(retry).toBeVisible();
  await expect(retry).toBeFocused();
  await page.unroute(/kith-sequence\.(mp4|webm)/);
  await retry.click();
  const video = page.locator('video');
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0.15);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => video.evaluate(element => element.paused)).toBe(true);
  await noOverflow(page);
});

test('the complete media page connects real screens, playback and truthful beta status', async ({ page, baseURL }) => {
  const external = [];
  page.on('request', request => { const url = new URL(request.url()); if (url.origin !== 'null' && url.origin !== new URL(baseURL).origin) external.push(request.url()); });
  await openStory(page, 'start-here-media--complete-page');
  await page.getByRole('link', { name: 'Meet Kith', exact: true }).click();
  await page.getByRole('tab', { name: 'Keep the small things' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('How you met');
  await expect(page.getByAltText('Kith · person detail · actual app screen')).toBeVisible();
  await page.getByRole('button', { name: 'Play Kith screen sequence', exact: true }).click();
  await expect.poll(() => page.locator('video').evaluate(element => element.currentTime)).toBeGreaterThan(0.15);
  await page.getByRole('link', { name: 'Beta status', exact: true }).click();
  await expect(page.locator('#kith-status')).toContainText('There is no public invite or App Store listing yet.');
  await noOverflow(page);
  expect(external).toEqual([]);
});
