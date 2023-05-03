import { NgModule, SecurityContext } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ArticleComponent } from './article.component'
import { ScrollTopComponent } from './components/scroll-top/scroll-top.component'
import { PartialsModule } from '../partials/partials.module'
import { MaterialModule } from '../material/material.module'
import { TranslocoModule } from '@ngneat/transloco'
import { MarkdownModule, MarkdownService, SECURITY_CONTEXT } from 'ngx-markdown'

@NgModule({
  declarations: [ArticleComponent, ScrollTopComponent],
  imports: [
    CommonModule,
    MarkdownModule.forChild(),
    MaterialModule,
    PartialsModule,
    TranslocoModule
  ],
  exports: [
    ArticleComponent
  ],
  providers: [
    MarkdownService,
    { provide: SECURITY_CONTEXT, useValue: SecurityContext.NONE },
  ],
})
export class ArticleModule { }
