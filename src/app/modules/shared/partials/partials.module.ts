import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MaterialModule } from '../material/material.module'
import { NgModule } from '@angular/core'

import { GeneralCardComponent } from './components/general-card/general-card.component'
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component'
import { TranslocoModule } from '@ngneat/transloco'
import { PaginatorComponent } from './components/paginator/paginator.component'
import { FeedbackButtonComponent } from './components/feedback-button/feedback-button.component'
import { TranslatePipe } from './pipes/translate.pipe'
import { SidenavComponent } from './components/sidenav/sidenav.component'
import { RouterModule } from '@angular/router'
import { DistancePipe } from './pipes/distance.pipe'
import { LinkRelDirective } from './directives/link-rel.directive'
import { MainSafeHtmlPipe } from './pipes/main-safe-html.pipe'
import { ExportWarningComponent } from './components/export-warning/export-warning.component'

@NgModule({
  declarations: [
    GeneralCardComponent,
    LanguageSelectorComponent,
    PaginatorComponent,
    FeedbackButtonComponent,
    TranslatePipe,
    DistancePipe,
    SidenavComponent,
    LinkRelDirective,
    MainSafeHtmlPipe,
    ExportWarningComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    TranslocoModule,
  ],
  exports: [
    GeneralCardComponent,
    LanguageSelectorComponent,
    PaginatorComponent,
    FeedbackButtonComponent,
    TranslatePipe,
    DistancePipe,
    MainSafeHtmlPipe,
    SidenavComponent,
    LinkRelDirective,
    ExportWarningComponent,
  ],
  providers: [TranslatePipe],
})
export class PartialsModule {}
