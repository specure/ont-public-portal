import { createReducer, on } from '@ngrx/store'
import { Paginator } from 'src/app/core/classes/paginator.class'
import { IBasicResponse } from 'src/app/core/interfaces/basic-response.interface'
import { IPaginator } from 'src/app/core/interfaces/paginator.interface'
import { ARTICLES_PAGINATOR_SIZE } from 'src/app/modules/main/modules/articles/components/articles-list/articles-list.component'
import { IArticle } from 'src/app/modules/main/modules/articles/interfaces/article.interface'
import { IAppState } from '..'
import {
  loadArticles,
  loadArticlesEnd,
  loadFullArticleEnd,
} from './articles.action'

export class ArticlesState {
  articlesMap: IBasicResponse<IArticle> = null
  article: IArticle = null
  paginator: IPaginator = new Paginator(0, ARTICLES_PAGINATOR_SIZE)
}

export const articlesReducer = createReducer(
  new ArticlesState(),
  on(loadArticles, (state, { request }) => ({
    ...state,
    paginator: request?.paginator ?? state.paginator,
  })),
  on(loadArticlesEnd, (state, { articlesMap }) => ({
    ...state,
    articlesMap,
  })),
  on(loadFullArticleEnd, (state, { article }) => ({
    ...state,
    article,
  }))
)

export const getArticlesState = (s: IAppState) => s.articles
