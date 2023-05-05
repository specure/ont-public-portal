import { test, expect, Page } from '@playwright/test'
import start from '../../utils/start'
import { EButtonTypes, handleCookieWidget } from '../../utils/commands'
import { environment } from 'src/environments/environment.playwright'
import { getClassList } from 'test/utils/selectors'
import { ERoutes } from 'src/app/core/enums/routes.enum'

test.describe('Statistics Page', () => {
  let page: Page
  let lastCountyName = ''
  let latestMunName = ''
  let noData: boolean

  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ browser }) => {
    page = await start(browser, `/en/${ERoutes.DATA}/${ERoutes.STATISTICS}`)
    await expect(page.locator('.nt-cookie__dialog')).toBeVisible()
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
    await handleCookieWidget(page, EButtonTypes.ALL)
    await expect(page.locator('.nt-stats')).not.toHaveCount(0)
    await expect(page.locator('.nt-stats')).not.toHaveCount(1)
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
    noData = await page.isVisible('.nt-stats__chart:has-text("No data.")')
  })

  test('shows the Aggregated national statistics title and lead', async () => {
    const titles = [
      'Aggregated national statistics',
      'Counties & Municipalities',
    ]
    for (const title of titles) {
      await expect(
        page.locator(`.nt-stats__header .nt-stats__title:has-text("${title}")`)
      ).not.toHaveCount(0)
    }
    await expect(page.locator('.nt-stats__lead')).toBeVisible()
    await expect(page.locator('.nt-stats__lead')).toContainText(
      'Based on the measurements made by the users of Nettfart mobile applications in the last 6 months.'
    )
  })

  test('shows the chart', async () => {
    if (noData) {
      return
    }
    await expect(page.locator('nt-statistics-chart canvas')).not.toHaveCount(0)
    await expect(
      page.locator('.nt-legend .nt-legend__item--download')
    ).not.toHaveCount(0)
    await expect(
      page.locator('.nt-legend .nt-legend__item--download')
    ).toContainText('Download')
    await expect(
      page.locator('.nt-legend .nt-legend__item--upload')
    ).not.toHaveCount(0)
    await expect(
      page.locator('.nt-legend .nt-legend__item--upload')
    ).toContainText('Upload')
  })

  test('shows Aggregated national statistics table', async () => {
    if (noData) {
      return
    }
    const inOrderNumber = await page
      .locator('.nt-stats__footer:has-text("*In alphabetical order")')
      .count()
    for (let i = 0; i < inOrderNumber; i++) {
      await expect(
        page
          .locator(`.nt-stats__footer:has-text("*In alphabetical order")`)
          .nth(i)
      ).toBeVisible()
    }
    expect(inOrderNumber).toEqual(2)
    const arr = [
      'Mobile Network Operator',
      'Download (Mbps)',
      'Upload (Mbps)',
      'Latency (ms)',
      'Measurements',
    ]
    const styles = [
      {
        selector: '.mat-column-providerName',
        style: 'justify-content: flex-start; text-align: left;',
      },
      {
        selector: '.mat-column-download',
        style: 'justify-content: flex-end; text-align: right;',
      },
      {
        selector: '.mat-column-upload',
        style: 'justify-content: flex-end; text-align: right;',
      },
      {
        selector: '.mat-column-latency',
        style: 'justify-content: flex-end; text-align: right;',
      },
      {
        selector: '.mat-column-measurements',
        style: 'justify-content: flex-end; text-align: right;',
      },
    ]
    for (const title of arr) {
      await expect(page.locator(`text=${title}`).first()).toBeVisible()
    }
    for (const style of styles) {
      await expect(page.locator(style.selector).first()).toBeVisible()
      await expect(page.locator(style.selector).first()).toHaveAttribute(
        'style',
        style.style
      )

      expect(await page.locator('.mat-row').count()).toBeGreaterThan(0)
    }
  })

  test('shows filters, filters should filter the data', async () => {
    if (noData) {
      return
    }
    await expect(page.locator('mat-select[name=tech]')).toBeVisible()
    await page.locator('mat-select[name=tech]').click()
    const techArr = ['All technologies', '5G', '4G', '3G', '2G']
    for (const tech of techArr) {
      await expect(
        page.locator(`.mat-option-text:has-text("${tech}")`)
      ).not.toHaveCount(0)
    }
    const textAll = await page
      .locator('.mat-cell:nth-child(3)')
      .evaluateAll((cells) => {
        return cells.map((cell) => cell.textContent)
      })
    const [response] = await Promise.all([
      page.waitForResponse(
        new RegExp(`.+${environment.controlServer.routes.providers}`)
      ),
      page.locator('.mat-option-text:has-text("3G")').click(),
    ])
    expect(response.ok()).toBeTruthy()
    const text3G = await page
      .locator('.mat-cell:nth-child(3)')
      .evaluateAll((cells) => {
        return cells.map((cell) => cell.textContent)
      })
    expect(textAll).not.toEqual(text3G)
  })

  test('shows MNO/ISP switch', async () => {
    if (!environment.cms.url.includes('dev')) {
      return
    }
    await expect(
      page.locator('.mat-radio-group[formcontrolname="providerType"]')
    ).toBeVisible()
    let radioClassList = await getClassList(
      page,
      '.mat-radio-group[formcontrolname="providerType"] .mat-radio-button:first-of-type'
    )
    expect(radioClassList.includes('mat-radio-checked')).toBeTruthy()

    let responses = await Promise.all([
      page.waitForResponse(
        new RegExp(
          `.+${environment.controlServer.routes.providers}\\?tech=all_isp`
        )
      ),
      page.click(
        '.mat-radio-group[formcontrolname="providerType"] .mat-radio-button:last-of-type'
      ),
    ])
    expect(responses[0].ok()).toBeTruthy()
    await expect(
      page.locator('mat-select[name=tech].mat-select-disabled')
    ).toBeVisible()
    radioClassList = await getClassList(
      page,
      '.mat-radio-group[formcontrolname="providerType"] .mat-radio-button:last-of-type'
    )
    expect(radioClassList.includes('mat-radio-checked')).toBeTruthy()

    responses = await Promise.all([
      page.waitForResponse(
        new RegExp(
          `.+${environment.controlServer.routes.providers}\\?tech=all_mno`
        )
      ),
      page.click(
        '.mat-radio-group[formcontrolname="providerType"] .mat-radio-button:first-of-type'
      ),
    ])
    expect(responses[0].ok()).toBeTruthy()
    await expect(
      page.locator('mat-select[name=tech].mat-select-disabled')
    ).not.toBeVisible()
    radioClassList = await getClassList(
      page,
      '.mat-radio-group[formcontrolname="providerType"] .mat-radio-button:first-of-type'
    )
    expect(radioClassList.includes('mat-radio-checked')).toBeTruthy()
  })

  test('shows counties and municipalities in alphabetical order', async () => {
    await expect(page.locator('.nt-stats__list')).not.toHaveCount(0)
    await expect(page.locator('.nt-stats__list')).not.toBeEmpty()
    await expect(
      page.locator(
        '.nt-stats__list .nt-stats__li .nt-stats__dl .nt-stats__link'
      )
    ).not.toHaveCount(0)
    const locale = 'nb'
    const countyNames = await page
      .locator('.nt-stats__list .nt-stats__li .nt-stats__dl .nt-stats__dt')
      .evaluateAll((dl) => {
        return dl.map((el) => el.textContent)
      })
    for (const countyName of countyNames) {
      const trimmedCountyName = countyName.trim()
      expect(trimmedCountyName.localeCompare(lastCountyName, locale)).toEqual(1)
      lastCountyName = trimmedCountyName
    }

    const munNames = await page
      .locator('.nt-stats__list .nt-stats__li .nt-stats__dl')
      .nth(0)
      .evaluate((dl) =>
        Array.from(dl.querySelectorAll('.nt-stats__link')).map(
          (e) => e.textContent
        )
      )
    let lastMunName = ''
    for (let i = 0; i < 5; i++) {
      const munName = munNames[i].trim()
      expect(munName.localeCompare(lastMunName, locale)).toEqual(1)
      lastMunName = munName
      latestMunName = munName
    }
  })

  test('searches for counties and municipalities', async () => {
    const searchFieldSelector = '.nt-stats__search input'
    await expect(page.locator(searchFieldSelector)).toBeVisible()
    await page.locator(searchFieldSelector).type(lastCountyName)
    await expect(
      page.locator('.nt-stats--municipalities .nt-stats__dt')
    ).not.toHaveCount(0)
    expect(
      await page.locator('.nt-stats--municipalities .nt-stats__dt').count()
    ).toEqual(1)
    await expect(
      page.locator('.nt-stats--municipalities .nt-stats__dt')
    ).toContainText(lastCountyName)
    await page.locator(searchFieldSelector).fill('')
    const fullLength = await page
      .locator('.nt-stats--municipalities .nt-stats__link')
      .evaluateAll((els) => els.length)
    await page.locator(searchFieldSelector).type(latestMunName)
    await expect(
      page.locator(
        `.nt-stats--municipalities .nt-stats__link:has-text("${latestMunName}")`
      )
    ).not.toHaveCount(0)
    const searchLength = await page
      .locator('.nt-stats--municipalities .nt-stats__link')
      .evaluateAll((els) => els.length)
    expect(searchLength).toBeLessThan(fullLength)
  })
})
