import { ActivatedRouteSnapshot, Router } from '@angular/router'
import { Injectable } from '@angular/core'
import { TranslocoService } from '@ngneat/transloco'
import { ERoutes } from '../enums/routes.enum'
import * as Sentry from '@sentry/angular-ivy'

@Injectable({ providedIn: 'root' })
export class RedirectResolver {
  constructor(private router: Router, private transloco: TranslocoService) {}
  resolve(route: ActivatedRouteSnapshot) {
    const { redirectTo } = route.data
    const activeLang = this.transloco.getActiveLang()
    if (redirectTo) {
      if (redirectTo === ERoutes.PAGE_NOT_FOUND) {
        Sentry.captureMessage(
          `Requested non-existent page at ${globalThis.document?.URL}`
        )
      }
      return this.router.navigateByUrl(`/${activeLang}/${redirectTo}`)
    }
    return this.router.navigate([activeLang])
  }
}
