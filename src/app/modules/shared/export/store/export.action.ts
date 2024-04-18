import { createAction, props } from '@ngrx/store'
import { IExportedReport } from '../interfaces/exported-report.interface'

export const enqueExport = createAction(
  '[EXPORT] Adding report to the queue...',
  props<{ date: string }>()
)
export const enqueExportEnd = createAction(
  '[EXPORT] Adding report to the queue [END]',
  props<{ report: IExportedReport }>()
)
export const updateExportQueue = createAction(
  '[EXPORT] Updating enqued export...',
  props<{ reports: IExportedReport[] }>()
)
export const updateExportQueueEnd = createAction(
  '[EXPORT] Updating enqued export [END]',
  props<{ reports: IExportedReport[] }>()
)
export const clearExportQueue = createAction(
  '[EXPORT] Clearing export queue...',
  props<{ reportIds: string[] }>()
)
export const setLimitReached = createAction(
  '[EXPORT] Setting if limit is rached...',
  props<{ limitReached: boolean }>()
)
export const initExportQueue = createAction(
  '[EXPORT] Initializing export queue...'
)
