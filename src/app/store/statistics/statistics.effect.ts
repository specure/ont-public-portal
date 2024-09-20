import { Action, Store } from '@ngrx/store'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { catchError, map, switchMap, tap } from 'rxjs/operators'
import { HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { forkJoin, of } from 'rxjs'

import { IAppState } from '..'
import { loading, loadingError, loadingSuccess } from '../common/common.action'
import { loadMenus, loadPage } from '../main/main.action'
import {
  loadMunicipality,
  loadMunicipalityEnd,
  loadNationalTable,
  loadNationalTableEnd,
  loadStatistics,
  loadStatisticsEnd,
} from './statistics.action'
import { StatisticsService } from 'src/app/modules/main/modules/data/services/statistics.service'
import { MainHttpService } from 'src/app/modules/main/services/main-http.service'
import { SeoService } from 'src/app/core/services/seo.service'
import { Router } from '@angular/router'
import { TranslocoService } from '@ngneat/transloco'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'

@Injectable()
export class StatisticsEffects {
  loadNationalTable$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & { filters: { [param: string]: string } }>(
        loadNationalTable.type
      ),
      tap(() => this.store.dispatch(loading())),
      switchMap(({ filters }) => {
        return this.http.getNationalTable(filters).pipe(
          map((nationalTable) => {
            this.store.dispatch(loadNationalTableEnd({ nationalTable }))
            return loadingSuccess()
          }),
          catchError((error: HttpErrorResponse) => {
            this.store.dispatch(loadNationalTableEnd({ nationalTable: null }))
            return of(loadingError({ error }))
          })
        )
      })
    )
  )

  loadStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & { route: string }>(loadStatistics.type),
      tap(({ route }) =>
        route
          ? this.store.dispatch(loadPage({ route }))
          : this.store.dispatch(loading())
      ),
      switchMap(() => this.mainHttp.getOrDownloadProject()),
      switchMap((project) => {
        return forkJoin([
          this.http.getNationalTable(),
          this.mainHttp.getMunicipalities(),
        ]).pipe(
          map(([nationalTable, municipalities]) => {
            this.store.dispatch(
              loadStatisticsEnd({ nationalTable, municipalities })
            )
            return loadingSuccess()
          }),
          catchError((error: HttpErrorResponse) => {
            this.store.dispatch(
              loadStatisticsEnd({ nationalTable: null, municipalities: null })
            )
            return of(loadingError({ error }))
          })
        )
      })
    )
  )

  loadMunicipality$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & { name: string }>(loadMunicipality.type),
      tap(() => this.store.dispatch(loading())),
      switchMap(({ name }) =>
        forkJoin([of(name), this.mainHttp.getOrDownloadProject()])
      ),
      switchMap(([name, project]) => {
        return this.mainHttp.getMunicipality(name).pipe(
          map((municipality) => {
            this.seoService.setPageMetadata(municipality, project)
            this.store.dispatch(
              loadNationalTable({
                filters: {
                  code: municipality.code,
                },
              })
            )
            this.store.dispatch(loadMunicipalityEnd({ municipality }))
            return loadingSuccess()
          }),
          catchError((error: HttpErrorResponse) => {
            this.seoService.setPageMetadata(null, project)
            this.store.dispatch(loadMunicipalityEnd({ municipality: null }))
            if (error?.status === 404) {
              this.router.navigate([
                this.transloco.getActiveLang(),
                ERoutes.PAGE_NOT_FOUND,
              ])
              return of(loadingError({ error: null }))
            }
            return of(loadingError({ error }))
          })
        )
      }),
      tap(() => this.store.dispatch(loadMenus()))
    )
  )

  constructor(
    private actions$: Actions,
    private http: StatisticsService,
    private mainHttp: MainHttpService,
    private router: Router,
    private seoService: SeoService,
    private store: Store<IAppState>,
    private transloco: TranslocoService
  ) {}
}
