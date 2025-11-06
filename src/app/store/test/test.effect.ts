import { Action, Store } from '@ngrx/store'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import { Injectable } from '@angular/core'
import { forkJoin, lastValueFrom, of } from 'rxjs'

import { IAppState } from '..'
import { loading, loadingError } from '../common/common.action'
import { loadPage, setMeasurementServer } from '../main/main.action'
import { TestService } from 'src/app/modules/main/modules/test/services/test.service'
import {
  handleServerError,
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
import { HttpErrorResponse } from '@angular/common/http'
import { getMainState } from '../main/main.reducer'
import { MainSnackbarComponent } from 'src/app/modules/main/components/main-snackbar/main-snackbar.component'
import { MatSnackBar } from '@angular/material/snack-bar'

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
        return forkJoin([
          this.testService.getTestResults(id),
          this.testService.getSpeedCurve(id),
        ]).pipe(
          map(([data, speedCurve]) => {
            const visualization =
              TestVisualizationStateFinalResult.withSpeedCurve(
                state.visualization,
                data,
                speedCurve
              )
            this.store.dispatch(visualResultEnd({ data, visualization }))
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

  handleServerError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<Action & { error: HttpErrorResponse }>(handleServerError.type),
        withLatestFrom(
          this.store.select(getTestState),
          this.store.select(getMainState)
        ),
        tap(([action, state, mainState]) => {
          const nextServer = mainState.availableServers.find(
            (server) => !state.triedServersIds.has(server.id)
          )
          if (nextServer && state.measurementRetries) {
            this.store.dispatch(setMeasurementServer({ server: nextServer }))
            this.snackbar.openFromComponent(MainSnackbarComponent, {
              panelClass: 'nt-main-snackbar',
              data: {
                message: 'test.snackbar.switching_servers',
              },
              duration: 3000,
            })
            setTimeout(() => {
              lastValueFrom(this.testService.launchTest()).then()
            }, 300)
          } else {
            this.store.dispatch(loadingError({ error: action.error }))
            this.router.navigate([this.transloco.getActiveLang(), ERoutes.TEST])
          }
        })
      ),
    { dispatch: false }
  )

  constructor(
    private actions$: Actions,
    private testService: TestService,
    private router: Router,
    private snackbar: MatSnackBar,
    private store: Store<IAppState>,
    private transloco: TranslocoService
  ) {}
}
