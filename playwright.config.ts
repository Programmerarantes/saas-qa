import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],

  globalSetup: "./tests/api/global-setup.ts",

  use: {
    baseURL: 'http://localhost:3001',
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: '**/*spec.ts',
    },
  ],

  webServer: {
    command: 'npm run start:test',
    cwd: './backend',
    url: 'http://localhost:3001/health',
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  }
});
