import { expect, test } from '@playwright/test';
import { noOverflow, openStory } from './helpers.mjs';

test('native controls retain browser interfaces and intrinsic input geometry', async ({ page }, testInfo) => {
  const globals = testInfo.project.name.includes('dark') ? 'theme:ink;mode:dark' : 'theme:paper;mode:light';
  await openStory(page, 'inputs-native-controls--playground', globals);
  const select = page.getByLabel('Project status');
  await select.selectOption('parked');
  await expect(select).toHaveValue('parked');
  const checkbox = page.getByLabel('Include archived evidence');
  const box = await checkbox.boundingBox();
  expect(box.width).toBe(16);
  expect(box.height).toBe(16);
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
  expect(await page.getByLabel('Completed checks').evaluate(node => ({ max: node.max, value: node.value, position: node.position }))).toEqual({ max: 8, value: 3, position: 3 / 8 });
  await page.locator('summary').click();
  await expect(page.locator('details')).toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'Open native dialog' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: 'Open native dialog' }).click();
  await dialog.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect(await page.locator('dialog').evaluate(node => node.returnValue)).toBe('done');
  await noOverflow(page);
  await testInfo.attach('native-controls', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});

test('optional shell rail and mobile modal navigation retain focus and routing', async ({ page }, testInfo) => {
  const globals = testInfo.project.name.includes('dark') ? 'theme:ink;mode:dark' : 'theme:paper;mode:light';
  await openStory(page, 'blocks-app--navigation', globals);
  if (page.viewportSize().width >= 1024) {
    const sidebar = page.locator('[data-slot="app-sidebar"]');
    await page.getByRole('button', { name: 'Collapse sidebar' }).click();
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true');
    expect((await sidebar.boundingBox()).width).toBe(64);
    await expect(sidebar.getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute('title', 'Projects');
    await page.getByRole('button', { name: 'Expand sidebar' }).click();
    expect((await sidebar.boundingBox()).width).toBe(240);
  } else {
    const trigger = page.getByRole('button', { name: 'Open navigation' });
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
    for (let index = 0; index < 5; index++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
    }
    await dialog.getByRole('link', { name: 'Settings', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
  await noOverflow(page);
  await testInfo.attach('shell-navigation', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
});
