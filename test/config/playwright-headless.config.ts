import { PlaywrightTestConfig, devices } from '@playwright/test'
const config: PlaywrightTestConfig = {
  expect: {
    timeout: 60_000,
  },
  retries: 3,
  testDir: '../specs',
  timeout: 120_000,
  use: {
    baseURL: 'http://localhost:4200/en',
    headless: true,
    viewport: { width: 1600, height: 900 },
    ignoreHTTPSErrors: true,
    ...devices['Desktop Firefox'],
  },
  workers: 1,
}
export default config
