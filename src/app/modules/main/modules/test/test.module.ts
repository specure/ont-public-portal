import { NgModule } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { TestComponent } from './test.component'
import { TestRoutingModule } from './test-routing.module'
import { TestHomeComponent } from './components/test-home/test-home.component'
import { SharedModule } from 'src/app/modules/shared/shared.module'
import { TestIndicatorComponent } from './components/test-indicator/test-indicator.component'
import { TestChartComponent } from './components/test-chart/test-chart.component'
import { TestHeaderComponent } from './components/test-header/test-header.component';
import { TestHomeInitComponent } from './components/test-home-init/test-home-init.component'

@NgModule({
  declarations: [
    TestComponent,
    TestHeaderComponent,
    TestHomeComponent,
    TestIndicatorComponent,
    TestChartComponent,
    TestHomeInitComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    TestRoutingModule,
  ],
  providers: [ DatePipe ]
})
export class TestModule { }
