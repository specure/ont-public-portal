import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Injectable, OnDestroy } from '@angular/core'
import { interval, lastValueFrom, of, Subscription } from 'rxjs'
import { Action, Store } from '@ngrx/store'
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import {
  clearExportQueue,
  clearPreviousExportQueue,
  enqueExport,
  enqueExportEnd,
  setLimitReached,
  updateExportQueue,
  updateExportQueueEnd,
} from './export.action'
import { getExportState } from './export.reducer'
import { ExportSnackbarComponent } from '../components/export-snackbar/export-snackbar.component'
import { EExportStatus } from '../enums/export-status.enum'
import { OpenDataService } from '../services/open-data.service'
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar'
import { IAppState } from 'src/app/store'
import { loadingError } from 'src/app/store/common/common.action'

const EXPORT_QUEUE_UPDATE_INTERVAL = 1_000

@Injectable()
export class ExportEffects implements OnDestroy {
  enqueExport$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & { date: string }>(enqueExport.type),
      withLatestFrom(
        this.store.select(getExportState).pipe(map((s) => s.exportedReports))
      ),
      switchMap(([{ date }, exportedReports]) => {
        if (exportedReports && Object.keys(exportedReports).length >= 5) {
          this.store.dispatch(setLimitReached({ limitReached: true }))
          return of(enqueExportEnd({ report: null }))
        }
        return this.dataService.export(date).pipe(
          map((report) => {
            if (!this.exportSub) {
              this.exportSub = interval(EXPORT_QUEUE_UPDATE_INTERVAL).subscribe(
                () => this.store.dispatch(updateExportQueue())
              )
            }
            if (!this.snackBarRef) {
              this.snackBarRef = this.snackbar.openFromComponent(
                ExportSnackbarComponent,
                {
                  panelClass: 'nt-multisnackbar',
                  data: {
                    format: date === null ? 'full' : 'monthly',
                  },
                }
              )
              this.snackBarRef
                .afterDismissed()
                .subscribe(() => (this.snackBarRef = null))
            }
            return enqueExportEnd({ report })
          }),
          catchError((error) => {
            this.store.dispatch(loadingError({ error }))
            return of(enqueExportEnd({ report: null }))
          })
        )
      })
    )
  )

  updateExportQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action>(updateExportQueue.type),
      switchMap(() => {
        return this.dataService.updateExportQueue().pipe(
          map((reports) => {
            if (
              reports?.every(
                (r) => r.exportStatus !== EExportStatus.IN_PROGRESS
              )
            ) {
              this.exportSub?.unsubscribe()
              this.exportSub = null
            }
            return updateExportQueueEnd({ reports })
          }),
          catchError(() => {
            return of(updateExportQueueEnd({ reports: null }))
          })
        )
      })
    )
  )

  clearExportQueue$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<Action & { reportIds: string[] }>(clearExportQueue.type),
        withLatestFrom(
          this.store.select(getExportState).pipe(map((s) => s.exportedReports))
        ),
        switchMap(([{ reportIds }, exportedReports]) => {
          if (!exportedReports || Object.values(exportedReports).length <= 1) {
            this.exportSub?.unsubscribe()
            this.exportSub = null
          }
          return Promise.all(
            reportIds.map((reportId) =>
              lastValueFrom(this.dataService.clearExportQueue(reportId))
            )
          ).catch((error) => {
            this.store.dispatch(loadingError({ error }))
          })
        })
      ),
    { dispatch: false }
  )

  clearPreviousExportQueue$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<Action>(clearPreviousExportQueue),
        withLatestFrom(
          this.store.select(getExportState).pipe(map((s) => s.exportedReports))
        ),
        switchMap(([_, exportedReports]) =>
          !exportedReports ? this.dataService.updateExportQueue() : of(null)
        ),
        tap((reports) => {
          if (reports?.length) {
            this.store.dispatch(
              clearExportQueue({ reportIds: reports.map((r) => r.id) })
            )
          }
        }),
        catchError((err) => {
          console.log(err)
          return of(null)
        })
      ),
    { dispatch: false }
  )

  private exportSub: Subscription
  private snackBarRef: MatSnackBarRef<ExportSnackbarComponent>

  constructor(
    private actions$: Actions,
    private dataService: OpenDataService,
    private snackbar: MatSnackBar,
    private store: Store<IAppState>
  ) {}

  ngOnDestroy(): void {
    this.exportSub?.unsubscribe()
  }
}
