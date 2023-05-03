import { Injectable } from '@angular/core'
import { TranslocoService } from '@ngneat/transloco'
import { map, startWith } from 'rxjs/operators'
import { MainHttpService } from 'src/app/modules/main/services/main-http.service'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  logoHeader$ = this.mainHttpService
    .getAssetByName(
      `logo-header.${
        environment.cms.projectSlug
      }.${this.transloco.getActiveLang()}.svg`
    )
    .pipe(
      startWith({ url: environment.logo.header }),
      map((asset) => asset?.url ?? environment.logo.header)
    )
  logoHeaderSide$ = this.mainHttpService
    .getAssetByName(
      `logo-header-side.${
        environment.cms.projectSlug
      }.${this.transloco.getActiveLang()}.svg`
    )
    .pipe(
      startWith({ url: environment.logo.headerSide }),
      map((asset) => asset?.url ?? environment.logo.headerSide)
    )
  logoFooter$ = this.mainHttpService
    .getAssetByName(
      `logo-footer.${
        environment.cms.projectSlug
      }.${this.transloco.getActiveLang()}.svg`
    )
    .pipe(
      startWith({ url: environment.logo.footer }),
      map((asset) => asset?.url ?? environment.logo.footer)
    )
  logoMap$ = this.mainHttpService
    .getAssetByName(
      `logo-map.${
        environment.cms.projectSlug
      }.${this.transloco.getActiveLang()}.svg`
    )
    .pipe(
      startWith({ url: environment.logo.map ?? environment.logo.header }),
      map((asset) => asset?.url ?? environment.logo.map)
    )
  defaultMunicipalityBanner$ = this.mainHttpService
    .getAssetByName(
      `default-municipality-banner.${environment.cms.projectSlug}.jpg`
    )
    .pipe(
      startWith({
        url: `${environment.cms.routes.images}/default-municipality-banner.jpg`,
      }),
      map(
        (asset) =>
          asset?.url ??
          `${environment.cms.routes.images}/default-municipality-banner.jpg`
      )
    )
  defaultArticleCover$ = this.mainHttpService
    .getAssetByName(`default-article-cover.${environment.cms.projectSlug}.jpg`)
    .pipe(
      startWith({
        url: `${environment.cms.routes.images}/default-article-cover.jpg`,
      }),
      map(
        (asset) =>
          asset?.url ??
          `${environment.cms.routes.images}/default-article-cover.jpg`
      )
    )

  constructor(
    private mainHttpService: MainHttpService,
    private transloco: TranslocoService
  ) {}

  getFullImageUrl(url: string) {
    return `${environment.cms.url}${url}`
  }
}
