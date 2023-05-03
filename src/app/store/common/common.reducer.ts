import { loading, loadingSuccess, loadingError, setNavigationEvent } from './common.action'
import { createReducer, on } from '@ngrx/store'
import { IAppState } from '..'
import { HttpErrorResponse } from '@angular/common/http'
import { NavigationStart } from '@angular/router'

export class CommonState {
  loading = false
  success = false
  error: HttpErrorResponse = null
  navigationEvent?: NavigationStart
}

export const commonReducer = createReducer(
  new CommonState(),
  on(loading, state => ({...state, loading: true, success: false, error: null})),
  on(loadingSuccess, state => ({...state, loading: false, success: true, error: null})),
  on(loadingError, (state, { error }) => ({...state, loading: false, success: false, error})),
  on(setNavigationEvent, (state, { event }) => ({ ...state, navigationEvent: event }))
)

export const getCommonState = (state: IAppState) => state.common

