import { isPlatformBrowser } from '@angular/common'
import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core'
import { ICookie } from '@nettest/cookie-widget/dist/interfaces/cookie.interface'
import { MatomoInitializerService } from 'ngx-matomo-client'
import { NTCookieService } from '@nettest/cookie-widget'
import { CookieService } from 'ngx-cookie-service'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'

declare global {
  interface Window {
    dataLayer: any[]
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService implements OnDestroy {
  private ga = ''
  private gt = ''
  private project?: IMainProject

  constructor(
    private cookieService: CookieService,
    private matomo: MatomoInitializerService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return
    }
    NTCookieService.I.removeEventListener(
      'consentUpdated',
      this.toggleGoogleAnalytics
    )
  }

  init(project: IMainProject) {
    if (!project) {
      return
    }
    if (!this.project) {
      this.project = project
    }

    if (this.project?.web_matomo_analytics_config) {
      this.matomo.initializeTracker(this.project.web_matomo_analytics_config)
    } else {
      this.toggleGoogleAnalytics()
    }
  }

  private toggleGoogleAnalytics = async () => {
    if (!isPlatformBrowser(this.platformId)) {
      return
    }
    let isAnalyticsAllowed = true
    if (this.project?.enable_cookie_widget) {
      isAnalyticsAllowed = await NTCookieService.I.isCookieAccepted('analytics')
      NTCookieService.I.addEventListener(
        'consentUpdated',
        (cookies: ICookie[]) => {
          if (cookies?.some((c) => c.key === 'analytics')) {
            location.reload()
          }
        }
      )
    }
    if (isAnalyticsAllowed) {
      this.enableGoogleAnalytics()
    } else {
      this.disableGoogleAnalytics()
    }
  }

  private disableGoogleAnalytics = () => {
    if (!isPlatformBrowser(this.platformId)) {
      return
    }
    Object.keys(this.cookieService.getAll()).forEach((key) => {
      if (/^_ga/.test(key)) {
        const hp = location.hostname.split('.')
        const domain = hp.length > 1 ? `.${hp.slice(-2).join('.')}` : hp[0]
        this.cookieService.delete(key, '/', domain)
      }
    })
  }

  private enableGoogleAnalytics = () => {
    if (!this.project || !isPlatformBrowser(this.platformId)) {
      return
    }
    const { google_analytics_id: ga, google_tag_manager_code: gt } =
      this.project
    if (gt && !this.gt) {
      this.gtm(globalThis, document, 'link', 'dataLayer', gt)
      this.gt = gt
    } else if (ga && !this.ga && !this.gt) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`
      document
        .querySelector('head')
        ?.insertBefore(script, document.querySelector('link'))

      this.gtag('js', new Date())
      this.gtag('config', ga)

      this.ga = ga
    }
  }

  private gtag(...args: any[]) {
    if (!isPlatformBrowser(this.platformId)) {
      return
    }
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(args)
  }

  // tslint:disable
  private gtm(w: any, d: any, s: any, l: any, i: any) {
    w[l] = w[l] || []
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement('script'),
      dl = l != 'dataLayer' ? '&l=' + l : ''
    j.async = true
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
    f.parentNode.insertBefore(j, f)
  }
  // tslint:enable
}
