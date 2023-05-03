import { commonReducer, CommonState } from './common/common.reducer'
import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store'
import { environment } from 'src/environments/environment'
import { storeFreeze } from 'ngrx-store-freeze'
import { mainReducer, MainState } from './main/main.reducer'
import { MainEffects } from './main/main.effect'
import { testReducer, TestState } from './test/test.reducer'
import { TestEffects } from './test/test.effect'
import { historyReducer, HistoryState } from './history/history.reducer'
import { HistoryEffects } from './history/history.effect'
import { mapReducer, MapState } from './map/map.reducer'
import {
  statisticsReducer,
  StatisticsState,
} from './statistics/statistics.reducer'
import { StatisticsEffects } from './statistics/statistics.effect'
import { CommonEffects } from './common/common.effect'
import {
  exportReducer,
  ExportState,
} from '../modules/shared/export/store/export.reducer'
import { ExportEffects } from '../modules/shared/export/store/export.effect'
import { articlesReducer, ArticlesState } from './articles/articles.reducer'
import { ArticlesEffects } from './articles/articles.effect'

export interface IAppState {
  articles: ArticlesState
  common: CommonState
  export: ExportState
  main: MainState
  statistics: StatisticsState
  test: TestState
  history: HistoryState
  map: MapState
}

export const APP_EFFECTS = [
  ArticlesEffects,
  CommonEffects,
  ExportEffects,
  MainEffects,
  TestEffects,
  HistoryEffects,
  StatisticsEffects,
]

export const appReducers: ActionReducerMap<IAppState> = {
  articles: articlesReducer,
  common: commonReducer,
  export: exportReducer,
  main: mainReducer,
  statistics: statisticsReducer,
  test: testReducer,
  history: historyReducer,
  map: mapReducer,
}

export function logger(
  reducer: ActionReducer<IAppState>
): ActionReducer<IAppState> {
  return (state: IAppState, action: any): IAppState => {
    console.log(state, action)
    return reducer(state, action)
  }
}

export const metaReducers: MetaReducer<IAppState>[] = !environment.production
  ? [logger, storeFreeze]
  : []
