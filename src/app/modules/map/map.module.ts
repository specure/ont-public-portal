import { NgModule } from '@angular/core'
import { MapRoutingModule } from './map-routing.module'
import { MapComponent } from './map.component'
import { MapboxComponent } from './components/map/mapbox.component'
import { SharedModule } from '../shared/shared.module'
import { MenuBarComponent } from './components/menu-bar/menu-bar.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SideNavigationComponent } from './components/side-navigation/side-navigation.component'
import { MapLayerFilterComponent } from './components/filter/map-layer-filter.component'
import { MatExpansionModule } from '@angular/material/expansion'
import { CommonModule } from '@angular/common'
import { TimelineComponent } from './components/timeline/timeline.component'
import { MobileTimelineComponent } from './components/mobile-timeline/mobile-timeline.component'
import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl'

@NgModule({
  declarations: [
    MapComponent,
    MapboxComponent,
    MenuBarComponent,
    SideNavigationComponent,
    MapLayerFilterComponent,
    TimelineComponent,
    MobileTimelineComponent,
  ],
  imports: [
    CommonModule,
    MapRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    NgxMapLibreGLModule,
  ],
})
export class MapModule {}
