import { Component } from '@angular/core'
import { combineLatest, Observable } from 'rxjs'
import { IMainMenuItem } from '../../interfaces/main-menu-item.interface'
import { Store, select } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import { getMainState, MainState } from 'src/app/store/main/main.reducer'
import { map } from 'rxjs/operators'
import { IMainProject } from '../../interfaces/main-project.interface'
import { TranslocoService } from '@ngneat/transloco'
import { EMenuFlavors } from '../../enums/menu-flavors.enum'
import { ConfigService } from 'src/app/core/services/config.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'nt-main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.scss'],
})
export class MainFooterComponent {
  cookieWidgetOpener =
    'onclick="window.NTCookieService.isDialogOpen = true; return false;"'
  logoPath$ = this.config.logoFooter$
  logoAlt = environment.projectTitle
  menuFlavors = EMenuFlavors
  menu$: Observable<IMainMenuItem[]> = combineLatest([
    this.store.pipe(select(getMainState)),
    this.transloco.selectTranslate('footer.menu.cookie_settings'),
  ]).pipe(
    map(([s, label]) => {
      this.project = s.project
      return this.addFooterClass(this.addCookieWidgetLink(s, label))
    })
  )
  flavor$ = this.store.pipe(
    select(getMainState),
    map((s) => (s?.footerMenu ? s.footerMenu.flavor : null))
  )
  project?: IMainProject

  constructor(
    private config: ConfigService,
    private store: Store<IAppState>,
    private transloco: TranslocoService
  ) {}

  private addCookieWidgetLink(state: MainState, cookieLabel: string) {
    let menuItems = state.footerMenu?.menu_items || []
    if (
      this.project?.enable_cookie_widget &&
      state.footerMenu?.flavor !== EMenuFlavors.RATEL
    ) {
      menuItems = [
        ...menuItems,
        {
          action: (e: MouseEvent) => {
            e.preventDefault()
            if (window.NTCookieService) {
              window.NTCookieService.isDialogOpen = true
            }
          },
          id: 'cookie-settings',
          label: cookieLabel,
          route: null,
          translations: [],
        },
      ]
    }
    return menuItems
  }

  private addFooterClass(menuItems: IMainMenuItem[]) {
    return menuItems
      ? menuItems.map((mi) => ({
          ...mi,
          className: `${mi.className} nt-menu__item--footer`,
        }))
      : menuItems
  }
}
