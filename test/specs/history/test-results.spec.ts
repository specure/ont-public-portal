import { test, expect, Page } from '@playwright/test'
import start from '../../utils/start'
import { EButtonTypes, handleCookieWidget } from '../../utils/commands'
import { ERoutes } from 'src/app/core/enums/routes.enum'

test.describe('Test results page', () => {
  let page: Page
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ browser }) => {
    page = await start(browser, `/en/${ERoutes.DATA}/${ERoutes.TEST_HISTORY}`)
    await expect(page.locator('.nt-cookie__dialog')).toBeVisible()
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
    await handleCookieWidget(page, EButtonTypes.ESSENTIAL)
  })

  test('shows that the functional cookies are disabled', async () => {
    await expect(page.locator('.nt-functional-cookie')).toBeVisible()
    await expect(
      page.locator('.nt-functional-cookie .nt-functional-cookie__icon-wrapper')
    ).toBeVisible()
    await expect(
      page.locator(
        '.nt-functional-cookie .nt-functional-cookie__icon-wrapper .mat-icon:has-text("report_problem")'
      )
    ).toBeVisible()
    await expect(
      page.locator('.nt-functional-cookie .nt-functional-cookie__text')
    ).toBeVisible()
    await expect(
      page.locator('.nt-functional-cookie .nt-functional-cookie__text')
    ).toContainText(
      'The history of your measurement results is not available. Please enable functional cookies to enable your measurement history.'
    )
    await expect(
      page.locator(
        '.nt-functional-cookie .nt-functional-cookie__button .mat-button-wrapper'
      )
    ).toBeVisible()
    await expect(
      page.locator(
        '.nt-functional-cookie .nt-functional-cookie__button .mat-button-wrapper'
      )
    ).toContainText('Enable Functional Cookies')
  })

  test('shows that the functional cookies are enabled', async () => {
    await expect(
      page.locator(
        '.nt-functional-cookie .nt-functional-cookie__button .mat-button-wrapper'
      )
    ).toBeVisible()
    await expect(
      page.locator(
        '.nt-functional-cookie .nt-functional-cookie__button .mat-button-wrapper'
      )
    ).toContainText('Enable Functional Cookies')
    await page
      .locator(
        '.nt-functional-cookie .nt-functional-cookie__button .mat-button-wrapper'
      )
      .click()
    await expect(page.locator('.nt-functional-cookie')).not.toHaveCount(0)
    await expect(
      page.locator(
        '.nt-functional-cookie .nt-functional-cookie__icon-wrapper--success'
      )
    ).toBeVisible()
    await expect(
      page.locator(
        '.nt-functional-cookie .nt-functional-cookie__icon-wrapper--success .mat-icon:has-text("check")'
      )
    ).toBeVisible()
    await expect(
      page.locator('.nt-functional-cookie .nt-functional-cookie__text')
    ).toBeVisible()
    await expect(
      page.locator('.nt-functional-cookie .nt-functional-cookie__text')
    ).toContainText(
      'Functional cookies are now enabled.  You will now see your list of measurement results in the history.'
    )
    await expect(
      page.locator(
        '.nt-functional-cookie .nt-functional-cookie__button .mat-button-wrapper'
      )
    ).toBeVisible()
    await expect(
      page.locator(
        '.nt-functional-cookie .nt-functional-cookie__button .mat-button-wrapper'
      )
    ).toContainText('Run Test')
    await page.click(
      '.nt-functional-cookie .nt-functional-cookie__button .mat-button-wrapper'
    )
    await page.waitForSelector(`.mat-button-wrapper:has-text("Run Test Again")`)
    await page.waitForTimeout(10_000)
  })

  test('should show history', async () => {
    await page.goto(`/en/${ERoutes.DATA}/${ERoutes.TEST_HISTORY}`)
    await expect(page.locator('.nt-container__header')).toBeVisible()
    await expect(page.locator('.nt-container__header')).toContainText('History')
    await expect(page.locator('.nt-history__heading')).toBeVisible()
    await expect(page.locator('.nt-history__heading')).not.toBeEmpty()
    await expect(page.locator('.nt-table')).toBeVisible()

    const arr = ['Time', 'Device', 'Operator']
    const sortableArr = [
      'Date',
      'Download (Mbps)',
      'Upload (Mbps)',
      'Latency (ms)',
    ]

    for (const title of sortableArr) {
      const header = page.locator(
        `.mat-sort-header-content:has-text("${title}")`
      )
      await expect(header).toBeVisible()
      await header.click()
      await page.waitForTimeout(300)
      await expect(page.locator('.mat-sort-header-arrow')).not.toHaveCount(0)
    }

    for (const title of arr) {
      await expect(
        page.locator(`.sah-table__cell--ellipsis:has-text("${title}")`)
      ).toBeVisible()
    }
  })
})
