import { Inject, Injectable, PLATFORM_ID } from '@angular/core'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import {
  loadMenus,
  loadMenusEnd,
  loadPage,
  loadPageEnd,
  postFeedback,
  postFeedbackEnd,
  setLanguage,
} from './main.action'
import { tap, switchMap, map, catchError } from 'rxjs/operators'
import { Store, Action } from '@ngrx/store'
import { IAppState } from '..'
import { loading, loadingSuccess, loadingError } from '../common/common.action'
import { MainHttpService } from 'src/app/modules/main/services/main-http.service'
import { HttpErrorResponse } from '@angular/common/http'
import { forkJoin, of } from 'rxjs'
import { TranslocoService } from '@ngneat/transloco'
import { Router } from '@angular/router'
import { SeoService } from 'src/app/core/services/seo.service'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { IFeedback } from 'src/app/modules/main/interfaces/feedback.interface'
import { DefaultFeedback } from 'src/app/modules/main/classes/feedback.class'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MainSnackbarComponent } from 'src/app/modules/main/components/main-snackbar/main-snackbar.component'

@Injectable()
export class MainEffects {
  loadMenus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMenus.type),
      tap(() => this.store.dispatch(loading())),
      switchMap(() => {
        return this.http.getMenus().pipe(
          map((menus) => {
            this.store.dispatch(loadMenusEnd(menus))
            return loadingSuccess()
          }),
          catchError((error: HttpErrorResponse) => {
            this.store.dispatch(
              loadMenusEnd({ headerMenu: null, footerMenu: null })
            )
            return of(loadingError({ error }))
          })
        )
      })
    )
  )

  loadPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & { route: string }>(loadPage.type),
      switchMap(({ route }) => {
        this.store.dispatch(loading())
        return forkJoin([of(route), this.http.getOrDownloadProject()])
      }),
      switchMap(([route, project]) => {
        return this.http.getPage(route?.replace('/:', '-')).pipe(
          map((page) => {
            this.store.dispatch(loadPageEnd({ page }))
            this.seoService.setPageMetadata(page, project)
            return loadingSuccess()
          }),
          catchError((error: HttpErrorResponse) => {
            this.store.dispatch(loadPageEnd({ page: null }))
            this.seoService.setPageMetadata(null, project)
            if (error.status === 404) {
              this.router.navigate([
                this.transloco.getActiveLang(),
                ERoutes.PAGE_NOT_FOUND,
              ])
              return of(loadingSuccess())
            }
            return of(loadingError({ error }))
          })
        )
      }),
      tap(() => this.store.dispatch(loadMenus()))
    )
  )

  setLanguage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<Action & { lang: string }>(setLanguage.type),
        tap(({ lang }) => {
          if ((this.transloco.getAvailableLangs() as string[]).includes(lang)) {
            return this.transloco.setActiveLang(lang)
          }
          return this.router.navigate[this.transloco.getDefaultLang()]
        })
      ),
    { dispatch: false }
  )

  postFeedback$ = createEffect(() =>
    this.actions$.pipe(
      ofType<Action & { feedback: IFeedback }>(postFeedback.type),
      tap(() => this.store.dispatch(loading())),
      switchMap(({ feedback }) => {
        return this.http.postFeedback(feedback).pipe(
          map(() => {
            this.store.dispatch(
              postFeedbackEnd({ feedback: DefaultFeedback.instance })
            )
            this.snackbar.openFromComponent(MainSnackbarComponent, {
              panelClass: 'nt-main-snackbar',
              data: {
                status: 'success',
                message: 'contact.snackbar.success',
              },
              duration: 3000,
            })
            return loadingSuccess()
          }),
          catchError((error: HttpErrorResponse) => {
            this.store.dispatch(postFeedbackEnd({ feedback }))
            this.snackbar.openFromComponent(MainSnackbarComponent, {
              panelClass: 'nt-main-snackbar',
              data: {
                status: 'error',
                message: 'contact.snackbar.error',
              },
              duration: 3000,
            })
            return of(loadingSuccess())
          })
        )
      })
    )
  )

  constructor(
    private actions$: Actions,
    private http: MainHttpService,
    private router: Router,
    private seoService: SeoService,
    private snackbar: MatSnackBar,
    private store: Store<IAppState>,
    private transloco: TranslocoService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}
}
