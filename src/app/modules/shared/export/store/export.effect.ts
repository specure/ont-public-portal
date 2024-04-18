import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Injectable, OnDestroy } from '@angular/core'
import { lastValueFrom, of } from 'rxjs'
import { Action, Store } from '@ngrx/store'
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import {
  clearExportQueue,
  enqueExport,
  enqueExportEnd,
  initExportQueue,
  setLimitReached,
  updateExportQueue,
  updateExportQueueEnd,
} from './export.action'
import { getExportState } from './export.reducer'
import { ExportSnackbarComponent } from '../components/export-snackbar/export-snackbar.component'
import { OpenDataService } from '../services/open-data.service'
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar'
import { IAppState } from 'src/app/store'
import { loadingError } from 'src/app/store/common/common.action'
import { IExportedReport } from '../interfaces/exported-report.interface'

const EXPORT_QUEUE_UPDATE_INTERVAL = 2_000

@Injectable()
export class ExportEffects implements OnDestroy {
  initExportQueue$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<Action>(initExportQueue),
        tap(() => {
          this.handleLeftovers().then()
        })
      ),
    { dispatch: false }
  )

  private handleLeftovers = async () => {
    try {
      const reports = await this.dataService.updateExportQueue()
      if (!reports.length) {
        clearInterval(this.updateQueueInterval)
      }
      this.store.dispatch(updateExportQueue({ reports }))
    } catch (e) {
      console.error(e)
    }
  }

  enqueExport$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & { date: string }>(enqueExport.type),
      withLatestFrom(
        this.store.select(getExportState).pipe(map((s) => s.exportedReports))
      ),
      switchMap(([{ date }, exportedReports]) => {
        clearInterval(this.updateQueueInterval)
        this.updateQueueInterval = setInterval(
          this.handleLeftovers.bind(this),
          EXPORT_QUEUE_UPDATE_INTERVAL
        )
        if (exportedReports && Object.keys(exportedReports).length >= 5) {
          this.store.dispatch(setLimitReached({ limitReached: true }))
          return of(enqueExportEnd({ report: null }))
        }
        return this.dataService.export(date).pipe(
          map((report) => {
            this.openSnackBar(date)
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

  private openSnackBar = (date: string | null) => {
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
  }

  updateExportQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & { reports: IExportedReport[] }>(updateExportQueue.type),
      map(({ reports }) => {
        if (reports.length && !this.snackBarRef) {
          this.store.dispatch(
            clearExportQueue({ reportIds: reports.map((r) => r.id) })
          )
        }
        return updateExportQueueEnd({ reports })
      })
    )
  )

  clearExportQueue$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<Action & { reportIds: string[] }>(clearExportQueue.type),
        switchMap(({ reportIds }) => {
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

  private snackBarRef: MatSnackBarRef<ExportSnackbarComponent>
  private updateQueueInterval: ReturnType<typeof setInterval>

  constructor(
    private actions$: Actions,
    private dataService: OpenDataService,
    private snackbar: MatSnackBar,
    private store: Store<IAppState>
  ) {}

  ngOnDestroy(): void {
    clearInterval(this.updateQueueInterval)
  }
}
