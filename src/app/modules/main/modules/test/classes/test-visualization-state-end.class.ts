import { ITestVisualizationState } from '../interfaces/test-visualization-state.interface'
import { ETestStatuses } from '../enums/test-statuses.enum'
import { ITestItemState } from '../interfaces/test-item-state.interface'
import { extend } from 'src/app/core/helpers/extend'
import { ETestLabels } from '../enums/test-labels.enum'
import { TestVisualizationState } from './test-visualization-state.class'

export class TestVisualizationStateEnd extends TestVisualizationState {
  download: ITestItemState
  ping: ITestItemState
  upload: ITestItemState

  static from(other: ITestVisualizationState, up: string | number, progress: number, time: number) {
    const testState = extend<ITestVisualizationState>(
      new TestVisualizationStateEnd(),
      other
    )

    testState.upload = {
      chart: testState.extendChart('upload', up, progress),
      container: ETestStatuses.DONE,
      counter: up,
      label: ETestLabels.UPLOAD,
      progress,
      time
    }
    return testState
  }
}
