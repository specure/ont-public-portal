import { test, expect, Page } from '@playwright/test'
import start from '../../utils/start'
import { EButtonTypes, handleCookieWidget } from '../../utils/commands'
import { getClassList } from '../../utils/selectors'
import { ERoutes } from 'src/app/core/enums/routes.enum'
const dayjs = require('dayjs')

test.describe('Map Page Responsiveness', () => {
  let page: Page
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async ({ browser }) => {
    page = await start(browser, `/en/${ERoutes.MAP}`, true)
    await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible()
    await expect(page.locator('.nt-cookie__dialog')).toBeVisible()
    await handleCookieWidget(page, EButtonTypes.ALL)
  })

  const checkTimeline = async () => {
    await expect(page.locator('.nt-timeline-toggle')).toBeVisible()
    await expect(
      page.locator('.nt-timeline-toggle .nt-panel-toggle .mat-icon')
    ).toBeVisible()
    await expect(
      page.locator('.nt-timeline-toggle .nt-panel-toggle .mat-icon')
    ).toContainText('keyboard_arrow_up')
    await expect(
      page.locator('.nt-timeline-toggle .nt-panel-toggle + span')
    ).toBeVisible()
    const prevMonth = dayjs().startOf('day').subtract(1, 'day')
    await expect(
      page.locator('.nt-timeline-toggle .nt-panel-toggle + span')
    ).toContainText(prevMonth.format('MMMM YYYY'))
    await page.locator('.nt-timeline-toggle').click()

    await expect(
      page.locator('.nt-timeline__header .nt-panel-toggle')
    ).toBeVisible()
    await expect(page.locator('.nt-timeline__header')).toBeVisible()
    await expect(
      page.locator(
        '.nt-timeline__header .nt-btn .nt-panel-toggle--switched .mat-icon'
      )
    ).toBeVisible()
    await expect(
      page.locator(
        '.nt-timeline__header .nt-btn .nt-panel-toggle--switched .mat-icon'
      )
    ).toContainText('keyboard_arrow_up')
    await expect(page.locator('.nt-list__wrapper .nt-list')).not.toHaveCount(0)
    const months = await page
      .locator('.nt-list__wrapper .nt-list .nt-list__item .nt-btn')
      .count()
    expect(months).toBeGreaterThan(0)
    for (let i = 0; i < months; i++) {
      await expect(
        page.locator('.nt-list__wrapper .nt-list .nt-list__item .nt-btn').nth(i)
      ).not.toBeEmpty()
    }
    await page.locator('.nt-timeline__header .nt-btn').click()
    await expect(page.locator('.nt-timeline-toggle')).toBeVisible()
  }

  const checkFiltersExpanded = async () => {
    await expect(page.locator('.nt-filters--expanded')).toBeVisible()
    const buttons = await page
      .locator('.nt-filters__technology-filter-button')
      .count()
    expect(buttons).toEqual(5)
    for (let i = 0; i < buttons; i++) {
      await expect(
        page.locator('.nt-filters__technology-filter-button').nth(i)
      ).not.toBeEmpty()
    }

    await expect(page.locator('.nt-all-color')).toBeVisible()
    await expect(
      page.locator(
        '.nt-all-color + .nt-filters__mobile-operators:has-text("All")'
      )
    ).toHaveCount(0)

    const filters = await page.locator('.nt-filters__sec').count()
    expect(buttons).toEqual(5)
    for (let i = 0; i < filters; i++) {
      await expect(page.locator('.nt-filters__sec').nth(i)).toBeVisible()
    }
    await expect(page.locator('.nt-filters__sec--expanded')).toBeVisible()
    await expect(page.locator('.nt-filters .mat-select')).toBeVisible()
    await expect(page.locator('.nt-filters__disclaimer')).toBeVisible()
  }

  const checkFiltersCollapsedTab = async () => {
    await expect(page.locator('.nt-filters')).toBeVisible()
    const classes = await getClassList(page, '.nt-filters')
    expect(classes).not.toContain('nt-filters--expanded')
    const buttons = await page
      .locator('.nt-filters__technology-filter-button')
      .count()
    expect(buttons).toEqual(5)
    for (let i = 0; i < buttons; i++) {
      await expect(
        page.locator('.nt-filters__technology-filter-button').nth(i)
      ).toBeVisible()
    }
    await expect(page.locator('.nt-all-color')).toBeVisible()
    await expect(
      page.locator(
        '.nt-all-color + .nt-filters__mobile-operators:has-text("All")'
      )
    ).toHaveCount(0)

    const filters = await page.locator('.nt-filters__sec').count()
    expect(filters).toEqual(2)
    for (let i = 0; i < filters; i++) {
      await expect(page.locator('.nt-filters__sec').nth(i)).toBeVisible()
    }
    await expect(page.locator('.nt-filters__sec--expanded')).toBeVisible()
    await expect(page.locator('.nt-filters .mat-select')).not.toBeVisible()
    await expect(page.locator('.nt-filters__disclaimer')).toBeVisible()
  }

  const checkFiltersCollapsedMobile = async () => {
    await expect(page.locator('.nt-filters')).toBeVisible()
    const classes = await getClassList(page, '.nt-filters')
    expect(classes).not.toContain('nt-filters--expanded')

    await expect(
      page.locator('.nt-filters__technology-filter-button')
    ).toBeVisible()
    await expect(
      page.locator('.nt-filters__technology-filter-button')
    ).toHaveCount(1)
    await expect(page.locator('.nt-all-color')).toBeVisible()
    await expect(
      page.locator(
        '.nt-all-color + .nt-filters__mobile-operators:has-text("All")'
      )
    ).toBeVisible()
    const filters = await page.locator('.nt-filters__sec').count()
    expect(filters).toEqual(2)
    for (let i = 0; i < filters; i++) {
      await expect(page.locator('.nt-filters__sec').nth(i)).toBeVisible()
    }
    await expect(page.locator('.nt-filters__sec--expanded')).toHaveCount(0)
    await expect(page.locator('.nt-filters .mat-select')).not.toBeVisible()
    await expect(page.locator('.nt-filters__disclaimer')).toBeVisible()
  }

  test('should show the map and controls for tablets at 900 width', async () => {
    await page.setViewportSize({ width: 900, height: 600 })

    await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible()
    await checkTimeline()

    await checkFiltersExpanded()
    await expect(page.locator('.nt-filters .nt-panel-toggle')).toBeVisible()
    await page.locator('.nt-filters .nt-panel-toggle').click()

    await checkFiltersCollapsedTab()
    await expect(page.locator('.nt-filters .nt-panel-toggle')).toBeVisible()
    await page.locator('.nt-filters .nt-panel-toggle').click()
  })

  test('should show the map and controls for phones at 768 width', async () => {
    await page.setViewportSize({ width: 768, height: 600 })

    await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible()
    await checkTimeline()

    await checkFiltersExpanded()
    await expect(page.locator('.nt-filters .nt-panel-toggle')).toBeVisible()
    await page.locator('.nt-filters .nt-panel-toggle').click()

    await checkFiltersCollapsedMobile()
    await expect(page.locator('.nt-filters .nt-panel-toggle')).toBeVisible()
    await page.locator('.nt-filters .nt-panel-toggle').click()
  })

  test('should show the map and controls for phones at 375 width', async () => {
    await page.setViewportSize({ width: 375, height: 600 })

    await expect(page.locator('canvas.maplibregl-canvas')).toBeVisible()
    await checkTimeline()

    await checkFiltersExpanded()
    await expect(page.locator('.nt-filters .nt-panel-toggle')).toBeVisible()
    await page.locator('.nt-filters .nt-panel-toggle').click()

    await checkFiltersCollapsedMobile()
    await expect(page.locator('.nt-filters .nt-panel-toggle')).toBeVisible()
    await page.locator('.nt-filters .nt-panel-toggle').click()
  })
})
