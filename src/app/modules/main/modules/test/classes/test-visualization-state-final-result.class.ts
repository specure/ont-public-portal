import { ITestVisualizationState } from '../interfaces/test-visualization-state.interface'
import { ITestItemState } from '../interfaces/test-item-state.interface'
import { extend } from 'src/app/core/helpers/extend'
import { TestVisualizationState } from './test-visualization-state.class'
import { ETestStatuses } from '../enums/test-statuses.enum'
import { ETestLabels } from '../enums/test-labels.enum'
import { ITestResult } from '../interfaces/test-result.interface'
import { TestVisualizationService } from '../services/test-visualization.service'
import {
  ISpeedCurveItem,
  ISpeedCurveResponse,
} from '../interfaces/speed-curve-item.interface'

export class TestVisualizationStateFinalResult extends TestVisualizationState {
  download: ITestItemState
  ping: ITestItemState
  upload: ITestItemState

  /** Deprecated */
  static async from(other: ITestVisualizationState, result: ITestResult) {
    const testState = extend<ITestVisualizationState>(
      new TestVisualizationStateFinalResult(),
      other
    )
    const {
      test_speed_download,
      test_speed_upload,
      ping_median,
      speed_detail,
    } = result || {}

    const downThreads = TestVisualizationService.threadsFromResult(
      speed_detail,
      'down'
    )

    const downResults = await TestVisualizationService.resultsByProgress(
      downThreads,
      'down'
    )

    const upThreads = TestVisualizationService.threadsFromResult(
      speed_detail,
      'up'
    )
    const upResults = await TestVisualizationService.resultsByProgress(
      upThreads,
      'up'
    )

    testState.download = {
      chart: downResults,
      container: ETestStatuses.DONE,
      counter: (test_speed_download / 1000).toFixed(2),
      label: ETestLabels.DOWNLOAD,
      progress: 100,
      time: null,
    }

    testState.upload = {
      chart: upResults,
      container: ETestStatuses.DONE,
      counter: (test_speed_upload / 1000).toFixed(2),
      label: ETestLabels.UPLOAD,
      progress: 100,
      time: null,
    }

    testState.ping = {
      ...testState.ping,
      container: ETestStatuses.DONE,
      counter: (ping_median / 1000000).toFixed(2),
      label: ETestLabels.PING,
      progress: 100,
      time: null,
    }

    testState.downloadInit = { progress: 100 }
    testState.uploadInit = { progress: 100 }
    return testState
  }

  static withSpeedCurve(
    other: ITestVisualizationState,
    result: ITestResult,
    speedCurve?: ISpeedCurveResponse
  ) {
    const testState = extend<ITestVisualizationState>(
      new TestVisualizationStateFinalResult(),
      other
    )
    const {
      test_speed_download,
      test_speed_upload,
      ping_median,
      speed_curve: localSpeedCurve,
    } = result || {}
    const { download: downCurve, upload: upCurve } =
      speedCurve?.speed_curve ?? {
        download: [],
        upload: [],
      }

    const buildChart = (curve: ISpeedCurveItem[]) => {
      const dedupedMap = new Map<number, ISpeedCurveItem>()
      for (let i = 0; i < curve.length; i++) {
        dedupedMap.set(curve[i].time_elapsed, curve[i])
      }
      const dedupedList = Array.from(dedupedMap.values()).sort(
        (a, b) => a.time_elapsed - b.time_elapsed
      )
      const chart: { x: number; y: number }[] = []
      for (let x = 0; x < dedupedList.length; x++) {
        chart.push({
          x: (x / (dedupedList.length - 1)) * 100,
          y: dedupedList[x].speed / 1e6, // convert to Mbps
        })
      }
      return chart
    }

    testState.download = {
      chart: localSpeedCurve?.download ?? buildChart(downCurve),
      container: ETestStatuses.DONE,
      counter: (test_speed_download / 1000).toFixed(2),
      label: ETestLabels.DOWNLOAD,
      progress: 100,
      time: null,
    }

    testState.upload = {
      chart: localSpeedCurve?.upload ?? buildChart(upCurve),
      container: ETestStatuses.DONE,
      counter: (test_speed_upload / 1000).toFixed(2),
      label: ETestLabels.UPLOAD,
      progress: 100,
      time: null,
    }

    testState.ping = {
      ...testState.ping,
      container: ETestStatuses.DONE,
      counter: (ping_median / 1000000).toFixed(2),
      label: ETestLabels.PING,
      progress: 100,
      time: null,
    }

    testState.downloadInit = { progress: 100 }
    testState.uploadInit = { progress: 100 }
    return testState
  }
}
