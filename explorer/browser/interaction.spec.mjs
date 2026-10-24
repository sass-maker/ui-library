import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { noOverflow, openStory } from './helpers.mjs';

test('the expressive button has one accessible name and supports keyboard activation', async ({ page }) => {
  await openStory(page, 'effects-interactive-hover-button--playground');
  const button = page.getByRole('button', { name: 'Explore components', exact: true });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Example action selected', { exact: true })).toBeVisible();
  await expect(button).toBeFocused();
  await noOverflow(page);
});

test('a dialog saves the actual name, discards cancelled drafts and focuses invalid input', async ({ page }) => {
  await openStory(page, 'overlays-dialog--playground');
  const trigger = page.getByRole('button', { name: 'Edit project', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Edit project', exact: true });
  const name = dialog.getByRole('textbox', { name: 'Project name', exact: true });
  await name.fill('   ');
  await dialog.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await name.fill('  Kith release review  ');
  await dialog.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('Kith release review');
  await trigger.click();
  await name.fill('Discard this draft');
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await trigger.click();
  await expect(name).toHaveValue('Kith release review');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await noOverflow(page);
});

test('the sheet inspector applies real properties and contains a nested select', async ({ page }) => {
  await openStory(page, 'overlays-sheet--playground');
  const trigger = page.getByRole('button', { name: 'Open inspector', exact: true });
  await trigger.click();
  const sheet = page.getByRole('dialog', { name: 'Button inspector', exact: true });
  const close = sheet.getByRole('button', { name: 'Close', exact: true });
  const target = await close.boundingBox();
  expect(target.width).toBeGreaterThanOrEqual(44);
  expect(target.height).toBeGreaterThanOrEqual(44);
  await sheet.getByRole('combobox', { name: 'Variant', exact: true }).click();
  await page.getByRole('option', { name: 'Outline', exact: true }).click();
  await sheet.getByRole('switch', { name: 'Disabled', exact: true }).click();
  await expect(sheet.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await sheet.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('Outline variant · Disabled');
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeDisabled();
  await noOverflow(page);
});

test('menu actions update the actual local collection and retain keyboard focus', async ({ page }) => {
  await openStory(page, 'overlays-dropdown-menu--playground');
  const trigger = page.getByRole('button', { name: 'Project actions', exact: true });
  await trigger.click();
  const pin = page.getByRole('menuitemcheckbox', { name: 'Pin in quick access', exact: true });
  if (await page.evaluate(() => matchMedia('(pointer:coarse)').matches)) await expect.poll(async () => (await pin.boundingBox()).height).toBeGreaterThanOrEqual(43.99);
  await expect(page.locator('#storybook-root')).not.toHaveAttribute('aria-hidden', 'true');
  await pin.click();
  await expect(trigger).toBeFocused();
  await expect(page.getByText('Active collection · Pinned', { exact: true })).toBeVisible();
  await trigger.click();
  await page.getByRole('menuitem', { name: 'Move to', exact: true }).click();
  await page.getByRole('menuitemradio', { name: 'Review', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Moved to Review.');
  await expect(page.getByText('Review collection · Pinned', { exact: true })).toBeVisible();
  await expect(trigger).toBeFocused();
  await noOverflow(page);
});

test('an empty table provides a working filter recovery and keeps focus', async ({ page }) => {
  await openStory(page, 'data-data-table--empty');
  await expect(page.getByRole('heading', { name: 'No matching modules', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filter', exact: true }).click();
  await expect(page.getByRole('searchbox', { name: 'Filter example modules', exact: true })).toBeFocused();
  await expect(page.getByRole('row').filter({ has: page.getByText('Accordion', { exact: true }) })).toBeVisible();
  await noOverflow(page);
});

test('composition inputs and notes share their tracks and inline links stay text-flush', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await openStory(page, 'start-here-composition--from-atom-to-organism');
  const inputs = await page.locator('.composition-pieces input').evaluateAll(items => items.map(item => item.getBoundingClientRect().top));
  const notes = await page.locator('.composition-pieces .composition-note code').evaluateAll(items => items.map(item => item.getBoundingClientRect().top));
  expect(Math.abs(inputs[0] - inputs[1])).toBeLessThan(1);
  expect(Math.abs(notes[0] - notes[1])).toBeLessThan(1);
  await openStory(page, 'start-here-overview--explore');
  expect(await page.getByRole('link', { name: 'See how it fits together', exact: true }).evaluate(element => parseFloat(getComputedStyle(element).paddingLeft))).toBe(0);
});

test('the paged catalog shows a complete page and makes horizontal overflow explicit', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await openStory(page, 'start-here-catalog--all-modules');
  const region = page.getByRole('region', { name: 'Component catalog', exact: true });
  await expect(page.locator('tr[data-row]')).toHaveCount(12);
  const geometry = await region.evaluate(element => ({ scroll: element.scrollHeight, height: element.clientHeight }));
  expect(geometry.scroll - geometry.height).toBeLessThanOrEqual(1);
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(region).toHaveAttribute('data-scroll-right', 'true');
  await expect(page.getByText('Scroll horizontally for more columns.', { exact: true })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Select Accordion', exact: true }).check();
  const actions = await Promise.all(['Download view', 'Columns'].map(name => page.getByRole('button', { name, exact: true }).boundingBox()));
  expect(Math.abs(actions[0].y - actions[1].y), 'selection keeps primary table actions on one line').toBeLessThan(1);
  await region.evaluate(element => { element.scrollLeft = element.scrollWidth; });
  await expect(region).toHaveAttribute('data-scroll-left', 'true');
  await expect(region).not.toHaveAttribute('data-scroll-right');
  await noOverflow(page);
});

test('curated font pairings load real faces and preserve the working collection', async ({ page }) => {
  await openStory(page, 'foundations-tokens--font-pairings');
  const preview = page.getByTestId('font-pairing-preview');
  const tileTops = await page.locator('.type-choice-top').evaluateAll(items => items.map(item => item.getBoundingClientRect().top));
  expect(Math.abs(tileTops[0] - tileTops[1]), 'wrapping font labels do not shift the selector headings').toBeLessThan(1);
  await preview.getByRole('button', { name: 'Brand', exact: true }).click();
  for (const [label, id, family] of [
    ['Editorial', 'editorial', 'Instrument Sans Variable'],
    ['Calm product', 'calm', 'Manrope Variable'],
    ['Expressive', 'expressive', 'Geist Variable'],
    ['Technical', 'technical', 'IBM Plex Sans Variable'],
  ]) {
    await page.getByRole('group', { name: 'Choose a font pairing' }).getByRole('button', { name: new RegExp(`^${label}`) }).click();
    await expect(preview).toHaveAttribute('data-pairing', id);
    await expect(preview).toHaveCSS('font-family', new RegExp(family));
    await expect(preview.getByRole('button', { name: 'Brand', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(preview.getByText('The long way home.webp', { exact: true })).toHaveCount(0);
    const art = await preview.getByAltText('Two people walking along Kith’s illustrated coastal path').boundingBox();
    const landing = await preview.getByRole('region', { name: 'Kith landing preview' }).boundingBox();
    expect(art.x + art.width).toBeLessThanOrEqual(landing.x + landing.width + 1);
    await noOverflow(page);
  }
  const faces = await page.evaluate(async () => {
    const samples = [
      ['Instrument Sans Variable', 'normal'], ['Instrument Sans Variable', 'italic'],
      ['Manrope Variable', 'normal'], ['Bricolage Grotesque Variable', 'normal'],
      ['IBM Plex Sans Variable', 'normal'], ['IBM Plex Sans Variable', 'italic'],
    ];
    return Promise.all(samples.map(async ([family, style]) => {
      const loaded = await document.fonts.load(`${style} 400 20px "${family}"`);
      const context = document.createElement('canvas').getContext('2d');
      context.font = `${style} 400 20px "${family}", monospace`;
      const actual = context.measureText('Remember the people, Il1 O0 0123456789').width;
      context.font = `${style} 400 20px monospace`;
      return { family, style, loaded: loaded.length, difference: Math.abs(actual - context.measureText('Remember the people, Il1 O0 0123456789').width) };
    }));
  });
  for (const face of faces) {
    expect(face.loaded, `${face.family} ${face.style} loads a declared face`).toBeGreaterThan(0);
    expect(face.difference, `${face.family} ${face.style} renders beyond fallback`).toBeGreaterThan(0.1);
  }
  await preview.getByRole('button', { name: 'All files', exact: true }).click();
  const clipped = await preview.locator('[data-slot="transition-panel"]').evaluate(element => new Promise(resolve => {
    let worst = 0, frames = 0;
    function measure() {
      worst = Math.max(worst, element.firstElementChild.getBoundingClientRect().bottom - element.getBoundingClientRect().bottom);
      if (++frames < 8) requestAnimationFrame(measure); else resolve(worst);
    }
    requestAnimationFrame(measure);
  }));
  expect(clipped, 'newly filtered cards stay in natural document flow throughout their entrance').toBeLessThanOrEqual(1);
  const screen = preview.getByRole('button', { name: 'Preview A little constellation.webp', exact: true }).locator('img');
  await expect(screen).toHaveCSS('object-fit', 'contain');
  await preview.getByRole('button', { name: 'Preview Release notes.md', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Photography, notes, and stories, together.');
  await page.keyboard.press('Escape');
  await expect(preview.getByRole('button', { name: 'Preview Release notes.md', exact: true })).toBeFocused();
});

test('the media gallery supports keyboard browsing and isolates offscreen links', async ({ page }) => {
  await openStory(page, 'motion-carousel--in-context');
  const gallery = page.getByRole('group', { name: 'Kith moments', exact: true });
  const frame = gallery.locator('[data-slot="carousel-viewport"]');
  await expect(gallery.getByRole('group', { name: 'The long way home.', exact: true })).toBeVisible();
  await expect(gallery.getByRole('link', { name: 'Explore Kith', exact: true })).toHaveCount(1);
  await expect(gallery.getByRole('button', { name: 'Next slide', exact: true })).toHaveCSS('opacity', '1');
  for (const button of await gallery.getByRole('button').all()) {
    const size = await button.boundingBox();
    expect(size.width).toBeGreaterThanOrEqual(44);
    expect(size.height).toBeGreaterThanOrEqual(44);
  }
  await frame.focus();
  await page.keyboard.press('ArrowRight');
  await expect(gallery.getByRole('status')).toHaveText('Slide 2 of 4');
  await expect(gallery.getByRole('link', { name: 'Explore Kith', exact: true })).toHaveCount(1);
  await expect(gallery.locator('button[aria-label="Go to slide 2"]')).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('End');
  await expect(gallery.getByRole('status')).toHaveText('Slide 4 of 4');
  await expect(gallery.getByRole('button', { name: 'Next slide', exact: true })).toBeDisabled();
  await page.keyboard.press('Home');
  await expect(gallery.getByRole('status')).toHaveText('Slide 1 of 4');
  const next = gallery.getByRole('button', { name: 'Next slide', exact: true });
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(next).toBeFocused();
  await next.click();
  await next.click();
  await expect(gallery.getByRole('status')).toHaveText('Slide 4 of 4');
  await noOverflow(page);
});

test('a carousel measures gaps, stays aligned on resize and recovers an empty collection', async ({ page }) => {
  await openStory(page, 'motion-carousel--responsive-collection', 'theme:paper;mode:light;motion:reduced');
  const gallery = page.getByRole('group', { name: 'Responsive artwork', exact: true });
  const frame = gallery.locator('[data-slot="carousel-viewport"]');
  await frame.focus();
  await page.keyboard.press('End');
  const last = gallery.locator('[data-slot="carousel-slide"]').last();
  await expect.poll(async () => Math.abs((await last.boundingBox()).x + (await last.boundingBox()).width - (await frame.boundingBox()).x - (await frame.boundingBox()).width)).toBeLessThan(2);
  await expect(gallery.getByRole('button', { name: 'Next slide', exact: true })).toBeDisabled();
  const resizedWidth = page.viewportSize().width === 390 ? 1440 : 390;
  await page.setViewportSize({ width: resizedWidth, height: 900 });
  // Chromium can acknowledge emulation before painting the new media query.
  // Send input once the new one/two-frame layout is actually rendered.
  await expect.poll(() => frame.evaluate(element => Math.round(element.clientWidth / element.querySelector('[data-slot="carousel-slide"]').offsetWidth))).toBe(resizedWidth < 640 ? 1 : 2);
  await frame.focus();
  await page.keyboard.press('End');
  await expect.poll(async () => Math.abs((await last.boundingBox()).x + (await last.boundingBox()).width - (await frame.boundingBox()).x - (await frame.boundingBox()).width)).toBeLessThan(2);
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Remove last artwork', exact: true }).click();
  await expect(gallery.getByRole('status')).toHaveText('No slides');
  await expect(gallery.getByRole('button', { name: 'Next slide', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Restore artwork', exact: true }).click();
  await expect(gallery.getByRole('status')).toHaveText('Slide 1 of 5');
  await expect(gallery.getByRole('link', { name: 'Inspect Coastal walk', exact: true })).toBeVisible();
  await noOverflow(page);
});

test('a carousel follows right to left direction without changing button meaning', async ({ page }) => {
  await openStory(page, 'motion-carousel--right-to-left', 'theme:paper;mode:light;motion:reduced');
  const gallery = page.getByRole('group', { name: 'Right to left gallery', exact: true });
  const frame = gallery.locator('[data-slot="carousel-viewport"]');
  await frame.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(gallery.getByRole('status')).toHaveText('Slide 2 of 3');
  const second = gallery.getByRole('group', { name: '2 of 3', exact: true });
  await expect.poll(async () => Math.abs((await second.boundingBox()).x - (await frame.boundingBox()).x)).toBeLessThan(2);
  await gallery.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expect(gallery.getByRole('status')).toHaveText('Slide 3 of 3');
  await noOverflow(page);
});

test('swipe navigation and live reduced motion keep the selected frame aligned', async ({ page }) => {
  await openStory(page, 'motion-carousel--in-context');
  const gallery = page.getByRole('group', { name: 'Kith moments', exact: true });
  const frame = gallery.locator('[data-slot="carousel-viewport"]');
  await frame.scrollIntoViewIfNeeded();
  const box = await frame.boundingBox();
  await page.mouse.move(box.x + box.width * 0.75, box.y + 80);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.2, box.y + 80, { steps: 8 });
  await page.mouse.up();
  await expect(gallery.getByRole('status')).toHaveText('Slide 2 of 4');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gallery.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expect(gallery.getByRole('status')).toHaveText('Slide 3 of 4');
  const current = gallery.getByRole('group', { name: 'Stories worth keeping.', exact: true });
  await expect.poll(async () => Math.abs((await current.boundingBox()).x - (await frame.boundingBox()).x)).toBeLessThan(2);
  await noOverflow(page);
});

test('a touch gallery preserves vertical page scrolling and accepts a horizontal swipe', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium' || page.viewportSize().width !== 390, 'Native touch input uses Chromium’s emulated touchscreen.');
  await openStory(page, 'motion-carousel--in-context');
  const gallery = page.getByRole('group', { name: 'Kith moments', exact: true });
  const frame = gallery.locator('[data-slot="carousel-viewport"]');
  await frame.scrollIntoViewIfNeeded();
  const session = await context.newCDPSession(page);
  const swipe = async (from, to) => {
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 0 }] });
    for (let step = 1; step <= 8; step++) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * step / 8, y: from.y + (to.y - from.y) * step / 8, id: 0 }] });
      await page.waitForTimeout(16);
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  let box = await frame.boundingBox();
  const before = await page.evaluate(() => scrollY);
  await swipe({ x: box.x + box.width / 2, y: box.y + 180 }, { x: box.x + box.width / 2, y: box.y + 60 });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 30);
  await expect(gallery.getByRole('status')).toHaveText('Slide 1 of 4');
  await frame.scrollIntoViewIfNeeded();
  box = await frame.boundingBox();
  await swipe({ x: box.x + box.width * 0.8, y: box.y + 80 }, { x: box.x + box.width * 0.2, y: box.y + 80 });
  await expect(gallery.getByRole('status')).toHaveText('Slide 2 of 4');
  await session.detach();
});

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
    // The Storybook addon can still be inspecting the newly opened story.
    // Serialize engine access; actual accessibility findings are never retried.
    const deadline = performance.now() + 8000;
    let audit;
    while (!audit) {
      try {
        // Radix overlays are portalled beside the story root. Auditing only
        // that root would inspect the hidden background instead of the dialog.
        audit = await window.axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
      } catch (error) {
        if (!String(error).includes('Axe is already running') || performance.now() >= deadline) throw error;
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
    }
    const summarize = items => items.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) }));
    return { engine: window.axe.version, violations: summarize(audit.violations), incomplete: summarize(audit.incomplete) };
  });
  await testInfo.attach(`${scope}-accessibility`, { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
  expect(result.violations, scope).toEqual([]);
}

for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
  test(`shared overlays include their portal content in accessibility checks in ${mode} mode`, async ({ page }, testInfo) => {
    test.setTimeout(45_000);
    for (const [story, trigger, scope] of [
      ['overlays-dialog--playground', 'Edit project', 'dialog'],
      ['overlays-sheet--playground', 'Open inspector', 'sheet'],
      ['overlays-dropdown-menu--playground', 'Project actions', 'menu'],
    ]) {
      await openStory(page, story, `theme:${theme};mode:${mode}`);
      await page.getByRole('button', { name: trigger, exact: true }).click();
      await accessibleStory(page, testInfo, `${scope}-${mode}`);
    }
  });
  test(`font pairing code is keyboard scrollable and accessible in ${mode} mode`, async ({ page }, testInfo) => {
    test.setTimeout(45_000);
    await openStory(page, 'foundations-tokens--font-pairings', `theme:${theme};mode:${mode}`);
    const css = page.getByRole('region', { name: 'React and CSS applications configuration' });
    await css.focus();
    await expect(css).toBeFocused();
    await accessibleStory(page, testInfo, 'font-pairings');
  });

  test(`the media gallery meets automated accessibility checks in ${mode} mode`, async ({ page }, testInfo) => {
    test.setTimeout(45_000);
    await openStory(page, 'motion-carousel--in-context', `theme:${theme};mode:${mode}`);
    await accessibleStory(page, testInfo, 'media-gallery');
    await page.locator('[data-slot="carousel-viewport"]').focus();
    await page.keyboard.press('End');
    await accessibleStory(page, testInfo, 'media-gallery-screen');
  });
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
    await openStory(page, 'start-here-overview--explore', `theme:${theme};mode:${mode}`);
    await accessibleStory(page, testInfo, 'home-compositions');
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
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press('Tab');
    expect(await detail.evaluate(element => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Shift+Tab');
  expect(await detail.evaluate(element => element.contains(document.activeElement))).toBe(true);
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
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(label === 'Overview' ? 'Kith’s October release.' : label);
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

test('default and custom-height tabs contain their controls with usable touch targets', async ({ page }) => {
  for (const story of ['navigation-tabs--playground', 'start-here-overview--explore']) {
    await openStory(page, story);
    const geometry = await page.getByRole('tablist').evaluate(list => {
      const frame = list.getBoundingClientRect();
      return [...list.querySelectorAll('[role="tab"]')].map(tab => {
        const bounds = tab.getBoundingClientRect();
        return { top: bounds.top - frame.top, bottom: frame.bottom - bounds.bottom, height: bounds.height };
      });
    });
    for (const tab of geometry) {
      expect(tab.top).toBeGreaterThanOrEqual(2.99);
      expect(tab.bottom).toBeGreaterThanOrEqual(2.99);
      if (await page.evaluate(() => matchMedia('(pointer:coarse)').matches) || story.startsWith('start-here')) expect(tab.height).toBeGreaterThanOrEqual(44);
    }
    await noOverflow(page);
  }
});

test('home composition tabs retain decisions and share the actual inbox and files', async ({ page }) => {
  await openStory(page, 'start-here-overview--explore');
  await page.getByRole('button', { name: 'Approve The long way home.webp', exact: true }).click();
  await page.getByRole('button', { name: 'Request changes to The long way home.webp', exact: true }).click();
  await page.getByLabel('What should change?', { exact: true }).fill('Leave room above the walkers.');
  await page.getByRole('button', { name: 'Save note', exact: true }).click();
  await page.getByRole('tab', { name: 'Inbox', exact: true }).click();
  await expect(page.getByRole('button', { name: /Changes requested: The long way home/ })).toBeVisible();
  await page.getByRole('button', { name: 'Mark all read', exact: true }).click();
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Approve the coastal cover', exact: true })).not.toBeChecked();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Approve the coastal cover', exact: true })).toBeChecked();
  await page.getByRole('tab', { name: 'Assets', exact: true }).click();
  await page.getByLabel('Select The long way home.webp', { exact: true }).check();
  await page.getByRole('button', { name: 'Remove selected', exact: true }).click();
  await page.getByRole('tab', { name: 'Overview', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Approved The long way home.webp', exact: true })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'Approve the coastal cover', exact: true })).toHaveCount(0);
  await page.getByRole('tab', { name: 'Inbox', exact: true }).click();
  await expect(page.getByRole('button', { name: /Changes requested: The long way home/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Mark all read', exact: true })).toBeDisabled();
  await noOverflow(page);
});

test('artwork decisions connect checklist, inbox, counts and a narrowly scoped undo', async ({ page }) => {
  await openStory(page, 'start-here-workspace--complete-workflow');
  const initialViewport = page.viewportSize();
  await page.setViewportSize({ width: 820, height: 1000 });
  const review = page.getByRole('group', { name: 'Artwork waiting for review', exact: true });
  await expect(review.locator('[data-slot="carousel-slide"]:not([inert])')).toHaveCount(3);
  await expect.poll(() => review.getByRole('button').evaluateAll(buttons => buttons.every(button => button.scrollWidth <= button.clientWidth + 1))).toBe(true);
  await page.setViewportSize(initialViewport);
  const approved = page.getByRole('heading', { name: 'Approved', exact: true }).locator('..');
  const changes = page.getByRole('heading', { name: 'Needs changes', exact: true }).locator('..');
  const unread = page.getByRole('heading', { name: 'Unread', exact: true }).locator('..');
  const task = page.getByRole('checkbox', { name: 'Approve the coastal cover', exact: true });
  await expect(approved.getByText('0/3', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Approve The long way home.webp', exact: true }).click();
  await expect(task).toBeChecked();
  await expect(approved.getByText('1/3', { exact: true })).toBeVisible();
  const request = page.getByRole('button', { name: 'Request changes to The long way home.webp', exact: true });
  await request.click();
  const dialog = page.getByRole('dialog', { name: 'Request changes', exact: true });
  await dialog.getByRole('button', { name: 'Save note', exact: true }).click();
  await expect(dialog.getByLabel('What should change?', { exact: true })).toBeFocused();
  await expect(dialog).toContainText('Add a note before saving.');
  await dialog.getByLabel('What should change?', { exact: true }).fill('Keep more space around the walkers.');
  await dialog.getByRole('button', { name: 'Save note', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(request).toBeFocused();
  await expect(task).not.toBeChecked();
  await expect(approved.getByText('0/3', { exact: true })).toBeVisible();
  await expect(changes.getByText('1', { exact: true })).toBeVisible();
  await expect(unread.getByText('2', { exact: true })).toBeVisible();
  await workspaceSection(page, 'Inbox');
  await expect(page.getByRole('button', { name: /Changes requested: The long way home/ })).toBeVisible();
  await page.getByRole('button', { name: 'Mark all read', exact: true }).click();
  await workspaceSection(page, 'Overview');
  await expect(unread.getByText('0', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(task).toBeChecked();
  await expect(approved.getByText('1/3', { exact: true })).toBeVisible();
  await expect(changes.getByText('0', { exact: true })).toBeVisible();
  await expect(unread.getByText('0', { exact: true })).toBeVisible();
  await workspaceSection(page, 'Inbox');
  await expect(page.getByRole('button', { name: /Changes requested: The long way home/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Mark all read', exact: true })).toBeDisabled();
  await page.getByText('Controls', { exact: true }).click();
  await page.getByRole('button', { name: 'Reset example data', exact: true }).click();
  await page.getByText('Controls', { exact: true }).click();
  await workspaceSection(page, 'Overview');
  await expect(task).not.toBeChecked();
  await expect(approved.getByText('0/3', { exact: true })).toBeVisible();
  await expect(unread.getByText('2', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toHaveCount(0);
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

test('workspace navigation preserves focus moved during a pending settings save', async ({ page }) => {
  await openStory(page, 'start-here-workspace--complete-workflow');
  await workspaceSection(page, 'Settings');
  await page.getByLabel('Workspace name', { exact: true }).fill('Kith review studio');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saving…', exact: true })).toBeVisible();
  const search = page.getByRole('button', { name: 'Jump to a section ⌘K', exact: true });
  await search.focus();
  await expect(page.getByRole('status').filter({ hasText: 'All changes saved.' })).toBeVisible();
  await expect(search).toBeFocused();
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
  await expect(page.getByTestId('font-measurement')).toHaveCount(10);
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
