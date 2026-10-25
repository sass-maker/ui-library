import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { noOverflow, openStory } from './helpers.mjs';

test('shimmer actions retain readable text and distinct boundaries in both themes', async ({ page }, testInfo) => {
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    await openStory(page, 'effects-shimmer-button--playground', `theme:${theme};mode:${mode}`);
    const button = page.getByRole('button', { name: 'Explore components', exact: true });
    const contrast = await button.evaluate(node => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      const rgb = color => { context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1); return [...context.getImageData(0, 0, 1, 1).data]; };
      const luminance = color => color.slice(0, 3).map(v => { const c = v / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
      const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
      const painted = element => {
        const layers = [];
        for (let current = element; current; current = current.parentElement) layers.unshift(rgb(getComputedStyle(current).backgroundColor));
        return layers.reduce((under, over) => over.slice(0, 3).map((value, i) => value * over[3] / 255 + under[i] * (1 - over[3] / 255)), [255, 255, 255]);
      };
      const background = painted(node);
      return { text: ratio(rgb(getComputedStyle(node).color), background), boundary: ratio(background, painted(node.closest('.example-stage'))) };
    });
    await testInfo.attach(`shimmer-contrast-${theme}`, { body: JSON.stringify(contrast), contentType: 'application/json' });
    expect(contrast.text).toBeGreaterThanOrEqual(4.5);
    expect(contrast.boundary).toBeGreaterThanOrEqual(3);
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Example action selected', { exact: true })).toBeVisible();
    await expect(button).toBeFocused();
    await noOverflow(page);
  }
});

test('reorder priorities keep complete titles and descriptions readable through keyboard and pointer moves', async ({ page }) => {
  await openStory(page, 'interactions-reorder-list--in-context');
  const list = page.getByRole('list', { name: 'Release priorities', exact: true });
  const labels = ['Set the foundation', 'Care for every state', 'Connect the moments', 'Look at the real thing'];
  const descriptions = ['Tokens, type, and shared geometry', 'Loading, empty, error, success', 'Smooth, interruptible motion', 'Phone, tablet, and desktop'];
  for (const text of [...labels, ...descriptions]) {
    const content = list.getByText(text, { exact: true });
    await expect(content).toBeVisible();
    const overflow = await content.evaluate(node => ({ horizontal: node.scrollWidth - node.clientWidth, vertical: node.scrollHeight - node.clientHeight }));
    expect(overflow.horizontal).toBeLessThanOrEqual(1);
    expect(overflow.vertical).toBeLessThanOrEqual(1);
  }
  const handle = list.getByRole('button', { name: 'Reorder Set the foundation', exact: true });
  const target = await handle.boundingBox();
  expect(target.width).toBeGreaterThanOrEqual(44);
  expect(target.height).toBeGreaterThanOrEqual(44);
  await handle.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('End');
  await expect(list.getByRole('listitem').last()).toContainText(labels[0]);
  await expect(handle).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(list.getByRole('listitem').first()).toContainText(labels[0]);
  await expect(handle).toBeFocused();
  await expect(page.getByText('Cancelled. Set the foundation returned to position 1 of 4.', { exact: true })).toHaveAttribute('aria-live', 'assertive');
  await expect.poll(async () => (await handle.boundingBox()).y).toBeCloseTo(target.y, 0);
  const destination = await list.getByRole('listitem').nth(1).boundingBox();
  const start = await handle.boundingBox();
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2 + 8, { steps: 4 });
  await expect.poll(() => handle.locator('..').evaluate(row => row.style.zIndex)).toBe('1');
  await page.mouse.move(start.x + start.width / 2, destination.y + destination.height - 5, { steps: 20 });
  await page.mouse.up();
  await expect(list.getByRole('listitem').nth(1)).toContainText(labels[0]);
  await expect(list.getByRole('listitem').first()).toContainText(labels[1]);
  await noOverflow(page);
});

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
  const originalViewport = page.viewportSize();
  const pagePreview = page.locator('#storybook-root').getByRole('button', { name: 'Continue', exact: true, includeHidden: true });
  const pageTrigger = page.locator('#storybook-root').getByRole('button', { name: 'Open inspector', exact: true, includeHidden: true });
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(async () => {
      const panel = await sheet.boundingBox();
      const controls = await Promise.all([pagePreview, pageTrigger].map(control => control.boundingBox()));
      return controls.every(control => {
        const clear = control.x + control.width <= panel.x + 1;
        const covered = control.x >= panel.x - 1 && control.x + control.width <= panel.x + panel.width + 1;
        return width < 640 ? clear || covered : clear;
      });
    }, { message: `the page controls are whole or fully covered at${width}px` }).toBe(true);
  }
  await page.setViewportSize(originalViewport);
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
  await expect(region).not.toHaveAttribute('data-scroll-right');
  const first = page.locator('tr[data-row]').first();
  await expect(first.locator('code:visible')).toHaveText('@saas-maker/ui/molecules/accordion');
  const rowSize = await first.boundingBox();
  expect(rowSize.x + rowSize.width).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Columns', exact: true }).click();
  await page.getByRole('menuitemcheckbox', { name: 'Show all columns', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(region).toHaveAttribute('data-scroll-right', 'true');
  const cue = page.getByText('Scroll horizontally for more columns.', { exact: true });
  await expect(cue).toBeVisible();
  const cuePosition = await cue.boundingBox();
  const tablePosition = await region.boundingBox();
  expect(cuePosition.y + cuePosition.height).toBeLessThanOrEqual(tablePosition.y);
  await page.getByRole('checkbox', { name: 'Select Accordion', exact: true }).check();
  const actions = await Promise.all(['Download view', 'Columns'].map(name => page.getByRole('button', { name, exact: true }).boundingBox()));
  expect(Math.abs(actions[0].y - actions[1].y), 'selection keeps primary table actions on one line').toBeLessThan(1);
  await region.evaluate(element => { element.scrollLeft = element.scrollWidth; });
  await expect(region).toHaveAttribute('data-scroll-left', 'true');
  await expect(region).not.toHaveAttribute('data-scroll-right');
  await noOverflow(page);
  for (const width of [820, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await openStory(page, 'data-data-table--in-context');
    const imports = page.locator('tr[data-row] code:visible');
    await expect(imports).toHaveCount(12);
    const fragments = await imports.evaluateAll(codes => codes.flatMap(code => {
      const box = code.getBoundingClientRect(), walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT), fragments = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent.trim()) continue;
        const range = document.createRange(); range.selectNodeContents(node);
        for (const rect of range.getClientRects()) fragments.push({ text: node.textContent, left: rect.left - box.left, right: box.right - rect.right, top: rect.top - box.top, bottom: box.bottom - rect.bottom });
      }
      return fragments;
    }));
    expect(fragments.length).toBeGreaterThanOrEqual(12);
    expect(fragments.every(fragment => fragment.left >= -1 && fragment.right >= -1 && fragment.top >= -1 && fragment.bottom >= -1)).toBe(true);
    await noOverflow(page);
  }
});

test('the visible catalog source action confirms clipboard success and failure without shifting', async ({ page }) => {
  await openStory(page, 'start-here-catalog--all-modules');
  const copy = page.getByRole('button', { name: 'Copy source', exact: true });
  const initial = await copy.boundingBox();
  expect(initial.height).toBeGreaterThanOrEqual(44);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__sourceClipboard = value; } } }));
  await copy.click();
  await expect.poll(() => page.evaluate(() => window.__sourceClipboard)).toContain('ModuleCatalogExample');
  await expect(page.locator('[aria-live="polite"]').filter({ hasText: /^Copied$/ })).toHaveCount(1);
  expect((await copy.boundingBox()).width).toBe(initial.width);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Clipboard denied'); } } }));
  await copy.click();
  await expect(page.locator('[aria-live="polite"]').filter({ hasText: /^Couldn't copy$/ })).toHaveCount(1);
  expect((await copy.boundingBox()).width).toBe(initial.width);
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
  const originalViewport = page.viewportSize();
  await page.setViewportSize({ width: 820, height: 1000 });
  const firstSlide = gallery.locator('[data-slot="carousel-slide"]').first();
  await expect.poll(async () => {
    const artwork = await firstSlide.locator('figure > div').boundingBox();
    const caption = await firstSlide.locator('figcaption').boundingBox();
    return artwork.x + artwork.width - caption.x;
  }, { message: 'tablet artwork stays inside its grid column and clears the caption' }).toBeLessThanOrEqual(1);
  await noOverflow(page);
  await page.setViewportSize(originalViewport);
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

for (const mode of ['light', 'dark']) {
  test(`product personalities change identity while retaining shared component behavior in ${mode} mode`, async ({ page }, testInfo) => {
    test.setTimeout(45_000);
    await openStory(page, 'foundations-tokens--product-personality', `theme:paper;mode:${mode};motion:reduced`);
    const preview = page.getByTestId('product-personality-preview');
    const name = preview.getByRole('textbox', { name: 'Workspace name', exact: true });
    await name.fill('Kith · the next chapter');
    const identities = [];
    for (const personality of ['Editorial', 'Technical', 'Warm']) {
      await page.getByRole('group', { name: 'Product personality', exact: true }).getByRole('button', { name: new RegExp(`^${personality}`) }).click();
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await expect.poll(() => preview.evaluate(element => {
        const color = getComputedStyle(element).color;
        return [...element.querySelectorAll('h3, label, input, a, a svg')].every(child => getComputedStyle(child).color === color);
      }), { message: 'all inherited text settles with the selected product surface' }).toBe(true);
      await expect(name).toHaveValue('Kith · the next chapter');
      identities.push(await preview.evaluate(element => ({ theme: element.dataset.theme, font: getComputedStyle(element.querySelector('h2')).fontFamily, radius: getComputedStyle(element.querySelector('button')).borderRadius, brand: getComputedStyle(element.querySelector('button')).backgroundColor })));
      if (personality === 'Technical') expect(identities.at(-1).font).toContain('Figtree');
      await accessibleStory(page, testInfo, `personality-${personality}-${mode}`);
    }
    expect(new Set(identities.map(item => item.font)).size).toBeGreaterThan(1);
    expect(new Set(identities.map(item => item.radius)).size).toBeGreaterThan(1);
    expect(new Set(identities.map(item => item.brand)).size).toBeGreaterThan(1);
    await name.focus();
    await page.keyboard.press('Enter');
    await expect(preview.getByRole('status')).toHaveText('Saved “Kith · the next chapter” in this example.');
    await page.getByRole('button', { name: /^compact$/i }).click();
    await expect(preview.getByRole('button', { name: 'Reset example', exact: true })).toHaveAttribute('data-variant', 'outline');
    await preview.getByRole('button', { name: 'Reset example', exact: true }).click();
    await expect(name).toHaveValue('Kith · October release');
    await noOverflow(page);
  });
}

for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
test(`the media gallery keeps its caption action level across all slides and breakpoints in ${mode} mode`, async ({ page }) => {
  await openStory(page, 'motion-carousel--in-context', `theme:${theme};mode:${mode};motion:reduced`);
  const gallery = page.getByRole('group', { name: 'Kith moments', exact: true });
  const frame = gallery.locator('[data-slot="carousel-viewport"]');
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    // Browser resize completion can precede responsive style recalculation.
    // Qualify the committed breakpoint before comparing slide positions.
    await expect(gallery.locator('h3').first()).toHaveCSS('font-size', width < 640 ? '24px' : '30px');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await frame.focus();
    await page.keyboard.press('Home');
    const positions = [];
    for (let slide = 0; slide < 4; slide++) {
      await expect(gallery.getByRole('status')).toHaveText(`Slide ${slide + 1} of 4`);
      const link = gallery.getByRole('link', { name: 'Explore Kith', exact: true });
      positions.push(await link.evaluate(element => element.getBoundingClientRect().top - element.closest('[data-slot="carousel-viewport"]').getBoundingClientRect().top));
      if (slide < 3) await page.keyboard.press('ArrowRight');
    }
    expect(Math.max(...positions) - Math.min(...positions), `CTA stays level at${width}px`).toBeLessThanOrEqual(1);
    await noOverflow(page);
  }
});
}

test('the narrow review strip peeks imagery while keeping inactive copy and actions out of view', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await openStory(page, 'start-here-overview--explore', 'theme:paper;mode:light;motion:reduced');
  const gallery = page.getByRole('group', { name: 'Artwork waiting for review', exact: true });
  const slides = gallery.locator('[data-slot="carousel-slide"]');
  await expect(slides.first()).not.toHaveAttribute('aria-hidden');
  await expect(slides.first().locator('[data-review-details]')).toHaveCSS('opacity', '1');
  await expect(slides.nth(1)).toHaveAttribute('inert');
  await expect(slides.nth(1).locator('[data-review-details]')).toHaveCSS('opacity', '0');
  await expect(gallery.getByText('01 / 03', { exact: true })).toBeVisible();
  await gallery.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expect(gallery.getByRole('status').filter({ hasText: 'Slide 2 of 3' })).toBeVisible();
  await expect(slides.nth(1).locator('[data-review-details]')).toHaveCSS('opacity', '1');
  await expect(slides.first().locator('[data-review-details]')).toHaveCSS('opacity', '0');
  await expect(gallery.getByText('02 / 03', { exact: true })).toBeVisible();
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
  const media = gallery.locator('[data-media-state]');
  await expect.poll(() => media.evaluateAll(frames => frames.every(frame => { const r = frame.getBoundingClientRect(); return Math.abs(r.width / r.height - 4 / 3) < .01; }))).toBe(true);
  const spacing = await gallery.evaluate(node => { const first = node.querySelector('figure').getBoundingClientRect(); const footer = node.querySelector('footer').getBoundingClientRect(); return footer.top - first.bottom; });
  expect(spacing).toBeLessThan(32);
  const inspect = gallery.getByRole('button', { name: 'Inspect artwork: Coastal walk', exact: true });
  await expect(inspect).toBeVisible();
  await inspect.click();
  const preview = page.getByRole('dialog', { name: 'Coastal walk', exact: true });
  await expect(preview).toContainText('760 × 507 px');
  await expect.poll(() => preview.getByRole('img').evaluate(image => image.complete && image.naturalWidth === 760 && image.naturalHeight === 507)).toBe(true);
  await expect(preview.getByRole('link', { name: 'View the media source', exact: true })).toHaveAttribute('href', /site\/public\/demo\/kith/);
  await page.keyboard.press('Escape');
  await expect(preview).toHaveCount(0);
  await expect(inspect).toBeFocused();
  await noOverflow(page);
});

test('a carousel follows right to left direction without changing button meaning', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openStory(page, 'motion-carousel--right-to-left');
  const gallery = page.getByRole('group', { name: 'Right to left gallery', exact: true });
  const frame = gallery.locator('[data-slot="carousel-viewport"]');
  const release = await sampleCarouselRelease(page, frame, 1, .2, .7);
  expectSettledRelease(release);
  await expect(gallery.getByRole('status')).toHaveText('Slide 2 of 3');
  await frame.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowLeft');
  await expect(gallery.getByRole('status')).toHaveText('Slide 2 of 3');
  const second = gallery.getByRole('group', { name: '2 of 3', exact: true });
  await expect.poll(async () => Math.abs((await second.boundingBox()).x - (await frame.boundingBox()).x)).toBeLessThan(2);
  await gallery.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expect(gallery.getByRole('status')).toHaveText('Slide 3 of 3');
  await noOverflow(page);
});

async function sampleCarouselRelease(page, frame, targetIndex, from, to, hold = 0) {
  await frame.scrollIntoViewIfNeeded();
  const box = await frame.boundingBox();
  await page.mouse.move(box.x + box.width * from, box.y + 80);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * to, box.y + 80, { steps: 8 });
  if (hold) await page.waitForTimeout(hold); // A deliberate hold removes fling velocity.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await frame.evaluate((element, index) => {
    window.__carouselRelease = null;
    document.addEventListener('pointerup', () => {
      const target = element.querySelectorAll('[data-slot="carousel-slide"]')[index];
      const start = performance.now(), samples = [];
      function sample() {
        samples.push({ ms: performance.now() - start, remaining: target.getBoundingClientRect().left - element.getBoundingClientRect().left });
        if (performance.now() - start < 450) requestAnimationFrame(sample);
        else window.__carouselRelease = samples;
      }
      sample();
    }, { once: true, capture: true });
  }, targetIndex);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => !!window.__carouselRelease)).toBe(true);
  return page.evaluate(() => window.__carouselRelease);
}

function expectSettledRelease(samples) {
  const direction = samples[0].remaining < 0 ? -1 : 1;
  const remaining = samples.map(sample => sample.remaining * direction);
  expect(Math.min(...remaining), 'release never overshoots the selected frame').toBeGreaterThanOrEqual(-1);
  expect(Math.max(...remaining), 'release never rebounds away from the target').toBeLessThanOrEqual(Math.abs(samples[0].remaining) + 1);
  expect(Math.max(...samples.filter(sample => sample.ms >= 300).map(sample => Math.abs(sample.remaining))), 'release settles within300ms').toBeLessThanOrEqual(1);
}

test('swipe release stays continuous, settles without rebound and follows live reduced motion', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openStory(page, 'motion-carousel--in-context');
  const gallery = page.getByRole('group', { name: 'Kith moments', exact: true });
  const frame = gallery.locator('[data-slot="carousel-viewport"]');
  const advance = await sampleCarouselRelease(page, frame, 1, .8, .3);
  expectSettledRelease(advance);
  await expect(gallery.getByRole('status')).toHaveText('Slide 2 of 4');
  const width = (await frame.boundingBox()).width;
  const snapBack = await sampleCarouselRelease(page, frame, 1, .6, .6 - Math.min(30, width * .08) / width, 140);
  expectSettledRelease(snapBack);
  await expect(gallery.getByRole('status')).toHaveText('Slide 2 of 4');
  await expect(frame).toBeFocused();
  await testInfo.attach('carousel-release-trajectories', { body: JSON.stringify({ advance, snapBack }), contentType: 'application/json' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gallery.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expect(gallery.getByRole('status')).toHaveText('Slide 3 of 4');
  const current = gallery.getByRole('group', { name: 'Stories worth keeping.', exact: true });
  await expect.poll(async () => Math.abs((await current.boundingBox()).x - (await frame.boundingBox()).x)).toBeLessThan(2);
  await noOverflow(page);
});

test('a controlled carousel preserves a frozen owner and retargets interrupted navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openStory(page, 'motion-carousel--controlled-selection');
  const gallery = page.getByRole('group', { name: 'Controlled release artwork', exact: true });
  const frame = gallery.locator('[data-slot="carousel-viewport"]');
  await expect(gallery.getByRole('status')).toHaveText('Slide 2 of 3');
  await expect.poll(async () => Math.abs((await gallery.locator('[data-slot="carousel-slide"]').nth(1).boundingBox()).x - (await frame.boundingBox()).x)).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: 'Freeze selection', exact: true }).click();
  const rejected = await sampleCarouselRelease(page, frame, 1, .8, .3);
  expectSettledRelease(rejected);
  await expect(gallery.getByRole('status')).toHaveText('Slide 2 of 3');
  await page.getByRole('button', { name: 'Unlock selection', exact: true }).click();
  await gallery.getByRole('button', { name: 'Go to slide 1', exact: true }).click();
  await gallery.getByRole('button', { name: 'Go to slide 3', exact: true }).click();
  await expect(gallery.getByRole('status')).toHaveText('Slide 3 of 3');
  await page.setViewportSize({ width: page.viewportSize().width === 390 ? 1440 : 390, height: 1000 });
  await expect.poll(async () => Math.abs((await gallery.locator('[data-slot="carousel-slide"]').last().boundingBox()).x - (await frame.boundingBox()).x)).toBeLessThanOrEqual(1);
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


test('readable kanban lanes preserve keyboard movement, cancellation and focus on narrow screens', async ({ page }) => {
  await openStory(page, 'interactions-kanban-board--playground', 'theme:paper;mode:light;motion:reduced');
  const board = page.getByRole('group', { name: 'Example component workflow', exact: true });
  const viewport = page.getByRole('region', { name: 'Example component workflow lanes', exact: true });
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => board.getByRole('button').evaluateAll(buttons => buttons.every(button => {
      const title = button.querySelector('span:last-child');
      return title.scrollWidth <= title.clientWidth + 1 && title.scrollHeight <= title.clientHeight + 1;
    }))).toBe(true);
    await noOverflow(page);
  }
  await page.setViewportSize({ width: 390, height: 1000 });
  await expect(page.getByText('Scroll horizontally to explore all lanes. Arrow keys move between tasks.', { exact: true })).toBeVisible();
  const task = board.getByRole('button', { name: 'Review upstream API', exact: true });
  await task.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  await expect(board.getByRole('list', { name: 'Adapt', exact: true }).getByRole('button', { name: 'Review upstream API', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(board.getByRole('list', { name: 'Verify', exact: true }).getByRole('button', { name: 'Review upstream API', exact: true })).toBeFocused();
  await expect.poll(async () => {
    const view = await viewport.boundingBox();
    const card = await task.boundingBox();
    return card.x >= view.x && card.x + card.width <= view.x + view.width;
  }).toBe(true);
  await page.keyboard.press('Escape');
  await expect(board.getByRole('list', { name: 'Research', exact: true }).getByRole('button', { name: 'Review upstream API', exact: true })).toBeFocused();
  await expect(task).not.toHaveAttribute('aria-pressed', 'true');
  await noOverflow(page);
});

test('an opened navigation menu stays inside the viewport as its anchor resizes', async ({ page }) => {
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    await openStory(page, 'navigation-navigation-menu--playground', `theme:${theme};mode:${mode};motion:reduced`);
    const trigger = page.getByRole('button', { name: 'Explore', exact: true });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowDown');
    const panel = page.locator('[data-slot="navigation-menu-viewport"]');
    await expect(panel).toBeVisible();
    const initialWidth = page.viewportSize().width;
    await expect.poll(async () => {
      const box = await panel.boundingBox();
      return box && box.x >= 15 && box.x + box.width <= initialWidth - 15;
    }).toBe(true);
    await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(initialWidth);
    for (const width of [390, 820, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect.poll(async () => {
        const box = await panel.boundingBox();
        return box && box.x >= 15 && box.x + box.width <= width - 15;
      }).toBe(true);
      await expect(page.getByRole('link', { name: 'Source and installation', exact: true })).toBeVisible();
      await noOverflow(page);
    }
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  }
});

test('context actions open from the keyboard and return focus after dismissal', async ({ page }) => {
  await openStory(page, 'overlays-context-menu--playground');
  const trigger = page.locator('[data-slot="context-menu-trigger"]');
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Shift+F10');
  await expect(page.getByRole('menu')).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Unavailable action', exact: true })).toHaveAttribute('data-disabled', '');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await noOverflow(page);
});

test('reduced motion retains orbit positions and removes delayed hero entrances', async ({ page }) => {
  for (const [preference, motion] of [['reduce', 'user'], ['no-preference', 'reduced']]) {
    await page.emulateMedia({ reducedMotion: preference });
    await openStory(page, 'effects-orbiting-circles--playground', `theme:paper;mode:light;motion:${motion}`);
    const positions = await page.locator('.animate-orbit').evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return { x: Math.round(box.x), y: Math.round(box.y), animation: getComputedStyle(element).animationName };
    }));
    expect(positions).toHaveLength(5);
    expect(new Set(positions.map(point => `${point.x},${point.y}`)).size).toBe(5);
    expect(positions.every(point => point.animation === 'none')).toBe(true);
    await openStory(page, 'blocks-hero--playground', `theme:paper;mode:light;motion:${motion}`);
    expect(await page.locator('.hero-in').evaluateAll(elements => elements.every(element => getComputedStyle(element).animationName === 'none' && ['none', 'blur(0px)'].includes(getComputedStyle(element).filter)))).toBe(true);
    await noOverflow(page);
  }
});

test('morphing popover settles around a stable positioner in normal and reduced motion', async ({ page }) => {
  for (const reduced of [false, true]) {
    await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await openStory(page, 'motion-morphing-popover--in-context', `theme:paper;mode:light;motion:${reduced ? 'reduced' : 'user'}`);
    await page.getByRole('button', { name: 'Share collection', exact: true }).click();
    const panel = page.getByRole('dialog');
    const surface = page.locator('[data-slot="morphing-popover-surface"]');
    await expect(panel).toBeVisible();
    await expect.poll(async () => {
      const outer = await panel.boundingBox();
      const inner = await surface.boundingBox();
      // Radix measures offscreen before placement; two matching unplaced boxes
      // are not a settled popover, particularly with reduced motion.
      const viewport = page.viewportSize();
      if (outer.x < 0 || outer.y < 0 || outer.x + outer.width > viewport.width || outer.y + outer.height > viewport.height) return Infinity;
      return Math.max(Math.abs(outer.x - inner.x), Math.abs(outer.y - inner.y), Math.abs(outer.width - inner.width), Math.abs(outer.height - inner.height));
    }).toBeLessThan(1);
    const bounds = await panel.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize().width);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize().height);
    const samples = await surface.evaluate(element => new Promise(resolve => {
      const start = performance.now(), samples = [];
      function sample() {
        const box = element.getBoundingClientRect();
        samples.push({ x: box.x, y: box.y, width: box.width, height: box.height });
        if (performance.now() - start < 350) requestAnimationFrame(sample); else resolve(samples);
      }
      sample();
    }));
    for (const key of ['x', 'y', 'width', 'height']) expect(Math.max(...samples.map(sample => sample[key])) - Math.min(...samples.map(sample => sample[key]))).toBeLessThan(1);
    await expect(page.getByRole('heading', { name: 'Share collection', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Share collection', exact: true })).toBeFocused();
    await noOverflow(page);
  }
});

test('stacked transport stays compact on phones without losing native media actions', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    for (const layout of ['stacked-video', 'video-cover']) {
      await openStory(page, `molecules-media-media-backdrop--${layout}`, `theme:${theme};mode:${mode};motion:user`);
      const backdrop = page.getByRole('region', { name: 'Live adventure preview', exact: true });
      const play = backdrop.getByRole('button', { name: 'Play background video', exact: true });
      const box = await play.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
      if (layout === 'stacked-video' && page.viewportSize().width < 640) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeLessThanOrEqual(48);
      } else {
        expect(box.width).toBeGreaterThan(80);
      }
      await play.click();
      const video = backdrop.locator('video');
      await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(.15);
      const pause = backdrop.getByRole('button', { name: 'Pause background video', exact: true });
      if (layout === 'stacked-video' && page.viewportSize().width < 640) expect((await pause.boundingBox()).width).toBeCloseTo(box.width, 0);
      await pause.click();
      await expect(video).toHaveJSProperty('paused', true);
      await expect(play).toBeVisible();
      await testInfo.attach(`transport-${theme}-${layout}`, { body: JSON.stringify({ width: box.width, height: box.height, paused: await video.evaluate(element => element.paused), currentTime: await video.evaluate(element => element.currentTime) }), contentType: 'application/json' });
    }
  }
});

test('inline edit exposes its touch affordance and preserves keyboard save and cancel', async ({ page }, testInfo) => {
  await openStory(page, 'interactions-inline-edit--playground', 'theme:paper;mode:light;motion:reduced');
  const button = page.getByRole('button', { name: /^Edit Project name:/ });
  const pencil = button.locator('..').locator('svg').nth(0), saved = button.locator('..').locator('svg').nth(1);
  const opacity = locator => locator.evaluate(element => {
    let opacity = 1;
    for (let node = element; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
    return opacity;
  });
  const noHover = await page.evaluate(() => matchMedia('(hover:none)').matches);
  await expect.poll(() => opacity(pencil)).toBe(noHover ? 1 : 0);
  const initialOpacity = await opacity(pencil);
  if (!noHover) {
    await button.hover();
    await expect.poll(() => opacity(pencil)).toBe(1);
    await page.mouse.move(0, 0);
  }
  const before = await button.boundingBox();
  await button.focus();
  await page.keyboard.press('Enter');
  const editor = page.getByRole('textbox', { name: 'Project name', exact: true });
  await expect(editor).toBeFocused();
  const editing = await editor.boundingBox();
  for (const key of ['width', 'height', 'x', 'y']) expect(Math.abs(editing[key] - before[key])).toBeLessThan(1);
  await editor.fill('Discard this draft');
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await expect(button).toHaveAccessibleName('Edit Project name: Fleet UI library');
  await expect(editor).toHaveCount(0);
  await page.keyboard.press('Enter');
  await editor.fill('A thoughtful library');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Edit Project name: A thoughtful library', exact: true })).toBeFocused();
  await expect.poll(() => opacity(saved)).toBe(1);
  await expect.poll(() => opacity(pencil)).toBe(0);
  await expect.poll(() => opacity(saved)).toBe(0);
  await expect.poll(() => opacity(pencil)).toBe(1);
  await testInfo.attach('inline-edit-affordance', { body: JSON.stringify({ noHover, initialOpacity, before, editing }), contentType: 'application/json' });
  await noOverflow(page);
  await page.goto('/iframe.html?id=interactions-inline-edit--playground&args=multiline:true&globals=theme:paper;mode:light;motion:reduced');
  await page.getByRole('button', { name: /^Edit Project name:/ }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  const multilineButton = page.getByRole('button', { name: /^Edit Project name:/ });
  const initialMultiline = await multilineButton.boundingBox();
  await multilineButton.focus();
  await page.keyboard.press('Enter');
  const textarea = page.getByRole('textbox', { name: 'Project name', exact: true });
  await expect(textarea).toBeFocused();
  await expect(textarea).toHaveJSProperty('tagName', 'TEXTAREA');
  const initialEditor = await textarea.boundingBox();
  for (const key of ['width', 'height', 'x', 'y']) expect(Math.abs(initialEditor[key] - initialMultiline[key])).toBeLessThan(1);
  await textarea.fill('First line\nSecond line\nThird line');
  const grown = await textarea.boundingBox();
  expect(grown.height).toBeGreaterThan(initialEditor.height + 20);
  const mirror = await textarea.locator('..').locator('button').evaluate(element => { const box = element.getBoundingClientRect(); return { width: box.width, height: box.height }; });
  expect(Math.abs(grown.height - mirror.height)).toBeLessThan(1);
  expect(Math.abs(grown.width - mirror.width)).toBeLessThan(1);
  await textarea.fill('First line\n');
  const trailingNewline = await textarea.boundingBox();
  const trailingMirror = await textarea.locator('..').locator('button').evaluate(element => { const box = element.getBoundingClientRect(); return { width: box.width, height: box.height }; });
  expect(trailingNewline.height).toBeGreaterThan(initialEditor.height + 10);
  expect(Math.abs(trailingNewline.height - trailingMirror.height)).toBeLessThan(1);
  expect(Math.abs(trailingNewline.width - trailingMirror.width)).toBeLessThan(1);
  const trailingMetrics = await textarea.evaluate(element => ({ clientHeight: element.clientHeight, scrollHeight: element.scrollHeight }));
  expect(trailingMetrics.scrollHeight).toBeLessThanOrEqual(trailingMetrics.clientHeight + 1);
  await page.keyboard.press('Escape');
  await expect(multilineButton).toHaveAccessibleName('Edit Project name: Fleet UI library');
  await expect(multilineButton).toBeFocused();
  await testInfo.attach('inline-edit-multiline-growth', { body: JSON.stringify({ initialMultiline, initialEditor, grown, mirror, trailingNewline, trailingMirror, trailingMetrics }), contentType: 'application/json' });
  await noOverflow(page);
});

test('enabled radio, switch and visible scrollbar boundaries contrast with their adjacent surfaces', async ({ page }, testInfo) => {
  const contrast = locator => locator.evaluate(element => {
    const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const rgba = color => {
      context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].map((value, index) => index === 3 ? value / 255 : value);
    };
    const over = (top, under) => top.slice(0, 3).map((value, index) => value * top[3] + under[index] * (1 - top[3]));
    const painted = node => {
      const ancestors = [];
      for (let current = node; current; current = current.parentElement) ancestors.unshift(current);
      return ancestors.reduce((under, current) => over(rgba(getComputedStyle(current).backgroundColor), under), [255, 255, 255]);
    };
    const luminance = rgb => rgb.map(value => { const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
    const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const style = getComputedStyle(element), stage = painted(element.parentElement), fill = painted(element), border = over(rgba(style.borderTopColor), fill);
    return { borderStage: ratio(border, stage), borderFill: ratio(border, fill), fillStage: ratio(fill, stage), stage, fill, border, opacity: Number(style.opacity) };
  });
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    await openStory(page, 'inputs-radio-group--playground', `theme:${theme};mode:${mode};motion:reduced`);
    const radio = page.getByRole('radio', { name: 'Daily', exact: true });
    const radioColor = await contrast(radio);
    expect(radioColor.borderStage).toBeGreaterThanOrEqual(3);
    expect(radioColor.borderFill).toBeGreaterThanOrEqual(3);
    await radio.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('radio', { name: 'Weekly', exact: true })).toBeChecked();
    // Native disabled styling remains visibly distinct from the enabled boundary.
    await radio.evaluate(element => { element.disabled = true; });
    await expect(radio).toBeDisabled();
    expect((await contrast(radio)).opacity).toBeLessThan(radioColor.opacity);
    await openStory(page, 'inputs-switch--playground', `theme:${theme};mode:${mode};motion:reduced`);
    const toggle = page.getByRole('switch', { name: 'Respect reduced motion', exact: true });
    const before = await toggle.boundingBox(), thumbBefore = await toggle.locator('[data-slot="switch-thumb"]').boundingBox();
    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(toggle).not.toBeChecked();
    await toggle.evaluate(element => element.blur());
    await toggle.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {}))));
    const switchColor = await contrast(toggle);
    expect(switchColor.borderStage).toBeGreaterThanOrEqual(3);
    const after = await toggle.boundingBox(), thumbAfter = await toggle.locator('[data-slot="switch-thumb"]').boundingBox();
    for (const key of ['width', 'height']) {
      expect(after[key]).toBe(before[key]);
      expect(thumbAfter[key]).toBe(thumbBefore[key]);
    }
    await expect(page.getByRole('switch', { name: 'Unavailable setting', exact: true })).toBeDisabled();
    expect((await contrast(page.getByRole('switch', { name: 'Unavailable setting', exact: true }))).opacity).toBeLessThan(switchColor.opacity);
    await openStory(page, 'navigation-scroll-area--playground', `theme:${theme};mode:${mode};motion:reduced`);
    const viewport = page.locator('[data-slot="scroll-area-viewport"]');
    await viewport.focus();
    await page.keyboard.press('PageDown');
    await expect.poll(() => viewport.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    await page.locator('[data-slot="scroll-area"]').hover();
    const thumb = page.locator('[data-slot="scroll-area-thumb"]');
    await expect(thumb).toBeVisible();
    const scrollbarColor = await contrast(thumb);
    expect(scrollbarColor.fillStage).toBeGreaterThanOrEqual(3);
    await testInfo.attach(`control-contrast-${theme}`, { body: JSON.stringify({ radio: radioColor, switch: switchColor, scrollbar: scrollbarColor }), contentType: 'application/json' });
    await noOverflow(page);
  }
});

test('stacked backdrop artwork stays complete and separate from foreground copy', async ({ page }) => {
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    await openStory(page, 'molecules-media-media-backdrop--image-cover', `theme:${theme};mode:${mode};motion:reduced`);
    const backdrop = page.getByRole('region', { name: 'Kith coastal artwork', exact: true });
    const image = backdrop.locator('img');
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth === 760)).toBe(true);
    const geometry = await image.evaluate(element => {
      const image = element.getBoundingClientRect(), foreground = element.parentElement.querySelector('h1').parentElement.getBoundingClientRect();
      return { width: image.width, height: image.height, gap: foreground.top - image.bottom, fit: getComputedStyle(element).objectFit };
    });
    expect(geometry.gap).toBeGreaterThanOrEqual(-1);
    expect(geometry.height).toBeCloseTo(geometry.width * 507 / 760, 0);
    expect(geometry.fit).toBe('contain');
    await noOverflow(page);
  }
});

test('stacked backdrop intrinsic poster size prevents a jump during a real delayed image request', async ({ page }, testInfo) => {
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route(/coastal-walk-v2\.webp/, async route => { await gate; await route.continue(); });
    await page.goto(`/iframe.html?id=molecules-media-media-backdrop--image-cover&viewMode=story&globals=theme:${theme};mode:${mode};motion:reduced`, { waitUntil: 'domcontentloaded' });
    const backdrop = page.getByRole('region', { name: 'Kith coastal artwork', exact: true });
    const image = backdrop.locator('img');
    try {
      await expect(backdrop.getByRole('heading', { level: 1 })).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await image.evaluate(element => element.complete)).toBe(false);
      // Measure the component's own boundary; font settling in the explorer shell
      // can move the entire section without a poster-induced layout shift.
      const geometry = () => image.evaluate(element => {
        const artwork = element.getBoundingClientRect(), foreground = element.parentElement.querySelector('h1').parentElement.getBoundingClientRect();
        return { image: artwork.height, foreground: foreground.top - artwork.top, artworkTop: artwork.top, scrollY: window.scrollY };
      });
      const before = await geometry();
      expect(before.image).toBeCloseTo((await image.boundingBox()).width * 507 / 760, 0);
      release();
      await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth === 760)).toBe(true);
      const after = await geometry();
      await testInfo.attach(`delayed-poster-${theme}`, { body: JSON.stringify({ before, after }), contentType: 'application/json' });
      expect(Math.abs(after.image - before.image)).toBeLessThan(1);
      expect(Math.abs(after.foreground - before.foreground)).toBeLessThan(1);
    } finally {
      release();
      await page.unroute(/coastal-walk-v2\.webp/);
    }
  }
});

test('stacked background video and controls occupy only artwork and pause when only copy remains', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    await openStory(page, 'molecules-media-media-backdrop--stacked-video', `theme:${theme};mode:${mode};motion:user`);
    const backdrop = page.getByRole('region', { name: 'Live adventure preview', exact: true });
    const image = backdrop.locator('img'), video = backdrop.locator('video');
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth === 1280)).toBe(true);
    const artwork = await image.boundingBox(), movie = await video.boundingBox();
    expect(artwork.height).toBeCloseTo(artwork.width * 720 / 1280, 0);
    for (const key of ['x', 'y', 'width', 'height']) expect(Math.abs(movie[key] - artwork[key])).toBeLessThan(1);
    const play = backdrop.getByRole('button', { name: 'Play background video', exact: true });
    const control = await play.boundingBox();
    expect(control.y).toBeGreaterThanOrEqual(artwork.y);
    expect(control.y + control.height).toBeLessThanOrEqual(artwork.y + artwork.height);
    expect((await backdrop.getByRole('heading', { level: 1 }).boundingBox()).y).toBeGreaterThanOrEqual(artwork.y + artwork.height);
    await play.click();
    await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(.15);
    await expect(backdrop).toHaveAttribute('data-media-backdrop', 'playing');
    await backdrop.getByRole('button', { name: 'Pause background video', exact: true }).focus();
    await page.evaluate(() => { document.body.style.paddingBottom = '120vh'; });
    await image.evaluate(element => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().bottom + 1));
    await expect(backdrop.getByRole('heading', { level: 1 })).toBeInViewport();
    await expect.poll(() => image.evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
    await expect(video).toHaveJSProperty('paused', true);
    await expect(backdrop).toHaveAttribute('data-media-backdrop', 'still');
    // A keyboard activation while the copy remains visible must not restart hidden artwork.
    await video.evaluate(element => { element.dataset.playEvents = '0'; element.addEventListener('play', () => { element.dataset.playEvents = String(Number(element.dataset.playEvents) + 1); }); });
    await page.keyboard.press('Enter');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(video).toHaveJSProperty('paused', true);
    await expect(video).toHaveAttribute('data-play-events', '0');
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(image).toBeInViewport();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(video).toHaveJSProperty('paused', true);
    const pausedTime = await video.evaluate(element => element.currentTime);
    await play.click();
    await expect(video).toHaveJSProperty('paused', false);
    await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(pausedTime + .1);
    await backdrop.getByRole('button', { name: 'Pause background video', exact: true }).click();
    await expect(video).toHaveJSProperty('paused', true);
    await noOverflow(page);
  }
});

test('a decorative video backdrop loads deliberately, pauses offscreen and follows live motion preferences', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const requests = [];
  page.on('request', request => { if (request.url().includes('hobby-horizon.mp4')) requests.push(request.url()); });
  await openStory(page, 'molecules-media-media-backdrop--video-cover', 'theme:paper;mode:light;motion:user');
  const backdrop = page.getByRole('region', { name: 'Live adventure preview', exact: true });
  const video = backdrop.locator('video');
  await expect.poll(() => backdrop.locator('img').evaluate(image => image.complete && image.naturalWidth === 1280)).toBe(true);
  await expect(backdrop).toHaveAttribute('data-media-backdrop', 'still');
  expect(requests).toHaveLength(0);
  await backdrop.getByRole('button', { name: 'Play background video', exact: true }).click();
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0.15);
  await expect(backdrop).toHaveAttribute('data-media-backdrop', 'playing');
  await expect(video).toHaveJSProperty('muted', true);
  await backdrop.getByRole('button', { name: 'Pause background video', exact: true }).click();
  await expect(video).toHaveJSProperty('paused', true);
  await backdrop.getByRole('button', { name: 'Play background video', exact: true }).click();
  await expect(video).toHaveJSProperty('paused', false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(video).toHaveJSProperty('paused', true);
  await expect(backdrop).toHaveAttribute('data-media-backdrop', 'still');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await backdrop.getByRole('button', { name: 'Play background video', exact: true }).click();
  await expect(video).toHaveJSProperty('paused', false);
  await page.evaluate(() => { document.body.style.paddingBottom = '120vh'; window.scrollTo(0, document.body.scrollHeight); });
  await expect(video).toHaveJSProperty('paused', true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(backdrop).toBeInViewport();
  await backdrop.getByRole('button', { name: 'Play background video', exact: true }).click();
  await expect(video).toHaveJSProperty('paused', false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(video).toHaveJSProperty('paused', true);
  await expect(backdrop).toHaveAttribute('data-media-backdrop', 'still');
  await noOverflow(page);
});

test('background controls reconcile delayed media events with actual playback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openStory(page, 'molecules-media-media-backdrop--video-cover', 'theme:paper;mode:light;motion:user');
  const backdrop = page.getByRole('region', { name: 'Live adventure preview', exact: true });
  const video = backdrop.locator('video');
  await backdrop.getByRole('button', { name: 'Play background video', exact: true }).click();
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0.15);
  // A queued event can describe an earlier state; the element owns the current state.
  await video.evaluate(element => element.pause());
  await expect(video).toHaveJSProperty('paused', true);
  await expect(backdrop).toHaveAttribute('data-media-backdrop', 'still');
  await video.evaluate(element => {
    const trigger = element.closest('[data-media-backdrop]').querySelector('button');
    if (trigger.textContent.trim() !== 'Play background video') throw new Error('The visible control must request Play.');
    // Native playback may resume before its queued event updates the rendered control.
    void element.play().catch(() => {});
    trigger.click();
  });
  await expect(video).toHaveJSProperty('paused', false);
  await expect(backdrop).toHaveAttribute('data-media-backdrop', 'playing');
  await backdrop.getByRole('button', { name: 'Pause background video', exact: true }).click();
  await expect(video).toHaveJSProperty('paused', true);
  await expect(backdrop).toHaveAttribute('data-media-backdrop', 'still');
  // A native re-entry resume cannot override an explicit controller pause.
  await video.evaluate(element => element.play().catch(() => {}));
  await expect(video).toHaveJSProperty('paused', true);
  await expect(backdrop).toHaveAttribute('data-media-backdrop', 'still');
  await video.evaluate(async element => {
    element.dispatchEvent(new Event('play', { bubbles: true }));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await expect(backdrop).toHaveAttribute('data-media-backdrop', 'still');
  await backdrop.getByRole('button', { name: 'Play background video', exact: true }).click();
  await expect(video).toHaveJSProperty('paused', false);
  await video.evaluate(async element => {
    element.dispatchEvent(new Event('pause', { bubbles: true }));
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await expect(backdrop).toHaveAttribute('data-media-backdrop', 'playing');
  await backdrop.getByRole('button', { name: 'Pause background video', exact: true }).click();
  await expect(video).toHaveJSProperty('paused', true);
  await expect(backdrop).toHaveAttribute('data-media-backdrop', 'still');
  await backdrop.getByRole('button', { name: 'Play background video', exact: true }).focus();
  await video.evaluate(element => {
    element.dataset.playEvents = '0';
    element.addEventListener('play', () => { element.dataset.playEvents = String(Number(element.dataset.playEvents) + 1); });
  });
  await page.evaluate(() => { document.body.style.paddingBottom = '120vh'; window.scrollTo(0, document.body.scrollHeight); });
  await expect.poll(() => backdrop.evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.keyboard.press('Enter');
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect(video).toHaveJSProperty('paused', true);
  await expect(video).toHaveAttribute('data-play-events', '0');
});

test('background autoplay respects reduced motion and data saving before fetching video', async ({ page }) => {
  const requests = [];
  page.on('request', request => { if (request.url().includes('hobby-horizon.mp4')) requests.push(request.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openStory(page, 'molecules-media-media-backdrop--automatic-video', 'theme:ink;mode:dark;motion:user');
  await expect(page.getByRole('button', { name: 'Play background video', exact: true })).toBeVisible();
  await expect(page.locator('video source')).toHaveCount(0);
  expect(requests).toHaveLength(0);
  await page.addInitScript(() => {
    const connection = new EventTarget();
    connection.saveData = true;
    Object.defineProperty(navigator, 'connection', { value: connection });
  });
  await page.goto('about:blank');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openStory(page, 'molecules-media-media-backdrop--automatic-video', 'theme:ink;mode:dark;motion:user');
  await expect(page.getByRole('button', { name: 'Play background video', exact: true })).toBeVisible();
  await expect(page.locator('video source')).toHaveCount(0);
  expect(requests).toHaveLength(0);
  await noOverflow(page);
});

test('background video failure preserves the artwork and content and can recover', async ({ page }) => {
  await page.route(/hobby-horizon\.mp4/, route => route.abort());
  await openStory(page, 'molecules-media-media-backdrop--video-cover');
  await page.getByRole('button', { name: 'Play background video', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Video unavailable. The artwork stays visible.');
  await expect(page.getByRole('region', { name: 'Live adventure preview', exact: true }).getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-media-backdrop] img')).toBeVisible();
  await page.unroute(/hobby-horizon\.mp4/);
  await page.getByRole('button', { name: 'Retry background video', exact: true }).click();
  await expect.poll(() => page.locator('video').evaluate(element => element.currentTime)).toBeGreaterThan(0.15);
  await expect(page.getByRole('button', { name: 'Pause background video', exact: true })).toBeVisible();
  await noOverflow(page);
});

test('backdrop foreground tokens keep ordinary shared controls readable across product themes', async ({ page }) => {
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark'], ['hearth', 'light']]) {
    await openStory(page, 'molecules-media-media-backdrop--image-cover', `theme:${theme};mode:${mode};motion:reduced`);
    const backdrop = page.getByRole('region', { name: 'Kith coastal artwork', exact: true });
    const colors = await backdrop.locator('[data-slot="button"]').evaluateAll(buttons => buttons.map(button => {
      const style = getComputedStyle(button);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d');
      const luminance = color => {
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const values = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => {
          const channel = value / 255;
          return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        });
        return values[0] * .2126 + values[1] * .7152 + values[2] * .0722;
      };
      const text = luminance(style.color), background = luminance(style.getPropertyValue('--background'));
      return { variant: button.dataset.variant, contrast: (Math.max(text, background) + .05) / (Math.min(text, background) + .05) };
    }));
    expect(colors.map(color => color.variant)).toEqual(['outline', 'ghost']);
    expect(colors.every(color => color.contrast >= 7)).toBe(true);
    await backdrop.locator('[data-variant="outline"]').focus();
    await expect(backdrop.locator('[data-variant="outline"]')).toBeFocused();
    await noOverflow(page);
  }
});

test('tab labels fit inside their indicators with touch-sized controls', async ({ page }) => {
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    await openStory(page, 'navigation-tabs--playground', `theme:${theme};mode:${mode};motion:reduced`);
    const tabs = page.getByRole('tablist');
    for (const width of [390, 820, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const geometry = await tabs.getByRole('tab').evaluateAll(elements => elements.map(element => {
        const box = element.getBoundingClientRect(), range = document.createRange();
        range.selectNodeContents(element);
        const text = range.getBoundingClientRect();
        return { left: text.left - box.left, right: box.right - text.right };
      }));
      expect(geometry.every(box => box.left >= 7 && box.right >= 7)).toBe(true);
      await noOverflow(page);
    }
    await page.getByRole('tab', { name: 'Components', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Tokens', exact: true })).toBeFocused();
    await expect(page.getByRole('tabpanel')).toContainText('Shared color');
  }
});

test('closed avatar stacks leave every fallback initial unobscured', async ({ page }) => {
  for (const motion of ['user', 'reduced']) {
    await openStory(page, 'motion-morphing-popover--in-context', `theme:paper;mode:light;motion:${motion}`);
    const stack = page.getByRole('toolbar', { name: 'Collection collaborators', exact: true });
    const labels = await stack.getByRole('button').evaluateAll(buttons => buttons.map(button => {
      const label = button.querySelector('span[aria-hidden]'), range = document.createRange();
      range.selectNodeContents(label);
      const box = range.getBoundingClientRect();
      return { text: label.textContent, visible: [box.left + .5, box.right - .5].every(x => document.elementFromPoint(x, box.top + box.height / 2)?.closest('button') === button) };
    }));
    expect(labels.map(label => label.text)).toEqual(['MC', 'AP', 'LM']);
    expect(labels.every(label => label.visible)).toBe(true);
    await stack.getByRole('button').first().focus();
    await page.keyboard.press('End');
    await expect(stack.getByRole('button', { name: /Leah Martin/ })).toBeFocused();
    await noOverflow(page);
  }
});

test('collapsed search controls have a visible label or a compact footprint', async ({ page }) => {
  await openStory(page, 'blocks-search-palette--playground');
  const trigger = page.getByRole('button', { name: 'Search components ⌘K', exact: true });
  await expect(trigger.getByText('Search components', { exact: true })).toBeVisible();
  await trigger.focus();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Search', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await openStory(page, 'motion-dynamic-toolbar--playground');
  const search = page.getByRole('button', { name: 'Search components', exact: true });
  const wrapperWidth = await search.evaluate(element => element.closest('[data-slot="dynamic-toolbar"]').getBoundingClientRect().width);
  expect(wrapperWidth).toBeLessThanOrEqual((await search.boundingBox()).width + 32);
  await search.click();
  await expect(page.getByRole('searchbox', { name: 'Search components', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(search).toBeFocused();
  await noOverflow(page);
});

test('expanding search preserves foreground proportions through interruption', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openStory(page, 'motion-dynamic-toolbar--playground', 'theme:paper;mode:light;motion:user');
  const toolbar = page.locator('[data-slot="dynamic-toolbar"]');
  await toolbar.evaluate(element => {
    window.toolbarMotion = { done: false, samples: [] };
    element.addEventListener('click', () => {
      const start = performance.now();
      const frame = () => {
        const svg = element.querySelector('button svg'), input = element.querySelector('input');
        window.toolbarMotion.samples.push({
          icon: svg.getBoundingClientRect().width,
          width: element.getBoundingClientRect().width,
          inputScale: input ? input.getBoundingClientRect().width / parseFloat(getComputedStyle(input).width) : 1,
        });
        if (performance.now() - start < 650) requestAnimationFrame(frame);
        else window.toolbarMotion.done = true;
      };
      requestAnimationFrame(frame);
    }, { once: true });
  });
  await page.getByRole('button', { name: 'Search components', exact: true }).click();
  // Reverse the live surface projection, then reopen before it settles.
  await page.waitForTimeout(90);
  await page.getByRole('searchbox', { name: 'Search components', exact: true }).press('Escape');
  await page.waitForTimeout(50);
  await page.getByRole('button', { name: 'Search components', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.toolbarMotion.done)).toBe(true);
  const samples = await page.evaluate(() => window.toolbarMotion.samples);
  expect(samples.length).toBeGreaterThan(5);
  expect(samples.every(sample => sample.icon >= 15.5 && sample.icon <= 16.5)).toBe(true);
  expect(samples.every(sample => sample.inputScale >= .98 && sample.inputScale <= 1.02)).toBe(true);
  expect(Math.max(...samples.map(sample => sample.width)) - Math.min(...samples.map(sample => sample.width))).toBeGreaterThan(50);
  await expect(page.getByRole('searchbox', { name: 'Search components', exact: true })).toBeFocused();
  await noOverflow(page);
});

test('ruled feature grids retain the section surface in incomplete rows', async ({ page }) => {
  test.setTimeout(45000);
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1200 });
    for (const columns of [2, 3, 4]) {
      await page.goto(`/iframe.html?id=blocks-features--playground&args=columns:${columns};count:5&globals=theme:paper;mode:light;motion:reduced`);
      const grid = page.getByRole('list');
      await expect(grid.getByRole('listitem')).toHaveCount(5);
      const cells = await grid.getByRole('listitem').evaluateAll(elements => elements.map(element => ({
        top: parseFloat(getComputedStyle(element).borderTopWidth),
        left: parseFloat(getComputedStyle(element).borderLeftWidth),
      })));
      const actualColumns = width < 640 ? 1 : width < 1024 ? 2 : columns;
      expect(cells).toEqual(cells.map((_, index) => ({ top: index >= actualColumns ? 1 : 0, left: index % actualColumns ? 1 : 0 })));
      // An absent cell must show the surrounding section, not a border-colored block.
      await expect(grid).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await noOverflow(page);
    }
  }
});

test('image comparison exposes a visible handle that follows native input', async ({ page }) => {
  await openStory(page, 'motion-image-comparison--in-context');
  const slider = page.getByRole('slider', { name: 'Compare images', exact: true });
  const handle = page.locator('[data-slot="comparison-handle"]');
  await expect(handle).toBeVisible();
  const handleBox = await handle.boundingBox();
  expect(handleBox.width).toBeGreaterThanOrEqual(36);
  expect(handleBox.height).toBeGreaterThanOrEqual(36);
  for (const [key, value] of [['Home', 0], ['ArrowRight', 1], ['End', 100], ['ArrowLeft', 99]]) {
    await slider.press(key);
    await expect(slider).toHaveValue(String(value));
    await expect.poll(async () => {
      const track = await slider.boundingBox(), grip = await handle.boundingBox();
      return Math.abs(grip.x + grip.width / 2 - track.x - track.width * value / 100);
    }).toBeLessThan(1.5);
  }
  const track = await slider.boundingBox();
  await page.mouse.move(track.x + track.width / 2, track.y + track.height / 2);
  await page.mouse.down();
  await page.mouse.move(track.x + track.width * .75, track.y + track.height / 2, { steps: 4 });
  await page.mouse.up();
  const value = Number(await slider.inputValue());
  expect(value).toBeGreaterThan(70);
  expect(value).toBeLessThan(80);
  await noOverflow(page);
});

test('kanban pointer overlays cross lane clips and follow unequal scroll offsets', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await openStory(page, 'interactions-kanban-board--scrollable-lanes', 'theme:paper;mode:light;motion:reduced');
  const board = page.getByRole('group', { name: 'Scrollable workflow', exact: true });
  const queue = board.getByRole('list', { name: 'Queue', exact: true });
  const active = board.getByRole('list', { name: 'Active', exact: true });
  const card = board.getByRole('button', { name: 'Move between scrolled lanes', exact: true });
  const overlay = board.locator('[data-kanban-overlay="moving"]');
  await expect.poll(() => board.evaluate(node => ({ height: node.clientHeight, gap: getComputedStyle(node).gap }))).toEqual({ height: 520, gap: '24px' });
  const initialOrder = await board.getByRole('list').evaluateAll(lists => lists.map(list => [...list.querySelectorAll('button')].map(button => button.textContent.trim())));
  await queue.evaluate(list => { list.scrollTop = 72; });
  await expect.poll(() => queue.evaluate(list => list.scrollTop)).toBe(72);
  const source = await card.boundingBox();
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  // Before the lane threshold, the moving body's left edge crosses its lane.
  await page.mouse.move(source.x + source.width / 2 - 40, source.y + source.height / 2);
  await expect(overlay).toBeVisible();
  expect(await overlay.evaluate(node => {
    const bounds = node.getBoundingClientRect();
    return !node.closest('ul') && node.contains(document.elementFromPoint(bounds.left + 2, bounds.top + bounds.height / 2));
  })).toBe(true);
  await expect(card).toHaveCount(1);
  const target = await queue.boundingBox();
  const x = target.x + target.width / 2;
  const y = target.y + 32;
  await page.mouse.move(x, y, { steps: 6 });
  await expect.poll(() => queue.getByRole('button').allTextContents()).toEqual([
    'Queued task 1', 'Move between scrolled lanes', 'Queued task 2', 'Queued task 3',
    'Queued task 4', 'Queued task 5', 'Queued task 6', 'Queued task 7', 'Queued task 8',
  ]);
  await expect.poll(() => overlay.evaluate((node, point) => {
    const box = node.getBoundingClientRect();
    return Math.max(Math.abs(box.top + box.height / 2 - point.y), Math.abs(box.left + box.width / 2 - point.x));
  }, { x, y })).toBeLessThan(1);
  const beforeScroll = await overlay.boundingBox();
  await queue.evaluate(list => { list.scrollTop = 0; });
  await expect.poll(async () => {
    const box = await overlay.boundingBox();
    return Math.abs(box.x - beforeScroll.x) <= 2 && Math.abs(box.y - beforeScroll.y) <= 2;
  }).toBe(true);
  await expect(queue.getByRole('button').first()).toHaveText('Move between scrolled lanes');
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(overlay).toHaveCount(0);
  await expect(card).toBeFocused();
  await expect.poll(() => board.getByRole('list').evaluateAll(lists => lists.map(list => [...list.querySelectorAll('button')].map(button => button.textContent.trim())))).toEqual(initialOrder);
  // A committed drop uses the same scrolled insertion position.
  await queue.evaluate(list => { list.scrollTop = 72; });
  const again = await card.boundingBox();
  await page.mouse.move(again.x + again.width / 2, again.y + again.height / 2);
  await page.mouse.down();
  await page.mouse.move(x, y, { steps: 6 });
  await page.mouse.up();
  await expect(queue.getByRole('button').nth(1)).toHaveText('Move between scrolled lanes');
  await expect(active.getByRole('button')).toHaveCount(0);
  await expect(overlay).toHaveCount(0);
  await expect(card).toBeFocused();
  await noOverflow(page);
});

test('kanban keyboard moves reveal below-fold cards and preserve grid overrides on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await openStory(page, 'interactions-kanban-board--scrollable-lanes', 'theme:paper;mode:light;motion:reduced');
  const board = page.getByRole('group', { name: 'Scrollable workflow', exact: true });
  const queue = board.getByRole('list', { name: 'Queue', exact: true });
  const card = queue.getByRole('button', { name: 'Queued task 1', exact: true });
  await card.focus();
  await page.keyboard.press('Space');
  for (let i = 0; i < 7; i++) await page.keyboard.press('ArrowDown');
  await expect(queue.getByRole('button').last()).toHaveText('Queued task 1');
  await expect(card).toBeFocused();
  await expect.poll(() => card.evaluate(button => {
    const card = button.closest('li').getBoundingClientRect();
    const lane = button.closest('ul').getBoundingClientRect();
    return card.top >= lane.top - 1 && card.bottom <= lane.bottom + 1;
  })).toBe(true);
  await page.keyboard.press('Escape');
  await expect(queue.getByRole('button').first()).toHaveText('Queued task 1');
  await expect(card).toBeFocused();
  await expect.poll(() => queue.evaluate(list => list.scrollTop)).toBe(0);
  await noOverflow(page);
});

test('kanban ignores another pointer and cancels the active pointer without losing cards', async ({ page }) => {
  await openStory(page, 'interactions-kanban-board--scrollable-lanes', 'theme:paper;mode:light;motion:reduced');
  const board = page.getByRole('group', { name: 'Scrollable workflow', exact: true });
  const card = board.getByRole('button', { name: 'Move between scrolled lanes', exact: true });
  const original = await board.getByRole('list').evaluateAll(lists => lists.map(list => list.textContent));
  const bounds = await card.boundingBox();
  const point = { clientX: bounds.x + bounds.width / 2, clientY: bounds.y + bounds.height / 2, pointerType: 'touch', bubbles: true };
  await card.locator('[data-kanban-drag-handle]').dispatchEvent('pointerdown', { ...point, pointerId: 41, button: 0 });
  const send = (type, fields) => page.evaluate(({ type, fields }) => window.dispatchEvent(new PointerEvent(type, fields)), { type, fields });
  await send('pointermove', { ...point, pointerId: 41, clientX: point.clientX - 35 });
  const overlay = board.locator('[data-kanban-overlay="moving"]');
  await expect(overlay).toBeVisible();
  const heldBox = await overlay.boundingBox();
  await send('pointermove', { ...point, pointerId: 42, clientX: point.clientX + 200 });
  await send('pointerup', { ...point, pointerId: 42 });
  await expect(overlay).toBeVisible();
  const afterOtherPointer = await overlay.boundingBox();
  expect(Math.abs(afterOtherPointer.x - heldBox.x)).toBeLessThanOrEqual(1);
  await send('pointercancel', { ...point, pointerId: 41 });
  await expect(overlay).toHaveCount(0);
  await expect.poll(() => board.getByRole('list').evaluateAll(lists => lists.map(list => list.textContent))).toEqual(original);
  await expect(card).toBeFocused();
  await expect(board.getByRole('button')).toHaveCount(10);
});

test('kanban keeps a held card under a stationary pointer when its horizontal viewport scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await openStory(page, 'interactions-kanban-board--scrollable-lanes', 'theme:paper;mode:light;motion:reduced');
  const board = page.getByRole('group', { name: 'Scrollable workflow', exact: true });
  const viewport = page.getByRole('region', { name: 'Scrollable workflow lanes', exact: true });
  const card = board.getByRole('button', { name: 'Move between scrolled lanes', exact: true });
  await card.focus();
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 20, box.y + box.height / 2);
  const overlay = board.locator('[data-kanban-overlay="moving"]');
  await expect(overlay).toBeVisible();
  const before = await overlay.boundingBox();
  const scrollBefore = await viewport.evaluate(node => node.scrollLeft);
  await viewport.evaluate(node => { node.scrollLeft += 30; });
  await expect.poll(() => viewport.evaluate(node => node.scrollLeft)).toBeGreaterThan(scrollBefore + 20);
  await expect.poll(async () => {
    const after = await overlay.boundingBox();
    return Math.abs(after.x - before.x) <= 2 && Math.abs(after.y - before.y) <= 2;
  }).toBe(true);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(overlay).toHaveCount(0);
  await expect(card).toBeFocused();
  await noOverflow(page);
});

test('kanban returning overlay can be picked up before it settles', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openStory(page, 'interactions-kanban-board--playground', 'theme:paper;mode:light;motion:user');
  const board = page.getByRole('group', { name: 'Example component workflow', exact: true });
  const card = board.getByRole('button', { name: 'Review upstream API', exact: true });
  await board.evaluate(node => node.addEventListener('pointerdown', event => { window.kanbanTestPointerId = event.pointerId; }, { once: true }));
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 55, box.y + box.height / 2 + 100, { steps: 6 });
  await page.mouse.up();
  const overlay = board.locator('[data-kanban-overlay="a"]');
  await expect(overlay).toBeVisible();
  // Hit and press in the same browser task: a spring can move between protocol calls.
  const returning = await overlay.evaluate(node => {
    const bounds = node.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2, y = bounds.top + bounds.height / 2;
    const target = document.elementFromPoint(x, y);
    if (!node.contains(target)) throw new Error('Returning card is clipped at its center');
    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: window.kanbanTestPointerId, pointerType: 'mouse', button: 0, buttons: 1, clientX: x, clientY: y }));
    return { x, y };
  });
  const pressed = await overlay.boundingBox();
  await page.mouse.move(returning.x + 8, returning.y);
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  const lifted = await overlay.boundingBox();
  expect(Math.abs(lifted.x - pressed.x - 8)).toBeLessThan(8);
  expect(Math.abs(lifted.y - pressed.y)).toBeLessThan(8);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(overlay).toHaveCount(0);
  await expect(card).toBeFocused();
  await expect(board.getByRole('button')).toHaveCount(4);
  await expect(card).toHaveCount(1);
});

test('product artwork examples keep selection, source metadata and recovery usable', async ({ page }) => {
  await openStory(page, 'blocks-record-detail--in-context');
  const row = page.getByRole('button', { name: 'Inspect Keep the small things', exact: true });
  await row.click();
  const detail = page.viewportSize().width >= 1024
    ? page.getByRole('complementary', { name: 'Record detail', exact: true })
    : page.getByRole('dialog');
  await expect(detail.getByRole('heading', { name: 'Keep the small things', exact: true })).toBeVisible();
  await expect(detail).toContainText('1536 × 1024 px');
  const art = detail.getByRole('img', { name: 'Kith memory book with a photograph and coffee', exact: true });
  await expect.poll(() => art.evaluate(image => image.complete && image.naturalWidth === 1536 && image.naturalHeight === 1024)).toBe(true);
  await expect(detail.getByRole('link', { name: 'github.com', exact: true })).toHaveAttribute('href', /site\/public\/demo\/kith/);
  await page.keyboard.press('Escape');
  await expect(detail).toHaveCount(0);
  await expect(row).toBeFocused();
  const boundary = page.locator('[data-slot="resource-boundary"]');
  const readyHeight = (await boundary.boundingBox()).height;
  const keepsGeometry = async () => expect.poll(async () => Math.abs((await boundary.boundingBox()).height - readyHeight)).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: 'Error', exact: true }).click();
  await expect(page.getByText('Artwork could not load', { exact: true })).toBeVisible();
  await keepsGeometry();
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(row).toBeVisible();
  await page.getByRole('button', { name: 'Empty', exact: true }).click();
  await expect(row).toHaveCount(0);
  await keepsGeometry();
  await page.getByRole('button', { name: 'Restore example artwork', exact: true }).click();
  await expect(row).toBeVisible();
  await page.getByRole('button', { name: 'Loading', exact: true }).click();
  await expect(page.getByLabel('Loading release artwork', { exact: true })).toBeVisible();
  await keepsGeometry();
  await page.getByRole('button', { name: 'Ready', exact: true }).click();
  await expect(row).toBeVisible();
  await keepsGeometry();
  await noOverflow(page);
  await openStory(page, 'blocks-resource-boundary--playground');
  const selected = async name => {
    const active = page.getByRole('button', { name, exact: true });
    await expect(active).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('button[aria-pressed="true"]')).toHaveCount(1);
    const inactive = page.locator('button[aria-pressed="false"]').first();
    expect(await active.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(await inactive.evaluate(element => getComputedStyle(element).backgroundColor));
  };
  await selected('Success');
  await page.getByRole('button', { name: 'Loading', exact: true }).click();
  await selected('Loading');
  await expect(page.getByText('Loading component list…', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Empty', exact: true }).click();
  await selected('Empty');
  await expect(page.getByRole('heading', { name: 'Nothing here yet', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Error', exact: true }).click();
  await selected('Error');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await selected('Success');
  await expect(page.locator('[data-slot="resource-boundary"]')).toContainText('Button');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await noOverflow(page);
});

test('quote attribution separators stay with adjacent words on phones', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    await openStory(page, 'blocks-quote-list--playground', `theme:${theme};mode:${mode};motion:reduced`);
    const list = page.getByRole('list', { name: 'CodeVetter documentation excerpts', exact: true });
    const geometry = await list.locator('li > p:last-child').evaluateAll(metas => {
      const characters = element => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT), rects = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) for (let index = 0; index < node.textContent.length; index++) {
          if (/\s/.test(node.textContent[index])) continue;
          const range = document.createRange(); range.setStart(node, index); range.setEnd(node, index + 1);
          const rect = range.getBoundingClientRect();
          if (rect.width > 1 && rect.height > 5) rects.push(rect);
        }
        return rects;
      };
      return metas.flatMap(meta => [...meta.querySelectorAll('span[aria-hidden]')].filter(span => span.textContent.includes('·')).map(separator => {
        const range = document.createRange(), index = separator.firstChild.textContent.indexOf('·');
        range.setStart(separator.firstChild, index); range.setEnd(separator.firstChild, index + 1);
        const dot = range.getBoundingClientRect(), previous = characters(separator.previousElementSibling).at(-1), next = characters(separator.nextElementSibling)[0];
        const center = rect => rect.top + rect.height / 2;
        return { previous: Math.abs(center(dot) - center(previous)), next: Math.abs(center(dot) - center(next)) };
      }));
    });
    expect(geometry.length).toBeGreaterThan(0);
    expect(geometry.every(dot => dot.previous < 3 && dot.next < 3)).toBe(true);
    const links = list.getByRole('link');
    await links.first().focus();
    await expect(links.first()).toBeFocused();
    // Safari uses Option-Tab to include links in native keyboard navigation.
    await page.keyboard.press(testInfo.project.name.startsWith('webkit') ? 'Alt+Tab' : 'Tab');
    await expect(links.nth(1)).toBeFocused();
    await testInfo.attach(`quote-separator-lines-${theme}`, { body: JSON.stringify(geometry), contentType: 'application/json' });
    await noOverflow(page);
  }
});

test('selected product notes retain their exact source and custom popover paint is exposed', async ({ page }) => {
  await openStory(page, 'blocks-quote-list--in-context');
  const notes = page.getByRole('list', { name: 'CodeVetter product notes', exact: true });
  await notes.getByRole('button').nth(1).click();
  const selected = page.viewportSize().width >= 1024
    ? page.getByRole('complementary', { name: 'Record detail', exact: true })
    : page.getByRole('dialog');
  await expect(selected).toContainText('The product should prefer narrow, evidence-backed loops over broad "code intelligence" surfaces.');
  await expect(selected.getByRole('link', { name: 'Read the original text', exact: true })).toHaveAttribute('href', /efb6744aaf0a229f6e0d24aac61bffaad636477e\/README.md#product-direction$/);
  await page.keyboard.press('Escape');
  await expect(notes.getByRole('button').nth(1)).toBeFocused();
  await noOverflow(page);
  await openStory(page, 'motion-morphing-popover--playground');
  const trigger = page.getByRole('button', { name: 'Library details', exact: true });
  const paint = page.locator('[data-slot="morphing-popover-trigger-surface"]');
  await expect(paint).toHaveClass(/bg-primary/);
  expect(await paint.evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('[data-slot="morphing-popover-surface"]')).toHaveClass(/shadow-sm/);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await noOverflow(page);
});

test('kanban touch pans the lane from card bodies and drags only from its handle', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Trusted touch dispatch uses the Chromium DevTools protocol.');
  await page.setViewportSize({ width: 820, height: 1000 });
  await openStory(page, 'interactions-kanban-board--scrollable-lanes', 'theme:paper;mode:light;motion:reduced');
  const queue = page.getByRole('list', { name: 'Queue', exact: true });
  const active = page.getByRole('list', { name: 'Active', exact: true });
  const original = await queue.getByRole('button').allTextContents();
  const box = await queue.boundingBox();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const gesture = async (from, to) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 1 }] });
    for (let i = 1; i <= 8; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / 8, y: from.y + (to.y - from.y) * i / 8, id: 1 }] });
      await page.waitForTimeout(20);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  const start = { x: box.x + box.width / 4, y: box.y + 180 };
  await gesture(start, { x: start.x, y: start.y - 120 });
  await expect.poll(() => queue.evaluate(list => list.scrollTop)).toBeGreaterThan(40);
  await expect(queue.getByRole('button')).toHaveText(original);
  await expect(page.locator('[data-kanban-overlay]')).toHaveCount(0);
  const viewport = page.getByRole('region', { name: 'Scrollable workflow lanes', exact: true });
  const scrollBefore = await viewport.evaluate(node => node.scrollLeft);
  const sideways = { x: box.x + box.width / 4, y: box.y + 180 };
  await gesture(sideways, { x: sideways.x - 80, y: sideways.y });
  await expect.poll(() => viewport.evaluate(node => node.scrollLeft)).toBeGreaterThan(scrollBefore + 20);
  await expect(queue.getByRole('button')).toHaveText(original);
  const visible = await queue.getByRole('button').evaluateAll(buttons => {
    const lane = buttons[0].closest('ul').getBoundingClientRect();
    return buttons.find(button => { const r = button.getBoundingClientRect(); return r.top >= lane.top + 2 && r.bottom <= lane.bottom - 2; }).textContent.trim();
  });
  const handle = queue.getByRole('button', { name: visible, exact: true }).locator('[data-kanban-drag-handle]');
  const grip = await handle.boundingBox(), destination = await active.boundingBox();
  await gesture({ x: grip.x + grip.width / 2, y: grip.y + grip.height / 2 }, { x: destination.x + destination.width / 2, y: destination.y + 32 });
  await expect(active.getByRole('button', { name: visible, exact: true })).toHaveCount(1);
  await expect(page.locator('[data-kanban-overlay]')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Scrollable workflow', exact: true }).getByRole('button')).toHaveCount(10);
  await cdp.detach();
});

test('kanban responsive geometry gives ordinary titles room and honors consumer column templates', async ({ page }) => {
  await openStory(page, 'interactions-kanban-board--in-context');
  const board = page.getByRole('group', { name: 'Kith release board', exact: true });
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1100 });
    const titles = await board.getByRole('button').evaluateAll(buttons => buttons.map(button => {
      const text = button.querySelector('span.line-clamp-2');
      return { label: text.textContent, fullHeight: text.scrollHeight, visibleHeight: text.clientHeight };
    }));
    expect(titles).toHaveLength(7);
    expect(titles.every(title => title.fullHeight <= title.visibleHeight + 1)).toBe(true);
    if (width === 820) {
      await expect.poll(() => board.evaluate(node => node.parentElement.scrollWidth - node.parentElement.clientWidth)).toBeLessThanOrEqual(1);
    }
    if (width === 1440) {
      const widths = await board.evaluate(node => ({ board: node.clientWidth, container: node.parentElement.clientWidth }));
      expect(widths.board).toBeGreaterThan(widths.container - 12);
    }
    await noOverflow(page);
  }
  await page.goto('/iframe.html?id=interactions-kanban-board--scrollable-lanes&args=wideFirst:true&globals=theme:paper;mode:light;motion:reduced');
  const custom = page.getByRole('group', { name: 'Scrollable workflow', exact: true });
  await expect.poll(() => custom.evaluate(node => {
    const tracks = getComputedStyle(node).gridTemplateColumns.split(' ').map(parseFloat);
    return tracks.length === 3 && Math.abs(tracks[0] / tracks[1] - 2) < .02 && Math.abs(tracks[1] - tracks[2]) < 1;
  })).toBe(true);
});

test('kanban cleans up a card removed by its controlled parent during a drag', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 });
  await openStory(page, 'interactions-kanban-board--scrollable-lanes');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const card = page.getByRole('button', { name: 'Move between scrolled lanes', exact: true });
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 25, box.y + box.height / 2);
  await expect(page.locator('[data-kanban-overlay="moving"]')).toBeVisible();
  // A controlled parent update can arrive independently of the held pointer.
  await page.getByRole('button', { name: 'Remove active task', exact: true }).dispatchEvent('click');
  await expect(card).toHaveCount(0);
  await expect(page.locator('[data-kanban-overlay]')).toHaveCount(0);
  await page.mouse.up();
  await page.getByRole('button', { name: 'Restore example', exact: true }).click();
  await expect(card).toBeVisible();
  await expect(card).toHaveCSS('opacity', '1');
  await card.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect(card).toBeFocused();
  await expect(page.getByRole('list', { name: 'Done', exact: true }).getByRole('button')).toHaveCount(2);
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Remove active task', exact: true }).dispatchEvent('click');
  await expect(card).toHaveCount(0);
  await page.getByRole('button', { name: 'Restore example', exact: true }).click();
  await expect(card).toBeVisible();
  await expect.poll(() => card.evaluate(button => {
    const body = button.getBoundingClientRect(), slot = button.closest('li').getBoundingClientRect();
    return Math.abs(body.width - slot.width) + Math.abs(body.height - slot.height);
  })).toBeLessThan(.5);
  expect(errors).toEqual([]);
  await noOverflow(page);
});

test('artwork detail keeps its title and image throughout the phone exit animation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openStory(page, 'blocks-record-detail--in-context', 'theme:paper;mode:light;motion:user');
  await page.getByRole('button', { name: 'Inspect Keep the small things', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Keep the small things', exact: true });
  await expect(dialog).toBeVisible();
  await dialog.evaluate(node => {
    window.artworkExit = { done: false, samples: [] };
    const frame = () => {
      if (!node.isConnected) { window.artworkExit.done = true; return; }
      if (node.dataset.state === 'closed') window.artworkExit.samples.push({ title: node.querySelector('h2')?.textContent, image: !!node.querySelector('img') });
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => window.artworkExit.done)).toBe(true);
  const samples = await page.evaluate(() => window.artworkExit.samples);
  expect(samples.length).toBeGreaterThan(0);
  expect(samples.every(sample => sample.title === 'Keep the small things' && sample.image)).toBe(true);
  await expect(page.getByRole('button', { name: 'Inspect Keep the small things', exact: true })).toBeFocused();
});

test('detail examples keep initial focus and do not open a phone modal on breakpoint changes', async ({ page }) => {
  for (const [story, rowName, listName] of [
    ['blocks-record-detail--in-context', 'Inspect Keep the small things', null],
    ['blocks-quote-list--in-context', null, 'CodeVetter product notes'],
  ]) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openStory(page, story);
    await expect(page.getByRole('complementary', { name: 'Record detail', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await page.evaluate(() => {
      window.unrequestedSheets = [];
      window.resizeSheetObserver = new MutationObserver(() => {
        if (document.querySelector('[data-slot="sheet-content"][data-state="open"]')) window.unrequestedSheets.push(performance.now());
      });
      window.resizeSheetObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-state'] });
    });
    await page.setViewportSize({ width: 390, height: 1000 });
    await expect(page.getByRole('complementary', { name: 'Record detail', exact: true })).toHaveCount(0);
    await expect(page.locator('[data-slot="sheet-content"]')).toHaveCount(0);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const unrequested = await page.evaluate(() => { window.resizeSheetObserver.disconnect(); return window.unrequestedSheets; });
    expect(unrequested).toEqual([]);
    const row = rowName ? page.getByRole('button', { name: rowName, exact: true }) : page.getByRole('list', { name: listName, exact: true }).getByRole('button').nth(1);
    await row.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-slot="sheet-content"]')).toHaveCount(0);
    await expect(row).toBeFocused();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await expect(page.getByRole('complementary', { name: 'Record detail', exact: true })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 1000 });
    await expect(page.locator('[data-slot="sheet-content"]')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test('phone detail close controls stay visible and hit-test above sticky headers', async ({ page }) => {
  for (const [width, height] of [[390, 1000], [820, 1000], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await openStory(page, 'blocks-record-detail--in-context');
    const row = page.getByRole('button', { name: 'Inspect Keep the small things', exact: true });
    await row.click();
    const dialog = page.getByRole('dialog', { name: 'Keep the small things', exact: true });
    const close = dialog.getByRole('button', { name: 'Close', exact: true });
    await expect(close).toBeVisible();
    const closeIsTopmost = () => close.evaluate(button => { const r = button.getBoundingClientRect(); return button.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); });
    await expect.poll(closeIsTopmost).toBe(true);
    await dialog.evaluate(node => { node.scrollTop = node.scrollHeight; });
    await expect.poll(closeIsTopmost).toBe(true);
    if (height < 500) {
      expect(await dialog.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
      await close.focus();
      await page.keyboard.press('Enter');
    } else await close.click();
    await expect(page.locator('[data-slot="sheet-content"]')).toHaveCount(0);
    await expect(row).toBeFocused();
    await noOverflow(page);
  }
});


test('overflowing kanban retains a visible unmasked keyboard focus ring', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await openStory(page, 'interactions-kanban-board--in-context');
  const lanes = page.getByRole('region', { name: 'Kith release board lanes', exact: true });
  await expect(lanes).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('Tab');
  await lanes.focus();
  await expect(lanes).toBeFocused();
  expect(await lanes.evaluate(node => node.matches(':focus-visible'))).toBe(true);
  await expect(lanes).toHaveCSS('mask-image', 'none');
  expect(await lanes.evaluate(node => getComputedStyle(node).boxShadow)).not.toBe('none');
});

test('artwork state recovery keeps focus on the deliberate state action', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openStory(page, 'blocks-record-detail--in-context');
  await page.getByRole('button', { name: 'Inspect Keep the small things', exact: true }).click();
  await expect(page.getByRole('complementary', { name: 'Record detail', exact: true }).getByRole('heading', { name: 'Keep the small things', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Error', exact: true }).click();
  const ready = page.getByRole('button', { name: 'Ready', exact: true });
  await ready.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('complementary', { name: 'Record detail', exact: true })).toBeVisible();
  await expect(ready).toBeFocused();
});


test('pricing thresholds and discount explanations stay readable in narrow components', async ({ page }) => {
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1100 });
    await openStory(page, 'data-pricing-calculator--in-context');
    const thresholds = page.getByRole('list', { name: 'Plan thresholds', exact: true });
    await expect(thresholds.getByRole('listitem')).toHaveText(['Growing studio · from 5 seats', 'Together at scale · from 12 seats']);
    const boxes = await thresholds.getByRole('listitem').evaluateAll(items => items.map(item => { const r = item.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: item.scrollWidth, client: item.clientWidth }; }));
    expect(boxes.every(box => box.width <= box.client + 1)).toBe(true);
    expect(boxes[0].right <= boxes[1].left + 1 || boxes[0].bottom <= boxes[1].top + 1).toBe(true);
    const slider = page.getByRole('slider', { name: 'Seats', exact: true });
    await slider.focus();
    await page.keyboard.press('Home');
    for (let seat = 1; seat < 12; seat++) await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuetext', '12 seats');
    const invoice = page.locator('dl');
    await expect(invoice.getByText(/Yearly billing/)).toHaveCount(0);
    await expect(invoice.getByText('Together at scale rate, $4.00 off a seat', { exact: true })).toBeVisible();
    await expect.poll(() => invoice.locator('dt').evaluateAll(labels => labels.every(label => label.scrollWidth <= label.clientWidth + 1 && label.scrollHeight <= label.clientHeight + 1))).toBe(true);
    await expect(invoice).toContainText('$96.00');
    await page.getByRole('radio', { name: /Yearly/ }).click();
    await expect(invoice.getByText('Yearly billing, 20% off', { exact: true })).toBeVisible();
    await expect(invoice).toContainText('$76.80');
    await expect(invoice).toContainText('Billed $922 a year');
    await noOverflow(page);
  }
});


test('a contextual shimmer action opens its artwork and preserves an intrinsic button width', async ({ page }) => {
  await openStory(page, 'effects-shimmer-button--in-context');
  const trigger = page.getByRole('button', { name: 'Explore this artwork', exact: true });
  expect((await trigger.boundingBox()).width).toBeLessThan(300);
  await trigger.click();
  const detail = page.getByRole('dialog', { name: 'Keep the small things', exact: true });
  await expect(detail).toBeVisible();
  await expect.poll(() => detail.getByRole('img').evaluate(image => image.complete && image.naturalWidth === 1536)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(detail).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await noOverflow(page);
  await openStory(page, 'effects-shimmer-button--playground');
  expect((await page.getByRole('button', { name: 'Explore components', exact: true }).boundingBox()).width).toBeLessThan(300);
});


test('decorative effect motion keeps text stationary and stops for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openStory(page, 'effects-shimmer-button--in-context', 'theme:paper;mode:light;motion:user');
  const trigger = page.getByRole('button', { name: 'Explore this artwork', exact: true });
  const spark = trigger.locator('.animate-spin-around');
  const before = await spark.evaluate(node => getComputedStyle(node).transform);
  const textBefore = await trigger.boundingBox();
  await expect.poll(() => spark.evaluate(node => getComputedStyle(node).transform)).not.toBe(before);
  const textAfter = await trigger.boundingBox();
  expect(Math.abs(textAfter.x - textBefore.x) + Math.abs(textAfter.y - textBefore.y) + Math.abs(textAfter.width - textBefore.width)).toBeLessThan(.5);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => spark.evaluate(node => parseFloat(getComputedStyle(node).animationDuration))).toBeLessThan(.001);
  await page.waitForTimeout(100);
  const reducedSpark = await spark.evaluate(node => getComputedStyle(node).transform);
  await page.waitForTimeout(100);
  expect(await spark.evaluate(node => getComputedStyle(node).transform)).toBe(reducedSpark);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openStory(page, 'effects-border-beam--in-context', 'theme:paper;mode:light;motion:user');
  const beam = page.locator('[style*="offset-path"]');
  const heading = page.getByRole('heading', { name: 'Guard the invalid state', exact: true });
  const headingBefore = await heading.boundingBox();
  const offset = await beam.evaluate(node => getComputedStyle(node).offsetDistance);
  await expect.poll(() => beam.evaluate(node => getComputedStyle(node).offsetDistance)).not.toBe(offset);
  const headingAfter = await heading.boundingBox();
  expect(Math.abs(headingAfter.x - headingBefore.x) + Math.abs(headingAfter.y - headingBefore.y)).toBeLessThan(.5);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(beam).toHaveCSS('offset-distance', '0%');
  await page.waitForTimeout(150);
  await expect(beam).toHaveCSS('offset-distance', '0%');
  await noOverflow(page);
});


test('pricing slider has a contrasting thumb, aligned fill and stable notes across full-range jumps', async ({ page }, testInfo) => {
  const evidence = [];
  await page.setViewportSize({ width: 390, height: 1100 });
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'data-pricing-calculator--in-context', `theme:${theme};mode:${mode};motion:reduced`);
    const thumb = page.locator('[data-slot="pricing-slider-thumb"]');
    const contrast = await thumb.evaluate(node => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d');
      const luminance = color => { context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1); const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(channel => { const s = channel / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; }); return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]; };
      const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
      const style = getComputedStyle(node), card = getComputedStyle(node.closest('[data-slot="pricing-calculator"]')), track = getComputedStyle(node.parentElement.querySelector('[data-slot="pricing-slider-track"]'));
      return { borderWidth: parseFloat(style.borderTopWidth), againstCard: ratio(style.borderTopColor, card.backgroundColor), againstTrack: ratio(style.borderTopColor, track.backgroundColor) };
    });
    expect(contrast.borderWidth).toBeGreaterThanOrEqual(2);
    expect(contrast.againstCard).toBeGreaterThanOrEqual(3);
    expect(contrast.againstTrack).toBeGreaterThanOrEqual(3);
    const slider = page.getByRole('slider', { name: 'Seats', exact: true });
    const invoice = page.locator('dl');
    let baseline;
    for (const [key, seats] of [['Home', '1 seat'], ['End', '20 seats'], ['Home', '1 seat']]) {
      await slider.focus(); await page.keyboard.press(key);
      await expect(slider).toHaveAttribute('aria-valuetext', seats);
      await expect.poll(() => thumb.evaluate(node => { const knob = node.getBoundingClientRect(), fill = node.parentElement.querySelector('[data-slot="pricing-slider-fill"]').getBoundingClientRect(); return Math.abs(fill.right - (knob.left + knob.width / 2)); })).toBeLessThan(1);
      const top = (await invoice.boundingBox()).y;
      if (baseline === undefined) baseline = top;
      else expect(Math.abs(top - baseline)).toBeLessThan(1);
    }
    evidence.push({ theme, ...contrast });
    await noOverflow(page);
  }
  await testInfo.attach('pricing-thumb-contrast', { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' });
});


test('collection sharing keeps its full link readable and retains the selected example permission', async ({ page }) => {
  await openStory(page, 'motion-morphing-popover--in-context');
  const trigger = page.getByRole('button', { name: 'Share collection', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  const link = dialog.getByText('https://example.com/collections/kith', { exact: true });
  await expect(link).toBeVisible();
  expect(await link.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  await dialog.getByLabel('Who can open this?', { exact: true }).selectOption('Anyone with the link');
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByText('Anyone with the link · Example permissions', { exact: true })).toBeVisible();
  await trigger.click();
  await expect(page.getByLabel('Who can open this?', { exact: true })).toHaveValue('Anyone with the link');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await noOverflow(page);
});


test('reduced marquee keeps every item reachable and retains first-copy DOM identity', async ({ page }, testInfo) => {
  const measurements = [];
  for (const width of [...new Set([page.viewportSize().width, 820])]) {
    await page.setViewportSize({ width, height: 900 });
    for (const vertical of [false, true]) {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto(`/iframe.html?id=effects-marquee--playground&args=vertical:${vertical};reverse:true&globals=theme:paper;mode:light;motion:user`);
      const track = page.locator(vertical ? '.animate-marquee-vertical' : '.animate-marquee').first();
      await track.waitFor();
      await page.evaluate(() => document.fonts.ready);
      const root = track.locator('..');
      const input = await track.evaluateHandle(element => {
        const input = document.createElement('input');
        input.setAttribute('aria-label', 'Marquee DOM identity probe');
        input.style.cssText = 'width:100%;min-width:0;display:block';
        element.firstElementChild.append(input);
        return input;
      });
      const field = page.getByRole('textbox', { name: 'Marquee DOM identity probe' });
      await field.fill('Keep this value');
      await field.focus();
      const assertReachable = async preference => {
        await expect(field).toBeFocused();
        await expect(field).toHaveValue('Keep this value');
        expect(await input.evaluate(element => element === document.querySelector('input[aria-label="Marquee DOM identity probe"]'))).toBe(true);
        const overflow = await root.evaluate(element => ({ x: getComputedStyle(element).overflowX, y: getComputedStyle(element).overflowY }));
        const initialBounds = await track.locator(':scope > div').evaluateAll(elements => elements.map(element => { const b = element.getBoundingClientRect(); return { label: element.firstChild.textContent, left: b.left, right: b.right, top: b.top, bottom: b.bottom }; }));
        await testInfo.attach(`marquee-${width}-${vertical ? 'vertical' : 'horizontal'}-${preference}-initial-bounds`, { body: JSON.stringify({ overflow, initialBounds, root: await root.boundingBox() }), contentType: 'application/json' });
        const bounds = [];
        for (const tile of await track.locator(':scope > div').all()) {
          if (['auto', 'scroll'].includes(vertical ? overflow.y : overflow.x)) await tile.scrollIntoViewIfNeeded();
          const result = await tile.evaluate(element => {
            const tile = element.getBoundingClientRect(), root = element.parentElement.parentElement.getBoundingClientRect();
            return { label: element.firstChild.textContent, tile: { left: tile.left, right: tile.right, top: tile.top, bottom: tile.bottom }, root: { left: root.left, right: root.right, top: root.top, bottom: root.bottom }, viewport: { width: innerWidth, height: innerHeight } };
          });
          expect(result.tile.left).toBeGreaterThanOrEqual(Math.max(0, result.root.left) - 1);
          expect(result.tile.right).toBeLessThanOrEqual(Math.min(result.viewport.width, result.root.right) + 1);
          expect(result.tile.top).toBeGreaterThanOrEqual(Math.max(0, result.root.top) - 1);
          expect(result.tile.bottom).toBeLessThanOrEqual(Math.min(result.viewport.height, result.root.bottom) + 1);
          bounds.push(result);
        }
        expect(bounds.map(item => item.label)).toEqual(['Components', 'Tokens', 'Motion', 'Blocks', 'Templates']);
        await expect.poll(() => track.evaluate(element => getComputedStyle(element).animationName)).toBe('none');
        await expect.poll(() => track.evaluate(element => getComputedStyle(element).transform)).toBe('none');
        const visibleCopies = await root.locator(':scope > div').evaluateAll(elements => elements.filter(element => getComputedStyle(element).display !== 'none').length);
        expect(visibleCopies).toBe(1);
        measurements.push({ width, vertical, preference, bounds });
        await noOverflow(page);
      };
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await assertReachable('os');
      await field.focus();
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect.poll(() => track.evaluate(element => getComputedStyle(element).animationName)).toBe(vertical ? 'sm-marquee-vertical' : 'sm-marquee');
      await page.evaluate(() => document.documentElement.dataset.motion = 'reduced');
      await assertReachable('explorer');
      await field.focus();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.evaluate(() => document.documentElement.dataset.motion = 'user');
      await assertReachable('os-with-explorer-user');
      await input.dispose();
    }
  }
  await testInfo.attach('marquee-reduced-reachability-and-dom-identity', { body: JSON.stringify(measurements), contentType: 'application/json' });
});

test('normal marquee translates with inert copies and preserves reverse and hover pause', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const vertical of [false, true]) {
    await page.goto(`/iframe.html?id=effects-marquee--playground&args=vertical:${vertical};reverse:true&globals=theme:paper;mode:light;motion:user`);
    const track = page.locator(vertical ? '.animate-marquee-vertical' : '.animate-marquee').first();
    await track.waitFor();
    const root = track.locator('..');
    await page.mouse.move(0, 0);
    expect(await root.locator(':scope > div').count()).toBe(4);
    for (const copy of (await root.locator(':scope > div').all()).slice(1)) {
      await expect(copy).toHaveAttribute('aria-hidden', 'true');
      await expect(copy).toHaveJSProperty('inert', true);
      await expect(copy).toBeVisible();
    }
    expect(await track.evaluate(element => getComputedStyle(element).animationDirection)).toBe('reverse');
    const first = await track.evaluate(element => getComputedStyle(element).transform);
    await expect.poll(() => track.evaluate(element => getComputedStyle(element).transform)).not.toBe(first);
    if (await page.evaluate(() => matchMedia('(hover:hover)').matches)) await root.hover();
    else await track.evaluate(element => { const button = document.createElement('button'); button.textContent = 'Marquee focus pause probe'; element.firstElementChild.append(button); button.focus(); });
    await expect.poll(() => track.evaluate(element => getComputedStyle(element).animationPlayState)).toBe('paused');
    await noOverflow(page);
  }
});
