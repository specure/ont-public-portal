import { Resolve, ActivatedRouteSnapshot } from '@angular/router'
import { Injectable } from '@angular/core'
import { IAppState } from 'src/app/store'
import { Store } from '@ngrx/store'
import { of } from 'rxjs'
import { TranslocoService } from '@ngneat/transloco'

@Injectable({ providedIn: 'root'})
export class RouteParamsResolver implements Resolve<any> {
  constructor(
    private store: Store<IAppState>,
    private transloco: TranslocoService,
  ) {}
  resolve(route: ActivatedRouteSnapshot) {
    const {action, props} = route.data
    const lang = this.transloco.getAvailableLangs().includes(route?.params?.lang) ? route?.params?.lang : this.transloco.getDefaultLang()
    if (action) {
      this.store.dispatch(action({...route.params, lang, ...(props || {})}))
    }
    return of(null)
  }
}
