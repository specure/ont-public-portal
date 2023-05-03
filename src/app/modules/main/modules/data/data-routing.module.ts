import { ERoutes } from 'src/app/core/enums/routes.enum'
import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { RedirectResolver } from 'src/app/core/resolvers/redirect.resolver'
import { DataComponent } from './data.component'
import { PathResolver } from 'src/app/core/resolvers/path.resolver'
import { loadPage } from 'src/app/store/main/main.action'
import { loadHistory } from 'src/app/store/history/history.action'
import { OpenDataComponent } from './components/open-data/open-data.component'
import { StatisticsComponent } from './components/statistics/statistics.component'
import { TestHistoryComponent } from './components/test-history/test-history.component'
import {
  loadMunicipality,
  loadStatistics,
} from 'src/app/store/statistics/statistics.action'
import { MunicipalityComponent } from './components/municipality/municipality.component'
import { RouteParamsResolver } from 'src/app/core/resolvers/route-params.resolver'
import { ErrorsComponent } from 'src/app/modules/errors/errors.component'

export const dataRouting: Routes = [
  {
    path: '',
    component: DataComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        resolve: { state: RedirectResolver },
        data: { redirectTo: ERoutes.TEST_HISTORY },
        component: TestHistoryComponent,
      },
      {
        path: ERoutes.OPEN_DATA,
        component: OpenDataComponent,
        resolve: { props: PathResolver },
        data: { action: loadPage, path: ERoutes.OPEN_DATA },
        runGuardsAndResolvers: 'always',
      },
      {
        path: ERoutes.STATISTICS,
        component: StatisticsComponent,
        resolve: { props: PathResolver },
        data: { action: loadStatistics, path: ERoutes.STATISTICS },
        runGuardsAndResolvers: 'always',
      },
      {
        path: ERoutes.MUNICIPALITY,
        component: MunicipalityComponent,
        resolve: { props: RouteParamsResolver },
        data: { action: loadMunicipality },
        runGuardsAndResolvers: 'always',
      },
      {
        path: ERoutes.TEST_HISTORY,
        component: TestHistoryComponent,
        resolve: { props: PathResolver },
        data: {
          action: loadHistory,
          path: ERoutes.TEST_HISTORY,
        },
        runGuardsAndResolvers: 'always',
      },
      {
        path: '**',
        resolve: { state: RedirectResolver },
        component: ErrorsComponent,
        data: { redirectTo: ERoutes.PAGE_NOT_FOUND },
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(dataRouting)],
  exports: [RouterModule],
})
export class DataRoutingModule {}
