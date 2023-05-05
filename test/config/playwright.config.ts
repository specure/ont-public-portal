import { PlaywrightTestConfig, devices } from '@playwright/test'
const config: PlaywrightTestConfig = {
  expect: {
    timeout: 60_000
  },
  retries: 1,
  testDir: '../specs',
  timeout: 120_000,
  use: {
    baseURL: 'http://localhost:4200/en',
    headless: false,
    viewport: { width: 1600, height: 900 },
    ignoreHTTPSErrors: true,
    ...devices['Desktop Firefox'],
  },
  workers: 3
}
export default config
