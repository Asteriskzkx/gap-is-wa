import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: "./tests",

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ["html"],
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: "http://localhost:3000",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.spec\.js/,
    },

    // Dedicated project for performance tests (Lighthouse only works with Chromium)
    {
      name: "performance",
      testMatch: /performance\.spec\.js/,
      use: { ...devices["Desktop Chrome"] },
      timeout: 60 * 1000,
      retries: 0,
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: /performance\.spec\.js/,
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: /performance\.spec\.js/,
    },

    // Test against mobile viewports
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: /performance\.spec\.js/,
    },

    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
      testIgnore: /performance\.spec\.js/,
    },

    // Test against branded browsers
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
      testIgnore: /performance\.spec\.js/,
    },

    {
      name: "Google Chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
      testIgnore: /performance\.spec\.js/,
    },
  ],

  // Run your local dev server before starting the tests
  // Uncomment if you want Playwright to automatically start the dev server
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
