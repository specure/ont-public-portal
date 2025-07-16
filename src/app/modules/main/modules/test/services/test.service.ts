import {
  catchError,
  first,
  map,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core'
import { combineLatest, forkJoin, from, Observable, of } from 'rxjs'
import { Store } from '@ngrx/store'

import { BasicHttpParams } from 'src/app/core/classes/basic-http-params.class'
import { environment } from 'src/environments/environment'
import { IAppState } from 'src/app/store'
import { IBasicResponse } from 'src/app/core/interfaces/basic-response.interface'
import { IHistoryTableItem } from '../../../interfaces/history-table.interface'
import { IPaginator } from 'src/app/core/interfaces/paginator.interface'
import { ISort } from 'src/app/core/interfaces/sort.interface'
import { ITestResult } from '../interfaces/test-result.interface'
import { ITestServer } from '../interfaces/test-server.interface'
import { IUserSetingsResponse } from '../interfaces/user-settings-response.interface'
import { TestServer } from '../classes/test-server.class'
import { UserSettingsRequest } from '../classes/user-settings-request.class'
import { TestVisualizationService } from './test-visualization.service'
import { ITestServerResponse } from '../interfaces/test-server-response.interface'
import { loadingError } from 'src/app/store/common/common.action'
import dayjs from 'dayjs/esm'
import utc from 'dayjs/esm/plugin/utc'
import tz from 'dayjs/esm/plugin/timezone'
import {
  addTriedServer,
  setLocation,
  visualInit,
} from 'src/app/store/test/test.action'
import { getMainState } from '../../../../../store/main/main.reducer'
import {
  setAvailableServers,
  setMeasurementServer,
} from '../../../../../store/main/main.action'
import { getTestState } from '../../../../../store/test/test.reducer'
import { EServerDefinition } from '../enums/server-definition.enum'
import { isPlatformBrowser } from '@angular/common'
import { MatomoTracker } from 'ngx-matomo-client'
import { EMatomoEventCategory } from 'src/app/core/enums/matomo-events.enum'
import { getHistoryState } from 'src/app/store/history/history.reducer'
import {
  storeUuidInMemory,
  storeUuidOnDisk,
} from 'src/app/store/history/history.action'
import { Router } from '@angular/router'
import { ERoutes } from 'src/app/core/enums/routes.enum'
import { TranslocoService } from '@ngneat/transloco'
import { NTCookieService } from '@nettest/cookie-widget'
import { IMainProject } from '../../../interfaces/main-project.interface'

dayjs.extend(utc)
dayjs.extend(tz)

@Injectable({
  providedIn: 'root',
})
export class TestService {
  private isHistoryAllowed = false
  private testServer: ITestServer
  private rmbtws: any

  get headers() {
    return environment.controlServer.headers
  }

  constructor(
    private http: HttpClient,
    private matomo: MatomoTracker,
    private ngZone: NgZone,
    private router: Router,
    private store: Store<IAppState>,
    private transloco: TranslocoService,
    private visualizator: TestVisualizationService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const promise = environment.production
        ? import('rmbtws')
        : import('rmbtws/dist/rmbtws.js')
      promise.then((rmbtws) => {
        this.rmbtws = rmbtws
      })
    }
  }

  launchTest() {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null)
    }
    this.matomo.trackEvent(EMatomoEventCategory.MEASUREMENT, 'Started')
    this.router.navigate([
      this.transloco.getActiveLang(),
      ERoutes.TEST,
      ERoutes.TEST_PROGRESS,
    ])
    this.store.dispatch(visualInit())

    return from(NTCookieService.I.isCookieAccepted('functional')).pipe(
      withLatestFrom(
        this.store.select(getMainState),
        this.store.select(getHistoryState),
        this.store.select(getTestState)
      ),
      take(1),
      switchMap(
        ([
          isCookieAccepted,
          { project, server },
          { uuid },
          { measurementRetries },
        ]) => {
          if (!server) {
            return this.getTestServerFromApi().pipe(
              switchMap((testServer) => {
                if (!testServer) {
                  throw new Error('No test server available')
                }
                this.setServer(testServer)
                return of({
                  project,
                  server: testServer,
                  uuid,
                  measurementRetries,
                  isCookieAccepted,
                })
              })
            )
          }
          return of({
            project,
            server,
            uuid,
            measurementRetries,
            isCookieAccepted,
          })
        }
      ),
      switchMap(
        ({ server, project, uuid, measurementRetries, isCookieAccepted }) => {
          this.testServer = server
          this.store.dispatch(
            addTriedServer({
              server,
              measurementRetries: !!measurementRetries
                ? measurementRetries - 1
                : project?.measurement_retries,
            })
          )
          if (project?.enable_cookie_widget) {
            this.isHistoryAllowed = !!isCookieAccepted
          } else {
            this.isHistoryAllowed = true
          }
          if (project?.enable_cookie_widget && isCookieAccepted) {
            this.store.dispatch(storeUuidOnDisk({ uuid }))
          } else {
            this.store.dispatch(storeUuidInMemory({ uuid }))
          }
          return this.getUserSettings(uuid, project)
        }
      ),
      tap(({ uuid, app_version }) => {
        if (!this.rmbtws) {
          return
        }
        this.ngZone.runOutsideAngular(() => {
          this.rmbtws.TestEnvironment.init(this.visualizator, null)
          const config = new this.rmbtws.RMBTTestConfig(
            'en',
            environment.controlServer.url,
            ''
          )
          config.uuid = uuid
          config.timezone = dayjs.tz.guess()
          config.additionalSubmissionParameters = { network_type: 0 }
          config.additionalRegistrationParameters = {
            uuid_permission_granted: this.isHistoryAllowed,
            app_version,
          }
          const ctrl = new this.rmbtws.RMBTControlServerCommunication(
            config,
            environment.controlServer.headers,
            this.testServer
          )
          const websocketTest = new this.rmbtws.RMBTTest(config, ctrl)
          this.rmbtws.TestEnvironment.getTestVisualization().setRMBTTest(
            websocketTest
          )
          websocketTest.startTest()
          this.rmbtws.TestEnvironment.getTestVisualization().startTest() // start the visualization
        })
      }),
      catchError((error) => {
        console.log(error)
        this.store.dispatch(loadingError({ error }))
        this.router.navigate([this.transloco.getActiveLang(), ERoutes.TEST])
        return of(null)
      })
    )
  }

  stopTest = () => {
    this.rmbtws?.TestEnvironment.getTestVisualization()?.stopTest()
  }

  getHistoryList(
    paginator: IPaginator,
    sort: ISort,
    uuid: string
  ): Observable<IBasicResponse<IHistoryTableItem>> {
    return this.http.get<IBasicResponse<IHistoryTableItem>>(
      `${environment.controlServer.url}${environment.controlServer.routes.history}`,
      {
        params: new BasicHttpParams(paginator, sort, { uuid }),
        headers: this.headers,
      }
    )
  }

  getTestResults(id: string): Observable<ITestResult> {
    return this.http.get<ITestResult>(
      `${environment.controlServer.url}${environment.controlServer.routes.result}/${id}`,
      { headers: this.headers }
    )
  }

  getLocationFromStore(): Observable<{ longitude: number; latitude: number }> {
    return this.store.select(getTestState).pipe(
      first(),
      tap((test) => console.log('test', test)),
      switchMap((test) => {
        if (!test?.location) {
          this.setLocationToStore()
          this.store.select(getTestState).pipe(
            map(({ location }) =>
              of({
                longitude: location?.longitude,
                latitude: location?.latitude,
              })
            )
          )
        }
        return of({
          longitude: test.location?.longitude,
          latitude: test.location?.latitude,
        })
      }),
      map((location) => location)
    )
  }

  setLocationToStore() {
    navigator.geolocation.getCurrentPosition((success) => {
      this.store.dispatch(
        setLocation({
          location: {
            longitude: success.coords.longitude,
            latitude: success.coords.latitude,
          },
        })
      )
    })
  }

  getTestServers() {
    return combineLatest([
      this.getAllTestServersFromApi(),
      this.store.select(getMainState),
      this.store.select(getTestState),
    ]).pipe(
      first(),
      map(([servers, mainState, testState]) => {
        let serverToUse: TestServer
        if (mainState.server) {
          serverToUse = mainState.server
        } else if (testState.info?.measurement_server_name) {
          serverToUse =
            servers?.find(
              (s) => s.name === testState.info.measurement_server_name
            ) ?? servers?.[0]
          this.setServer(serverToUse)
        } else {
          serverToUse = servers?.[0]
          this.setServer(serverToUse)
        }
        return [serverToUse, servers]
      })
    )
  }

  setServer(server: TestServer): void {
    this.store.dispatch(setMeasurementServer({ server }))
  }

  private getTestServerFromApi(): Observable<TestServer> {
    return this.http
      .get<ITestServerResponse[]>(
        `${environment.controlServer.url}${environment.controlServer.routes.measurementServer}`,
        {
          headers: this.headers,
        }
      )
      .pipe(
        map(this.supportedServers),
        catchError(() => of([])),
        map((servers) => servers?.[0])
      )
  }

  private getAllTestServersFromApi() {
    return this.getLocation().pipe(
      switchMap((location) => {
        const params = !location
          ? new HttpParams({})
          : new HttpParams({
              fromObject: {
                latitude: location.latitude.toString(),
                longitude: location.longitude.toString(),
              },
            })
        return this.http
          .get<ITestServerResponse[]>(
            `${environment.controlServer.url}${environment.controlServer.routes.measurementServer}`,
            {
              params,
              headers: this.headers,
            }
          )
          .pipe(
            map((servers) => {
              const availableServers = this.supportedServers(servers)
              this.store.dispatch(setAvailableServers({ availableServers }))
              return availableServers
            }),
            catchError(() => of([]))
          )
      })
    )
  }

  private supportedServers = (servers) => {
    if (!servers) {
      return []
    }
    if (servers.every((s) => s.serverTypeDetails === undefined)) {
      return servers
        .map(TestServer.fromResponse)
        .sort((a, b) => a.distance - b.distance)
    }
    return servers
      .reduce((acc, server) => {
        const shouldShow = server.serverTypeDetails?.some(
          (d) => d.serverType === EServerDefinition.RMBTws
        )
        if (!shouldShow) {
          return acc
        }
        const mappedServer = TestServer.fromResponse(server) ?? null
        return [...acc, mappedServer]
      }, [])
      .sort((a, b) => a.distance - b.distance)
  }

  public getLocation(): Observable<{ longitude: number; latitude: number }> {
    return this.store.select(getMainState).pipe(
      take(1),
      switchMap(({ project }) =>
        project?.require_location
          ? of(null) // TODO implement getting from navigator
          : of(null)
      )
    )
  }

  private getUserSettings(uuid: string, project: IMainProject) {
    const body = new UserSettingsRequest()
    body.uuid = uuid
    return this.http
      .post<IUserSetingsResponse>(
        `${environment.controlServer.url}${environment.controlServer.routes.settings}`,
        body,
        { headers: this.headers }
      )
      .pipe(
        tap((resp) => {
          if (resp.error && resp.error.length) {
            throw resp.error
          }
        }),
        map((resp) =>
          resp.settings && resp.settings.length
            ? { ...resp.settings[0], app_version: project?.version }
            : null
        )
      )
  }
}
