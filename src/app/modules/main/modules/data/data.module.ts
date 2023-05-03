import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DataComponent } from './data.component'
import { DataRoutingModule } from './data-routing.module'
import { SharedModule } from 'src/app/modules/shared/shared.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { OpenDataComponent } from './components/open-data/open-data.component'
import { StatisticsComponent } from './components/statistics/statistics.component'
import { TestHistoryComponent } from './components/test-history/test-history.component'
import { FunctionalCookieComponent } from './components/functional-cookie/functional-cookie.component'
import { StatisticsChartComponent } from './components/statistics-chart/statistics-chart.component'
import { MunicipalityComponent } from './components/municipality/municipality.component'

@NgModule({
  declarations: [
    DataComponent,
    OpenDataComponent,
    StatisticsComponent,
    TestHistoryComponent,
    FunctionalCookieComponent,
    StatisticsChartComponent,
    MunicipalityComponent,
  ],
  imports: [
    CommonModule,
    DataRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class DataModule {}
