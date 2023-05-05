import { test, expect, Page } from '@playwright/test'
import start from '../../utils/start'
import { EButtonTypes, handleCookieWidget } from '../../utils/commands'
import { ERoutes } from 'src/app/core/enums/routes.enum'
const dayjs = require('dayjs')

test.describe('Open Data', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await start(browser, `/en/${ERoutes.DATA}/${ERoutes.OPEN_DATA}`)
    await expect(page.locator('.nt-cookie__dialog')).toBeVisible()
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
    await handleCookieWidget(page, EButtonTypes.ALL)
  })

  test('should show header', async () => {
    await expect(page.locator('.nt-container__header')).toBeVisible()
    await expect(page.locator('.nt-container__header')).toContainText(
      'Open data'
    )
    await expect(
      page.locator('.nt-container .nt-open-data__wrapper:first-of-type p')
    ).toBeVisible()
    await expect(
      page.locator('.nt-container .nt-open-data__wrapper:first-of-type p')
    ).not.toBeEmpty()
  })

  test('should show Monthly Export by default', async () => {
    await page.waitForSelector('.mat-radio-button')
    expect(await page.locator('.mat-radio-button').count()).toEqual(2)
    await expect(
      page.locator('.mat-radio-button:first-of-type.mat-radio-checked')
    ).toBeVisible()
    await expect(
      page.locator(
        '.mat-radio-checked .mat-radio-label-content:has-text("Monthly Export")'
      )
    ).toBeVisible()
    await expect(
      page.locator('.nt-open-data__fieldset .nt-open-data__select .mat-select')
    ).toBeVisible()
    await expect(
      page.locator(
        '.nt-open-data__fieldset .nt-open-data__select:last-of-type:has-text("month")'
      )
    ).toBeVisible()
  })

  test('should show correct dates in the first select', async () => {
    await expect(
      page.locator(
        `.mat-select-value-text span:has-text("${dayjs().format('YYYY-MM')}")`
      )
    ).toBeVisible()
    await page.locator('.nt-open-data__fieldset .mat-select-trigger').click()
    await expect(
      page.locator(`.mat-option-text:has-text("${dayjs().format('YYYY-MM')}")`)
    ).toBeVisible()
    const prevMonth = dayjs().subtract(1, 'month').format('YYYY-MM')
    await page.locator(`.mat-option-text div:has-text("${prevMonth}")`).click()
    await expect(
      page.locator(`.mat-select-value-text span:has-text("${prevMonth}")`)
    ).toBeVisible()
  })

  test('should allow switching to Full Export', async () => {
    await page.locator('.mat-radio-button:last-of-type').click()
    await expect(
      page.locator('.mat-radio-button:last-of-type.mat-radio-checked')
    ).not.toHaveCount(0)
    await expect(
      page.locator(
        '.mat-radio-checked .mat-radio-label-content:has-text("Full Export")'
      )
    ).not.toHaveCount(0)
    await expect(
      page.locator('.nt-open-data__fieldset .nt-open-data__select .mat-select')
    ).toHaveCount(0)
    await expect(page.locator('.nt-open-data__desc')).not.toHaveCount(0)
    await expect(page.locator('.nt-open-data__desc')).toContainText(
      'By selecting the full export, you will download all the available measurement data.'
    )
  })

  test('should show Download button and footer', async () => {
    await expect(page.locator('.nt-open-data__footer p')).not.toHaveCount(0)
    await expect(page.locator('.nt-open-data__footer p')).not.toBeEmpty()
    await expect(
      page.locator(`.nt-open-data__footer .nt-open-data__icons
        a[href="http://creativecommons.org/licenses/by/4.0/"]
        img[src="https://i.creativecommons.org/l/by/4.0/88x31.png"]`)
    ).not.toHaveCount(0)
    await expect(
      page.locator('.nt-btn .mat-button-wrapper:has-text("Download")')
    ).not.toHaveCount(0)
  })

  test('shows snackbar on click', async () => {
    await page.click(
      '.nt-open-data__wrapper .mat-button-wrapper:has-text("Download")'
    )
    await expect(page.locator('nt-export-snackbar')).toBeVisible()
    await expect(page.locator('nt-export-snackbar .nt-icon')).toBeVisible()
    await expect(
      page.locator(
        `nt-export-snackbar .nt-container__col:nth-child(2) p:first-of-type`
      )
    ).not.toBeEmpty()
    await expect(
      page.locator(
        `nt-export-snackbar
        .nt-container__col:nth-child(2)
        p:has-text("Open Data - Full Export.csv")`
      )
    ).toBeVisible()
    await expect(
      page.locator(
        'nt-export-snackbar .mat-button-wrapper:has-text("Download")'
      )
    ).toBeVisible()
    await page.click('mat-icon:has-text("close")')
    await expect(page.locator('nt-export-snackbar')).not.toBeVisible()
  })

  test('keeps the snackbar open when navigating between pages', async () => {
    await page
      .locator(
        '.nt-open-data__wrapper .mat-button-wrapper:has-text("Download")'
      )
      .click()
    await expect(page.locator('nt-export-snackbar')).not.toHaveCount(0)
    await expect(page.locator(`a[href="/en/${ERoutes.MAP}"]`)).not.toHaveCount(
      0
    )
    await page.locator(`a[href="/en/${ERoutes.MAP}"]`).click({ force: true })
    await expect(page.locator('nt-export-snackbar')).not.toHaveCount(0)
    await expect(
      page.locator(`a[href="/en/${ERoutes.ABOUT}"]`)
    ).not.toHaveCount(0)
    await page.locator(`a[href="/en/${ERoutes.ABOUT}"]`).click({ force: true })
    await expect(page.locator('nt-export-snackbar')).not.toHaveCount(0)
  })

  test('hides the snackbar on reload and deletes scheduled exports', async () => {
    await expect(page.locator('nt-export-snackbar')).not.toHaveCount(0)
    await page.goto(`/en/${ERoutes.DATA}/${ERoutes.OPEN_DATA}`)
    await expect(page.locator('nt-export-snackbar')).toHaveCount(0)
  })

  test('hides the snackbar on download', async () => {
    await expect(
      page.locator('.mat-button-wrapper:has-text("Download")')
    ).toBeVisible()
    await page.locator('.mat-button-wrapper:has-text("Download")').click()
    await expect(page.locator('nt-export-snackbar')).toBeVisible()
    const now = dayjs()
    await expect(
      page.locator('nt-export-snackbar .nt-icon--ready')
    ).toBeVisible()
    await expect(
      page.locator(`nt-export-snackbar
      .nt-container__col:nth-child(2)
      p:has-text("Your download is ready.")`)
    ).toBeVisible()
    await expect(
      page.locator(`nt-export-snackbar
      .nt-container__col:nth-child(2)
      p:has-text("Open Data - Monthly Export - ${now.year()}-${now.format(
        'MM'
      )}.csv")`)
    ).toBeVisible()
    await page
      .locator(
        'snack-bar-container button .mat-button-wrapper:has-text("Download")'
      )
      .click({ force: true })
    await expect(page.locator('nt-export-snackbar')).not.toBeVisible()
  })
})
