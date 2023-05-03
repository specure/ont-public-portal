import { ITestVisualizationState } from '../interfaces/test-visualization-state.interface'
import { ETestStatuses } from '../enums/test-statuses.enum'
import { ITestItemState } from '../interfaces/test-item-state.interface'
import { extend } from 'src/app/core/helpers/extend'
import { ETestLabels } from '../enums/test-labels.enum'
import { TestVisualizationState } from './test-visualization-state.class'

export class TestVisualizationStateInit extends TestVisualizationState {
  download: ITestItemState
  ping: ITestItemState
  upload: ITestItemState

  static from(other: ITestVisualizationState) {
    const testState = extend<ITestVisualizationState>(
      new TestVisualizationStateInit(),
      other
    )
    testState.ping = {
        container: ETestStatuses.INIT,
        counter: '-',
        label: ETestLabels.PING,
        progress: 0,
        time: null,
    }

    testState.download = {
        chart: [],
        container: ETestStatuses.INIT,
        counter: '-',
        label: ETestLabels.DOWNLOAD,
        progress: 0,
        time: null,
    }

    testState.upload = {
        chart: [],
        container: ETestStatuses.INIT,
        counter: '-',
        label: ETestLabels.UPLOAD,
        progress: 0,
        time: null,
    }
    return testState
  }
}
