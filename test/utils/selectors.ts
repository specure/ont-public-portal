import { Page } from '@playwright/test'

export const getClassList = async (page: Page, selector: string) => {
  return await page
    .locator(selector)
    .evaluate((el) => Object.values(el.classList))
}

export const getStyle = async (page: Page, selector: string, style: string): Promise<string> => {
  return await page
    .locator(selector)
    .first()
    .evaluate((element, styleKey) => {
      return window.getComputedStyle(element).getPropertyValue(styleKey)
    }, style)
}

