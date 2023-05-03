import { isPlatformBrowser } from '@angular/common'
import { Inject, Injectable, PLATFORM_ID } from '@angular/core'
import { TranslocoService } from '@ngneat/transloco'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { environment } from 'src/environments/environment'
import { ERoutes } from '../enums/routes.enum'
import * as Sentry from '@sentry/angular'

@Injectable({
  providedIn: 'root',
})
export class PrivacyService {
  private project?: IMainProject

  constructor(
    private transloco: TranslocoService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  initWidget(project: IMainProject) {
    if (
      this.project ||
      !project?.enable_cookie_widget ||
      !isPlatformBrowser(this.platformId)
    ) {
      return
    }
    this.project = project
    const { cms, availableLangs, defaultLang } = environment
    const activeLang = this.transloco.getActiveLang()
    const config = {
      api: {
        cookies: `${cms.url}${cms.routes.cookiesProject}/${project.id}`,
        cookieConsents: `${cms.url}${cms.routes.cookieConsents}`,
        cookiePolicy: `${cms.url}${cms.routes.pagesProject}/${project.id}?menu_item.route=${ERoutes.COOKIE_POLICY}`,
        uiTranslations: `${cms.url}${cms.routes.translations}/locale`,
      },
      i18n: {
        availableLangs,
        defaultLang,
        activeLang,
      },
      theme: environment.cookieWidget.theme,
    }
    globalThis.NTCookieWidget?.init(config)
  }
}
