import { createReducer, on } from '@ngrx/store'
import { NationalTable } from 'src/app/modules/main/modules/data/classes/national-table.class'
import { IMunicipality } from 'src/app/modules/main/modules/data/interfaces/municipality.interface'
import { INationalTable } from 'src/app/modules/main/modules/data/interfaces/national-table.interface'
import { IAppState } from '..'
import {
  loadMunicipality,
  loadMunicipalityEnd,
  loadNationalTable,
  loadNationalTableEnd,
  loadStatisticsEnd,
} from './statistics.action'

export class StatisticsState {
  nationalTable: INationalTable
  municipalities: IMunicipality[]
  municipality: IMunicipality
  filters: { [param: string]: string }
}

export const statisticsReducer = createReducer(
  new StatisticsState(),
  on(loadNationalTable, (state, { filters }) => ({ ...state, filters })),
  on(loadNationalTableEnd, (state, { nationalTable }) => ({
    ...state,
    nationalTable: nationalTable && NationalTable.from(nationalTable),
  })),
  on(
    loadStatisticsEnd,
    (state, { nationalTable, municipalities }): StatisticsState => ({
      ...state,
      nationalTable: nationalTable && NationalTable.from(nationalTable),
      municipalities,
    })
  ),
  on(loadMunicipality, (state) => ({ ...state, municipality: null })),
  on(loadMunicipalityEnd, (state, { municipality }) => ({
    ...state,
    municipality,
  }))
)

export const getStatisticsState = (state: IAppState) => state.statistics
