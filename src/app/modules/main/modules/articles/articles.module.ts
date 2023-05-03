import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ArticlesComponent } from './articles.component'
import { ArticlesRoutingModule } from './articles-routing.module'
import { SharedModule } from 'src/app/modules/shared/shared.module'
import { ArticlesListComponent } from './components/articles-list/articles-list.component'
import { FullArticleComponent } from './components/full-article/full-article.component'

@NgModule({
  declarations: [
    ArticlesComponent,
    ArticlesListComponent,
    FullArticleComponent,
  ],
  imports: [CommonModule, ArticlesRoutingModule, SharedModule],
})
export class ArticlesModule {}
