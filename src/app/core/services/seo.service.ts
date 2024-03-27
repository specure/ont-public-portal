import { Injectable } from '@angular/core'
import { Meta, Title } from '@angular/platform-browser'
import { TranslocoService } from '@ngneat/transloco'
import { firstValueFrom, lastValueFrom } from 'rxjs'
import { IMainPage } from 'src/app/modules/main/interfaces/main-page.interface'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { MainHttpService } from 'src/app/modules/main/services/main-http.service'
import { TranslatePipe } from 'src/app/modules/shared/partials/pipes/translate.pipe'
import { environment } from 'src/environments/environment'
import { ERoutes } from '../enums/routes.enum'

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  smartBanner: any

  constructor(
    private mainHttpService: MainHttpService,
    private metaService: Meta,
    private titleService: Title,
    private translate: TranslatePipe,
    private transloco: TranslocoService
  ) {}

  setDescription(description: string) {
    if (!description) {
      return
    }
    this.metaService.updateTag({
      property: 'og:description',
      name: 'description',
      content: description,
    })
  }

  setKeywords(keywords: string) {
    if (!keywords) {
      return
    }
    this.metaService.updateTag({ name: 'keywords', content: keywords })
  }

  setPageMetadata(page: IMainPage, project: IMainProject = null) {
    this.titleService.setTitle(
      project ? project.visible_name || project.name : environment.projectTitle
    )
    if (!page) {
      return
    }
    const [description, keywords, name, title] = [
      'description',
      'keywords',
      'name',
      'title',
    ].map((key) => this.translate.transform(page, key))
    this.setDescription(description)
    this.setKeywords(keywords)
    this.setTitle(name ?? title)
    this.setCanonicalUrl()
    this.setNoIndex()
  }

  setTitle(pageTitle: string, separator = ' - ') {
    const titleArr = this.titleService.getTitle().split(separator)
    const siteName = titleArr.length === 1 ? titleArr[0] : titleArr[1]
    const title = pageTitle ? [pageTitle, siteName].join(separator) : siteName
    this.titleService.setTitle(title)
    this.metaService.updateTag({
      property: 'og:title',
      name: 'title',
      content: title,
    })
    this.metaService.updateTag({
      property: 'og:url',
      content: globalThis.location?.href,
    })
  }

  setCanonicalUrl() {
    if (!globalThis.document) {
      return
    }
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.querySelector('head').appendChild(link)
    }
    link.setAttribute('href', document.URL)
  }

  setNoIndex() {
    if (!globalThis.document) {
      return
    }
    const resultsPath = `/${ERoutes.TEST}/${
      ERoutes.TEST_HYSTORY_RESULTS.split('/')[0]
    }`
    const historyPath = `/${ERoutes.DATA}/${ERoutes.TEST_HISTORY}`
    if (
      document.URL.includes(resultsPath) ||
      document.URL.includes(historyPath) ||
      document.URL.includes(ERoutes.PAGE_NOT_FOUND)
    ) {
      this.metaService.updateTag({
        name: 'robots',
        content: 'noindex, nofollow',
      })
    } else if (environment.robotsMayIndex) {
      this.metaService.removeTag('name="robots"')
    }
  }

  async setSmartAppBanner(project: IMainProject) {
    if (!project.enable_banner_to_install_app) {
      return
    }
    const appStoreId = new RegExp(/\/id([0-9]+)/gi).exec(
      project.app_store_link
    )?.[1]
    const googlePlayId = new RegExp(/id=([a-z.]+)/gi).exec(
      project.google_play_link
    )?.[1]
    if (appStoreId) {
      this.metaService.updateTag({
        name: 'apple-itunes-app',
        content: `app-id=${appStoreId}`,
      })
    }
    if (googlePlayId) {
      this.metaService.updateTag({
        name: 'google-play-app',
        content: `app-id=${googlePlayId}`,
      })
    }
    if (!globalThis.navigator) {
      return
    }
    const SmartBanner = (await import('smart-app-banner')).default
    const closeWithoutCookies = function () {
      this.hide()
      if (typeof this.options.close === 'function') {
        return this.options.close()
      }
    }
    SmartBanner.prototype.close = closeWithoutCookies
    SmartBanner.prototype.install = closeWithoutCookies
    const translations = this.transloco.getTranslation(
      this.transloco.getActiveLang()
    )
    const options: { [key: string]: any } = {
      title: translations['banner_to_install_app.app_name'],
      author: translations['banner_to_install_app.app_author'],
      button: translations['banner_to_install_app.open_button_text'],
      store: {
        ios: translations['banner_to_install_app.on_the_app_store'],
        android: translations['banner_to_install_app.in_google_play'],
      },
      price: {
        ios: translations['banner_to_install_app.ios_price'],
        android: translations['banner_to_install_app.android_price'],
      },
      theme: 'nettest',
    }
    const icon = await lastValueFrom(
      this.mainHttpService.getAssetByName(
        `appicon.${environment.cms.projectSlug}.png`
      )
    )
    if (icon) {
      options.icon = icon.url
    }
    this.smartBanner = new SmartBanner(options)
  }
}
