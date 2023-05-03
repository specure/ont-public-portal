import { createAction, props } from '@ngrx/store'
import { ITestInfo } from 'src/app/modules/main/modules/test/interfaces/test-info.interface'
import { ITestResult } from 'src/app/modules/main/modules/test/interfaces/test-result.interface'
import { ITestVisualizationState } from 'src/app/modules/main/modules/test/interfaces/test-visualization-state.interface'

export const setLocation = createAction(
  '[TEST] Setting location...',
  props<{ location: { longitude: number; latitude: number } }>()
)
export const setTestInfo = createAction(
  '[TEST] Setting test info...',
  props<{ info: ITestInfo }>()
)
export const setShowProgress = createAction(
  '[TEST] Setting showProgress...',
  props<{ showProgress: boolean }>()
)
export const visualInit = createAction('[TEST] Initializing checks...')
export const visualInitDown = createAction(
  '[TEST] Initializing download checks...',
  props<{ down: string | number; up: string | number; progress: number }>()
)
export const visualPing = createAction(
  '[TEST] Checking ping...',
  props<{ ping: string | number; progress: number }>()
)
export const visualDown = createAction(
  '[TEST] Checking download...',
  props<{
    ping: string | number
    down: string | number
    progress: number
    time: number
  }>()
)
export const visualInitUp = createAction(
  '[TEST] Initializing upload checks...',
  props<{ down: string | number; up: string | number; progress: number }>()
)
export const visualUp = createAction(
  '[TEST] Checking upload...',
  props<{ up: string | number; progress: number; time: number }>()
)
export const visualEnd = createAction(
  '[TEST] Finishing checks...',
  props<{ up: string | number; progress: number; time: number }>()
)
export const visualError = createAction(
  '[TEST] Test error!',
  props<{ result }>()
)
export const visualSuccess = createAction(
  '[TEST] Test finished successfully [END]',
  props<{ result }>()
)
export const visualResult = createAction(
  '[TEST] Test result get [...]',
  props<{ id: string }>()
)
export const visualResultEnd = createAction(
  '[TEST] Test result get [END]',
  props<{ data: ITestResult; visualization: ITestVisualizationState }>()
)
export const visualReset = createAction(
  '[TEST] Resetting test...',
  props<{ route: string }>()
)
