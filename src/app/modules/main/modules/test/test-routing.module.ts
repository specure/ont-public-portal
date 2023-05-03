import { ERoutes } from 'src/app/core/enums/routes.enum'
import { NgModule } from '@angular/core'
import { TestComponent } from './test.component'
import { Routes, RouterModule } from '@angular/router'

import { PathResolver } from 'src/app/core/resolvers/path.resolver'
import { RedirectResolver } from 'src/app/core/resolvers/redirect.resolver'
import { TestHomeComponent } from './components/test-home/test-home.component'
import { visualReset, visualResult } from 'src/app/store/test/test.action'
import { RouteParamsResolver } from 'src/app/core/resolvers/route-params.resolver'
import { ErrorsComponent } from 'src/app/modules/errors/errors.component'
import { loadPage } from 'src/app/store/main/main.action'
import { TestIsRunningResolver } from './resolvers/test-is-running.resolver'

export const testRouting: Routes = [
  {
    path: '',
    component: TestComponent,
    children: [
      {
        path: '',
        component: TestHomeComponent,
        pathMatch: 'full',
        resolve: { props: PathResolver },
        data: { action: visualReset, path: ERoutes.TEST },
        runGuardsAndResolvers: 'always',
      },
      {
        path: ERoutes.TEST_PROGRESS,
        component: TestHomeComponent,
        pathMatch: 'full',
        resolve: { state: TestIsRunningResolver, props: PathResolver },
        data: { action: loadPage, path: ERoutes.TEST },
        runGuardsAndResolvers: 'always',
      },
      {
        path: ERoutes.TEST_HYSTORY_RESULTS,
        component: TestHomeComponent,
        pathMatch: 'full',
        resolve: { props: RouteParamsResolver },
        data: {
          action: visualResult,
          props: { route: ERoutes.TEST_HYSTORY_RESULTS },
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
  imports: [RouterModule.forChild(testRouting)],
  exports: [RouterModule],
})
export class TestRoutingModule {}
