import { test, expect, Page } from '@playwright/test'
import start from '../../utils/start'
import { EButtonTypes, handleCookieWidget } from '../../utils/commands'

test.describe('Footer menu', () => {
  let page: Page
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ browser }) => {
    page = await start(browser, '/en')
    await page.waitForTimeout(1000)
    await handleCookieWidget(page, EButtonTypes.ALL)
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
    await page.waitForTimeout(1000)
  })

  test('has correct elements', async () => {
    await expect(
      page.locator(
        '.nt-footer .nt-logo img[src="/assets/images/logo-footer.svg"]'
      )
    ).toBeVisible()
    expect(
      await page.locator('.nt-menu__item--footer').count()
    ).toBeGreaterThanOrEqual(5)
    await expect(page.locator('.nt-footer .nt-copyright')).toBeVisible()
    await expect(page.locator('.nt-footer .nt-copyright')).not.toBeEmpty()
  })
})
