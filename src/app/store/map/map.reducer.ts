import { createReducer, on } from '@ngrx/store'
import {
  getProvidersSuccess,
  setDate,
  setMapFilters,
  setMunicipality,
  setOperator,
  setStyle,
  setTechnology,
} from './map.action'
import { IAppState } from '../index'
import { ITechnology } from '../../modules/map/interfaces/technology.interface'
import { ITimelineStep } from 'src/app/modules/map/interfaces/timeline-step.interface'
import { IMainMapStyle } from 'src/app/modules/map/interfaces/main-map-style.interface'
import { IRawProvider } from 'src/app/modules/map/interfaces/raw-provider.interface'

export class MapState {
  date!: ITimelineStep
  municipality!: string
  operator!: string
  technology!: ITechnology
  style: IMainMapStyle | undefined
  providers: IRawProvider[] = []
}

export const mapReducer = createReducer(
  new MapState(),
  on(setStyle, (state, { style }) =>
    style?.url === state.style?.url ? state : { ...state, style },
  ),
  on(setTechnology, (state, { technology }) => ({ ...state, technology })),
  on(setOperator, (state, { operator }) => ({ ...state, operator })),
  on(setDate, (state, { date }) => ({ ...state, date })),
  on(setMapFilters, (state, { operator, technology }) => ({
    ...state,
    operator,
    technology,
  })),
  on(setMunicipality, (state, { municipality }) => ({
    ...state,
    municipality,
  })),
  on(getProvidersSuccess, (state, { providers }) => ({
    ...state,
    providers,
  })),
)

export const getMapState = (state: IAppState) => state.map
