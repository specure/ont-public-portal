import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component'
import { ErrorsComponent } from './errors.component'
import { ErrorsRoutingModule } from './errors-routing.module'
import { TranslocoModule } from '@ngneat/transloco'
import { SharedModule } from '../shared/shared.module'

@NgModule({
  declarations: [PageNotFoundComponent, ErrorsComponent],
  imports: [
    CommonModule,
    ErrorsRoutingModule,
    SharedModule,
    TranslocoModule,
  ],
  exports: [PageNotFoundComponent]
})
export class ErrorsModule { }
