import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router'
import { TranslocoService } from '@ngneat/transloco'
import { Observable } from 'rxjs'
import { ERoutes } from '../enums/routes.enum'
import * as Sentry from '@sentry/angular'

@Injectable({
  providedIn: 'root',
})
export class LanguageAvailableGuard {
  constructor(private router: Router, private transloco: TranslocoService) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const requestedLang = next.paramMap.get('lang')
    if (
      (this.transloco.getAvailableLangs() as string[]).includes(requestedLang)
    ) {
      return true
    }
    Sentry.captureMessage(`Requested non-existent page at ${document.URL}`)
    this.router.navigate([
      this.transloco.getDefaultLang(),
      ERoutes.PAGE_NOT_FOUND,
    ])
    return false
  }
}
