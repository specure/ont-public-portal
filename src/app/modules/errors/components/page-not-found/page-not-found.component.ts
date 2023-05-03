import { Component } from '@angular/core'
import { Observable } from 'rxjs'
import { IMainAsset } from 'src/app/modules/main/interfaces/main-asset.interface'
import { MainHttpService } from 'src/app/modules/main/services/main-http.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'nt-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent {
  image$: Observable<IMainAsset> = this.mainHttp.getAssetByName(
    `page-not-found.${environment.cms.projectSlug}.svg`
  )

  constructor(
    private mainHttp: MainHttpService
  ) { }
}
