import { ITestVisualizationState } from '../interfaces/test-visualization-state.interface'
import { ETestStatuses } from '../enums/test-statuses.enum'
import { ITestItemState } from '../interfaces/test-item-state.interface'
import { extend } from 'src/app/core/helpers/extend'
import { ETestLabels } from '../enums/test-labels.enum'
import { TestVisualizationState } from './test-visualization-state.class'

export class TestVisualizationStatePing extends TestVisualizationState {
  download: ITestItemState
  ping: ITestItemState
  upload: ITestItemState

  static from(other: ITestVisualizationState, ping: string | number, progress: number) {
    const testState = extend<ITestVisualizationState>(
      new TestVisualizationStatePing(),
      other
    )
    testState.ping = {
        container: ETestStatuses.ACTIVE,
        counter: ping,
        label: ETestLabels.PING,
        progress,
        time: null,
    }

    testState.downloadInit = { progress: 100 }

    return testState
  }
}
