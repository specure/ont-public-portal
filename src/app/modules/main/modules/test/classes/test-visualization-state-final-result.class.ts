import { ITestVisualizationState } from '../interfaces/test-visualization-state.interface'
import { ITestItemState } from '../interfaces/test-item-state.interface'
import { extend } from 'src/app/core/helpers/extend'
import { TestVisualizationState } from './test-visualization-state.class'
import { ETestStatuses } from '../enums/test-statuses.enum'
import { ETestLabels } from '../enums/test-labels.enum'
import { ITestResult } from '../interfaces/test-result.interface'
import { TestVisualizationService } from '../services/test-visualization.service'

export class TestVisualizationStateFinalResult extends TestVisualizationState {
  download: ITestItemState
  ping: ITestItemState
  upload: ITestItemState

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
}
