import { Injectable } from '@angular/core'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { Action } from '@ngrx/store'
import { tap } from 'rxjs/operators'
import { markExternalLinks } from 'src/app/core/helpers/mark-external-links'
import { MatomoLinksHandlerService } from 'src/app/core/services/matomo-links-handler.service'
import { loadingSuccess } from './common.action'

@Injectable()
export class CommonEffects {
  loadingSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<Action>(loadingSuccess),
        tap(() => markExternalLinks()),
        tap(() => this.matomoLinksHandler.addHandlers())
      ),
    { dispatch: false }
  )

  constructor(
    private actions$: Actions,
    private matomoLinksHandler: MatomoLinksHandlerService
  ) {}
}
