import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { setLanguage } from './store/main/main.action'
import { RouteParamsResolver } from './core/resolvers/route-params.resolver'
import { ERoutes } from './core/enums/routes.enum'
import { LanguageAvailableGuard } from './core/guards/language-available.guard'

const routes: Routes = [
  {
    path: `:lang/${ERoutes.MAP}`,
    canActivate: [LanguageAvailableGuard],
    loadChildren: () =>
      import('./modules/map/map.module').then((m) => m.MapModule),
    resolve: { state: RouteParamsResolver },
    data: { action: setLanguage },
  },
  {
    path: `:lang`,
    canActivate: [LanguageAvailableGuard],
    loadChildren: () =>
      import('./modules/errors/errors.module').then((m) => m.ErrorsModule),
    resolve: { state: RouteParamsResolver },
    data: { action: setLanguage },
  },
  {
    path: '',
    loadChildren: () =>
      import('./modules/main/main.module').then((m) => m.MainModule),
  },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload',
    initialNavigation: 'enabledNonBlocking'
}),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
