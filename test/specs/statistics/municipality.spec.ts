import { test, expect, Page } from '@playwright/test'
import start from '../../utils/start'
import { EButtonTypes, handleCookieWidget } from '../../utils/commands'
import { environment } from 'src/environments/environment.playwright'
import { getClassList } from 'test/utils/selectors'
import { ERoutes } from 'src/app/core/enums/routes.enum'

test.describe('Municipality Page', () => {
  let page: Page
  let noData: boolean

  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ browser }) => {
    page = await start(
      browser,
      `/en/${ERoutes.DATA}/${ERoutes.STATISTICS}/${environment.municipality.forTesting.name}`
    )
    await expect(page.locator('.nt-cookie__dialog')).toBeVisible()
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
    await handleCookieWidget(page, EButtonTypes.ALL)
    await expect(page.locator('.nt-stats')).toHaveCount(1)
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
    noData = await page.isVisible('.nt-stats .nt-container--no-data')
  })

  test('shows basic info', async () => {
    await expect(
      page.locator(
        `.nt-title:has-text("${environment.municipality.forTesting.name}")`
      )
    ).toBeVisible()
    await expect(page.locator('.nt-dt:has-text("Municipality")')).toBeVisible()
    await expect(
      page.locator(
        `.nt-dd a.nt-link--external[target="_blank"][href="${environment.municipality.forTesting.website}"]:has-text("${environment.municipality.forTesting.name} Website")`
      )
    ).toBeVisible()
    await expect(page.locator('.nt-container__col--coat img')).toBeVisible()
    await expect(
      page.locator(
        `.nt-container__col--map-link a[href="/en/${ERoutes.MAP}"]:has-text("Go to map view")`
      )
    ).toBeVisible()
    await expect(page.locator('.nt-container__col--map img')).toBeVisible()
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
          `.+${environment.controlServer.routes.providers}\\?code=${environment.municipality.forTesting.code}&tech=all_isp`
        )
      ),
      page.click(
        '.mat-radio-group[formcontrolname="providerType"] .mat-radio-button:last-of-type'
      ),
    ])
    expect(responses[0].ok()).toBeTruthy()
    radioClassList = await getClassList(
      page,
      '.mat-radio-group[formcontrolname="providerType"] .mat-radio-button:last-of-type'
    )
    expect(radioClassList.includes('mat-radio-checked')).toBeTruthy()

    responses = await Promise.all([
      page.waitForResponse(
        new RegExp(
          `.+${environment.controlServer.routes.providers}\\?code=${environment.municipality.forTesting.code}&tech=all_mno`
        )
      ),
      page.click(
        '.mat-radio-group[formcontrolname="providerType"] .mat-radio-button:first-of-type'
      ),
    ])
    expect(responses[0].ok()).toBeTruthy()
    radioClassList = await getClassList(
      page,
      '.mat-radio-group[formcontrolname="providerType"] .mat-radio-button:first-of-type'
    )
    expect(radioClassList.includes('mat-radio-checked')).toBeTruthy()
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
    expect(inOrderNumber).toEqual(1)
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

  test('can navigate back to statistics', async () => {
    await expect(
      page.locator('a:has-text("Back to National Statistics")')
    ).toBeVisible()
    const [resp] = await Promise.all([
      page.waitForResponse(
        new RegExp(`.+${environment.controlServer.routes.providers}.+`)
      ),
      page.click('a:has-text("Back to National Statistics")'),
    ])
    expect(resp.ok()).toBeTruthy()
    await expect(
      page.locator(
        '.nt-stats__title:has-text("Aggregated national statistics")'
      )
    ).toBeVisible()
  })
})
