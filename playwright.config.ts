import { defineConfig, devices } from '@playwright/test';

const targetURL = process.env.TARGET_URL;

export default defineConfig({
  testDir: './e2e',
  webServer: targetURL ? undefined : { command: 'npm run build && npm run preview -- --port 4173', port: 4173, reuseExistingServer: true },
  use: { baseURL: targetURL ?? 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ]
});
