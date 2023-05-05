import { test, expect, Page } from '@playwright/test'
import start from '../../utils/start'
import { EButtonTypes, handleCookieWidget } from '../../utils/commands'
import { ERoutes } from 'src/app/core/enums/routes.enum'

test.describe('Page not found', () => {
  let page: Page
  test.describe.configure({ mode: 'serial' })
  test.beforeAll(async ({ browser }) => {
    page = await start(browser, `/en/${ERoutes.COOKIE_POLICY}`)
  })

  test.beforeEach(async () => {
    await handleCookieWidget(page, EButtonTypes.ALL)
  })

  const runChecks = async () => {
    await expect(page.locator('nt-not-found')).toBeVisible()
    await expect(page.locator('.nt-header')).toBeVisible()
    await expect(page.locator('.nt-header')).not.toBeEmpty()
    await expect(page.locator('.nt-btn')).toBeVisible()
    await expect(page.locator('.nt-btn')).not.toBeEmpty()
    await expect(page.locator('nt-not-found img')).toBeVisible()
  }

  test('opens the page when accessing unavailable route in main module', async () => {
    await page.goto('/en/blah')
    await runChecks()
  })

  test('opens the page when accessing unavailable route in test module', async () => {
    await page.goto(`/en/${ERoutes.TEST}/blah`)
    await runChecks()
  })
  test('opens the page when accessing unavailable route in data module', async () => {
    await page.goto(`/en/${ERoutes.DATA}/blah`)
    await runChecks()
  })
})
