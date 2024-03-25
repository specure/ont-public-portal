import { test, expect, Page } from '@playwright/test'
import start from '../../utils/start'
import {
  EButtonTypes,
  handleCookieWidget,
  mockGeolocation,
} from '../../utils/commands'
import { getClassList, getStyle } from '../../utils/selectors'
import { ERoutes } from 'src/app/core/enums/routes.enum'

test.describe('Test Home Page', () => {
  let page: Page
  test.describe.configure({ mode: 'serial' })
  test.beforeAll(async ({ browser }) => {
    page = await start(browser, '/en')
    await expect(page.locator('.nt-cookie__dialog')).toBeVisible()
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
    await handleCookieWidget(page, EButtonTypes.ALL)
  })

  test('should hide menu items and show hamburger icon', async () => {
    await page.setViewportSize({ width: 900, height: 1600 })
    await expect(page.locator('.nt-sidenav')).not.toBeVisible()
    await expect(page.locator('.nt-hamburger')).toBeVisible()
    await expect(page.locator('mat-icon:has-text("menu")')).toBeVisible()
    await page.locator('mat-icon:has-text("menu")').click()

    await expect(page.locator('mat-sidenav')).toBeVisible()
    await page.waitForSelector('.nt-sidenav mat-icon:has-text("close")')
    await expect(
      page.locator('.nt-sidenav mat-icon:has-text("close")')
    ).toBeVisible()
    await expect(page.locator('.nt-sidenav')).toBeVisible()
    await expect(page.locator('.nt-sidenav__language-select')).toBeVisible()
    await expect(page.locator('.nt-sidenav__sec').nth(3)).toBeVisible()
    const sidenavSec = await page.locator('.nt-sidenav__sec').count()
    expect(sidenavSec).toEqual(4)
    for (let i = 0; i < sidenavSec; i++) {
      await expect(page.locator('.nt-sidenav__sec').nth(i)).not.toBeEmpty()
    }
    await expect(
      page.locator(`.nt-menu-button[href="/en/${ERoutes.TEST}"]`)
    ).toBeVisible()
    const classes = await getClassList(
      page,
      `.nt-menu-button[href="/en/${ERoutes.TEST}"]`
    )
    expect(classes).toContain('nt-menu-button--active')
    await expect(
      page.locator('.nt-sidenav .nt-menu-button:has-text("Cookie settings")')
    ).toBeVisible()
    await expect(page.locator('.nt-sidenav__footer-copyright')).toBeVisible()
    await expect(page.locator('.nt-sidenav__footer-copyright')).not.toBeEmpty()
    await page.locator('.nt-sidenav mat-icon:has-text("close")').click()
    await expect(page.locator('mat-icon:has-text("menu")')).toBeVisible()
    await expect(page.locator('mat-sidenav')).not.toBeVisible()
  })

  test('speed chart size must have right width', async ({ browser }) => {
    await page.setViewportSize({ width: 320, height: 900 })
    await mockGeolocation(browser, { latitude: 30, longitude: -98 })
    await page.locator('button.nt-run-test-btn').click()

    const stages = [
      'Initialising',
      'Down Pre-test',
      'Latency',
      'Download',
      'Up Pre-test',
      'Upload',
    ]

    for (const [i, stage] of stages.entries()) {
      await expect(
        page.locator(`.nt-test-header__title span:has-text("Phase: ")`)
      ).not.toHaveCount(0)
      await expect(
        page.locator(`.nt-test-header__title span:has-text("${stage}")`)
      ).not.toHaveCount(0)
      await expect(
        page.locator(`.nt-test-header__title span:has-text("(${i + 1}/7)")`)
      ).not.toHaveCount(0)
      await expect(
        page.locator(`.nt-test-header__title span:has-text("${stage}")`)
      ).toHaveCount(0)
      await expect(
        page.locator(`.nt-test-header__title span:has-text("(${i + 1}/7)")`)
      ).toHaveCount(0)
    }
    await expect(
      page.locator(`.nt-test-header__title span:has-text("Phase: ")`)
    ).toHaveCount(0)
    await expect(
      page.locator(`.nt-test-header__title span:has-text("Finished")`)
    ).not.toHaveCount(0)
    await expect(page.locator('#run-test .nt-container--done')).toHaveCount(3)
    await expect(page.locator('nt-test-chart')).toHaveCount(0)

    await page.setViewportSize({ width: 1441, height: 900 })
    const wideWidth = await getStyle(page, 'nt-test-chart', 'width')
    console.log('wideWidth', wideWidth)
    expect(wideWidth).toEqual('665px')

    await page.setViewportSize({ width: 961, height: 900 })
    const narrowWidth = await getStyle(page, 'nt-test-chart', 'width')
    expect(narrowWidth).toEqual('425px')
  })
})
