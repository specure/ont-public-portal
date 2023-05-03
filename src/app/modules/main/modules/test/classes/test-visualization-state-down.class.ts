import { ITestVisualizationState } from '../interfaces/test-visualization-state.interface'
import { ETestStatuses } from '../enums/test-statuses.enum'
import { ITestItemState } from '../interfaces/test-item-state.interface'
import { extend } from 'src/app/core/helpers/extend'
import { ETestLabels } from '../enums/test-labels.enum'
import { TestVisualizationState } from './test-visualization-state.class'

export class TestVisualizationStateDown extends TestVisualizationState {
  download: ITestItemState
  ping: ITestItemState
  upload: ITestItemState

  static from(other: ITestVisualizationState, ping: string | number, down: string | number, progress: number, time: number) {
    const testState = extend<ITestVisualizationState>(
      new TestVisualizationStateDown(),
      other
    )

    testState.ping = {
      container: ETestStatuses.DONE,
      counter: ping,
      label: ETestLabels.PING,
      progress: 100,
      time: null
    }

    testState.download = {
      chart: testState.extendChart('download', down, progress),
      container: ETestStatuses.ACTIVE,
      counter: down,
      label: ETestLabels.DOWNLOAD,
      progress,
      time
    }
    return testState
  }
}
