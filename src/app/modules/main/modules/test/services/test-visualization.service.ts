import { Store } from '@ngrx/store'
import { IAppState } from 'src/app/store'
import {
  visualInit,
  visualPing,
  visualSuccess,
  setTestInfo,
  visualDown,
  visualInitUp,
  visualUp,
  visualEnd,
  visualInitDown,
  handleServerError,
} from 'src/app/store/test/test.action'
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core'
import { ITestResult } from '../interfaces/test-result.interface'
import { ITestThread } from '../interfaces/test-thread.interface'
import { HttpErrorResponse } from '@angular/common/http'
import * as Sentry from '@sentry/angular'
import { isPlatformBrowser } from '@angular/common'
import { environment } from 'src/environments/environment'
import { MatomoTracker } from 'ngx-matomo-client'
import { EMatomoEventCategory } from 'src/app/core/enums/matomo-events.enum'

const DRAW_TIMEOUT = 160
const IDLE_TIMEOUT = 30_000

@Injectable({
  providedIn: 'root',
})
export class TestVisualizationService {
  private idleTimeout: any
  private lastProgress = -1
  private lastStatus: string | number = -1
  private redrawLoop: any
  private rmbtTest: any
  private testUUID: string

  /** Deprecated */
  static threadsFromResult(
    result: ITestResult['speed_detail'],
    direction: string
  ): ITestThread[] {
    return Object.values(
      result.reduce((acc, detail) => {
        if (detail.direction.includes(direction)) {
          const { bytes, time, thread } = detail
          const threadInfo = { ...acc[thread] }
          threadInfo[direction] = [
            ...(threadInfo[direction] || []),
            { duration: time, bytes },
          ]
          return { ...acc, [thread]: threadInfo }
        }
        return acc
      }, {})
    )
  }

  /** Deprecated */
  static async resultsByProgress(threads: ITestThread[], direction: string) {
    if (!threads || threads.length === 0) {
      return []
    }
    const rmbtws = await (environment.production
      ? import('rmbtws')
      : import('rmbtws/dist/rmbtws.js'))
    const longestThead = threads.sort(
      (a, b) => b[direction].length - a[direction].length
    )[0]
    const result: { [key: string]: number } = {}
    if (!longestThead || !longestThead[direction]) {
      return []
    }
    for (let i = 0; i <= longestThead[direction].length; i++) {
      const threadChunk: ITestThread[] = threads.map((t: any) => ({
        [direction]: t[direction].slice(0, i),
      }))
      const chunkResult =
        rmbtws.RMBTTestResult.calculateOverallSpeedFromMultipleThreads(
          threadChunk,
          (thread) => thread[direction]
        )
      let x = (i / longestThead[direction].length) * 100
      if (x === Infinity) {
        x = 0
      }
      result[x] = chunkResult.speed / 1_000_000
    }
    return Object.entries(result)
      .map(([x, y]) => ({
        x: +x,
        y,
      }))
      .sort((a, b) => a.x - b.x)
  }

  constructor(
    private matomo: MatomoTracker,
    private ngZone: NgZone,
    private store: Store<IAppState>,
    @Inject(PLATFORM_ID) private platformId
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const importRMBTWS = environment.production
        ? import('rmbtws')
        : import('rmbtws/dist/rmbtws.js')
      importRMBTWS.then((rmbtws) => {
        this.rmbtTest = rmbtws.RMBTTest
      })
    }
  }

  draw = () => {
    const result = this.rmbtTest?.getIntermediateResult()
    const status: string = result?.status.toString()

    /**
     * Init. Waiting for first result
     */
    if (
      result === null ||
      (result.progress === this.lastProgress &&
        this.lastProgress !== 1 &&
        this.lastStatus === status &&
        this.lastStatus !== 'QOS_TEST_RUNNING' &&
        this.lastStatus !== 'QOS_END' &&
        this.lastStatus !== 'SPEEDTEST_END')
    ) {
      this.redrawLoop = setTimeout(this.draw, DRAW_TIMEOUT)
      return
    }

    this.checkIfIdle(result)
    this.updateState(result)
    this.checkIfDone(result)
  }

  setRMBTTest(rmbtTest: any) {
    this.rmbtTest = rmbtTest
  }

  startTest() {
    // first draw, then the timeout should kick in
    this.draw()
  }

  stopTest() {
    clearTimeout(this.redrawLoop)
    this.redrawLoop = null
    clearTimeout(this.idleTimeout)
    this.idleTimeout = null
  }

  /**
   * Used by RMBTws, do not remove
   */
  setLocation() {}
  updateInfo(
    serverName: string,
    remoteIp: string,
    providerName: string,
    testUUID: string
  ) {
    this.ngZone.run(() => {
      this.store.dispatch(
        setTestInfo({ info: { serverName, remoteIp, providerName } })
      )
    })
    this.testUUID = testUUID
  }

  private checkIfDone(result) {
    const status: string = result?.status?.toString()

    switch (status) {
      case 'END':
        result.testUUID = this.testUUID
        this.stopTest()
        this.matomo.trackEvent(EMatomoEventCategory.MEASUREMENT, 'Finished')
        this.ngZone.run(() => {
          this.store.dispatch(visualSuccess({ result }))
        })
        break
      case 'ERROR':
        this.stopTest()
        this.matomo.trackEvent(
          EMatomoEventCategory.MEASUREMENT,
          'Finished with error'
        )
        this.handleError(result, status)
        break
      case 'ABORTED':
        this.stopTest()
        this.matomo.trackEvent(EMatomoEventCategory.MEASUREMENT, 'Aborted')
        this.handleError(result, status)
        break
      default:
        this.redrawLoop = setTimeout(this.draw, DRAW_TIMEOUT)
        break
    }
  }

  private handleError(result, status) {
    this.ngZone.run(() => {
      if (result?.error === 'Connection closed abnormally') {
        Sentry.captureMessage(
          `Socket was closed abnormally at ${globalThis.location?.href}.`
        )
        this.store.dispatch(
          handleServerError({
            error: new HttpErrorResponse({
              error: 'Connection was closed abnormally',
            }),
          })
        )
      } else {
        this.store.dispatch(
          handleServerError({
            error: new HttpErrorResponse({
              error: `test.status.${status.toLowerCase()}`,
            }),
          })
        )
      }
    })
  }

  private checkIfIdle(result) {
    const status: string = result?.status?.toString()
    if (this.lastProgress === result.progress) {
      if (!this.idleTimeout) {
        this.idleTimeout = setTimeout(() => {
          this.ngZone.run(() => {
            if (
              status !== 'END' &&
              status !== 'ERROR' &&
              status !== 'ABORTED'
            ) {
              console.log('IDLE!')
              this.stopTest()
              this.store.dispatch(
                handleServerError({
                  error: new HttpErrorResponse({
                    error: 'test.status.measurement_server_not_responding',
                  }),
                })
              )
            }
          })
        }, IDLE_TIMEOUT)
      }
    } else {
      clearTimeout(this.idleTimeout)
      this.idleTimeout = null
    }
  }

  private updateState(result) {
    const status: string = result?.status?.toString()
    let ping: string | number = '-'
    let down: string | number = '-'
    let up: string | number = '-'
    let progress: number

    this.lastProgress = result?.progress
    this.lastStatus = status

    /**
     * Rounding results
     */
    if (result !== null) {
      if (result.pingNano && result.pingNano !== -1) {
        ping = result.pingNano
        ping = Math.round((ping as number) / 1000000)
      }

      if (result.downBitPerSec && result.downBitPerSec !== -1) {
        down = result.downBitPerSec
        down = (down as number) / 1000000
      }

      if (result.upBitPerSec && result.upBitPerSec !== -1) {
        up = result.upBitPerSec
        up = (up as number) / 1000000
      }

      progress = Math.round(result.progress * 100)
    }

    /**
     * Updating state
     */
    this.ngZone.run(() => {
      switch (status) {
        case 'INIT':
          this.store.dispatch(visualInit())
          break
        case 'INIT_DOWN':
          this.store.dispatch(visualInitDown({ down, up, progress }))
          break
        case 'PING':
          this.store.dispatch(visualPing({ ping, progress }))
          break
        case 'DOWN':
          this.store.dispatch(
            visualDown({ ping, down, progress, time: result.diffTime })
          )
          break
        case 'INIT_UP':
          this.store.dispatch(visualInitUp({ down, up, progress }))
          break
        case 'UP':
          this.store.dispatch(visualUp({ up, progress, time: result.diffTime }))
          break
        case 'END':
          this.store.dispatch(
            visualEnd({ up, progress, time: result.diffTime })
          )
          break
      }
    })
  }
}
