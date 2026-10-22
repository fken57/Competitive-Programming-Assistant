import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

if (!process.env.DATABASE_URL) {
  throw new Error('Set DATABASE_URL to a dedicated MariaDB database before running E2E tests.');
}

const baseURL = 'http://127.0.0.1:18080';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 30_000,
  globalTimeout: 5 * 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'go run . > ../react-sample-app/e2e-server.log 2>&1',
    cwd: resolve(__dirname, '../backend'),
    url: `${baseURL}/healthz`,
    reuseExistingServer: false,
    timeout: 120_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    env: {
      APP_ENV: 'development',
      PORT: '18080',
      FRONTEND_ORIGIN: baseURL,
      STATIC_DIR: resolve(__dirname, 'build'),
      DATABASE_URL: process.env.DATABASE_URL,
      DEBUG: 'false',
    },
  },
});
