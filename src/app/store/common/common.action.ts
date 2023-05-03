import { createAction, props } from '@ngrx/store'
import { HttpErrorResponse } from '@angular/common/http'
import { NavigationStart } from '@angular/router'

export const loading = createAction('[COMMON] Loading...')
export const loadingSuccess = createAction('[COMMON] Loading [SUCCESS]')
export const loadingError = createAction('[COMMON] Loading [ERROR]', props<{error: HttpErrorResponse}>())
export const setNavigationEvent = createAction(
    '[COMMON] Setting navigation event', props<{event: NavigationStart}>()
)
