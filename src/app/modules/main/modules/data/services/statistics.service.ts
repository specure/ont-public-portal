import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ESpeedUnits } from 'src/app/core/enums/speed-units.enum'
import { convertBytes } from 'src/app/core/helpers/convert-bytes'
import { convertMs } from 'src/app/core/helpers/convert-ms'
import { extend } from 'src/app/core/helpers/extend'
import { ITableColumn } from 'src/app/modules/shared/tables/interfaces/table-column.interface'
import { environment } from 'src/environments/environment'
import { INationalTable } from '../interfaces/national-table.interface'
import { IProviderStats } from '../interfaces/provider-stats.interface'

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  get apiUrl() {
    return environment.controlServer.url
  }

  constructor(private http: HttpClient) {}

  buildSubHeader(
    column: ITableColumn<IProviderStats>,
    nationalTable: INationalTable
  ) {
    let subHeader = ''
    if (!nationalTable && column.columnDef !== 'providerName') {
      subHeader = '-'
    } else {
      switch (column.columnDef) {
        case 'providerName':
          subHeader = 'statistics.table.all'
          break
        case 'download':
          subHeader = convertBytes(nationalTable.averageDownload as number)
            .to(ESpeedUnits.MBPS)
            .toLocaleString()
          break
        case 'upload':
          subHeader = convertBytes(nationalTable.averageUpload as number)
            .to(ESpeedUnits.MBPS)
            .toLocaleString()
          break
        case 'latency':
          subHeader = convertMs(
            nationalTable.averageLatency as number
          ).toLocaleString()
          break
        case 'measurements':
          subHeader = nationalTable.allMeasurements.toLocaleString()
          break
      }
    }
    return extend<ITableColumn<IProviderStats>>(column, {
      subHeader,
      columnDef: `${column.columnDef}--subHeader`,
    })
  }

  getNationalTable(filters?: { [param: string]: string }) {
    return this.http.get<INationalTable>(
      `${environment.mapServer.url}/national-table`,
      {
        headers: environment.controlServer.headers,
        params: { country: environment.mapServer.country, ...filters },
      }
    )
  }
}
