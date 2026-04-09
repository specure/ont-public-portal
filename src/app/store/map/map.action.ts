import { createAction, props } from '@ngrx/store'
import { IMainMapStyle } from 'src/app/modules/map/interfaces/main-map-style.interface'
import { ITimelineStep } from 'src/app/modules/map/interfaces/timeline-step.interface'
import { ENetworkOperator } from '../../modules/map/components/filter/map-layer-filter.component'
import { ITechnology } from '../../modules/map/interfaces/technology.interface'
import { IRawProvider } from 'src/app/modules/map/interfaces/raw-provider.interface'

export const setStyle = createAction(
  '[MAP] Setting style...',
  props<{ style: IMainMapStyle }>(),
)
export const setOperator = createAction(
  '[MAP] Setting operator filter...',
  props<{ operator: ENetworkOperator }>(),
)
export const setTechnology = createAction(
  '[MAP] Setting technology filter...',
  props<{ technology: ITechnology }>(),
)
export const setDate = createAction(
  '[MAP] Setting date filter...',
  props<{ date: ITimelineStep }>(),
)
export const setMapFilters = createAction(
  '[MAP] Set Map filters',
  props<{ operator: ENetworkOperator; technology: ITechnology }>(),
)
export const setMunicipality = createAction(
  '[MAP] Setting municipality...',
  props<{ municipality: string }>(),
)
export const getProviders = createAction('[MAP] Getting providers...')
export const getProvidersSuccess = createAction(
  '[MAP] Getting providers SUCCESS',
  props<{ providers: IRawProvider[] }>(),
)
export const getProvidersFailure = createAction(
  '[MAP] Getting providers FAILURE',
  props<{ error: any }>(),
)
