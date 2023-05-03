import { isPlatformBrowser } from '@angular/common'
import { Inject, Injectable, PLATFORM_ID } from '@angular/core'
import { environment } from 'src/environments/environment'

@Injectable({ providedIn: 'root' })
export class PlatformService {
  get isMobile(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false
    }
    return window.innerWidth <= 768
  }

  get isTab(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false
    }
    if (environment.cms.projectSlug === 'nt') {
      return window.innerWidth > 768 && window.innerWidth <= 1280
    }
    return window.innerWidth > 768 && window.innerWidth <= 960
  }

  get isDesktop(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true
    }
    return window.innerWidth > 960
  }

  get isLandscape(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true
    }
    return window.innerWidth >= window.innerHeight
  }

  get isPortrait(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false
    }
    return window.innerWidth < window.innerHeight
  }

  get iosVersion(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 0
    }
    const agent = window.navigator.userAgent
    const start = agent.indexOf('OS ')
    if (
      (agent.indexOf('iPhone') > -1 || agent.indexOf('iPad') > -1) &&
      start > -1
    ) {
      return Number(agent.substring(start + 3, 3).replace('_', '.'))
    }
    return 0
  }

  constructor(@Inject(PLATFORM_ID) private platformId) {}
}
