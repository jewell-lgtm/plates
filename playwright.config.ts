import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/pwa',
  fullyParallel: false,
  use: { baseURL: process.env.E2E_BASE_URL || 'http://localhost:4173', channel: 'chrome', viewport: { width: 390, height: 844 } },
  webServer: process.env.E2E_BASE_URL ? undefined : { command: 'npm run preview', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI },
});
