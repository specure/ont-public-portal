import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import {
  getProviders,
  getProvidersFailure,
  getProvidersSuccess,
} from './map.action'
import { environment } from 'src/environments/environment'
import { IBasicResponse } from 'src/app/core/interfaces/basic-response.interface'
import { IRawProvider } from 'src/app/modules/map/interfaces/raw-provider.interface'

@Injectable()
export class MapEffects {
  getProviders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getProviders),
      switchMap(() =>
        this.http
          .get<IBasicResponse<IRawProvider>>(
            `${environment.controlServer.url}/rawProviders?page=0&size=1000`,
            {
              headers: {
                ...environment.controlServer.headers,
                'X-Nettest-Country': environment.mapServer.country,
              },
            },
          )
          .pipe(
            map((providers) =>
              getProvidersSuccess({ providers: providers.content }),
            ),
            catchError((error) => of(getProvidersFailure({ error }))),
          ),
      ),
    ),
  )

  constructor(
    private actions$: Actions,
    private http: HttpClient,
  ) {}
}
