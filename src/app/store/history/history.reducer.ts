import { Action, createReducer, on } from '@ngrx/store'

import { ERoutes } from '../../core/enums/routes.enum'
import { IAppState } from '..'
import { IBasicResponse } from 'src/app/core/interfaces/basic-response.interface'
import { IHistoryTableItem } from 'src/app/modules/main/interfaces/history-table.interface'
import { IPaginator } from 'src/app/core/interfaces/paginator.interface'
import { ISort } from 'src/app/core/interfaces/sort.interface'
import { ITestResult } from '../../modules/main/modules/test/interfaces/test-result.interface'
import {
  loadHistory,
  loadHistoryEnd,
  storeUuidInMemory,
  storeUuidOnDisk,
} from './history.action'
import { Paginator } from 'src/app/core/classes/paginator.class'
import {
  Sort,
  DEFAULT_ACTIVE,
  DEFAULT_DIRECTION,
} from 'src/app/core/classes/sort.class'
import { v4 as uuidv4 } from 'uuid'

export const TEST_COOKIE = 'RMBTuuid'

export class HistoryState {
  paginator: IPaginator = Paginator.fromSearchParams(ERoutes.TEST_HISTORY)
  history: IBasicResponse<IHistoryTableItem>
  current: ITestResult
  sort: ISort = Sort.fromSearchParams(
    DEFAULT_ACTIVE,
    DEFAULT_DIRECTION,
    ERoutes.TEST_HISTORY
  )
  uuid: string = globalThis?.localStorage?.getItem(TEST_COOKIE) ?? uuidv4()
  isHistoryAllowed: boolean = false
}

export const historyReducer = createReducer(
  new HistoryState(),
  on(
    loadHistory,
    (state, { request }): HistoryState => ({
      ...state,
      paginator: (request && request.paginator) || state.paginator,
      sort: (request && request.sort) || state.sort,
    })
  ),
  on(loadHistoryEnd, (state, history): HistoryState => ({ ...state, history })),
  on(storeUuidInMemory, (state, { uuid }) => {
    globalThis?.localStorage?.removeItem(TEST_COOKIE)
    return { ...state, uuid, isHistoryAllowed: false }
  }),
  on(storeUuidOnDisk, (state, { uuid }) => {
    globalThis?.localStorage?.setItem(TEST_COOKIE, uuid)
    return { ...state, uuid, isHistoryAllowed: true }
  })
)

export const getHistoryState = (state: IAppState) => state.history
