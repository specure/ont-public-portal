import { Injectable } from '@angular/core'
import { NavigationEnd } from '@angular/router'
import { PageUrlProvider } from 'ngx-matomo-client'
import { Observable, of } from 'rxjs'
import { ERoutes } from '../enums/routes.enum'

@Injectable()
export class MatomoUrlProviderService implements PageUrlProvider {
  getCurrentPageUrl(event: NavigationEnd): Observable<string> {
    const urlParts = event.urlAfterRedirects.split('/')
    const resUrlWithoutId = ERoutes.TEST_HYSTORY_RESULTS.replace('/:id', '')
    let resUrl = event.urlAfterRedirects
    if (urlParts[urlParts.length - 2] === resUrlWithoutId) {
      resUrl = urlParts.slice(0, -1).join('/')
    }
    return of(resUrl)
  }
}
