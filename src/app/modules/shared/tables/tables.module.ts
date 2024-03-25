import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TranslocoModule } from '@ngneat/transloco'

import { PartialsModule } from '../partials/partials.module'
import { TableComponent } from './components/table/table.component'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule } from '@angular/material/table'
import { MatTooltipModule } from '@angular/material/tooltip'

@NgModule({
  declarations: [TableComponent],
  imports: [
    PartialsModule,
    CommonModule,
    RouterModule,
    TranslocoModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
  ],
  exports: [TableComponent],
})
export class TablesModule {}
