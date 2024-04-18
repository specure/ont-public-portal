import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { environment } from '../../../../../environments/environment'
import { IExportedReport } from '../interfaces/exported-report.interface'
import { first, map, switchMap } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import { getHistoryState } from 'src/app/store/history/history.reducer'
import { lastValueFrom } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class OpenDataService {
  private uuid$ = this.store.select(getHistoryState).pipe(
    map((s) => s.uuid),
    first()
  )

  private get exportHost() {
    return `${environment.controlServer.url}${environment.cms.routes.export}`
  }

  constructor(private http: HttpClient, private store: Store<IAppState>) {}

  clearExportQueue(reportId: string) {
    return this.uuid$.pipe(
      switchMap((uuid) =>
        this.http.delete(
          `${this.exportHost}${environment.cms.routes.clearExport}/${reportId}/${uuid}`,
          {
            headers: environment.controlServer.headers,
          }
        )
      )
    )
  }

  downloadData(report: IExportedReport) {
    return this.http.get(report.url, {
      responseType: 'blob',
      observe: 'response',
    })
  }

  export(date?: string) {
    return this.uuid$.pipe(
      switchMap((uuid) => {
        const fromObject: { [k: string]: string } = {
          digitalSeparator:
            this.getDecimalSeparator() === '.' ? 'DOT' : 'COMMA',
          listSeparator: ';',
          uuid,
        }
        const url = date
          ? `${this.exportHost}${environment.cms.routes.scheduleExport}/${date}/csv`
          : `${this.exportHost}${environment.cms.routes.scheduleExport}/csv`

        return this.http.get<IExportedReport>(url, {
          headers: environment.controlServer.headers,
          params: new HttpParams({ fromObject }),
        })
      }),
      map((report) => ({ ...report, name: this.getReportName(date) }))
    )
  }

  async updateExportQueue() {
    const uuid = await lastValueFrom(this.uuid$)
    const p: { dataStreamResponses: IExportedReport[] } = await (
      await fetch(
        `${this.exportHost}${environment.cms.routes.exportQueue}/${uuid}`,
        {
          headers: environment.controlServer.headers,
        }
      )
    ).json()
    return p.dataStreamResponses
  }

  private getDecimalSeparator() {
    return (1.1).toLocaleString().substring(1, 2)
  }

  private getReportName(date?: string) {
    if (date) {
      return `Open Data - Monthly Export - ${date}.csv`
    }
    return `Open Data - Full Export.csv`
  }
}
