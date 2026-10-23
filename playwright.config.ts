import { defineConfig, devices } from '@playwright/test';

try {
  process.loadEnvFile('.env.local');
} catch {}

export default defineConfig({
  testDir: 'e2e',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
