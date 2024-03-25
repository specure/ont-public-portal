import { Injectable } from '@angular/core'
import { MatomoTracker } from 'ngx-matomo-client'
import { timer } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class MatomoLinksHandlerService {
  constructor(private matomo: MatomoTracker) {}

  private trackEvent(event: MouseEvent) {
    const element = (event.target as HTMLElement).closest(
      '[class^="matomo-category"]'
    )
    if (!element) {
      return
    }
    const classList: string[] = Array.prototype.slice.call(element.classList)
    const categoryList = classList
      .find((c) => c.includes('matomo-category'))
      ?.split(':')
    if (categoryList?.length < 1) {
      return
    }
    const category = categoryList[categoryList.length - 1]
    const actionList = classList
      .find((c) => c.includes('matomo-action'))
      ?.split(':')
    if (actionList?.length < 1) {
      return
    }
    const action = actionList[actionList.length - 1]
    this.matomo.trackEvent(category, action)
  }

  addHandlers() {
    timer(0).subscribe(() => {
      const elements: NodeListOf<HTMLElement> =
        globalThis.document?.querySelectorAll('[class^="matomo-category"]')
      elements?.forEach((l) => {
        l.removeEventListener('click', this.trackEvent.bind(this))
        l.addEventListener('click', this.trackEvent.bind(this))
      })
    })
  }
}
