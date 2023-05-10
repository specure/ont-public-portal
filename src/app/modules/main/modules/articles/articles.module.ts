import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ArticlesComponent } from './articles.component'
import { ArticlesRoutingModule } from './articles-routing.module'
import { SharedModule } from 'src/app/modules/shared/shared.module'
import { ArticlesListComponent } from './components/articles-list/articles-list.component'
import { FullArticleComponent } from './components/full-article/full-article.component';
import { ArticlePicturePipe } from './pipes/article-picture.pipe';
import { ArticleClassesPipe } from './pipes/article-classes.pipe';
import { ArticleAuthorPipe } from './pipes/article-author.pipe'

@NgModule({
  declarations: [
    ArticlesComponent,
    ArticlesListComponent,
    FullArticleComponent,
    ArticlePicturePipe,
    ArticleClassesPipe,
    ArticleAuthorPipe,
  ],
  imports: [CommonModule, ArticlesRoutingModule, SharedModule],
})
export class ArticlesModule {}
