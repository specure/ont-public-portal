import { Component } from '@angular/core'
import { Store } from '@ngrx/store'
import { map, withLatestFrom } from 'rxjs'
import { Paginator } from 'src/app/core/classes/paginator.class'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { IPaginator } from 'src/app/core/interfaces/paginator.interface'
import { ConfigService } from 'src/app/core/services/config.service'
import { IAppState } from 'src/app/store'
import { loadArticles } from 'src/app/store/articles/articles.action'
import { getArticlesState } from 'src/app/store/articles/articles.reducer'
import { IArticle } from '../../interfaces/article.interface'

export const ARTICLES_PAGINATOR_SIZE = 6

@Component({
  selector: 'nt-articles-list',
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.scss'],
})
export class ArticlesListComponent {
  articles$ = this.store.select(getArticlesState).pipe(
    withLatestFrom(this.config.defaultArticleCover$),
    map(([s, defaultCover]) => {
      this.paginator = s?.paginator
      this.defaultCover = defaultCover
      this.totalArticles = s?.articlesMap?.totalElements ?? 0
      return s?.articlesMap?.content
    })
  )
  defaultCover = ''
  paginator?: IPaginator
  totalArticles = 0

  constructor(private config: ConfigService, private store: Store<IAppState>) {}

  getArticleClasses(index: number) {
    const classList = ['nt-article']
    switch (index) {
      case 0:
        classList.push('nt-article--primary')
        break
      case 1:
      case 2:
        classList.push('nt-article--secondary')
        break
      default:
        classList.push('nt-article--tertiary')
        break
    }
    return classList
  }

  getArticlePicture(article: IArticle) {
    return article?.picture?.url
      ? this.config.getFullImageUrl(article.picture.url)
      : this.defaultCover
  }

  loadMore() {
    const paginator = new Paginator(
      this.paginator.page + ARTICLES_PAGINATOR_SIZE,
      this.paginator.size
    )
    this.store.dispatch(
      loadArticles({
        request: { paginator, sort: null },
        route: ERoutes.ARTICLES,
      })
    )
  }

  useArticleId(_: any, article: IArticle) {
    return article.id
  }
}
