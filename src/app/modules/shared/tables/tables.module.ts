import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TranslocoModule } from '@ngneat/transloco'

import { MaterialModule } from '../material/material.module'
import { PartialsModule } from '../partials/partials.module'
import { TableComponent } from './components/table/table.component'

@NgModule({
  declarations: [TableComponent],
  imports: [
    PartialsModule,
    CommonModule,
    MaterialModule,
    RouterModule,
    TranslocoModule
  ],
  exports: [
    TableComponent
  ]
})
export class TablesModule { }
