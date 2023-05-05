import { Browser, Page } from '@playwright/test'
import { mockGeolocation } from './commands'

async function start(browser: Browser, redirectUri: string = '/', withMockLocation = false) {
  console.log('Creating page...')
  let page: Page
  if (withMockLocation) {
    const context = await mockGeolocation(browser, { latitude: 30, longitude: -98 })
    page = await context.newPage()
  } else {
    page = await browser.newPage()
  }
  console.log('Accessing public portal ...')
  await page.goto(redirectUri)
  return page
}

export default start
