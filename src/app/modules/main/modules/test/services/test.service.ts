import {
  catchError,
  concatMap,
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
  setCloudServers,
  setLocation,
  setMeasurementServer,
  setTestInfo,
  visualInit,
} from 'src/app/store/test/test.action'
import { getMainState } from '../../../../../store/main/main.reducer'
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
import { TestRepoService } from './test-repo.service'

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
    private repo: TestRepoService,
    private router: Router,
    private store: Store<IAppState>,
    private transloco: TranslocoService,
    private visualizator: TestVisualizationService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const promise = environment.production
        ? import('rmbtws/dist/esm/rmbtws.min.js')
        : import('rmbtws/dist/esm/rmbtws.js')
      promise.then((rmbtws) => {
        this.rmbtws = rmbtws
      })
    }
  }

  goToTest() {
    from(this.router.navigate([this.transloco.getActiveLang(), ERoutes.TEST]))
      .pipe(
        concatMap(() => this.triggerNextTest()),
        tap(() => globalThis.scrollTo(0, 0))
      )
      .subscribe()
  }

  triggerNextTest() {
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
        this.store.select(getHistoryState).pipe(take(1)),
        this.store.select(getTestState)
      ),
      take(1),
      switchMap(([isCookieAccepted, mainState, historyState, testState]) => {
        return of({
          project: mainState.project,
          server: testState.selectedServer ?? this.testServer,
          uuid: historyState.uuid,
          measurementRetries: testState.measurementRetries,
          isCookieAccepted,
        })
      }),
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
        console.log('Starting test with UUID:', uuid)
        if (!this.rmbtws) {
          return
        }
        this.ngZone.runOutsideAngular(() => {
          this.rmbtws.TestEnvironment.init(this.visualizator, null)
          if (environment.production) {
            this.rmbtws.log.disable()
          }
          const config = new this.rmbtws.RMBTTestConfig(
            'en',
            environment.controlServer.url,
            ''
          )
          config.uuid = uuid
          config.timezone = dayjs.tz.guess()
          config.additionalSubmissionParameters = { network_type: 0 }
          const local_server_settings = this.testServer.isLocal
            ? this.getLocalServerSettings(app_version)
            : undefined
          config.additionalRegistrationParameters = {
            uuid_permission_granted: this.isHistoryAllowed,
            app_version,
            local_server_settings,
          }
          const commOptions = {
            headers: this.headers,
            register: () => {
              if (!this.testServer.isLocal) {
                return
              }
              this.store.dispatch(
                setTestInfo({
                  info: {
                    serverName: this.testServer.name,
                    providerName: '',
                    remoteIp: '',
                    testUuid: local_server_settings.test_uuid,
                  },
                })
              )
            },
            submit: () => {
              const testState = this.store.selectSignal(getTestState)()
              if (testState.visualization && testState.info) {
                this.repo.saveResult(testState)
              }
            },
          }
          const ctrl = new this.rmbtws.RMBTControlServerCommunication(
            config,
            commOptions,
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

  private getLocalServerSettings(app_version: string) {
    return {
      test_uuid: crypto.randomUUID(),
      test_duration: 5,
      test_server_name: this.testServer.name,
      test_wait: 0,
      test_server_address: this.testServer.address,
      test_numthreads: 5,
      test_server_port: this.testServer.port,
      test_server_encryption: false,
      test_numpings: 10,
      app_version,
      platform: 'UNKNOWN',
      error: [],
    }
  }

  stopTest = () => {
    this.rmbtws?.TestEnvironment.getTestVisualization()?.stopTest()
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

  setTestServers() {
    this.getLocation()
      .pipe(
        switchMap((location) => {
          const params = !location
            ? new HttpParams({})
            : new HttpParams({
                fromObject: {
                  latitude: location.latitude.toString(),
                  longitude: location.longitude.toString(),
                },
              })
          return this.http.get<ITestServerResponse[]>(
            `${environment.controlServer.url}${environment.controlServer.routes.measurementServer}`,
            {
              params,
              headers: this.headers,
            }
          )
        }),
        map((servers) => {
          return this.supportedServers(servers)
        }),
        catchError((err) => {
          console.error('Error fetching test servers:', err)
          return of([])
        })
      )
      .subscribe((servers) => {
        this.store.dispatch(setCloudServers({ cloudServers: servers }))
        const serverToUse: TestServer = servers?.[0]
        if (serverToUse) {
          this.setServer(serverToUse)
        }
      })
  }

  setServer(server: TestServer): void {
    this.store.dispatch(setMeasurementServer({ server }))
  }

  private supportedServers = (servers): TestServer[] => {
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
            ? { ...resp.settings[0], app_version: project?.version, uuid }
            : null
        )
      )
  }
}
