import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'src/__tests__',  // Your tests folder
  timeout: 30 * 1000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    storageState: 'storageState.json'
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,   // Only runs *.setup.ts files
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'authenticated',
      testMatch: /.*\.spec\.ts/,   // Only runs *.spec.ts files
      use: {
        storageState: 'playwright/.auth/state.json',
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
