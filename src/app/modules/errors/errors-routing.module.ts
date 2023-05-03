import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { PathResolver } from 'src/app/core/resolvers/path.resolver'
import { RedirectResolver } from 'src/app/core/resolvers/redirect.resolver'
import { loadPage } from 'src/app/store/main/main.action'
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component'
import { ErrorsComponent } from './errors.component'

export const errorsRouting: Routes = [
  {
    path: '',
    resolve: { state: RedirectResolver },
    component: ErrorsComponent,
    data: { redirectTo: ERoutes.TEST },
    pathMatch: 'full',
  },
  {
    path: ERoutes.PAGE_NOT_FOUND,
    component: PageNotFoundComponent,
    resolve: { props: PathResolver },
    data: { action: loadPage, path: ERoutes.PAGE_NOT_FOUND },
  },
]

@NgModule({
  imports: [RouterModule.forChild(errorsRouting)],
  exports: [RouterModule],
})
export class ErrorsRoutingModule {}
