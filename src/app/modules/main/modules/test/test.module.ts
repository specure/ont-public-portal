import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { TestComponent } from './test.component'
import { TestRoutingModule } from './test-routing.module'
import { TestHomeComponent } from './components/test-home/test-home.component'
import { SharedModule } from 'src/app/modules/shared/shared.module'
import { TestIndicatorComponent } from './components/test-indicator/test-indicator.component'
import { TestChartComponent } from './components/test-chart/test-chart.component'
import { TestHeaderComponent } from './components/test-header/test-header.component'
import { TestHomeInitComponent } from './components/test-home-init/test-home-init.component'
import { TestServersMapComponent } from './components/test-servers-map/test-servers-map.component'
import { TestNetworkInfoComponent } from './components/test-network-info/test-network-info.component'
import { TestChartsComponent } from './components/test-charts/test-charts.component'
import { TestHomeBetaInfoComponent } from './components/test-home-beta-info/test-home-beta-info.component'
import { TestHomeContactsComponent } from './components/test-home-contacts/test-home-contacts.component'
import { TestHomeStoreLinksComponent } from './components/test-home-store-links/test-home-store-links.component'
import { A11yModule } from '@angular/cdk/a11y'
import { TestHomeProgressComponent } from './components/test-home-progress/test-home-progress.component'
import { TestLocalServersComponent } from './components/test-local-servers/test-local-servers.component'
import { TestServersDialogComponent } from './components/test-servers-dialog/test-servers-dialog.component'

@NgModule({
  declarations: [
    TestComponent,
    TestHeaderComponent,
    TestHomeComponent,
    TestIndicatorComponent,
    TestChartComponent,
    TestChartsComponent,
    TestHomeInitComponent,
    TestHomeBetaInfoComponent,
    TestHomeContactsComponent,
    TestHomeStoreLinksComponent,
    TestHomeProgressComponent,
    TestLocalServersComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TestRoutingModule,
    TestServersMapComponent,
    TestNetworkInfoComponent,
    TestServersDialogComponent,
    A11yModule,
  ],
  providers: [DatePipe],
})
export class TestModule {}
