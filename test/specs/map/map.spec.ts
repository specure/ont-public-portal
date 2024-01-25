import { test, expect, Page } from '@playwright/test'
import start from '../../utils/start'
import { EButtonTypes, handleCookieWidget } from '../../utils/commands'
import { ERoutes } from 'src/app/core/enums/routes.enum'
const dayjs = require('dayjs')

test.describe('Map Page', () => {
  let page: Page
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ browser }) => {
    page = await start(browser, `/en/${ERoutes.MAP}`, true)
    await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible()
    await expect(page.locator('.nt-cookie__dialog')).toBeVisible()
    await handleCookieWidget(page, EButtonTypes.ALL)
  })

  test('should open/close side menu', async () => {
    await expect(page.locator('.nt-sidenav')).not.toBeVisible()
    await page.locator('.nt-menu-bar__button').click()
    await expect(page.locator('.nt-sidenav')).toBeVisible()
    await page.locator('.nt-sidenav__close-button').click()
    await expect(page.locator('.nt-sidenav')).not.toBeVisible()
  })

  test('should expand/collapse mobile operators filter', async () => {
    await expect(
      page.locator('.nt-filters__mobile-operators--collapsed')
    ).not.toBeVisible()
    await expect(
      page.locator('.nt-filters__mobile-operators--expanded')
    ).toBeVisible()
    await page.locator('.nt-panel-toggle').click()
    await expect(
      page.locator('.nt-filters__mobile-operators--collapsed')
    ).toBeVisible()
    await expect(
      page.locator('.nt-filters__mobile-operators--expanded')
    ).not.toBeVisible()
    await page.locator('.nt-panel-toggle').click()
  })

  test('collapsed mobile operators filter should display selected value', async () => {
    await page
      .locator('.nt-filters__mobile-operators--expanded mat-select')
      .click()
    const text = await page
      .locator('.mat-option .mat-option-text')
      .first()
      .evaluate((el) => el.textContent)
    await page.locator('.mat-option .mat-option-text').first().click()
    await page.locator('.nt-panel-toggle').click()
    const divText = await page
      .locator('.nt-filters__mobile-operators--collapsed')
      .evaluate((el) => el.textContent.trim())
    expect(divText).toEqual('Mobile Network Operator: ' + text)
  })

  test('should show time slider and change selection', async () => {
    await expect(page.locator('.nt-timeline__items')).toBeVisible()
    await expect(page.locator('.nt-timeline__header')).toBeVisible()
    await expect(
      page.locator('.nt-timeline__header span:first-child')
    ).toBeVisible()
    await expect(
      page.locator('.nt-timeline__header span:first-child')
    ).toContainText('Monthly data: ')
    const prevMonth = dayjs().startOf('day').subtract(1, 'day')
    await expect(
      page.locator('.nt-timeline__step--selected .nt-timeline__label')
    ).toContainText(prevMonth.format('MMM'))
    await expect(
      page.locator('.nt-timeline__header span:last-child')
    ).toBeVisible()
    await expect(
      page.locator('.nt-timeline__header span:last-child')
    ).toContainText(prevMonth.format('MMMM YYYY'))
    await page
      .locator('.nt-timeline__step--selected .nt-timeline__label')
      .hover()
    await expect(
      page.locator('.nt-timeline__step--selected .nt-timeline__tooltip')
    ).toContainText(prevMonth.format('MMMM YYYY'))
    await expect(
      page.locator('.nt-timeline__header span:last-child')
    ).toContainText(prevMonth.format('MMMM YYYY'))
    await expect(
      page.locator('.nt-timeline__header span:last-child')
    ).toBeVisible()
    await page.locator('.nt-timeline__step').first().click()
    await expect(
      page.locator('.nt-timeline__step--selected .nt-timeline__label')
    ).toContainText(prevMonth.subtract(23, 'M').format('MMM'))
  })

  test('should show disclaimer', async () => {
    await expect(page.locator('.nt-filters__disclaimer')).toContainText(
      'The map shows measurements done through the Nettfart apps. It is not a coverage map.'
    )
  })
})
