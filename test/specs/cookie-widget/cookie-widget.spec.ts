import { test, expect, Page } from '@playwright/test'
import start from '../../utils/start'

test.describe('Cookie Widget', () => {
  let page: Page
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ browser }) => {
    page = await start(browser, '/en')
    await expect(page.locator('.nt-cookie__dialog')).toBeVisible()
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
  })

  const checkContentMoreThan = async (selector: string, minNumber: number) => {
    const articlesLi = await page.locator(selector).count()
    expect(articlesLi).toBeGreaterThanOrEqual(minNumber)
    for (let i = 0; i < articlesLi; i++) {
      await expect(page.locator(selector).nth(i)).toBeVisible()
    }
  }

  const checkContentEqual = async (selector: string, eqNumber: number) => {
    const articlesLi = await page.locator(selector).count()
    expect(articlesLi).toEqual(eqNumber)
    for (let i = 0; i < articlesLi; i++) {
      await expect(page.locator(selector).nth(i)).not.toHaveCount(0)
    }
  }

  test('shows the header', async () => {
    await expect(page.locator('nt-cookie-widget header')).not.toHaveCount(0)
    await expect(page.locator('nt-cookie-widget header svg')).not.toHaveCount(0)
    await expect(
      page.locator(
        'nt-cookie-widget header .nt-cookie__langpicker .MuiSelect-select'
      )
    ).not.toHaveCount(0)
    await expect(
      page.locator(
        'nt-cookie-widget header .nt-cookie__langpicker .MuiSelect-select'
      )
    ).not.toBeEmpty()
    await expect(page.locator('nt-cookie-widget article p')).not.toHaveCount(0)
    await expect(page.locator('nt-cookie-widget article p')).not.toBeEmpty()
  })

  test('allows changing language', async () => {
    await page
      .locator(
        'nt-cookie-widget header .nt-cookie__langpicker .MuiSelect-select'
      )
      .click()
    await expect(
      page.locator('.MuiMenuItem-root[data-value="en"]')
    ).toBeVisible()
    await expect(
      page.locator('.MuiMenuItem-root[data-value="en"]')
    ).toContainText('English')
    await page.locator('.MuiMenuItem-root[data-value="en"]').click()
    await expect(page.locator('nt-cookie-widget article p')).toBeVisible()
    await expect(page.locator('nt-cookie-widget article p')).not.toBeEmpty()
  })

  test('shows the list of cookies', async () => {
    await checkContentMoreThan('nt-cookie-widget article li', 1)
    await checkContentMoreThan('nt-cookie-widget article dt', 1)
    await checkContentMoreThan('nt-cookie-widget article dd', 1)
    await checkContentMoreThan(
      'nt-cookie-widget article dd div:first-of-type',
      1
    )
    await checkContentMoreThan('nt-cookie-widget article dd .MuiSwitch-root', 1)

    await checkContentEqual('nt-cookie-widget article dd .Mui-disabled', 1)
    await checkContentEqual('nt-cookie-widget article dd .Mui-checked', 1)

    await expect(
      page.locator('nt-cookie-widget a:has-text("Cookie policy")')
    ).toBeVisible()
  })

  test('shows the cookie policy', async () => {
    await page.locator('nt-cookie-widget a:has-text("Cookie policy")').click()
    await expect(page.locator('nt-cookie-widget article section')).toBeVisible()
    await expect(
      page.locator('nt-cookie-widget article section')
    ).not.toBeEmpty()
    await expect(
      page.locator('nt-cookie-widget .MuiButton-label:has-text("Back")')
    ).toBeVisible()
    await page
      .locator('nt-cookie-widget .MuiButton-label:has-text("Back")')
      .click()
    await page.waitForSelector('nt-cookie-widget article ul')
    await checkContentMoreThan('nt-cookie-widget article li', 1)
  })
})
