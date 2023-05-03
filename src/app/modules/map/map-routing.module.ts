import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MapComponent } from './map.component'
import { PathResolver } from '../../core/resolvers/path.resolver'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { loadStatistics } from 'src/app/store/statistics/statistics.action'

export const routes: Routes = [
  {
    path: '',
    component: MapComponent,
    resolve: { props: PathResolver },
    data: { action: loadStatistics, path: ERoutes.MAP },
    runGuardsAndResolvers: 'always'
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class MapRoutingModule {
}
