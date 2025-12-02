import { NgModule, SecurityContext } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ArticleComponent } from './article.component'
import { ScrollTopComponent } from './components/scroll-top/scroll-top.component'
import { PartialsModule } from '../partials/partials.module'
import { TranslocoModule } from '@ngneat/transloco'
import { MarkdownModule, MarkdownService, SANITIZE } from 'ngx-markdown'
import { MatIconModule } from '@angular/material/icon'

@NgModule({
  declarations: [ArticleComponent, ScrollTopComponent],
  imports: [
    CommonModule,
    MarkdownModule.forChild(),
    PartialsModule,
    TranslocoModule,
    MatIconModule,
  ],
  exports: [ArticleComponent],
  providers: [
    MarkdownService,
    { provide: SANITIZE, useValue: SecurityContext.NONE },
  ],
})
export class ArticleModule {}
