import { defineConfig } from '@playwright/test';

const port = 4184;
export default defineConfig({
  testDir: './explorer/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: { timeout: 8000, toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.001 } },
  snapshotPathTemplate: '{testDir}/baselines/{platform}/{projectName}/{arg}{ext}',
  use: { baseURL: `http://127.0.0.1:${port}`, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    command: `python3 -m http.server ${port} --bind 127.0.0.1 --directory explorer/storybook-static`,
    url: `http://127.0.0.1:${port}/index.json`, reuseExistingServer: !process.env.CI,
  },
  projects: [
    ...['chromium', 'firefox', 'webkit'].flatMap(browserName => [390, 1440].map(width => ({
      name: `${browserName}-${width}`, testMatch: /interaction\.spec\.mjs/,
      use: { browserName, viewport: { width, height: 900 }, hasTouch: width === 390, ...(browserName !== 'firefox' ? { isMobile: width === 390 } : {}) },
    }))),
    { name: 'visual', testMatch: /visual\.spec\.mjs/, use: { browserName: 'chromium', reducedMotion: 'reduce', deviceScaleFactor: 1 } },
  ],
});
