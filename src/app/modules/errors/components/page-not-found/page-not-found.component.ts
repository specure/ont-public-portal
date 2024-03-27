import { Component, OnInit } from '@angular/core'
import { TranslocoService } from '@ngneat/transloco'
import { Observable } from 'rxjs'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { IMainAsset } from 'src/app/modules/main/interfaces/main-asset.interface'
import { MainHttpService } from 'src/app/modules/main/services/main-http.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'nt-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
})
export class PageNotFoundComponent implements OnInit {
  image$: Observable<IMainAsset> = this.mainHttp.getAssetByName(
    `page-not-found.${environment.cms.projectSlug}.svg`
  )
  homeLink = `/${this.transloco.getActiveLang()}/${ERoutes.TEST}`

  constructor(
    private mainHttp: MainHttpService,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    if (
      globalThis.document &&
      environment.cms.projectSlug == 'nt' &&
      !document.referrer
    ) {
      location.replace(`${location.href}?e=404`)
    }
  }
}
