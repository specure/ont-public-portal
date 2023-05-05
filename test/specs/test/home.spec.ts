import { test, expect, Page } from '@playwright/test'
import start from '../../utils/start'
import {
  EButtonTypes,
  handleCookieWidget,
  mockGeolocation,
} from '../../utils/commands'
import { ERoutes } from 'src/app/core/enums/routes.enum'

test.describe('Test Home Page', () => {
  let page: Page

  const checkTestBlock = async (stages: string[] = []) => {
    if (stages?.length) {
      await expect(
        page.locator('.nt-test-header__list .nt-test-header__item')
      ).not.toHaveCount(0)
      expect(
        await page
          .locator('.nt-test-header__list .nt-test-header__item')
          .count()
      ).toEqual(7)
      const headerItems = await page
        .locator('.nt-test-header__list .nt-test-header__item')
        .evaluateAll((els) => {
          return els.map((el) => ({
            title: el.querySelector('.nt-test-header__title').textContent,
            progress: el.querySelector(
              '.nt-test-header__progress-container .nt-test-header__progress'
            ),
          }))
        })
      for (const { title, progress } of headerItems) {
        expect(stages).toContain(title)
        expect(progress).not.toBeNull()
      }
    } else {
      await page.waitForSelector('.nt-test-header')
      await expect(page.locator('.nt-test-header')).toBeVisible()
      await expect(page.locator('.nt-test-header')).not.toHaveCount(0)
    }
    await expect(
      page.locator('#run-test .nt-container__title:has-text("Latency")')
    ).not.toHaveCount(0)
    await expect(
      page.locator('#run-test .nt-container__units:has-text("ms")')
    ).not.toHaveCount(0)

    await expect(
      page.locator('#run-test .nt-container__title:has-text("Download")')
    ).not.toHaveCount(0)
    await expect(
      page.locator('#run-test .nt-container__title:has-text("Upload")')
    ).not.toHaveCount(0)
    await expect(
      page.locator('#run-test .nt-container__units:has-text("Mbps")')
    ).not.toHaveCount(0)

    await page.waitForSelector(
      '#run-test .nt-aside__header:has-text("Server Name")'
    )
    expect(await page.locator('#run-test .nt-aside__header').count()).toEqual(3)
    expect(
      await page.locator('#run-test .nt-container__col p').count()
    ).toEqual(3)

    await expect(
      page.locator('#run-test .nt-aside__header:has-text("Server Name")')
    ).not.toHaveCount(0)
    await expect(
      page.locator('#run-test .nt-aside__header:has-text("IP Address")')
    ).not.toHaveCount(0)
    await expect(
      page.locator('#run-test .nt-aside__header:has-text("Provider")')
    ).not.toHaveCount(0)

    await expect(
      page.locator('#test-charts .nt-container__header:has-text("Download")')
    ).not.toHaveCount(0)
    await expect(
      page.locator('#test-charts .nt-container__header:has-text("Upload")')
    ).not.toHaveCount(0)
    await expect(page.locator('#test-charts nt-test-chart')).toHaveCount(2)
    await expect(page.locator('#run-test .nt-container--done')).toHaveCount(3)
    await expect(page.locator('#run-test .nt-container__counter')).toHaveCount(
      3
    )
    await expect(
      page.locator('.mat-button-wrapper:has-text("Run Test Again")')
    ).toBeVisible()
    await expect(
      page.locator('.mat-button-wrapper:has-text("Export as PDF")')
    ).toBeVisible()
    await expect(page.locator('.nt-share__item')).toHaveCount(4)
    const icons = ['twitter', 'facebook', 'linkedin', 'whatsapp']
    for (const icon of icons) {
      await expect(
        page.locator(
          `.nt-share__item .nt-share__link .nt-share__icon.nt-share__icon--${icon}`
        )
      ).toBeVisible()
    }
  }

  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ browser }) => {
    page = await start(browser, '/en')
    await expect(page.locator('.nt-cookie__dialog')).toBeVisible()
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
    await handleCookieWidget(page, EButtonTypes.ALL)
  })

  test('should show the Start Test block', async () => {
    await expect(page.locator('#run-test')).not.toHaveCount(0)
    await expect(page.locator('#run-test h1')).toContainText(
      'Test the speed of your internet.'
    )
    await expect(
      page.locator('.mat-button-wrapper:has-text("Start speed test")')
    ).not.toHaveCount(0)
    await expect(page.locator('#run-test .nt-link')).not.toHaveCount(0)
    await expect(
      page.locator('#run-test .nt-link mat-icon:has-text("info")')
    ).not.toHaveCount(0)
    await expect(page.locator('#run-test .nt-link span')).not.toHaveCount(0)
    await expect(page.locator('#run-test .nt-link span')).not.toBeEmpty()
  })

  test('allows picking server', async () => {
    await expect(page.locator('.nt-test-invite__server')).toBeVisible()
    await expect(
      page.locator('.nt-test-invite__server p:has-text("Measurement Server")')
    ).toBeVisible()
    await expect(
      page.locator('.nt-test-invite__server mat-select-trigger p')
    ).not.toBeEmpty()
    await page.click('.nt-test-invite__server mat-select-trigger')
    const optionLocator = page.locator('.mat-option-text')
    await expect(optionLocator).not.toHaveCount(0)
    for (let i = 0; i < (await optionLocator.count()); i++) {
      await expect(optionLocator.nth(i)).not.toBeEmpty()
    }
    await optionLocator.first().click()
    await expect(optionLocator).toHaveCount(0)
  })

  test('should show the measurements when the test is running', async ({
    browser,
  }) => {
    await mockGeolocation(browser, { latitude: 30, longitude: -98 })
    await page
      .locator('.mat-button-wrapper:has-text("Start speed test")')
      .click()
    await expect(
      page.locator('#run-test .nt-container__counter:text-is("-")')
    ).toHaveCount(3)
    const stages = [
      'Initialising',
      'Down Pre-test',
      'Latency',
      'Download',
      'Up Pre-test',
      'Upload',
      'Finalization',
    ]
    await checkTestBlock(stages)
    await page.waitForTimeout(100)
    await page.reload()
    await checkTestBlock()
  })

  test('should show the stores links', async () => {
    await expect(page.locator('#store-links')).not.toHaveCount(0)
    await expect(
      page.locator('[title="Download on the App Store"] img')
    ).not.toHaveCount(0)
    await expect(
      page.locator('[title="Get it on Google Play"] img')
    ).not.toHaveCount(0)
  })

  test('should reset test when switching between pages', async ({
    browser,
  }) => {
    await mockGeolocation(browser, { latitude: 30, longitude: -98 })
    await page.locator('.mat-button-wrapper:has-text("Run Test Again")').click()
    await expect(
      page.locator('#run-test .nt-container__counter:has-text("-")')
    ).not.toHaveCount(0)
    await page
      .locator(`[href="/en/${ERoutes.ABOUT}"]`)
      .first()
      .click({ force: true })
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
    await expect(page.locator('#run-test')).not.toBeVisible()
    await page.locator('.nt-logo').first().click()
    await expect(page.locator('#run-test')).toBeVisible()
    await expect(page.locator('#run-test h1')).toContainText(
      'Test the speed of your internet.'
    )
    await expect(
      page.locator('.mat-button-wrapper:has-text("Start speed test")')
    ).not.toHaveCount(0)
  })
})
