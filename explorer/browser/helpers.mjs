import { expect } from '@playwright/test';

export async function openStory(page, id, globals = 'theme:paper;mode:light') {
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=${globals}`);
  await expect(page.locator('#storybook-root')).not.toBeEmpty();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.sb-errordisplay')).toHaveCount(0);
}

export async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
}
