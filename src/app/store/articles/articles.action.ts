import { createAction, props } from '@ngrx/store'
import { IBasicRequest } from 'src/app/core/interfaces/basic-request.interface'
import { IBasicResponse } from 'src/app/core/interfaces/basic-response.interface'
import { IArticle } from 'src/app/modules/main/modules/articles/interfaces/article.interface'

export type LoadArticlesRequestProps = { request: IBasicRequest; route: string }
export type LoadArticlesResponseProps = {
  articlesMap: IBasicResponse<IArticle>
}
export type LoadFullArticleRequestProps = { slug: string }
export type LoadFullArticleResponseProps = { article: IArticle }

export const loadArticles = createAction(
  '[ARTICLES] Loading the list...',
  props<LoadArticlesRequestProps>()
)
export const loadArticlesEnd = createAction(
  '[ARTICLES] Loading the list... [END]',
  props<LoadArticlesResponseProps>()
)
export const loadFullArticle = createAction(
  '[ARTICLES] Loading full article...',
  props<LoadFullArticleRequestProps>()
)
export const loadFullArticleEnd = createAction(
  '[ARTICLES] Loading full article... [END]',
  props<LoadFullArticleResponseProps>()
)
