import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { noOverflow, openStory } from './helpers.mjs';

// Reuse the explorer's installed accessibility engine; no second version or
// network-loaded checker. Keep review-needed findings in the test artifact.
const explorerRequire = createRequire(new URL('../package.json', import.meta.url));
const addonRequire = createRequire(explorerRequire.resolve('@storybook/addon-a11y/package.json'));
const axeSource = addonRequire.resolve('axe-core/axe.min.js');
async function accessibleStory(page, testInfo, scope) {
  // Contrast is assessed at rest, after real entrance/dismissal motion. A
  // fading, closed drawer must not be mistaken for static low-contrast text.
  const drawer = page.locator('[data-slot="app-drawer"]');
  if (await drawer.count()) await expect(drawer).toBeHidden();
  const panel = page.locator('[data-slot="workspace-panel"]:not([hidden])');
  if (await panel.count()) await expect(panel).toHaveCSS('opacity', '1');
  await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => animation.effect?.getComputedTiming().endTime !== Infinity).map(animation => animation.finished.catch(() => {}))));
  if (!await page.evaluate(() => !!window.axe)) await page.addScriptTag({ path: axeSource });
  const result = await page.evaluate(async () => {
    const audit = await window.axe.run(document.querySelector('#storybook-root'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
    const summarize = items => items.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }));
    return { engine: window.axe.version, violations: summarize(audit.violations), incomplete: summarize(audit.incomplete) };
  });
  await testInfo.attach(`${scope}-accessibility`, { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
  expect(result.violations, scope).toEqual([]);
}

for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
  test(`the catalog and its detail meet automated accessibility checks in ${mode} mode`, async ({ page }, testInfo) => {
    test.setTimeout(45_000);
    await openStory(page, 'start-here-catalog--all-modules', `theme:${theme};mode:${mode}`);
    await accessibleStory(page, testInfo, 'catalog');
    await page.getByRole('searchbox', { name: 'Filter modules', exact: true }).fill('@saas-maker/ui/atoms/button');
    await page.getByRole('row').filter({ has: page.getByText('Button', { exact: true }) }).click();
    await expect(page.getByRole('dialog', { name: 'Button', exact: true })).toBeVisible();
    await accessibleStory(page, testInfo, 'module-detail');
  });
  test(`workspace and first-run forms meet automated accessibility checks in ${mode} mode`, async ({ page }, testInfo) => {
    test.setTimeout(45_000);
    await openStory(page, 'start-here-workspace--complete-workflow', `theme:${theme};mode:${mode}`);
    await accessibleStory(page, testInfo, 'workspace');
    await workspaceSection(page, 'Settings');
    await accessibleStory(page, testInfo, 'settings');
    await openStory(page, 'start-here-workspace--first-run-to-workspace', `theme:${theme};mode:${mode}`);
    await accessibleStory(page, testInfo, 'first-run');
  });
}

test('the catalog filters real modules, keeps selection and exports the sorted view', async ({ page }) => {
  await openStory(page, 'start-here-catalog--all-modules');
  await page.getByRole('button', { name: /^Atoms$/i }).click();
  const button = page.getByRole('checkbox', { name: 'Select Button', exact: true });
  await page.locator('label').filter({ has: button }).click({ position: { x: 2, y: 2 } });
  await expect(button).toBeChecked();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: /^Molecules$/i }).click();
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__catalogClipboard = value; } } }));
  await page.getByRole('button', { name: 'Copy selected imports', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__catalogClipboard)).toBe('import { Button } from "@saas-maker/ui/atoms/button";');
  await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Selection cleared.' })).toBeFocused();
  await page.getByRole('button', { name: /^Atoms$/i }).click();
  await page.getByRole('button', { name: /^Module$/i }).click();
  await page.getByRole('button', { name: /^Module$/i }).click();
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download view', exact: true }).click();
  const file = await downloading;
  expect(file.suggestedFilename()).toBe('fleet-ui-modules.json');
  const exported = JSON.parse(await readFile(await file.path(), 'utf8'));
  expect(exported.modules.length).toBeGreaterThan(10);
  expect(exported.modules.every(item => item.layer === 'Atoms')).toBe(true);
  expect(exported.modules.map(item => item.name)).toEqual([...exported.modules.map(item => item.name)].sort((a, b) => b.localeCompare(a, undefined, { sensitivity: 'base', numeric: true })));
  await page.getByRole('searchbox', { name: 'Filter modules', exact: true }).fill('no-module-has-this-name');
  await expect(page.getByText('No matching modules', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(page.getByRole('searchbox', { name: 'Filter modules', exact: true })).toBeFocused();
  await noOverflow(page);
});

test('catalog rows and command search open real examples with reliable dialog focus', async ({ page }) => {
  await openStory(page, 'start-here-catalog--all-modules');
  await page.getByRole('searchbox', { name: 'Filter modules', exact: true }).fill('@saas-maker/ui/atoms/button');
  const row = page.getByRole('row').filter({ has: page.getByText('Button', { exact: true }) });
  await row.focus();
  await page.keyboard.press('Enter');
  const detail = page.getByRole('dialog', { name: 'Button', exact: true });
  await expect(detail.getByRole('heading', { name: 'Button', exact: true })).toBeFocused();
  await expect(detail.getByRole('link', { name: 'Open live example', exact: true })).toHaveAttribute('href', './?path=/story/foundations-button--playground');
  await expect(detail.getByRole('link', { name: 'View source', exact: true })).toHaveAttribute('href', /\/packages\/ui\/src\/components\/button\.tsx$/);
  await page.keyboard.press('Escape');
  await expect(row).toBeFocused();
  await page.keyboard.press('Control+k');
  await page.getByPlaceholder('Find a component by name or purpose…').fill('workspace settings');
  await page.getByRole('option', { name: /^Workspace Settings/ }).click();
  await expect(page.getByRole('dialog', { name: 'Workspace Settings', exact: true }).getByRole('heading', { name: 'Workspace Settings', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Find a component ⌘K', exact: true })).toBeFocused();
  await noOverflow(page);
});

test('a table retry restores the collection and keeps focus in the named region', async ({ page }) => {
  await openStory(page, 'data-data-table--failure-recovery');
  await expect(page.getByRole('alert')).toContainText('The example request was interrupted.');
  await page.getByRole('button', { name: /^try again$/i }).click();
  await expect(page.getByRole('region', { name: 'Recoverable module request', exact: true })).toBeFocused();
  await expect(page.getByText('Accordion', { exact: true })).toBeVisible();
  await noOverflow(page);
});

async function workspaceSection(page, label) {
  if (page.viewportSize().width < 1024) await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.getByRole('link', { name: new RegExp(`^${label}(?: \\d+)?$`) }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(label);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
}

test('first run keeps choices on failure and hands the created name into a working app', async ({ page }) => {
  await openStory(page, 'start-here-workspace--first-run-to-workspace');
  if (page.viewportSize().width < 1024) {
    const introduction = await page.locator('main > section').first().boundingBox();
    const form = await page.getByRole('form', { name: 'Create a workspace', exact: true }).boundingBox();
    expect(form.y - introduction.y - introduction.height).toBeLessThanOrEqual(32);
  }
  await page.getByRole('textbox', { name: 'Workspace name', exact: true }).fill('Kith review room');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('form', { name: 'Create a workspace' }).getByText('Review together', { exact: true }).click();
  await expect(page.getByRole('radio', { name: /Review together/ })).toBeChecked();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Simulate a connection failure').check();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Your choices are retained');
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.locator('form')).toContainText('Kith review room');
  await page.getByLabel('Simulate a connection failure').uncheck();
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await page.getByRole('button', { name: 'Open workspace', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.getByRole('status').filter({ hasText: 'Welcome to Kith review room.' })).toBeVisible();
  await workspaceSection(page, 'Settings');
  await expect(page.getByLabel('Workspace name', { exact: true })).toHaveValue('Kith review room');
  await noOverflow(page);
});

test('a connected workspace previews, removes and restores local files', async ({ page }) => {
  await openStory(page, 'start-here-workspace--complete-workflow');
  await page.getByRole('button', { name: 'Browse release assets' }).click();
  const preview = page.getByRole('button', { name: 'Preview The long way home.webp', exact: true });
  await preview.click();
  await expect(page.getByRole('dialog')).toContainText('The long way home.webp');
  await page.keyboard.press('Escape');
  await expect(preview).toBeFocused();
  await page.getByLabel('Select The long way home.webp', { exact: true }).check();
  await page.getByRole('button', { name: 'Remove selected', exact: true }).click();
  await expect(preview).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo removal', exact: true }).click();
  await expect(preview).toBeVisible();
  await expect(page.locator('section[aria-label="Release assets"] article').first()).toContainText('The long way home.webp');
  await page.getByLabel('Add local files', { exact: true }).setInputFiles({ name: 'Review notes.txt', mimeType: 'text/plain', buffer: Buffer.from('Local example notes') });
  await page.getByRole('button', { name: 'Local files', exact: true }).click();
  await page.getByLabel('Select Review notes.txt', { exact: true }).check();
  await page.getByRole('button', { name: 'Remove selected', exact: true }).click();
  await expect(page.getByRole('button', { name: 'All files', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status').filter({ hasText: '6 of 6 files' })).toBeVisible();
  await page.getByRole('button', { name: 'Actions for Release notes.md', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Remove file', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Preview Release notes.md', exact: true })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Release assets', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Undo removal', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Preview Release notes.md', exact: true })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: '1 file restored.' })).toBeFocused();
  const menu = page.getByRole('button', { name: 'Actions for Release notes.md', exact: true });
  await menu.click();
  await page.getByRole('menuitem', { name: 'Open preview', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Release notes.md', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Release notes.md');
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await noOverflow(page);
});

test('a tablet inbox survives narrow reflow and restores focus after filtering', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await openStory(page, 'start-here-workspace--complete-workflow');
  await workspaceSection(page, 'Inbox');
  await page.getByRole('button', { name: 'Unread', exact: false }).filter({ hasText: /^Unread/ }).click();
  await page.getByRole('button', { name: /Maya Chen/ }).click();
  await expect(page.getByRole('heading', { name: 'The small things are coming together', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 700, height: 1000 });
  await page.getByRole('button', { name: 'Inbox', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inbox', exact: true, level: 2 })).toBeFocused();
  await expect(page.getByRole('button', { name: /Arjun Patel/ })).toBeVisible();
  await noOverflow(page);
});

test('workspace navigation retains drafts and settings recover from a failed save', async ({ page }) => {
  await openStory(page, 'start-here-workspace--complete-workflow');
  const search = page.getByRole('button', { name: 'Jump to a section ⌘K', exact: true });
  await search.click();
  await expect(page.getByRole('dialog', { name: 'Search', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(search).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Search', exact: true })).toHaveCount(0);
  await search.click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(search).toBeFocused();
  await page.keyboard.press('Control+k');
  await page.getByPlaceholder('Find a workspace section…').fill('preferences');
  await page.getByRole('option', { name: /Settings/ }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  const name = page.getByLabel('Workspace name', { exact: true });
  await name.fill('Kith design room');
  await workspaceSection(page, 'Assets');
  await page.goBack();
  await expect(name).toBeVisible();
  await expect(name).toHaveValue('Kith design room');
  await page.getByText('Controls', { exact: true }).click();
  await page.getByLabel('Simulate save failure').check();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'The example save was interrupted.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeFocused();
  await expect(name).toHaveValue('Kith design room');
  await page.getByLabel('Simulate save failure').uncheck();
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'All changes saved.' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'All changes saved.' })).toBeFocused();
  await workspaceSection(page, 'Inbox');
  await page.getByRole('button', { name: 'Mark all read', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mark all read', exact: true })).toBeDisabled();
  await workspaceSection(page, 'Settings');
  await expect(name).toHaveValue('Kith design room');
  await expect(page.getByRole('button', { name: 'Save changes', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Notifications', exact: true }).click();
  const release = page.getByRole('switch', { name: 'Release notifications', exact: true });
  await expect(release).toBeChecked();
  await page.getByText('A short note when something new is ready.', { exact: true }).click();
  await expect(release).not.toBeChecked();
  await page.getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(release).toBeChecked();
  await expect(page.getByRole('status').filter({ hasText: 'You’re all up to date.' })).toBeFocused();
  await noOverflow(page);
});

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
  await expect(video).toHaveAttribute('aria-hidden', 'true');
  expect(movies).toEqual([]);
  const play = page.getByRole('button', { name: 'Play Kith screen sequence', exact: true });
  await play.focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0.15);
  expect(movies.length).toBeGreaterThan(0);
  await expect(video).toHaveAttribute('controls', '');
  await expect(video).toHaveAttribute('aria-hidden', 'false');
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
