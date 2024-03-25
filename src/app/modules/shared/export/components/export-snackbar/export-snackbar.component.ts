import { Component, Inject } from '@angular/core'
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar'
import { Store } from '@ngrx/store'
import { map, pluck } from 'rxjs/operators'
import { IAppState } from '../../../../../store/index'
import { clearExportQueue, setLimitReached } from '../../store/export.action'
import { EExportStatus } from '../../../../shared/export/enums/export-status.enum'
import { IExportedReport } from '../../../../shared/export/interfaces/exported-report.interface'
import { OpenDataService } from '../../../../shared/export/services/open-data.service'
import { getExportState } from '../../store/export.reducer'
import { saveAs } from 'file-saver-es'
import { TranslocoService } from '@ngneat/transloco'
import { Observable } from 'rxjs'

@Component({
  selector: 'nt-export-snackbar',
  templateUrl: './export-snackbar.component.html',
  styleUrls: ['./export-snackbar.component.scss'],
})
export class ExportSnackbarComponent {
  reports$ = this.store
    .select(getExportState)
    .pipe(
      map((s) =>
        s.exportedReports ? Object.values(s.exportedReports).reverse() : []
      )
    )
  limitReached$ = this.store
    .select(getExportState)
    .pipe(pluck('exportLimitReached'))
  downloadedReports: string[] = []

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data,
    private ref: MatSnackBarRef<any>,
    private store: Store<IAppState>,
    private dataService: OpenDataService,
    private transloco: TranslocoService
  ) {}

  close(report: IExportedReport, total: number) {
    this.store.dispatch(setLimitReached({ limitReached: false }))
    if (report?.id) {
      this.store.dispatch(clearExportQueue({ reportIds: [report.id] }))
    }
    if (total <= 1) {
      this.ref.dismiss()
    }
  }

  download(report: IExportedReport, total: number) {
    this.downloadedReports.push(report.id)
    this.dataService.downloadData(report).subscribe((res) => {
      saveAs(res.body, report.name)
      this.downloadedReports.splice(
        this.downloadedReports.indexOf(report.id),
        1
      )
      this.close(report, total)
    })
  }

  error(report: IExportedReport) {
    return report.exportStatus === EExportStatus.ERROR
  }

  preparing(report: IExportedReport) {
    return report.exportStatus === EExportStatus.IN_PROGRESS
  }

  ready(report: IExportedReport) {
    return report.exportStatus === EExportStatus.COMPLETED
  }

  getSnackbarStatus(exportStatus?: EExportStatus): Observable<string> {
    return this.transloco.selectTranslate(
      `opendata.${this.data.format}.snakbar_${exportStatus.toLocaleLowerCase()}`
    )
  }
}
