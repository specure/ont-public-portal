import { Injectable, OnDestroy } from '@angular/core'
import { IBasicResponse } from 'src/app/core/interfaces/basic-response.interface'
import { IPaginator } from 'src/app/core/interfaces/paginator.interface'
import { ISort } from 'src/app/core/interfaces/sort.interface'
import { IHistoryTableItem } from '../../../interfaces/history-table.interface'
import { firstValueFrom, from, Observable, of, switchMap } from 'rxjs'
import { environment } from 'src/environments/environment'
import { BasicHttpParams } from 'src/app/core/classes/basic-http-params.class'
import { ITestResult } from '../interfaces/test-result.interface'
import { ISpeedCurveResponse } from '../interfaces/speed-curve-item.interface'
import { HttpClient } from '@angular/common/http'
import { IdbService } from 'src/app/core/services/idb.service'
import { TestState } from 'src/app/store/test/test.reducer'
import { Store } from '@ngrx/store'
import {
  storeUuidInMemory,
  storeUuidOnDisk,
} from 'src/app/store/history/history.action'
import { NTCookieService } from '@nettest/cookie-widget'
import { getHistoryState } from 'src/app/store/history/history.reducer'
import { getMainState } from 'src/app/store/main/main.reducer'
import { HistoryTableItem } from '../classes/history-table-item.class'
import { TestResult } from '../classes/test-result.class'
import { LocalResultsSort } from '../classes/local-results-sort.class'

const LOCAL_DB_NAME = 'NettestDB'
const LOCAL_STORE_NAME = 'TestResults'

@Injectable({
  providedIn: 'root',
})
export class TestRepoService implements OnDestroy {
  private db: IDBDatabase

  private get headers() {
    return environment.controlServer.headers
  }

  private get localStoreName() {
    return `${LOCAL_STORE_NAME}_${environment.cms.projectSlug.toUpperCase()}`
  }

  constructor(
    private readonly http: HttpClient,
    private readonly idbService: IdbService,
    private readonly store: Store
  ) {
    this.idbService
      .connect(LOCAL_DB_NAME, this.localStoreName, { keyPath: 'test_uuid' })
      .then((db) => {
        this.db = db
      })
  }

  ngOnDestroy(): void {
    this.idbService.dispose(this.db)
  }

  getHistoryList(
    paginator: IPaginator,
    sort: ISort,
    uuid: string
  ): Observable<IBasicResponse<IHistoryTableItem>> {
    return from(
      this.idbService.getList<ITestResult>(
        this.db,
        this.localStoreName,
        paginator,
        new LocalResultsSort(sort),
        (item) =>
          item.client_uuid === uuid &&
          !!item.test_speed_download &&
          !!item.test_speed_upload &&
          !!item.ping_median
      )
    ).pipe(
      switchMap(({ data, total }) => {
        if (data?.length > 0) {
          return of({
            totalElements: total,
            content: data.map(HistoryTableItem.fromLocalHistoryItem),
          } as IBasicResponse<IHistoryTableItem>)
        }
        return this.http.get<IBasicResponse<IHistoryTableItem>>(
          `${environment.controlServer.url}${environment.controlServer.routes.history}`,
          {
            params: new BasicHttpParams(paginator, sort, { uuid }),
            headers: this.headers,
          }
        )
      })
    )
  }

  getTestResult(id: string): Observable<ITestResult> {
    return from(
      this.idbService.getData<ITestResult>(this.db, this.localStoreName, id)
    ).pipe(
      switchMap((localResult) => {
        if (localResult) {
          return of(localResult)
        }
        return this.http.get<ITestResult>(
          `${environment.controlServer.url}${environment.controlServer.routes.result}/${id}`,
          { headers: this.headers }
        )
      })
    )
  }

  getSpeedCurve(id: string): Observable<ISpeedCurveResponse> {
    return from(
      this.idbService.getData<ITestResult>(this.db, this.localStoreName, id)
    ).pipe(
      switchMap((localResult) => {
        if (localResult?.speed_curve) {
          return of(null)
        }
        return this.http.get<ISpeedCurveResponse>(
          `${environment.controlServer.url}${environment.controlServer.routes.speedCurve}/${id}`,
          { headers: this.headers }
        )
      })
    )
  }

  async saveResult(testState: TestState) {
    const result: Partial<ITestResult> = TestResult.fromTestState(testState)
    await this.idbService.putData(this.db, this.localStoreName, result)
  }

  async setHistoryPermission() {
    const { uuid } = await firstValueFrom(this.store.select(getHistoryState))
    const { project } = await firstValueFrom(this.store.select(getMainState))
    if (!project?.enable_cookie_widget) {
      this.store.dispatch(storeUuidInMemory({ uuid }))
      return true
    }
    let isAccepted = false
    if (globalThis.document) {
      isAccepted = await NTCookieService.I.isCookieAccepted('functional')
    }
    if (!isAccepted) {
      this.store.dispatch(storeUuidInMemory({ uuid }))
    } else {
      this.store.dispatch(storeUuidOnDisk({ uuid }))
    }
    return isAccepted
  }

  async clearHistory() {
    await this.idbService.clearStore(this.db, this.localStoreName)
  }
}
