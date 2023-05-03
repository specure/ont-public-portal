import { createReducer, on } from '@ngrx/store'
import {
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

export class MapState {
  date: ITimelineStep
  municipality: string
  operator: string
  technology: ITechnology
  style: IMainMapStyle
}

export const mapReducer = createReducer(
  new MapState(),
  on(setStyle, (state, { style }) => ({ ...state, style })),
  on(setTechnology, (state, { technology }) => ({ ...state, technology })),
  on(setOperator, (state, { operator }) => ({ ...state, operator })),
  on(setDate, (state, { date }) => ({ ...state, date })),
  on(setMapFilters, (state, { operator, technology }) => ({
    ...state,
    operator,
    technology,
  })),
  on(setMunicipality, (state, { municipality }) => ({ ...state, municipality }))
)

export const getMapState = (state: IAppState) => state.map
