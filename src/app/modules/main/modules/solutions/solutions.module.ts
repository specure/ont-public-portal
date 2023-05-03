import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SolutionsComponent } from './solutions.component'
import { SolutionsRoutingModule } from './solutions-routing.module'

@NgModule({
  declarations: [SolutionsComponent],
  imports: [SolutionsRoutingModule, CommonModule],
})
export class SolutionsModule {}
