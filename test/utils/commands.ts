import { expect, Page, Browser } from '@playwright/test'

export const handleCookieWidget = async (
  page: Page,
  buttonToClick: EButtonTypes
) => {
  const isWidgetVisible = await page.isVisible('.nt-cookie__dialog')
  if (isWidgetVisible) {
    await page.waitForSelector('nt-cookie-widget .nt-cookie__footer')
    await page.click(buttonToClick)
    await expect(page.locator('.nt-cookie__dialog')).not.toBeVisible()
    await expect(
      page.locator('mat-progress-bar[mode="indeterminate"]')
    ).not.toBeVisible()
  }
}

export const mockGeolocation = async (
  browser: Browser,
  location: { latitude: number; longitude: number }
) => {
  const context = await browser.newContext()
  await context.grantPermissions(['geolocation'])
  await context.setGeolocation({
    latitude: location.latitude,
    longitude: location.longitude,
  })
  return context
}

export enum EButtonTypes {
  ESSENTIAL = `nt-cookie-widget .nt-cookie__footer button:first-of-type`,
  ALL = `nt-cookie-widget .nt-cookie__footer button:last-of-type`,
}
