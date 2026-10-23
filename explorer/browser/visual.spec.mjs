import { expect, test } from '@playwright/test';
import { noOverflow, openStory } from './helpers.mjs';

for (const width of [390, 820, 1440]) {
  for (const [theme, mode] of [['paper', 'light'], ['ink', 'dark']]) {
    const suffix = `${width}-${theme}-${mode}`;
    const globals = `theme:${theme};mode:${mode};motion:reduced`;
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
  }
}
