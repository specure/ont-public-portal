import { HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { TranslocoService } from '@ngneat/transloco'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Action, select, Store } from '@ngrx/store'
import {
  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs'
import { Paginator } from 'src/app/core/classes/paginator.class'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { SeoService } from 'src/app/core/services/seo.service'
import { URLService } from 'src/app/core/services/url.service'
import { ARTICLES_PAGINATOR_SIZE } from 'src/app/modules/main/modules/articles/components/articles-list/articles-list.component'
import { ArticlesService } from 'src/app/modules/main/modules/articles/services/articles.service'
import { MainHttpService } from 'src/app/modules/main/services/main-http.service'
import { IAppState } from '..'
import { loading, loadingError, loadingSuccess } from '../common/common.action'
import { loadMenus, loadPage } from '../main/main.action'
import {
  loadArticles,
  loadArticlesEnd,
  LoadArticlesRequestProps,
  loadFullArticle,
  loadFullArticleEnd,
  LoadFullArticleRequestProps,
} from './articles.action'
import { getArticlesState } from './articles.reducer'

@Injectable()
export class ArticlesEffects {
  loadArticles$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & LoadArticlesRequestProps>(loadArticles.type),
      tap(({ route }) => {
        this.currentRoute = route
        this.store.dispatch(loading())
      }),
      withLatestFrom(this.store.pipe(select(getArticlesState))),
      map(([_, store]) => ({
        paginator: Paginator.validate(store.paginator, {
          availableSizes: [ARTICLES_PAGINATOR_SIZE],
          size: ARTICLES_PAGINATOR_SIZE,
          page: 0,
        }),
        articlesMap: store.articlesMap,
      })),
      switchMap(({ paginator, articlesMap }) => {
        return this.http.getArticlesList({ paginator, sort: null }).pipe(
          map((response) => {
            if (
              articlesMap?.content?.length &&
              response?.content?.length &&
              paginator?.page > 0
            ) {
              this.store.dispatch(
                loadArticlesEnd({
                  articlesMap: {
                    content: [...articlesMap.content, ...response.content],
                    totalElements: response.totalElements,
                  },
                })
              )
            } else {
              this.store.dispatch(loadArticlesEnd({ articlesMap: response }))
            }
            this.loadPage()
            return loadingSuccess()
          }),
          catchError((error) => {
            this.store.dispatch(loadArticlesEnd({ articlesMap: null }))
            return of(loadingError({ error }))
          })
        )
      })
    )
  )

  loadFullArticle$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & LoadFullArticleRequestProps>(loadFullArticle.type),
      tap(() => this.store.dispatch(loading())),
      switchMap(({ slug }) =>
        forkJoin([of(slug), this.mainHttp.getOrDownloadProject()])
      ),
      switchMap(([slug, project]) => {
        return this.http.getFullArticle(slug).pipe(
          map((article) => {
            this.seoService.setPageMetadata(article, project)
            this.store.dispatch(loadFullArticleEnd({ article }))
            return loadingSuccess()
          }),
          catchError((error: HttpErrorResponse) => {
            this.seoService.setPageMetadata(null, project)
            this.store.dispatch(loadFullArticleEnd({ article: null }))
            if (error?.status === 404) {
              this.router.navigate([
                this.transloco.getActiveLang(),
                ERoutes.PAGE_NOT_FOUND,
              ])
              return of(loadingError({ error: null }))
            }
            return of(loadingError({ error }))
          })
        )
      }),
      tap(() => this.store.dispatch(loadMenus()))
    )
  )

  private currentRoute: string

  constructor(
    private actions$: Actions,
    private http: ArticlesService,
    private mainHttp: MainHttpService,
    private router: Router,
    private seoService: SeoService,
    private store: Store<IAppState>,
    private transloco: TranslocoService,
    private url: URLService
  ) {}

  private loadPage() {
    if (this.currentRoute) {
      this.store.dispatch(loadPage({ route: this.currentRoute }))
      this.currentRoute = null
    }
  }
}
