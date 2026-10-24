import { expect, test } from '@playwright/test';
import { noOverflow, openStory } from './helpers.mjs';

for (const width of [390, 820, 1440]) {
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    const suffix = `${width}-${theme}-${mode}`;
    const globals = `theme:${theme};mode:${mode};motion:reduced`;
    test.describe(suffix, () => {
      test.use({ hasTouch: width <= 820, isMobile: width <= 820 });
      test.beforeEach(async ({ page }) => {
        expect(await page.evaluate(() => matchMedia('(pointer:coarse)').matches)).toBe(width <= 820);
      });
      test(`catalog ${suffix}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await openStory(page, 'start-here-catalog--all-modules', globals);
        await expect(page.getByRole('searchbox', { name: 'Filter modules', exact: true })).toBeVisible();
        await noOverflow(page);
        await expect(page).toHaveScreenshot(`catalog-${suffix}.png`, { fullPage: true });
        await page.getByRole('checkbox', { name: 'Select Accordion', exact: true }).check();
        await expect(page.getByRole('checkbox', { name: 'Select all rows on this page', exact: true })).toHaveAttribute('aria-checked', 'mixed');
        await expect(page).toHaveScreenshot(`catalog-selected-${suffix}.png`, { fullPage: true });
        await page.getByRole('searchbox', { name: 'Filter modules', exact: true }).fill('@saas-maker/ui/atoms/button');
        await page.getByRole('row').filter({ has: page.getByText('Button', { exact: true }) }).click();
        await expect(page.getByRole('dialog', { name: 'Button', exact: true })).toBeVisible();
        await expect(page).toHaveScreenshot(`catalog-detail-${suffix}.png`);
      });
      test(`table states ${suffix}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        for (const state of ['loading', 'empty', 'failure-recovery']) {
          await openStory(page, `data-data-table--${state}`, globals);
          await noOverflow(page);
          await expect(page).toHaveScreenshot(`table-${state}-${suffix}.png`, { fullPage: true });
        }
      });
      test(`first run ${suffix}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await openStory(page, 'start-here-workspace--first-run-to-workspace', globals);
        await expect(page.getByRole('textbox', { name: 'Workspace name', exact: true })).toBeVisible();
        const artwork = page.getByAltText('Kith’s illustrated memory book with a photograph and cup of coffee');
        if (await artwork.isVisible()) await expect.poll(() => artwork.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
        await noOverflow(page);
        await expect(page).toHaveScreenshot(`workspace-first-run-${suffix}.png`, { fullPage: true });
      });
      test(`complete workspace ${suffix}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await openStory(page, 'start-here-workspace--complete-workflow', globals);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect.poll(() => page.getByAltText('Kith’s illustrated coastal walk, part of the release artwork').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
        await noOverflow(page);
        await expect(page).toHaveScreenshot(`workspace-${suffix}.png`, { fullPage: true });
        await page.getByRole('button', { name: 'Browse release assets' }).click();
        await expect.poll(() => page.locator('section[aria-label="Release assets"] img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
        await noOverflow(page);
        await expect(page).toHaveScreenshot(`workspace-assets-${suffix}.png`, { fullPage: true });
        await page.getByRole('button', { name: 'Preview The long way home.webp', exact: true }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect.poll(() => page.getByRole('dialog').locator('img').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
        await expect(page).toHaveScreenshot(`workspace-preview-${suffix}.png`);
      });
      test(`composition ${suffix}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await openStory(page, 'start-here-composition--from-atom-to-organism', globals);
        await expect(page.getByLabel('Workspace name', { exact: true }).first()).toBeVisible();
        await noOverflow(page);
        await expect(page).toHaveScreenshot(`composition-${suffix}.png`, { fullPage: true });
      });
      test(`form validation and success ${suffix}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await openStory(page, 'foundations-button--in-context', globals);
        await page.getByLabel('Project name', { exact: true }).fill('');
        await page.getByRole('button', { name: 'Save project', exact: true }).click();
        await expect(page.getByText('Give this project a name before saving.')).toBeVisible();
        await expect(page).toHaveScreenshot(`form-invalid-${suffix}.png`, { fullPage: true });
        await page.getByLabel('Project name', { exact: true }).fill('Kith · the next chapter');
        await page.getByRole('button', { name: 'Save project', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
        await expect(page).toHaveScreenshot(`form-saved-${suffix}.png`, { fullPage: true });
      });
      for (const state of ['Ready', 'Loading', 'Empty', 'Error']) {
        test(`asset ${state} ${suffix}`, async ({ page }) => {
          await page.setViewportSize({ width, height: 1000 });
          await openStory(page, 'start-here-states--state-lab', globals);
          await page.getByRole('radio', { name: state, exact: true }).click();
          if (state === 'Loading') await expect(page.getByRole('button', { name: 'Finish loading' })).toBeVisible();
          if (state === 'Empty') await expect(page.getByRole('button', { name: 'Add example files' })).toBeVisible();
          if (state === 'Error') await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
          await noOverflow(page);
          await expect(page).toHaveScreenshot(`asset-${state.toLowerCase()}-${suffix}.png`, { fullPage: true });
        });
      }
      test(`font impact ${suffix}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await openStory(page, 'foundations-tokens--font-impact', globals);
        await expect(page.getByTestId('font-measurement').first()).toContainText('body lines');
        await noOverflow(page);
        await expect(page).toHaveScreenshot(`fonts-${suffix}.png`, { fullPage: true });
      });
      test(`visual source shelf ${suffix}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await openStory(page, 'start-here-visual-sources--source-shelf', globals);
        await page.getByRole('textbox', { name: 'Search visual sources' }).fill('Kenney');
        await expect(page.getByTestId('source-results').locator('article')).toHaveCount(1);
        await noOverflow(page);
        await expect(page).toHaveScreenshot(`sources-${suffix}.png`, { fullPage: true });
      });
      test(`complete media page ${suffix}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await openStory(page, 'start-here-media--complete-page', globals);
        await expect(page.getByAltText('Illustrative coastal walk in Kith’s warm visual world')).toBeVisible();
        await page.locator('#kith-status').scrollIntoViewIfNeeded();
        await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
        await page.getByRole('link', { name: 'Kith for iPhone', exact: true }).scrollIntoViewIfNeeded();
        await noOverflow(page);
        await expect(page).toHaveScreenshot(`media-${suffix}.png`, { fullPage: true });
      });
    });
  }
}
