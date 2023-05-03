import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AppsComponent } from './apps.component'
import { AppsRoutingModule } from './apps-routing.module'

@NgModule({
  declarations: [AppsComponent],
  imports: [AppsRoutingModule, CommonModule],
})
export class AppsModule {}
