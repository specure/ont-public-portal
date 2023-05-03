import { Action, Store } from '@ngrx/store'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import { Injectable } from '@angular/core'
import { of } from 'rxjs'

import { IAppState } from '..'
import { loading, loadingError } from '../common/common.action'
import { loadPage } from '../main/main.action'
import { TestService } from 'src/app/modules/main/modules/test/services/test.service'
import {
  visualReset,
  visualResult,
  visualResultEnd,
  visualSuccess,
} from './test.action'
import { Router } from '@angular/router'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { TranslocoService } from '@ngneat/transloco'
import { getTestState } from './test.reducer'
import { TestVisualizationStateFinalResult } from 'src/app/modules/main/modules/test/classes/test-visualization-state-final-result.class'

@Injectable()
export class TestEffects {
  visualSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<Action & any>(visualSuccess.type),
        tap((action) => {
          this.router.navigate(
            action?.result?.testUUID
              ? [
                  this.transloco.getActiveLang(),
                  ERoutes.TEST,
                  ERoutes.TEST_HYSTORY_RESULTS.split('/')[0],
                  action.result.testUUID,
                ]
              : [ERoutes.TEST]
          )
        })
      ),
    { dispatch: false }
  )

  visualReset$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<Action & { route: string }>(visualReset.type),
        tap(({ route }) => this.store.dispatch(loadPage({ route })))
      ),
    { dispatch: false }
  )

  visualResult$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & { id: string; route: string }>(visualResult.type),
      tap(() => this.store.dispatch(loading())),
      withLatestFrom(this.store.select(getTestState)),
      switchMap(([{ id, route }, state]) => {
        return this.http.getTestResults(id).pipe(
          map((data) => {
            TestVisualizationStateFinalResult.from(
              state.visualization,
              data
            ).then((visualization) => {
              this.store.dispatch(visualResultEnd({ data, visualization }))
            })
            return loadPage({ route })
          }),
          catchError((error) => {
            this.router.navigate([ERoutes.TEST])
            return of(loadingError({ error }))
          })
        )
      })
    )
  )

  constructor(
    private actions$: Actions,
    private http: TestService,
    private router: Router,
    private store: Store<IAppState>,
    private transloco: TranslocoService
  ) {}
}
