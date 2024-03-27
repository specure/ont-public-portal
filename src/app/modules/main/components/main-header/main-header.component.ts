import { Component, Input } from '@angular/core'
import { getMainState } from 'src/app/store/main/main.reducer'
import { IAppState } from 'src/app/store'
import { map } from 'rxjs/operators'
import { Store, select } from '@ngrx/store'

import { IMainProject } from '../../interfaces/main-project.interface'
import { TranslatePipe } from 'src/app/modules/shared/partials/pipes/translate.pipe'
import { MatSidenav } from '@angular/material/sidenav'
import { EMenuFlavors } from '../../enums/menu-flavors.enum'
import { IMainMenu } from '../../interfaces/main-menu.interface'
import { ConfigService } from 'src/app/core/services/config.service'
import { environment } from 'src/environments/environment'
import { TranslocoService } from '@ngneat/transloco'
import { ERoutes } from 'src/app/core/enums/routes.enum'

@Component({
  selector: 'nt-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
})
export class MainHeaderComponent {
  @Input() sidenav?: MatSidenav

  logoPath$ = this.config.logoHeader$
  logoSidePath$ = this.config.logoHeaderSide$
  logoAlt = environment.projectTitle
  logoLink = `/${this.transloco.getActiveLang()}/${ERoutes.TEST}`
  menuFlavors = EMenuFlavors
  menu$ = this.store.pipe(
    select(getMainState),
    map((s) => (s && s.headerMenu ? this.addHeaderClass(s.headerMenu) : []))
  )
  flavor$ = this.store.pipe(
    select(getMainState),
    map((s) => s?.headerMenu?.flavor ?? null)
  )
  project$ = this.store.pipe(
    select(getMainState),
    map((s) => s.project)
  )

  constructor(
    private config: ConfigService,
    private store: Store<IAppState>,
    private translate: TranslatePipe,
    private transloco: TranslocoService
  ) {}

  getProjectName(project: IMainProject): string {
    const key = project.visible_name ? 'visible_name' : 'name'
    return this.translate.transform(project, key)
  }

  private addHeaderClass(menu: IMainMenu) {
    return (
      menu?.menu_items &&
      menu?.menu_items.map((mi) => ({
        ...mi,
        className: `${mi.className} nt-menu__item--header`,
      }))
    )
  }
}
