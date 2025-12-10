import { Action, select, Store } from '@ngrx/store'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import { HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { of } from 'rxjs'

import { getHistoryState } from './history.reducer'
import { IAppState } from '..'
import { IBasicRequest } from 'src/app/core/interfaces/basic-request.interface'
import { loadHistory, loadHistoryEnd } from './history.action'
import { loading, loadingError, loadingSuccess } from '../common/common.action'
import { loadPage } from '../main/main.action'
import { Paginator } from 'src/app/core/classes/paginator.class'
import { Sort, DEFAULT_DIRECTION } from 'src/app/core/classes/sort.class'
import { URLService } from '../../core/services/url.service'
import { HISTORY_COLS } from 'src/app/modules/main/modules/data/components/test-history/test-history.component'
import { TestRepoService } from 'src/app/modules/main/modules/test/services/test-repo.service'

@Injectable()
export class HistoryEffects {
  loadHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & { request: IBasicRequest; route: string }>(
        loadHistory.type
      ),
      tap(({ route }) => {
        this.currentRoute = route
        this.store.dispatch(loading())
      }),
      withLatestFrom(this.store.pipe(select(getHistoryState))),
      map(([_, store]) => ({
        sort: Sort.validate(
          store.sort,
          HISTORY_COLS,
          'measurementDate',
          DEFAULT_DIRECTION
        ),
        paginator: Paginator.validate(store.paginator),
        uuid: store.uuid,
      })),
      switchMap(({ paginator, sort, uuid }) => {
        if (!uuid) {
          this.store.dispatch(loadHistoryEnd(null))
          this.loadPage()
          return of(loadingSuccess())
        }
        return this.repo.getHistoryList(paginator, sort, uuid).pipe(
          map((response) => {
            this.store.dispatch(loadHistoryEnd(response))
            this.url.toSearchParams({ ...paginator, ...sort })
            this.loadPage()
            return loadingSuccess()
          }),
          catchError((error: HttpErrorResponse) => {
            this.store.dispatch(loadHistoryEnd(null))
            return of(loadingError({ error }))
          })
        )
      })
    )
  )

  private currentRoute: string

  constructor(
    private actions$: Actions,
    private repo: TestRepoService,
    private store: Store<IAppState>,
    private url: URLService
  ) {}

  private loadPage() {
    if (this.currentRoute) {
      this.store.dispatch(loadPage({ route: this.currentRoute }))
      this.currentRoute = null
    }
  }
}
