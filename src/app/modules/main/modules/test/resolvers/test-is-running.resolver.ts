import { Injectable } from '@angular/core'
import { Router, Resolve } from '@angular/router'
import { TranslocoService } from '@ngneat/transloco'
import { Store } from '@ngrx/store'
import { Observable, map, of, tap } from 'rxjs'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { IAppState } from 'src/app/store'
import { getTestState } from 'src/app/store/test/test.reducer'

@Injectable({
  providedIn: 'root',
})
export class TestIsRunningResolver implements Resolve<boolean> {
  constructor(
    private store: Store<IAppState>,
    private router: Router,
    private transloco: TranslocoService
  ) {}

  resolve(): Observable<boolean> {
    return this.store.select(getTestState).pipe(
      map((state) => state.showProgress),
      tap((isRunning) => {
        if (!isRunning) {
          this.router.navigate([this.transloco.getActiveLang(), ERoutes.TEST])
        }
      })
    )
  }
}
