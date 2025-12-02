import { Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core'
import { filter, map, tap, withLatestFrom } from 'rxjs/operators'
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs'
import { select, Store } from '@ngrx/store'
import { TranslocoService } from '@ngneat/transloco'

import { getHistoryState } from 'src/app/store/history/history.reducer'
import { IAppState } from 'src/app/store'
import { IBasicResponse } from 'src/app/core/interfaces/basic-response.interface'
import { IHistoryTableItem } from 'src/app/modules/main/interfaces/history-table.interface'
import { IPaginator } from 'src/app/core/interfaces/paginator.interface'
import { ISort } from 'src/app/core/interfaces/sort.interface'
import { ITableColumn } from 'src/app/modules/shared/tables/interfaces/table-column.interface'
import {
  loadHistory,
  storeUuidInMemory,
  storeUuidOnDisk,
} from 'src/app/store/history/history.action'
import { getMainState } from 'src/app/store/main/main.reducer'
import { TranslatePipe } from 'src/app/modules/shared/partials/pipes/translate.pipe'
import { convertBytes } from 'src/app/core/helpers/convert-bytes'
import { ESpeedUnits } from 'src/app/core/enums/speed-units.enum'
import { convertMs } from 'src/app/core/helpers/convert-ms'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { IMainProject } from 'src/app/modules/main/interfaces/main-project.interface'
import { isPlatformBrowser } from '@angular/common'
import { NTCookieService } from '@nettest/cookie-widget'

export const HISTORY_COLS: ITableColumn<IHistoryTableItem>[] = [
  {
    columnDef: 'mobileCounter',
    header: 'Test',
  },
  {
    columnDef: 'date',
    getNgClass: () => 'blue-link',
    isSortable: true,
    header: 'history.table.date',
    key: 'measurementDate',
  },
  {
    columnDef: 'time',
    header: 'history.table.time',
    key: 'measurementDate',
  },
  {
    columnDef: 'device',
    header: 'history.table.device',
    key: 'browserName',
  },
  {
    columnDef: 'operator',
    header: 'history.table.operator',
    key: 'clientProvider',
    getTooltip: (value) => value.clientProvider,
  },
  {
    columnDef: 'download',
    isSortable: true,
    header: 'history.table.download',
    justify: 'flex-end',
    transformValue: (value) =>
      convertBytes(value.download).to(ESpeedUnits.MBPS),
  },
  {
    columnDef: 'upload',
    isSortable: true,
    header: 'history.table.upload',
    justify: 'flex-end',
    transformValue: (value) => convertBytes(value.upload).to(ESpeedUnits.MBPS),
  },
  {
    columnDef: 'ping',
    isSortable: true,
    header: 'history.table.ping',
    justify: 'flex-end',
    transformValue: (value) => convertMs(value.ping),
  },
]

@Component({
    selector: 'nt-test-history',
    templateUrl: './test-history.component.html',
    styleUrls: ['./test-history.component.scss'],
    standalone: false
})
export class TestHistoryComponent implements OnDestroy {
  action = loadHistory
  columns: ITableColumn<any>[] = HISTORY_COLS.map((col) =>
    col.columnDef === 'date'
      ? {
          ...col,
          link: (val) =>
            `/${this.transloco.getActiveLang()}/${
              ERoutes.TEST
            }/${ERoutes.TEST_HYSTORY_RESULTS.replace(':id', val.openTestUuid)}`,
        }
      : col
  )
  history$: Observable<IBasicResponse<IHistoryTableItem>> = this.store.pipe(
    select(getHistoryState),
    filter((s) => !!s.history),
    map((history) => {
      this.paginator = history.paginator
      this.sort = history.sort
      return history.history
    })
  )
  isHistoryAllowed$ = new BehaviorSubject(null)
  language$ = this.store.pipe(
    select(getMainState),
    map((main) => main.lang)
  )
  paginator?: IPaginator
  project$ = this.store.select(getMainState).pipe(
    filter((s) => !!s.project),
    map((s) => {
      if (isPlatformBrowser(this.platformId)) {
        NTCookieService.I.addEventListener(
          'consentUpdated',
          this.refresh(s.project)
        )
        this.refresh(s.project)()
      }
      return s.project
    })
  )
  sort?: ISort
  title$ = this.store
    .select(getMainState)
    .pipe(map((s) => this.translate.transform(s.page, 'name')))

  constructor(
    private store: Store<IAppState>,
    private translate: TranslatePipe,
    private transloco: TranslocoService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return
    }
    NTCookieService.I.removeEventListener('consentUpdated', this.refresh)
  }

  getHeading(count: number) {
    const heading = this.transloco.translate(
      `history.table.heading-${count === 1 ? 1 : 2}`
    )
    return `${count || 0} ${heading}`
  }

  print() {
    globalThis.print?.()
  }

  private refresh = (project: IMainProject) => async () => {
    this.isHistoryAllowed$.next(null)
    const { uuid } = await firstValueFrom(this.store.select(getHistoryState))
    if (!project?.enable_cookie_widget) {
      this.store.dispatch(storeUuidInMemory({ uuid }))
      this.isHistoryAllowed$.next(true)
      return
    }
    let isAccepted = false
    if (isPlatformBrowser(this.platformId)) {
      isAccepted = await NTCookieService.I.isCookieAccepted('functional')
    }
    if (!isAccepted) {
      this.store.dispatch(storeUuidInMemory({ uuid }))
    } else {
      this.store.dispatch(storeUuidOnDisk({ uuid }))
    }
    this.isHistoryAllowed$.next(isAccepted)
  }
}
