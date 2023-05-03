import { createAction, props } from '@ngrx/store'

import { IBasicRequest } from 'src/app/core/interfaces/basic-request.interface'
import { IBasicResponse } from 'src/app/core/interfaces/basic-response.interface'
import { IHistoryTableItem } from 'src/app/modules/main/interfaces/history-table.interface'

export const loadHistory = createAction(
  '[HISTORY] Loading history...',
  props<{ request: IBasicRequest; route: string }>()
)
export const loadHistoryEnd = createAction(
  '[HISTORY] Loading history [END]',
  props<IBasicResponse<IHistoryTableItem>>()
)
export const storeUuidInMemory = createAction(
  '[MAIN] Storing UUID in memory',
  props<{ uuid: string }>()
)
export const storeUuidOnDisk = createAction(
  '[MAIN] Storing UUID on disk',
  props<{ uuid: string }>()
)
