import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { Injectable } from '@angular/core'
import { Store } from '@ngrx/store'

import { IAppState } from 'src/app/store'
import { first, map, tap } from 'rxjs/operators'
import { interval, timer } from 'rxjs'
import { TestService } from 'src/app/modules/main/modules/test/services/test.service'

@Injectable({ providedIn: 'root' })
export class PathResolver implements Resolve<any> {
  constructor(
    private store: Store<IAppState>,
    private testService: TestService
  ) {}
  resolve(route: ActivatedRouteSnapshot) {
    return this.store
      .select((s) => s.common)
      .pipe(
        first(),
        map(({ navigationEvent }) => {
          const { action, path, props, useParams } = route.data
          const actualPath = path ?? route.url[0]?.path
          if (
            !action ||
            /**
             * This is to not reload the data on every hash change
             */
            ((navigationEvent?.navigationTrigger === 'hashchange' ||
              navigationEvent?.navigationTrigger === 'popstate') &&
              navigationEvent?.url?.includes('#'))
          ) {
            return null
          }
          /**
           * This is to scroll the page to the anchor after the data is loaded
           */
          if (
            navigationEvent?.navigationTrigger === 'imperative' &&
            navigationEvent?.url?.includes('#')
          ) {
            this.store.dispatch(
              action({
                route: actualPath,
                ...(useParams ? route.params : props),
              })
            )
            const hash = navigationEvent.url.split('#')
            const int = interval(300)
              .pipe(
                tap((value) => {
                  let anchor = globalThis.document?.getElementById(hash[1])
                  if (!anchor) {
                    anchor = globalThis.document?.querySelector(`.${hash[1]}`)
                  }
                  if (anchor || value > 2000) {
                    anchor?.scrollIntoView()
                    int.unsubscribe()
                  }
                })
              )
              .subscribe()
            return null
          }
          /**
           * Normal navigation after the app is loaded
           */
          this.testService.stopTest()
          this.store.dispatch(
            action({
              route: actualPath,
              ...(useParams ? route.params : props),
            })
          )
          timer(0).subscribe({
            next: () => {
              if (globalThis.scrollY > 0) {
                globalThis.scrollTo(0, 0)
              }
            },
          })
          return null
        })
      )
  }
}
