import { isPlatformBrowser } from '@angular/common'
import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core'
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select'
import { MatSidenav } from '@angular/material/sidenav'
import { TranslocoService } from '@ngneat/transloco'
import { Store } from '@ngrx/store'
import { Subscription } from 'rxjs'
import { filter, map, pluck, tap } from 'rxjs/operators'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { ILocale } from 'src/app/core/interfaces/locale.interface'
import { ConfigService } from 'src/app/core/services/config.service'
import { EMenuFlavors } from 'src/app/modules/main/enums/menu-flavors.enum'
import { IAppState } from 'src/app/store'
import { getMainState } from 'src/app/store/main/main.reducer'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'nt-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements AfterViewInit, OnDestroy {
  @Input() sidenav: MatSidenav

  cookieSettings = {
    action: (e: MouseEvent) => {
      if (!isPlatformBrowser(this.platformId)) {
        return
      }
      e.preventDefault()
      if (window.NTCookieService) {
        window.NTCookieService.isDialogOpen = true
      }
    },
    id: 'cookie-settings',
    label: 'Cookie settings',
    route: null,
    translations: [],
  }
  locales: ILocale[] = environment.availableLangs
  logoSidePath$ = this.config.logoHeaderSide$
  logoAlt = environment.projectTitle
  feedbackMenu$ = this.store.select(getMainState).pipe(
    pluck('feedbackMenu'),
    filter((m) => !!m?.menu_items?.length),
    map((m) => m.menu_items)
  )
  flavor$ = this.store
    .select(getMainState)
    .pipe(pluck('footerMenu'), pluck('flavor'))
  footerMenu$ = this.store.select(getMainState).pipe(
    pluck('footerMenu'),
    filter((m) => !!m?.menu_items?.length),
    map((m) => m.menu_items)
  )
  headerMenu$ = this.store.select(getMainState).pipe(
    pluck('headerMenu'),
    filter((m) => !!m?.menu_items?.length),
    map((m) => m.menu_items)
  )
  menuFlavors = EMenuFlavors
  project$ = this.store.select(getMainState).pipe(pluck('project'))
  isCookieWidgetEnabled$ = this.project$.pipe(
    map((p) => p?.enable_cookie_widget)
  )
  routes = ERoutes
  selectedLocale = this.locales.find(
    (l: ILocale) => this.transloco.getActiveLang() === l.iso
  )

  private sub: Subscription

  constructor(
    private config: ConfigService,
    private transloco: TranslocoService,
    private store: Store<IAppState>,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe()
  }

  ngAfterViewInit() {
    this.sub = this.sidenav?.openedStart
      .pipe(
        tap(() =>
          document.querySelector('.mat-drawer-inner-container').scrollTo(0, 0)
        )
      )
      .subscribe()
  }

  changeLocale(change: MatSelectChange) {
    if (!globalThis.location) {
      return
    }
    const hrefParts = globalThis.location.pathname.split('/')
    hrefParts[1] = change.value
    globalThis.open(
      `${globalThis.location.protocol}//${
        globalThis.location.host
      }${hrefParts.join('/')}${globalThis.location.search}`,
      '_self'
    )
  }

  openCookieWidget(evt: MouseEvent) {
    this.cookieSettings.action(evt)
    this.sidenav?.close()
  }
}
