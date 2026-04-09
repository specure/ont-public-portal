import { createAction, props } from '@ngrx/store'
import { IMunicipality } from 'src/app/modules/main/modules/data/interfaces/municipality.interface'
import { INationalTable } from 'src/app/modules/main/modules/data/interfaces/national-table.interface'

export const loadNationalTable = createAction(
  '[STATISTIC] Loading national table...',
  props<{
    filters: { [param: string]: string | string[] | undefined }
  }>(),
)
export const loadNationalTableEnd = createAction(
  '[STATISTIC] Loading national table [END]',
  props<{
    nationalTable: INationalTable | null
  }>(),
)
export const loadStatistics = createAction(
  '[STATISTIC] Loading statistics...',
  props<{
    route: string
  }>(),
)
export const loadStatisticsEnd = createAction(
  '[STATISTIC] Loading statistics [END]',
  props<{
    nationalTable: INationalTable | null
    municipalities: IMunicipality[] | null
  }>(),
)
export const loadMunicipality = createAction(
  '[STATISTIC] Loading municipality...',
  props<{ name: string }>(),
)
export const loadMunicipalityEnd = createAction(
  '[STATISTIC] Loading municipality [END]',
  props<{ municipality: IMunicipality | null }>(),
)
